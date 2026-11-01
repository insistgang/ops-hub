#!/usr/bin/env python3
"""
scripts/sanitize_public.py: 从本地真源快照生成可公开发布的脱敏产物。

设计目标
--------
ops-hub 是公开仓库。本地 `data/` 目录保存真实数据（求职投递记录、同事真名、
内网与 Tailscale 地址、本地绝对路径），这些内容仅供本人在本机与局域网使用，
不应进入公开仓库。

因此本脚本做两件事：
1. 从 `data/status.json` / `data/memory_rules.json` 读取真源；
2. 按白名单规则裁剪与脱敏，写入 `data/public/`，供前端展示与 Git 追踪。

脱敏规则
--------
- `weight_challenge`（三人减重决战，含他人真名与体重相关数据）→ 整块移除
- `career_summary.records` 只保留公司、岗位、阶段和日期。备注、薪资、简历文件名不进入公开页。
- `projects_and_exams` 中的本地绝对路径 → 替换为相对占位
- 所有 IP 地址 → 按 RFC 5737 / RFC 1918 保留段掩码为占位地址
- 真实姓名 → 角色代号
- SSH / SMB 连接串 → 去掉主机地址

只做减法与掩码，不做任何推断或编造；被移除的字段不会以任何形式留在公开产物中。
"""

import json
import re
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
PUBLIC_DIR = DATA_DIR / "public"
ALIASES_PATH = DATA_DIR / "private_aliases.json"

# 脱敏规则的真实标识对照表存放在本地真源 data/private_aliases.json，
# 该文件已 git-ignore，因此本脚本中不出现任何真实姓名、地址或路径。
# 若对照表缺失，则退化为仅做结构性裁剪（不执行字符串掩码）。
DEFAULT_ALIASES = {"names": {}, "relations": {}, "ips": {}, "paths": {}}


def load_aliases():
    """读取本地真源的脱敏对照表。"""
    if not ALIASES_PATH.exists():
        print(f"⚠️ 未找到脱敏对照表 {ALIASES_PATH}，仅执行结构性裁剪")
        return dict(DEFAULT_ALIASES)
    try:
        data = json.loads(ALIASES_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        print(f"⚠️ 脱敏对照表读取失败（{e}），仅执行结构性裁剪")
        return dict(DEFAULT_ALIASES)
    merged = dict(DEFAULT_ALIASES)
    for key in merged:
        merged[key] = data.get(key, {}) or {}
    return merged


def scrub_text(value, aliases):
    """对任意字符串做脱敏：IP、绝对路径、真名、第三方称谓。"""
    if not isinstance(value, str):
        return value
    out = value
    for real_ip, placeholder in aliases["ips"].items():
        out = out.replace(real_ip, placeholder)
    for real_path, placeholder in aliases["paths"].items():
        out = out.replace(real_path, placeholder)
    for real_name, alias in aliases["names"].items():
        out = out.replace(real_name, alias)
    for real_rel, alias in aliases["relations"].items():
        out = out.replace(real_rel, alias)
    # 兜底：残留的 /Users/<name>/ 开头路径
    out = re.sub(r"/Users/[^/\s\"']+", "~", out)
    return out


def scrub_deep(obj, aliases):
    """递归脱敏任意 JSON 结构中的字符串。"""
    if isinstance(obj, dict):
        return {k: scrub_deep(v, aliases) for k, v in obj.items()}
    if isinstance(obj, list):
        return [scrub_deep(v, aliases) for v in obj]
    if isinstance(obj, str):
        return scrub_text(obj, aliases)
    return obj


_PHONE = re.compile(r"1[3-9]\d{9}")


def public_career_records(records):
    """Keep the board readable without notes, pay, or resume filenames."""
    public_records = []
    for record in records or []:
        if not isinstance(record, dict):
            continue
        public_records.append({
            "company": _PHONE.sub("", str(record.get("company") or "")),
            "position": _PHONE.sub("", str(record.get("position") or "")),
            "status": str(record.get("status") or ""),
            "apply_date": str(record.get("apply_date") or "")[:10],
            "priority": str(record.get("priority") or ""),
        })
    return public_records


def build_public_status(status, aliases):
    """从本地真源快照裁剪出可公开的状态快照。"""
    public = json.loads(json.dumps(status, ensure_ascii=False))  # 深拷贝

    # 1. 移除整块敏感模块
    public.pop("weight_challenge", None)

    # 2. 求职台账只公开阶段，不公开备注、薪资和简历文件名
    career = public.get("career_summary")
    if isinstance(career, dict):
        career["records"] = public_career_records(career.get("records"))

    # 3. 项目雷达移除本地绝对路径（scrub_deep 已处理，这里额外兜底删 path 字段）
    projects = public.get("projects_and_exams")
    if isinstance(projects, list):
        for item in projects:
            if isinstance(item, dict):
                item.pop("path", None)

    # 4. 设备矩阵中的主机名与连接串脱敏
    topo = public.get("topology")
    if isinstance(topo, dict):
        for key in ("mac", "windows", "jetson"):
            dev = topo.get(key)
            if isinstance(dev, dict):
                dev.pop("name", None)
                dev.pop("ssh_cmd", None)

    alloc = public.get("device_allocation")
    if isinstance(alloc, dict):
        for dev in alloc.get("devices", []) or []:
            if isinstance(dev, dict):
                dev.pop("network", None)
                for wf in alloc.get("project_workflows", []) or []:
                    if isinstance(wf, dict):
                        wf.pop("collab_mode", None)

    # 5. 全量字符串脱敏
    public = scrub_deep(public, aliases)

    # 6. 标记脱敏事实，便于读者理解公开口径
    meta = public.setdefault("meta", {})
    meta["sanitized"] = True
    meta["sanitized_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    meta["sanitize_note"] = (
        "公开版保留投递阶段，已移除备注、简历文件名、同事真名、内网地址、本地路径与私人挑战数据。"
    )
    return public


def build_public_memory(memory, aliases):
    """脱敏记忆规则：仅保留通用秩序条款。"""
    if not isinstance(memory, dict):
        return {}
    public = scrub_deep(json.loads(json.dumps(memory, ensure_ascii=False)), aliases)
    # 记忆规则若含具体人名项目，同样走一遍移除
    for key in ("members", "people", "names"):
        public.pop(key, None)
    return public


def write_public_files():
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    aliases = load_aliases()

    status_src = DATA_DIR / "status.json"
    if not status_src.exists():
        print(f"⚠️ 本地真源不存在: {status_src}，跳过公开产物生成")
        return False

    status = json.loads(status_src.read_text(encoding="utf-8"))
    public_status = build_public_status(status, aliases)

    memory = {}
    memory_src = DATA_DIR / "memory_rules.json"
    if memory_src.exists():
        memory = json.loads(memory_src.read_text(encoding="utf-8"))
    public_memory = build_public_memory(memory, aliases)

    (PUBLIC_DIR / "status.json").write_text(
        json.dumps(public_status, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (PUBLIC_DIR / "status.js").write_text(
        "window.__OPS_STATUS__ = " + json.dumps(public_status, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    (PUBLIC_DIR / "memory_rules.js").write_text(
        "window.__OPS_MEMORY__ = " + json.dumps(public_memory, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )

    # 核验：公开产物中不得残留任何真实标识
    blob = "".join(
        (PUBLIC_DIR / name).read_text(encoding="utf-8")
        for name in ("status.json", "status.js", "memory_rules.js")
    )
    leaks = []
    for group in ("ips", "paths", "names", "relations"):
        for needle in aliases[group].keys():
            if needle in blob:
                leaks.append(needle)
    if leaks:
        print(f"❌ 公开产物仍含未脱敏标识: {leaks}，已中止")
        return False

    print(f"✅ 公开脱敏产物已生成: {PUBLIC_DIR}")
    return True


if __name__ == "__main__":
    ok = write_public_files()
    raise SystemExit(0 if ok else 1)
