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

import hashlib
import json
import os
import re
import tempfile
import unicodedata
from datetime import datetime, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
PUBLIC_DIR = DATA_DIR / "public"
ALIASES_PATH = DATA_DIR / "private_aliases.json"

# 脱敏规则的真实标识对照表存放在本地真源 data/private_aliases.json，
# 该文件已 git-ignore，因此本脚本中不出现任何真实姓名、地址或路径。
# 对照表是公开发布的必要输入，缺失或损坏时必须停止生成。
ALIAS_GROUPS = ("names", "relations", "ips", "paths")


def load_aliases():
    """读取并校验完整对照表；空组允许，省略组或无效映射不允许。"""
    try:
        data = json.loads(ALIASES_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        raise ValueError("脱敏对照表缺失或无法读取") from e
    if not isinstance(data, dict):
        raise ValueError("脱敏对照表必须是 JSON 对象")
    aliases = {}
    for group in ALIAS_GROUPS:
        mapping = data.get(group)
        if not isinstance(mapping, dict) or any(
            not isinstance(key, str) or not key.strip() or not isinstance(value, str)
            for key, value in mapping.items()
        ):
            raise ValueError(f"脱敏对照表的 {group} 组无效")
        aliases[group] = mapping
    return aliases


_IPV4 = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")


def _is_private_ip(text):
    """RFC1918 私网 / 回环 / CGNAT(Tailscale 100.64.0.0/10)。"""
    try:
        octets = [int(part) for part in text.split(".")]
    except ValueError:
        return False
    if len(octets) != 4 or any(o < 0 or o > 255 for o in octets):
        return False
    a, b = octets[0], octets[1]
    return (
        a in (0, 10, 127)
        or (a == 172 and 16 <= b <= 31)
        or (a == 192 and b == 168)
        or (a == 100 and 64 <= b <= 127)
    )


def mask_private_ips(value):
    """兜底掩码：任何私网/CGNAT 地址都保留前两段，避免漏登记新地址就外泄。

    对照表的 ips 组是显式登记，但设备换 DHCP 地址、换机器时容易漏登记——
    这里按网段兜底，宁可多掩码，不可漏明文。
    """
    if not isinstance(value, str):
        return value

    def replace(match):
        candidate = match.group(0)
        if not _is_private_ip(candidate):
            return candidate
        head = ".".join(candidate.split(".")[:2])
        return head + ".x.x"

    return _IPV4.sub(replace, value)


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
    # 兜底：任何未登记的私网/CGNAT 地址
    out = mask_private_ips(out)
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
    # knowledge 投影含真名、账号、本地绝对路径与金额，一律不进入公开产物。
    public.pop("knowledge", None)

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


def build_public_energy(knowledge, aliases):
    """裁剪可公开的日记精力投影。

    本人 2026-11-07 明确选择 C 档：分数与推断依据一起公开。仍做三层收口：
    只保留日期/分数/依据/睡眠运动，丢掉本地文件路径；文本过 scrub_text；
    真名、关系称谓、私网地址、绝对路径全部替换为对照表别名。
    """
    if not isinstance(knowledge, dict):
        return None
    energy = knowledge.get("energy")
    if not isinstance(energy, dict):
        return None

    public_days = []
    for day in energy.get("days") or []:
        if not isinstance(day, dict) or not day.get("date"):
            continue
        metrics = {}
        for name, metric in (day.get("metrics") or {}).items():
            if not isinstance(metric, dict):
                continue
            metrics[name] = {
                "score": metric.get("score"),
                "scale": metric.get("scale"),
                "basis": scrub_text(metric.get("basis") or "", aliases),
            }
        extra = {
            key: scrub_text(value, aliases)
            for key, value in (day.get("extra") or {}).items()
            if isinstance(value, str)
        }
        public_days.append({"date": day["date"], "metrics": metrics, "extra": extra})

    if not public_days:
        return None
    return {
        "available": True,
        "generated_at": knowledge.get("generated_at"),
        "latest": {"date": public_days[0]["date"]},
        "days": public_days,
    }


_DIARY_TODO_ID = re.compile(r"^diary-[0-9a-f]{24}$")
_FILESYSTEM_PATH = re.compile(r"(?<![\w])(?:~[/\\]|/(?:Users|home|var|tmp|opt|private)/|[A-Za-z]:[\\/])[^\s\"'<>]+")


def _valid_iso_date(value):
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return False
    try:
        return datetime.strptime(value, "%Y-%m-%d").date().isoformat() == value
    except ValueError:
        return False


def build_public_diary_todos(knowledge, aliases):
    """Publish only the explicitly selected checkbox title/date/status fields."""
    if knowledge is None:
        knowledge = {}
    if not isinstance(knowledge, dict):
        raise ValueError("知识库投影必须是 JSON 对象")

    source = knowledge.get("diary_todos")
    if source is None:
        # An empty snapshot intentionally clears yesterday's published checklist.
        target_day = knowledge.get("today")
        if not _valid_iso_date(target_day):
            target_day = datetime.now().astimezone().date().isoformat()
        return {"date": target_day, "items": []}
    if not isinstance(source, dict) or not _valid_iso_date(source.get("date")):
        raise ValueError("日记待办日期无效")
    target_day = source["date"]
    if knowledge.get("today") and knowledge["today"] != target_day:
        raise ValueError("日记待办日期与快照日期不一致")
    raw_items = source.get("items")
    if not isinstance(raw_items, list):
        raise ValueError("日记待办条目必须是数组")

    validated = []
    for item in raw_items:
        if not isinstance(item, dict):
            raise ValueError("日记待办条目格式无效")
        todo_id = item.get("id")
        title = item.get("title")
        completed = item.get("completed")
        source_date = item.get("source_date")
        if not isinstance(todo_id, str) or not _DIARY_TODO_ID.fullmatch(todo_id):
            raise ValueError("日记待办 ID 无效")
        if not isinstance(title, str) or not title.strip() or len(title) > 160:
            raise ValueError("日记待办标题无效")
        if type(completed) is not bool:
            raise ValueError("日记待办状态无效")
        if not _valid_iso_date(source_date):
            raise ValueError("日记待办来源日期无效")
        previous_day = (datetime.strptime(target_day, "%Y-%m-%d").date() - timedelta(days=1)).isoformat()
        if source_date not in (target_day, previous_day):
            raise ValueError("日记待办来源日期超出允许范围")
        normalized = " ".join(unicodedata.normalize("NFKC", title).split()).casefold()
        expected_id = "diary-" + hashlib.sha256(f"{target_day}\0{normalized}".encode("utf-8")).hexdigest()[:24]
        if todo_id != expected_id:
            raise ValueError("日记待办 ID 与标题不匹配")
        validated.append((source_date, normalized, item))

    public_items = []
    seen_titles = set()
    # Prefer the current diary's status when titles occur in both sources.
    for source_date, normalized, item in sorted(validated, key=lambda row: row[0] != target_day):
        title = item["title"]
        todo_id = item["id"]
        completed = item["completed"]
        if normalized in seen_titles:
            continue
        seen_titles.add(normalized)
        public_title = scrub_text(title.strip(), aliases)
        public_title = _FILESYSTEM_PATH.sub("[路径已隐藏]", public_title)
        if not public_title.strip():
            raise ValueError("脱敏后日记待办标题为空")
        public_items.append({
            "id": todo_id,
            "title": public_title,
            "completed": completed,
            "source_date": source_date,
        })

    return {"date": target_day, "items": public_items}


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
    # Build and validate every candidate in memory before touching published files.
    try:
        aliases = load_aliases()
        status = json.loads((DATA_DIR / "status.json").read_text(encoding="utf-8"))
        if not isinstance(status, dict):
            raise ValueError("状态真源必须是 JSON 对象")
        public_status = build_public_status(status, aliases)
        memory = {}
        memory_src = DATA_DIR / "memory_rules.json"
        if memory_src.exists():
            memory = json.loads(memory_src.read_text(encoding="utf-8"))
            if not isinstance(memory, dict):
                raise ValueError("记忆规则真源必须是 JSON 对象")
        public_memory = build_public_memory(memory, aliases)
        knowledge = {}
        knowledge_src = DATA_DIR / "knowledge.json"
        if knowledge_src.exists():
            knowledge = json.loads(knowledge_src.read_text(encoding="utf-8"))
            if not isinstance(knowledge, dict):
                raise ValueError("知识库快照必须是 JSON 对象")
        public_energy = build_public_energy(knowledge, aliases)
        public_diary_todos = build_public_diary_todos(knowledge, aliases)
        artifacts = {
            "status.json": json.dumps(public_status, ensure_ascii=False, indent=2) + "\n",
            "status.js": "window.__OPS_STATUS__ = " + json.dumps(public_status, ensure_ascii=False) + ";\n",
            "memory_rules.js": "window.__OPS_MEMORY__ = " + json.dumps(public_memory, ensure_ascii=False) + ";\n",
            "diary-todos.json": json.dumps(public_diary_todos, ensure_ascii=False, indent=2) + "\n",
            "diary-todos.js": "window.__OPS_DIARY_TODOS__ = " + json.dumps(public_diary_todos, ensure_ascii=False) + ";\n",
        }
        if public_energy:
            artifacts["energy.json"] = json.dumps(public_energy, ensure_ascii=False, indent=2) + "\n"
            artifacts["energy.js"] = "window.__OPS_PUBLIC_ENERGY__ = " + json.dumps(public_energy, ensure_ascii=False) + ";\n"
    except (OSError, ValueError, TypeError):
        print("❌ 脱敏配置或真源无效，保留上次公开产物，本次发布已中止。")
        return False

    blob = "".join(artifacts.values())
    leaked_ips = [ip for ip in _IPV4.findall(blob) if _is_private_ip(ip)]
    if leaked_ips:
        # 不回显具体地址，只报数量与类别
        print(f"❌ 公开产物仍含 {len(leaked_ips)} 处未脱敏私网地址，本次发布已中止。")
        return False
    if any(needle in blob for group in ALIAS_GROUPS for needle in aliases[group]):
        # Never repeat the private identifiers in logs.
        print("❌ 公开产物仍含未脱敏标识，保留上次公开产物，本次发布已中止。")
        return False

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    staged = []
    try:
        for name, content in artifacts.items():
            fd, temporary = tempfile.mkstemp(dir=PUBLIC_DIR, prefix=name + ".", suffix=".tmp")
            staged.append((Path(temporary), PUBLIC_DIR / name))
            with os.fdopen(fd, "w", encoding="utf-8") as stream:
                stream.write(content)
        for temporary, target in staged:
            os.replace(temporary, target)
    finally:
        for temporary, _ in staged:
            temporary.unlink(missing_ok=True)

    print(f"✅ 公开脱敏产物已生成: {PUBLIC_DIR}")
    return True


if __name__ == "__main__":
    ok = write_public_files()
    raise SystemExit(0 if ok else 1)
