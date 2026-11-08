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
import hashlib
import json
import os
import re
import sys
import unicodedata
from datetime import date, datetime, timedelta
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
# 日记待办公开投影（严格限定两个日期章节）
# --------------------------------------------------------------------------

DIARY_CHECKBOX_RE = re.compile(r"^\s*[-*+]\s+\[([ xX])\]\s+(.+?)\s*$")
DIARY_HEADING_RE = re.compile(r"^(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$")
DIARY_FENCE_RE = re.compile(r"^\s*(```+|~~~+)")


def _normalized_diary_title(title: str) -> str:
    return " ".join(unicodedata.normalize("NFKC", title).split()).casefold()


def _diary_todo_id(target_day: date, normalized_title: str) -> str:
    source = f"{target_day.isoformat()}\0{normalized_title}".encode("utf-8")
    return "diary-" + hashlib.sha256(source).hexdigest()[:24]


def _parse_diary_todo_section(path: Path, section_name: str, target_day: date) -> list[dict]:
    """Read checkboxes only inside an exact Markdown section heading."""
    lines = _read(path).splitlines()
    items = []
    index = 0
    in_outer_fence = False
    outer_fence_char = ""
    while index < len(lines):
        fence = DIARY_FENCE_RE.match(lines[index])
        if fence:
            marker = fence.group(1)
            if not in_outer_fence:
                in_outer_fence = True
                outer_fence_char = marker[0]
            elif marker[0] == outer_fence_char:
                in_outer_fence = False
            index += 1
            continue
        if in_outer_fence:
            index += 1
            continue
        heading = DIARY_HEADING_RE.match(lines[index])
        if not heading or heading.group(2).strip() != section_name:
            index += 1
            continue

        level = len(heading.group(1))
        index += 1
        in_fence = False
        fence_char = ""
        while index < len(lines):
            line = lines[index]
            fence = DIARY_FENCE_RE.match(line)
            if fence:
                marker = fence.group(1)
                if not in_fence:
                    in_fence = True
                    fence_char = marker[0]
                elif marker[0] == fence_char:
                    in_fence = False
                index += 1
                continue

            next_heading = None if in_fence else DIARY_HEADING_RE.match(line)
            if next_heading and len(next_heading.group(1)) <= level:
                break
            if not in_fence:
                checkbox = DIARY_CHECKBOX_RE.match(line)
                if checkbox:
                    title = _strip_md(checkbox.group(2)).strip()
                    title = _clip(title, 160)
                    normalized = _normalized_diary_title(title)
                    if normalized:
                        items.append({
                            "id": _diary_todo_id(target_day, normalized),
                            "title": title,
                            "completed": checkbox.group(1).casefold() == "x",
                            "source_date": path.stem,
                        })
            index += 1
        # Continue after a sibling/parent heading; another exact target section
        # later in the file is still part of the allowlisted source.
    return items


def parse_diary_todos(knowledge_dir: Path = KNOWLEDGE_DIR, day: date | None = None) -> dict:
    """Project today's and yesterday's explicitly dated task checkboxes only."""
    day = day or _today()
    yesterday = day - timedelta(days=1)
    daily_dir = knowledge_dir / "01-Daily"
    sources = (
        (daily_dir / day.strftime("%Y-%m") / f"{day.isoformat()}.md", "今日计划与执行状态"),
        (daily_dir / yesterday.strftime("%Y-%m") / f"{yesterday.isoformat()}.md", "明日计划"),
    )
    items = []
    seen = set()
    for path, section in sources:  # current diary wins duplicate status/title
        if not path.is_file():
            continue
        for item in _parse_diary_todo_section(path, section, day):
            normalized = _normalized_diary_title(item["title"])
            if normalized in seen:
                continue
            seen.add(normalized)
            items.append(item)
    return {"date": day.isoformat(), "items": items}


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


def _date_precision(cell: str) -> str:
    """返回 day / month / unknown。只写到月份的日期（如 2027-01）不能当月初倒计时。"""
    m = DATE_RE.search(_strip_md(cell))
    if not m:
        return "unknown"
    return "day" if m.group(3) else "month"


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
            precision = _date_precision(date_cell)
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
                "date_precision": precision,
                # 只到月份的日期不给倒计时，避免把「2027-01 待定」说成「1 月 1 日还有 N 天」
                "effective_date": entry_date.isoformat() if entry_date and precision == "day" else None,
                "days_left": (entry_date - today).days if entry_date and precision == "day" else None,
                "impact": _clip(_strip_md(impact), 200),
            }
            if status_text == "活跃":
                if entry_date and precision == "day" and (entry_date - today).days < 0:
                    row["overdue_days"] = (today - entry_date).days
                    # 续费/扣费类节点日期已过、但仍标活跃，通常表示「事件已发生、还有待确认事项」，
                    # 不是逾期未办，不能报成红色的逾期。
                    if any(mark in row["type"] for mark in ("续费", "扣费")):
                        row["needs_confirm"] = True
                        active_rows.append(row)
                    else:
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
# 项目台账  03-Projects/<项目名>/ 与顶层 .md
# --------------------------------------------------------------------------

PROJECTS_DIR = Path("03-Projects")
PROJECT_SKIP = {"_backups", "Attachments", "node_modules", ".git", ".obsidian"}
MAX_PROJECTS = 400
# 目录里的说明/索引文件不是项目本身，混进来会把台账变成文档列表
META_STEMS = {"agents", "claude", "readme", "index", "03-projects", "todo"}  # 实际上等于不截断：项目台账要完整列出，宁可长也不漏
MAX_PROJECT_FILES = 2000
DATE_PREFIX_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})-")
FRONTMATTER_BLOCK = re.compile(r"\A---\s*\n.*?\n---\s*\n", re.S)


def _collect_mtimes(directory: Path) -> tuple[list[float], int, bool]:
    """收集目录下真实文件的 mtime。返回 (时间列表, 文件数, 是否触达上限)。"""
    times: list[float] = []
    count = 0
    capped = False
    for current, dirs, files in os.walk(directory):
        dirs[:] = sorted(d for d in dirs if d not in PROJECT_SKIP and not d.startswith("."))
        for name in files:
            if name.startswith("."):
                continue
            count += 1
            if count > MAX_PROJECT_FILES:
                capped = True
                break
            try:
                times.append((Path(current) / name).stat().st_mtime)
            except OSError:
                continue
        if capped:
            break
    return times, count, capped


def _first_line_text(path: Path, limit: int = 4000) -> str | None:
    """取第一段可读文字：跳过 frontmatter、标题、图片、徽章、引用块与列表符号。"""
    try:
        text = path.read_text(encoding="utf-8")[:limit]
    except (OSError, UnicodeDecodeError):
        return None
    text = FRONTMATTER_BLOCK.sub("", text)
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith(("#", "!", "[", ">", "|", "-", "```")):
            continue
        return _clip(_strip_md(stripped), 120) or None
    return None


def _iso(ts: float) -> str:
    return datetime.fromtimestamp(ts).astimezone().isoformat(timespec="minutes")


def _bulk_stamps(all_times: list[float]) -> dict[int, int]:
    """识别「批量刷新」簇：同一分钟内大量文件同时变更，多半是同步/迁移工具。

    人工不可能在一分钟内改上百个文件，这些时间戳会污染「最近改动」排序。
    返回 {分钟内时间戳: 命中文件数}。
    """
    if len(all_times) < 20:
        return {}
    buckets: dict[int, int] = {}
    for ts in all_times:
        key = int(ts // 60)
        buckets[key] = buckets.get(key, 0) + 1
    threshold = max(20, int(len(all_times) * 0.08))
    return {key: hit for key, hit in buckets.items() if hit >= threshold}


def parse_projects(knowledge_dir: Path = KNOWLEDGE_DIR) -> dict:
    """抽取 03-Projects 的项目条目。全部取自文件系统事实，不推断进度。"""
    root = knowledge_dir / PROJECTS_DIR
    if not root.is_dir():
        raise KnowledgeSourceError(f"缺少项目目录：{root}")

    warnings: list[str] = []
    gathered: list[dict] = []

    for entry in sorted(root.iterdir()):
        if entry.name.startswith(".") or entry.name in PROJECT_SKIP:
            continue
        if entry.is_file() and entry.stem.lower() in META_STEMS:
            continue
        try:
            relative = (PROJECTS_DIR / entry.name).as_posix()
            if entry.is_dir():
                times, count, capped = _collect_mtimes(entry)
                if capped:
                    warnings.append(f"{entry.name} 超过 {MAX_PROJECT_FILES} 个文件，改动时间按已扫描部分计算")
                summary = _first_line_text(entry / "README.md")
                if summary is None:
                    newest = sorted(
                        (p for p in entry.rglob("*.md") if not p.name.startswith(".")),
                        key=lambda p: p.stat().st_mtime,
                        reverse=True,
                    )[:1]
                    summary = _first_line_text(newest[0]) if newest else None
                gathered.append({
                    "name": entry.name,
                    "kind": "dir",
                    "relative": relative,
                    "times": times,
                    "file_count": count,
                    "summary": summary,
                })
            elif entry.suffix.lower() == ".md":
                gathered.append({
                    "name": entry.stem,
                    "kind": "file",
                    "relative": relative,
                    "times": [entry.stat().st_mtime],
                    "file_count": 1,
                    "summary": _first_line_text(entry),
                })
        except OSError as exc:
            warnings.append(f"{entry.name} 读取失败：{exc}")

    if not gathered:
        raise KnowledgeSourceError(f"{root} 下没有可投影的项目条目")

    all_times = [ts for item in gathered for ts in item["times"]]
    bulk = _bulk_stamps(all_times)
    # 批量时间戳是正常的信息性说明，不是故障；放进 notes，避免污染页面上的故障提示
    notes = [
        f"{datetime.fromtimestamp(key * 60).astimezone().strftime('%Y-%m-%d %H:%M')} "
        f"有 {bulk[key]} 个文件同时改动（疑似同步工具），排序时已忽略该时间"
        for key in sorted(bulk, reverse=True)
    ]

    items: list[dict] = []
    for item in gathered:
        times = [ts for ts in item["times"] if int(ts // 60) not in bulk]
        source = "file"
        if not times:
            times = item["times"]
            source = "synced"
        updated = _iso(max(times)) if times else None
        hint = DATE_PREFIX_RE.match(item["name"])
        items.append({
            "name": item["name"],
            "kind": item["kind"],
            "relative": item.get("relative"),
            "updated": updated,
            "updated_source": source,
            "date_hint": hint.group(1) if hint else None,
            "file_count": item["file_count"],
            "summary": item["summary"],
        })

    # 有文件名日期的按文件名日期排序（那是作者自己标的时间），否则按真实改动时间
    # 同名条目（项目目录 + 同名笔记文件）只保留目录，避免台账里出现两份
    merged: dict[str, dict] = {}
    for item in items:
        existing = merged.get(item["name"])
        if existing is None:
            merged[item["name"]] = item
        elif existing["kind"] == "file" and item["kind"] == "dir":
            merged[item["name"]] = item
    items = list(merged.values())

    def activity(item: dict) -> tuple[int, str, str]:
        # 只有批量时间戳的项目无法判断真实活动时间，排到末尾而不是被顶到最前
        # （reverse=True 降序，权重大的排前面）
        if item["updated_source"] != "file" and not item["date_hint"]:
            return (0, "", "")
        day = item["date_hint"] or (item["updated"] or "")[:10]
        return (1, day, item["updated"] or "")

    items.sort(key=activity, reverse=True)

    total = len(items)
    return {
        "file": str(PROJECTS_DIR),
        "items": items[:MAX_PROJECTS],
        "total": total,
        "truncated": total > MAX_PROJECTS,
        "warnings": warnings,
        "notes": notes,
    }


# --------------------------------------------------------------------------
# 财务月度复盘  06-Growth/Finance/YYYY-MM-financial-review.md
# --------------------------------------------------------------------------

FINANCE_DIR = Path("06-Growth") / "Finance"
FINANCE_FILE_RE = re.compile(r"^(\d{4})-(\d{2})-(?:financial?-review|finance-review)")
FINANCE_ROW_RE = re.compile(r"^\|(.+)\|\s*$")
FINANCE_SEP_RE = re.compile(r"^:?-{2,}:?$")
FINANCE_SECTIONS = {"本月概况": "summary", "支出结构": "expenses"}


def _split_row(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def _is_separator(cells: list[str]) -> bool:
    return bool(cells) and all(FINANCE_SEP_RE.match(cell.replace(" ", "")) for cell in cells)


def _latest_finance_file(finance_dir: Path) -> Path | None:
    candidates: list[tuple[str, Path]] = []
    for entry in finance_dir.glob("*.md"):
        match = FINANCE_FILE_RE.match(entry.name)
        if match:
            candidates.append((f"{match.group(1)}-{match.group(2)}", entry))
    if not candidates:
        return None
    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1]


def parse_finance(knowledge_dir: Path = KNOWLEDGE_DIR) -> dict:
    """抽取最近一份月度财务复盘的核心数字。只读，不推断、不改写口径。"""
    finance_dir = knowledge_dir / FINANCE_DIR
    if not finance_dir.is_dir():
        raise KnowledgeSourceError(f"缺少财务复盘目录：{finance_dir}")

    path = _latest_finance_file(finance_dir)
    if path is None:
        raise KnowledgeSourceError(f"{finance_dir} 下没有 YYYY-MM-*-review.md")

    text = _read(path)
    month = FINANCE_FILE_RE.match(path.name).group(0)[:7]

    as_of = None
    for line in text.splitlines():
        if line.strip().startswith(">") and ("截至" in line or "更新于" in line):
            as_of = _clip(line.strip().lstrip("> ").strip(), 160)
            break

    current: str | None = None
    tables: dict[str, list[dict]] = {"summary": [], "expenses": []}
    header: list[str] | None = None
    warnings: list[str] = []

    for line in text.splitlines():
        heading = re.match(r"^##+\s*(?:[一二三四五六七八九十]+、)?\s*([^\s（(]+)", line.strip())
        if heading:
            title = heading.group(1)
            current = FINANCE_SECTIONS.get(title)
            header = None
            continue
        if current is None:
            continue
        match = FINANCE_ROW_RE.match(line.strip())
        if not match:
            if line.strip() and not line.strip().startswith(">"):
                header = None
            continue
        cells = _split_row(line)
        if _is_separator(cells):
            continue
        if header is None:
            header = cells
            continue
        if len(cells) < 2:
            continue
        label = _strip_md(cells[0])
        amount_raw = cells[1].replace(",", "")
        try:
            amount = float(amount_raw)
        except ValueError:
            warnings.append(f"{month} 财务：无法解析金额「{cells[1]}」（{label}）")
            amount = None
        row = {
            "label": label,
            "amount": amount,
            "amount_raw": cells[1],
            "note": _clip(_strip_md(cells[2]), 160) if len(cells) > 2 else "",
        }
        # 概况表用「项目」作表头列名，支出结构用「类别」
        key = "label"
        tables[current].append(row)

    if not tables["summary"]:
        warnings.append(f"{month} 财务复盘未解析到「本月概况」表格")

    return {
        "file": f"{FINANCE_DIR.as_posix()}/{path.name}",
        "month": month,
        "as_of": as_of,
        "summary": tables["summary"],
        "expenses": tables["expenses"],
        "warnings": warnings,
    }


# --------------------------------------------------------------------------
# 日记精力  01-Daily/YYYY-MM/YYYY-MM-DD.md 的「## 状态」段
# --------------------------------------------------------------------------

DAILY_DIR = Path("01-Daily")
ENERGY_DAYS = 7
ENERGY_METRICS = ("精力", "情绪", "专注")
ENERGY_EXTRA = ("睡眠", "运动")
STATUS_HEAD_RE = re.compile(r"^##+\s*状态\s*$", re.M)
STATUS_LINE_RE = re.compile(r"^[-*\s]*([\u4e00-\u9fa5A-Za-z]{2,4})[：:]\s*(.+)$")
SCORE_RE = re.compile(r"^约?\s*([\d.]+)\s*/\s*(\d+)")
BASIS_RE = re.compile(r"[（(]([^）)]+)[）)]\s*$")


def _status_items(text: str) -> dict[str, str]:
    match = STATUS_HEAD_RE.search(text)
    if not match:
        return {}
    body = text[match.end():]
    stop = re.search(r"^##+\s", body, re.M)
    if stop:
        body = body[:stop.start()]
    items: dict[str, str] = {}
    for line in body.splitlines():
        row = STATUS_LINE_RE.match(line.strip())
        if row:
            items[row.group(1)] = row.group(2).strip()
    return items


def _split_score(raw: str) -> dict | None:
    match = SCORE_RE.match(raw)
    if not match:
        return None
    basis = BASIS_RE.search(raw)
    return {
        "score": float(match.group(1)),
        "scale": int(match.group(2)),
        "basis": _clip(basis.group(1), 200) if basis else "",
    }


def parse_energy(knowledge_dir: Path = KNOWLEDGE_DIR, days: int = ENERGY_DAYS) -> dict:
    """抽取最近若干天日记里的精力／情绪／专注评分与本人写下的推断依据。"""
    daily = knowledge_dir / DAILY_DIR
    if not daily.is_dir():
        raise KnowledgeSourceError(f"缺少日记目录：{daily}")

    files = sorted(
        (p for p in daily.glob("*/*.md") if re.fullmatch(r"\d{4}-\d{2}-\d{2}\.md", p.name)),
        reverse=True,
    )
    if not files:
        raise KnowledgeSourceError(f"{daily} 下没有 YYYY-MM-DD.md 日记")

    warnings: list[str] = []
    collected: list[dict] = []
    for path in files:
        try:
            text = _read(path)
        except KnowledgeSourceError as exc:
            warnings.append(str(exc))
            continue
        items = _status_items(text)
        metrics = {}
        for name in ENERGY_METRICS:
            if name in items:
                parsed = _split_score(items[name])
                if parsed:
                    metrics[name] = parsed
        if not metrics:
            continue
        # 睡眠／运动不在「状态」段里，按全文首个同名字段兜底；找不到就不写，不猜
        extra = {}
        for name in ENERGY_EXTRA:
            if name in items:
                extra[name] = items[name]
                continue
            loose = re.search(r"^[-*\s]*" + name + r"[：:]\s*(.+)$", text, re.M)
            if loose:
                extra[name] = _clip(loose.group(1), 80)
        collected.append({
            "date": path.stem,
            "file": f"{DAILY_DIR.as_posix()}/{path.parent.name}/{path.name}",
            "metrics": metrics,
            "extra": extra,
        })
        if len(collected) >= days:
            break

    if not collected:
        raise KnowledgeSourceError("最近日记里没有可解析的「状态」评分")

    return {
        "days": collected,
        "latest": collected[0],
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
        "diary_todos": {"date": today.isoformat(), "items": []},
        "today_plan": None,
        "wip": None,
        "hard_nodes": None,
        "projects": None,
        "finance": None,
        "energy": None,
    }

    if not root.is_dir():
        result["error"] = f"知识库目录不存在：{root}（可用 OPS_KNOWLEDGE_DIR 覆盖）"
        return result

    degraded = False
    try:
        result["diary_todos"] = parse_diary_todos(root, today)
    except KnowledgeSourceError as exc:
        result["diary_todos"] = {"date": today.isoformat(), "items": []}
        degraded = True
        result["warnings"].append(f"日记待办：{exc}")

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

    try:
        projects = parse_projects(root)
        result["projects"] = projects
        result["warnings"].extend(projects["warnings"])
    except KnowledgeSourceError as exc:
        degraded = True
        result["warnings"].append(f"项目台账：{exc}")

    try:
        finance = parse_finance(root)
        result["finance"] = finance
        result["warnings"].extend(finance["warnings"])
    except KnowledgeSourceError as exc:
        degraded = True
        result["warnings"].append(f"财务复盘：{exc}")

    try:
        energy = parse_energy(root)
        result["energy"] = energy
        result["warnings"].extend(energy["warnings"])
    except KnowledgeSourceError as exc:
        degraded = True
        result["warnings"].append(f"日记精力：{exc}")

    result["available"] = bool(
        result["today_plan"] or result["hard_nodes"] or result.get("wip")
        or result.get("projects") or result.get("finance") or result.get("energy")
    )
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
        projects = data.get("projects") or {}
        if projects:
            print(f"项目: {projects.get('total')} 项（展示 {len(projects.get('items', []))} 项）")
        finance = data.get("finance") or {}
        if finance:
            print(f"财务: {finance.get('month')} · 概况 {len(finance.get('summary', []))} 行 · 支出 {len(finance.get('expenses', []))} 类")
            for note in projects.get("notes", []):
                print(f"  ℹ️  {note}")
        for warning in data.get("warnings", []):
            print(f"  ⚠️  {warning}")
        if data.get("error"):
            print(f"  ❌  {data['error']}")

    return 0 if data.get("available") else 1


if __name__ == "__main__":
    sys.exit(main())
