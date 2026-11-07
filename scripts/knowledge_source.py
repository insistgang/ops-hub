#!/usr/bin/env python3
"""只读投影层：把 knowledge 知识库当作真源，抽取 Ops-Hub 需要的结构。

设计约束（与仓库既有铁律一致）：
1. 单向只读 -- 本模块绝不写入 knowledge 目录，任何写操作都视为 bug。
2. 零 Mock 假数据 -- 解析不到就标记 degraded/error 并给出原因，绝不编造行。
3. 隐私边界 -- 产出只写入本机 data/ 私有文件，由 sanitize_public.py 剔除，
   不得进入 data/public/ 与公开站。

用法：
    python3 scripts/knowledge_source.py --json      # 打印抽取结果
    python3 scripts/knowledge_source.py --check     # 仅校验真源可解析
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import date, datetime
from pathlib import Path

# 知识库根目录；可用 OPS_KNOWLEDGE_DIR 覆盖（例如换机器或测试）。
KNOWLEDGE_DIR = Path(
    os.environ.get("OPS_KNOWLEDGE_DIR") or "/Users/insistgang/Documents/knowledge"
).expanduser()

TODAY_PLAN_DIR = Path("01-Daily") / "今日计划"
TODO_FILE = Path("00-Inbox") / "TODO.md"
HARD_NODES_FILE = Path("00-Inbox") / "硬节点台账.md"

MAX_TEXT = 300


class KnowledgeSourceError(RuntimeError):
    """真源缺失或结构不可解析。调用方应显式降级，不得填假数据。"""


# --------------------------------------------------------------------------
# 通用工具
# --------------------------------------------------------------------------

def _clip(text: str, limit: int = MAX_TEXT) -> str:
    text = re.sub(r"\s+", " ", (text or "")).strip()
    return text if len(text) <= limit else text[: limit - 1] + "…"


def _strip_md(text: str) -> str:
    """去掉 markdown 强调/删除线/行内代码包裹，保留文字。"""
    text = (text or "").strip()
    text = re.sub(r"~~(.+?)~~", r"\1", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"`(.+?)`", r"\1", text)
    return text.strip()


def _today() -> date:
    return datetime.now().astimezone().date()


def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError as exc:  # pragma: no cover - 环境问题
        raise KnowledgeSourceError(f"无法读取 {path}: {exc}") from exc


# --------------------------------------------------------------------------
# 今日计划  01-Daily/今日计划/YYYY-MM-DD.md
# --------------------------------------------------------------------------

FRONTMATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.S)
ITEM_HEAD_RE = re.compile(r"^###\s+(\d+)\.\s+(.*)$")
BULLET_RE = re.compile(r"^-\s+\*\*(.+?)\*\*\s*[（(]?([^）)：:]*)[）)]?\s*[：:]\s*(.*)$")
ASSIGNEE_RE = re.compile(r"`?\[(必须本人|可代跑|可全代跑|AI 起草|先 AI 起草[^\]]*)\]`?")
TAG_RE = re.compile(r"^\[([^\]]+)\]\s*")


def _parse_frontmatter(text: str) -> tuple[dict, str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    meta: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" in line and not line.lstrip().startswith("#"):
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip().strip('"').strip("'")
    return meta, text[match.end():]


def _latest_plan_file(plan_dir: Path) -> Path | None:
    if not plan_dir.is_dir():
        return None
    candidates = sorted(
        (p for p in plan_dir.glob("*.md") if re.fullmatch(r"\d{4}-\d{2}-\d{2}\.md", p.name)),
        reverse=True,
    )
    return candidates[0] if candidates else None


def parse_today_plan(knowledge_dir: Path = KNOWLEDGE_DIR, day: date | None = None) -> dict:
    """抽取今日计划的必做项。文件缺失时降级到最近一份并标记 is_today=False。"""
    day = day or _today()
    plan_dir = knowledge_dir / TODAY_PLAN_DIR
    wanted = plan_dir / f"{day.isoformat()}.md"
    warnings: list[str] = []

    path = wanted
    is_today = True
    if not path.is_file():
        fallback = _latest_plan_file(plan_dir)
        is_today = False
        if fallback is None:
            raise KnowledgeSourceError(f"今日计划目录无任何 YYYY-MM-DD.md：{plan_dir}")
        path = fallback
        warnings.append(f"缺少 {day.isoformat()} 的今日计划，已回退到 {path.stem}")

    meta, body = _parse_frontmatter(_read(path))
    lines = body.splitlines()

    headline = ""
    direction = ""
    capacity = ""
    items: list[dict] = []
    current: dict | None = None

    for line in lines:
        stripped = line.strip()

        if stripped.startswith("# ") and not headline:
            headline = _strip_md(stripped[2:])
            continue

        if stripped.startswith("> **方向**"):
            direction = _clip(_strip_md(stripped.split("：", 1)[-1]), 400)
            continue
        if stripped.startswith("> **今日容量**"):
            capacity = _clip(_strip_md(stripped.split("：", 1)[-1]), 400)
            continue

        head = ITEM_HEAD_RE.match(stripped)
        if head:
            if current:
                items.append(current)
            raw_title = _strip_md(head.group(2))
            assignee = ""
            found = ASSIGNEE_RE.search(raw_title)
            if found:
                assignee = found.group(1)
                raw_title = ASSIGNEE_RE.sub("", raw_title).strip()
            tag = ""
            tag_match = TAG_RE.match(raw_title)
            if tag_match:
                tag = tag_match.group(1).strip()
                raw_title = raw_title[tag_match.end():].strip()
            current = {
                "n": int(head.group(1)),
                "tag": tag,
                "title": _clip(raw_title, 160),
                "assignee": assignee,
                "done_standard": "",
                "first_step": "",
                "estimate": "",
                "note": "",
            }
            continue

        if current is not None:
            bullet = BULLET_RE.match(stripped)
            if bullet:
                label = _strip_md(bullet.group(1))
                value = _clip(_strip_md(bullet.group(3)), 240)
                if "完成标准" in label:
                    current["done_standard"] = value
                elif "第一步" in label:
                    current["first_step"] = value
                elif "预计" in label:
                    current["estimate"] = value
                elif "代跑" in label or "来源" in label:
                    current["note"] = value

    if current:
        items.append(current)

    if not items:
        warnings.append(f"{path.name} 未解析到「今日必做」条目，请核对模板格式")

    return {
        "date": meta.get("date") or path.stem,
        "is_today": is_today,
        "file": path.name,
        "headline": _clip(headline, 160),
        "direction": direction,
        "capacity": capacity,
        "items": items,
        "warnings": warnings,
    }


# --------------------------------------------------------------------------
# 当前 WIP  00-Inbox/TODO.md 的「当前 WIP」表
# --------------------------------------------------------------------------

WIP_HEADER = "当前 WIP"
BOLD_RE = re.compile(r"\*\*(.+?)\*\*")


def parse_wip(knowledge_dir: Path = KNOWLEDGE_DIR) -> dict:
    """抽取「当前 WIP」三个位置。事项原文极长（含大量取证记录），只保留标题与扼要。"""
    path = knowledge_dir / TODO_FILE
    if not path.is_file():
        raise KnowledgeSourceError(f"缺少 TODO 文件：{path}")

    text = _read(path)
    in_section = False
    header: list[str] | None = None
    items: list[dict] = []

    for raw in text.splitlines():
        line = raw.rstrip()
        if line.startswith("## "):
            in_section = line.strip().startswith("## " + WIP_HEADER)
            header = None
            continue
        if not in_section or not line.strip().startswith("|"):
            continue
        cells = _split_row(line)
        if _is_separator(cells):
            continue
        if header is None:
            header = cells
            continue
        if len(cells) < 2:
            continue

        position = _strip_md(cells[0])
        body = cells[1]
        bold = BOLD_RE.search(body)
        title = _clip(_strip_md(bold.group(1) if bold else body), 90)
        # 标记写法不统一（[必须本人]、[先 AI 起草、后本人终判]、[必须本人拍板 + AI 可代跑扫描]），
        # 直接取方括号内的原文，比枚举关键词更忠实
        bracket = re.search(r"`?\[([^\]]{1,40})\]`?", body)
        items.append({
            "position": _clip(position, 12),
            "title": title,
            "assignee": _clip(bracket.group(1), 20) if bracket else "",
            "action": _clip(_strip_md(cells[2]), 150) if len(cells) > 2 else "",
        })
        if len(items) >= 3:
            break

    warnings = []
    if not items:
        warnings.append(f"{path.name} 的「{WIP_HEADER}」表未解析到条目，请核对表头")
    return {"file": path.name, "items": items, "warnings": warnings}


# --------------------------------------------------------------------------
# 硬节点台账  00-Inbox/硬节点台账.md
# --------------------------------------------------------------------------

DATE_RE = re.compile(r"(\d{4})-(\d{2})(?:-(\d{2}))?")
RANGE_RE = re.compile(r"(\d{4}-\d{2}-\d{2})\s*(?:至|-|~)\s*(\d{4}-\d{2}-\d{2}|\d{2}-\d{2})")
SECTION_HEADER_RE = re.compile(r"^##\s+(.+)$")


def _split_row(line: str) -> list[str]:
    cells = line.strip().strip("|").split("|")
    return [c.strip() for c in cells]


def _is_separator(cells: list[str]) -> bool:
    return bool(cells) and all(re.fullmatch(r":?-{2,}:?", c or "-") for c in cells)


def _parse_date_token(token: str) -> date | None:
    token = (token or "").strip()
    if not token or token in {"—", "-", "无"}:
        return None
    m = DATE_RE.search(token)
    if not m:
        return None
    year, month = int(m.group(1)), int(m.group(2))
    day = int(m.group(3)) if m.group(3) else 1
    try:
        return date(year, month, day)
    except ValueError:
        return None


def _effective_date(cell: str) -> tuple[date | None, str]:
    """从日期列推出用于提醒的日期，并返回口径说明。"""
    cell = _strip_md(cell)
    rng = RANGE_RE.search(cell)
    if rng:
        start = _parse_date_token(rng.group(1))
        end_token = rng.group(2)
        end = _parse_date_token(end_token)
        # 区间右侧常写成 MM-DD（如「2026-11-16 至 11-18」），年份取左侧。
        if end is None and re.fullmatch(r"\d{2}-\d{2}", end_token) and start:
            try:
                end = date(start.year, int(end_token[:2]), int(end_token[3:]))
            except ValueError:
                end = None
            if end and end < start:  # 跨年区间
                try:
                    end = end.replace(year=start.year + 1)
                except ValueError:
                    end = None
        if "窗口" in cell and start:
            return start, "窗口起始"
        return end or start, "区间截止"
    parsed = _parse_date_token(cell)
    if "起" in cell:
        return parsed, "起始日"
    return parsed, "单日"


def parse_hard_nodes(knowledge_dir: Path = KNOWLEDGE_DIR, today: date | None = None) -> dict:
    today = today or _today()
    path = knowledge_dir / HARD_NODES_FILE
    if not path.is_file():
        raise KnowledgeSourceError(f"缺少硬节点台账：{path}")

    text = _read(path)
    warnings: list[str] = []
    section = ""
    active_rows: list[dict] = []
    overdue_rows: list[dict] = []
    weekly: list[dict] = []
    monthly: list[dict] = []
    header: list[str] | None = None

    for raw in text.splitlines():
        line = raw.rstrip()
        head = SECTION_HEADER_RE.match(line.strip())
        if head:
            section = head.group(1).strip()
            header = None
            continue

        if not line.strip().startswith("|"):
            # 空行不重置表头：台账里表格中间存在空行（如 11/16--11/18 数据冻结一行），
            # 若按空行重置会把真实数据行误当成表头吞掉。只有新的 ## 小节才重置表头。
            continue

        cells = _split_row(line)
        if _is_separator(cells):
            continue

        if header is None:
            header = cells
            continue

        if "活跃节点" in section:
            if len(cells) < 7:
                continue
            date_cell, node_type, title = cells[0], cells[1], cells[2]
            decision, impact, status = cells[3], cells[4], cells[6]
            entry_date, day_basis = _effective_date(date_cell)
            status_text = _strip_md(status)
            # 台账规则 2：到期日 != 决策日。续费类已经过了起始日、但决策日仍在未来时，
            # 按决策日提醒，不能误报成逾期。
            decision_date = _parse_date_token(decision)
            if decision_date and decision_date >= today and (entry_date is None or entry_date < today):
                entry_date, day_basis = decision_date, "决策日"
            row = {
                "kind": "node",
                "date": _strip_md(date_cell),
                "type": _strip_md(node_type),
                "title": _clip(_strip_md(title), 120),
                "decision": _clip(_strip_md(decision), 80),
                "status": status_text,
                "day_basis": day_basis,
                "effective_date": entry_date.isoformat() if entry_date else None,
                "days_left": (entry_date - today).days if entry_date else None,
                "impact": _clip(_strip_md(impact), 200),
            }
            if status_text == "活跃":
                if entry_date and (entry_date - today).days < 0:
                    row["overdue_days"] = (today - entry_date).days
                    overdue_rows.append(row)
                else:
                    active_rows.append(row)
            continue

        if "已逾期" in section:
            if len(cells) < 2:
                continue
            disposal = _clip(_strip_md(cells[3]) if len(cells) > 3 else "", 200)
            # 处置列若已写明闭环（排除「未闭环」），不再计入逾期
            if ("闭环" in disposal and "未闭环" not in disposal) or "已办结" in disposal or "已关闭" in disposal:
                continue
            overdue_rows.append({
                "kind": "ledger",
                "date": _strip_md(cells[0]),
                "title": _clip(_strip_md(cells[1]), 120),
                "disposal": disposal,
                "status": "已逾期",
            })
            continue

        if "每月固定" in section and len(cells) >= 2:
            monthly.append({
                "trigger": _clip(_strip_md(cells[0]), 60),
                "title": _clip(_strip_md(cells[1]), 120),
                "note": _clip(_strip_md(cells[2]) if len(cells) > 2 else "", 200),
            })
            continue

        if "每周固定" in section and len(cells) >= 2:
            weekly.append({
                "trigger": _clip(_strip_md(cells[0]), 60),
                "title": _clip(_strip_md(cells[1]), 120),
                "note": _clip(_strip_md(cells[2]) if len(cells) > 2 else "", 200),
            })
            continue

    if not active_rows and not overdue_rows:
        warnings.append(f"{path.name} 的「活跃节点」表未解析到任何行，请核对表头与列数")

    active_rows.sort(key=lambda r: (r["effective_date"] or "9999-99-99"))
    return {
        "file": path.name,
        "active": active_rows,
        "overdue": overdue_rows,
        "weekly": weekly,
        "monthly": monthly,
        "warnings": warnings,
    }


# --------------------------------------------------------------------------
# 汇总
# --------------------------------------------------------------------------

def collect(knowledge_dir: Path | None = None, today: date | None = None) -> dict:
    """返回可直接并入 status.json 的 knowledge 段。任何失败都以 available=False 表达。"""
    root = Path(knowledge_dir or KNOWLEDGE_DIR).expanduser()
    today = today or _today()
    result: dict = {
        "available": False,
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "source_root": str(root),
        "today": today.isoformat(),
        "warnings": [],
        "today_plan": None,
        "wip": None,
        "hard_nodes": None,
    }

    if not root.is_dir():
        result["error"] = f"知识库目录不存在：{root}（可用 OPS_KNOWLEDGE_DIR 覆盖）"
        return result

    degraded = False
    try:
        plan = parse_today_plan(root, today)
        result["today_plan"] = plan
        result["warnings"].extend(plan["warnings"])
    except KnowledgeSourceError as exc:
        degraded = True
        result["warnings"].append(f"今日计划：{exc}")

    try:
        wip = parse_wip(root)
        result["wip"] = wip
        result["warnings"].extend(wip["warnings"])
    except KnowledgeSourceError as exc:
        degraded = True
        result["warnings"].append(f"当前 WIP：{exc}")

    try:
        nodes = parse_hard_nodes(root, today)
        result["hard_nodes"] = nodes
        result["warnings"].extend(nodes["warnings"])
    except KnowledgeSourceError as exc:
        degraded = True
        result["warnings"].append(f"硬节点：{exc}")

    result["available"] = bool(result["today_plan"] or result["hard_nodes"] or result.get("wip"))
    result["degraded"] = degraded
    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="knowledge 只读投影抽取器")
    parser.add_argument("--json", action="store_true", help="打印完整 JSON")
    parser.add_argument("--check", action="store_true", help="仅校验，不打印全文")
    parser.add_argument("--knowledge-dir", default=None, help="覆盖知识库根目录")
    args = parser.parse_args(argv)

    data = collect(Path(args.knowledge_dir) if args.knowledge_dir else None)

    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        plan = data.get("today_plan") or {}
        nodes = data.get("hard_nodes") or {}
        print(f"知识库: {data['source_root']}  可用: {data['available']}")
        if plan:
            print(f"今日计划: {plan.get('date')} ({plan.get('file')}) · {len(plan.get('items', []))} 件必做"
                  + ("" if plan.get("is_today") else " [非今日，已回退]"))
        if nodes:
            print(f"硬节点: 活跃 {len(nodes.get('active', []))} 条 / 逾期 {len(nodes.get('overdue', []))} 条")
        for warning in data.get("warnings", []):
            print(f"  ⚠️  {warning}")
        if data.get("error"):
            print(f"  ❌  {data['error']}")

    return 0 if data.get("available") else 1


if __name__ == "__main__":
    sys.exit(main())
