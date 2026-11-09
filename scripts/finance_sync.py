#!/usr/bin/env python3
"""scripts/finance_sync.py: 从知识库日记读取个人实付消费，同步进财务账本。

输入
----
知识库日记 01-Daily/YYYY-MM/YYYY-MM-DD.md 中形如
「支出：午餐黄焖鸡米饭 18.00 元 + 晚餐一食堂猪脚饭 19.00 元，当日个人实付支出合计 **37.00 元**」
的行。只认这种写明合计口径的行，不从正文里猜金额。

输出
----
更新后的 financial_data.json（写到指定路径），可直接上传到服务器发布。

口径
----
- 只加不改：已记录的日期与已有条目原样保留，重复运行不会产生重复记录。
- 日记缺失的日期不补零，按仪表盘既有口径记 pending_review / missing。
- 「应急借款 / 借出」不计消费：按日记原文单独标注在 note 里。它是现金转应收，
  不是消费，也不是本人负债；资产快照另有日期，不在此凭空改写。
- 金额按日记原值写入，不重算、不四舍五入；汇总字段由逐日数组机械推导。
- 汇总里 dailyBaseline 与 runwayMonths 按「历史已记录月支出」折算，
  不随本月增量变动，因此保持原值。
"""

import argparse
import json
import re
import sys
from datetime import date, datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

EXPENSE_LINE = re.compile(
    r"支出[：:]\s*(?P<items>.+?)[，,]\s*当日个人实付支出合计\s*\**\s*"
    r"(?P<total>\d+(?:\.\d+)?)\s*元"
)
ITEM_LINE = re.compile(r"^\s*(?P<label>.+?)\s*(?P<amount>\d+(?:\.\d+)?)\s*元\s*$")
LOAN_LINE = re.compile(r"另转账?(?P<who>[^,，()（）\d]{2,6}?)\s*(?P<amount>\d+(?:\.\d+)?)\s*元")

# 日常餐饮及其他内部的子分类，与账本 desc 的既有写法一致
ROUTINE_SUBCATEGORIES = (
    ("餐饮", ("餐饮", "外卖", "饭", "餐", "粥", "火锅", "烧烤", "奶茶", "咖啡", "食堂", "点心", "早")),
    ("医疗健康", ("医疗", "药", "医院", "体检", "门诊", "看病")),
    ("食品采购", ("食品采购", "买菜", "生鲜", "食材")),
    ("日用品", ("日用", "纸巾", "洗衣", "沐浴")),
    ("交通", ("交通", "地铁", "公交", "打车", "高铁", "火车", "油费", "停车", "单车")),
)
CAPITAL_MARKERS = ("订阅", "充值", "会员", "土币", "TRY", "API 充值", "开通")

# 账本既有配色，逐笔条目沿用同一张表
CATEGORY_COLORS = {
    "餐饮": "#EC4899",
    "医疗健康": "#F43F5E",
    "食品采购": "#34D399",
    "日用品": "#94A3B8",
    "交通": "#0EA5E9",
    "订阅AI": "#4F46E5",
}
ROUTINE_ACCOUNT = "中信"


def classify(label):
    """返回 (子分类, 类型)。资本性支出单独成类；日常消费按子分类归入餐饮及其他。"""
    if any(marker in label for marker in CAPITAL_MARKERS):
        return "订阅AI", "capital"
    for name, keys in ROUTINE_SUBCATEGORIES:
        if any(key in label for key in keys):
            return name, "routine"
    return "餐饮", "routine"


def parse_day(text, day_value):
    """从一篇日记里解析出当日消费。返回 None 表示这篇日记没有写明实付合计。"""
    for line in text.splitlines():
        match = EXPENSE_LINE.search(line)
        if not match:
            continue
        total = float(match.group("total"))
        items = []
        for chunk in match.group("items").split("+"):
            chunk = chunk.strip()
            if not chunk:
                continue
            item = ITEM_LINE.match(chunk)
            if not item:
                return {"error": f"无法解析条目：{chunk}", "day": day_value}
            label = item.group("label").strip()
            amount = float(item.group("amount"))
            category, kind = classify(label)
            items.append({"label": label, "amount": amount, "category": category, "type": kind})
        summed = round(sum(i["amount"] for i in items), 2)
        if abs(summed - total) > 0.005:
            return {
                "error": f"条目合计 {summed} 与日记合计 {total} 不一致，拒绝写入",
                "day": day_value,
            }
        loans = []
        for loan in LOAN_LINE.finditer(line):
            loans.append({"who": loan.group("who").strip(), "amount": float(loan.group("amount"))})
        routine = round(sum(i["amount"] for i in items if i["type"] == "routine"), 2)
        capital = float(round(sum(i["amount"] for i in items if i["type"] == "capital"), 2))
        return {
            "day": day_value,
            "items": items,
            "loans": loans,
            "total": total,
            "routine": routine,
            "capital": capital,
            "count": len(items),
            "recordStatus": "recorded",
        }
    return None


def load_aliases():
    path = BASE_DIR / "data" / "private_aliases.json"
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    if not isinstance(data, dict):
        return {}
    mapping = {}
    for group in ("names", "relations"):
        entries = data.get(group)
        if isinstance(entries, dict):
            for real, alias in entries.items():
                if isinstance(real, str) and isinstance(alias, str):
                    mapping[real] = alias
    return mapping


def scrub(text, aliases):
    if not isinstance(text, str):
        return text
    out = text
    for real, alias in aliases.items():
        if real:
            out = out.replace(real, alias)
    return out


def weekly_buckets(daily, year, month):
    """按周一起算把逐日数组切成自然周。

    返回 [起始日, 结束日, 合计, 笔数, 实际天数]。跨月的周（如 11/01 是周日，
    其自然周从上月最后一天开始）显示起点夹取到账本覆盖的第一天。
    """
    buckets = []
    for entry in daily:
        day = int(entry["day"])
        current = date(year, month, day)
        start = day - current.weekday()
        if not buckets or buckets[-1][0] != start:
            buckets.append([start, day, 0.0, 0, 0])
        buckets[-1][1] = day
        buckets[-1][2] += float(entry.get("total") or 0.0)
        buckets[-1][3] += int(entry.get("count") or 0)
        buckets[-1][4] += 1
    return buckets


def rebuild_spending_rhythm(rhythm, daily, as_of, year, month):
    """按逐日数组重算本月/本周/今日口径。"""
    month_days = [int(e["day"]) for e in daily]
    month_total = round(sum(float(e.get("total") or 0.0) for e in daily), 2)
    month_count = sum(int(e.get("count") or 0) for e in daily)
    buckets = weekly_buckets(daily, year, month)
    current = buckets[-1]
    previous = buckets[-2] if len(buckets) > 1 else None
    day_entry = next((e for e in daily if int(e["day"]) == as_of), None)
    prev_day = next((e for e in daily if int(e["day"]) == as_of - 1), None)
    first_day = month_days[0]
    month_label = f"{month:02d}-{first_day:02d} ~ {month:02d}-{month_days[-1]:02d}"
    weekday = "一二三四五六日"[date(year, month, as_of).weekday()]

    def week_range(bucket):
        # 跨月自然周的显示起点夹取到账本覆盖的第一天
        start = max(bucket[0], first_day)
        return f"{month:02d}-{start:02d}~{month:02d}-{bucket[1]:02d}"
    return {
        "asOf": f"{month:02d}-{as_of:02d}",
        "weekday": weekday,
        "month": {
            "label": "本月累计",
            "range": month_label,
            "days": len(month_days),
            "total": month_total,
            "count": month_count,
            "avgPerDay": round(month_total / len(month_days), 2) if month_days else 0.0,
        },
        "week": {
            "label": "本周至今",
            "range": week_range(current),
            "days": current[4],
            "total": round(current[2], 2),
            "count": current[3],
            "prevRange": week_range(previous) if previous else "",
            "prevTotal": round(previous[2], 2) if previous else 0,
            "prevCount": previous[3] if previous else 0,
            "avgPerDay": round(current[2] / current[4], 2) if current[4] else 0.0,
        },
        "day": {
            "label": "今日",
            "range": f"{month:02d}-{as_of:02d}",
            "days": 1,
            "total": round(float(day_entry.get("total") or 0.0), 2) if day_entry else 0.0,
            "count": int(day_entry.get("count") or 0) if day_entry else 0,
            "prevRange": f"{month:02d}-{as_of - 1:02d}" if prev_day else "",
            "prevTotal": round(float(prev_day.get("total") or 0.0), 2) if prev_day else 0.0,
            "avgPerDay": round(float(day_entry.get("total") or 0.0), 2) if day_entry else 0.0,
        },
        "byWeek": [
            {
                "label": week_range(bucket),
                "short": f"{max(bucket[0], first_day)}–{bucket[1]}",
                "days": bucket[4],
                "total": round(bucket[2], 2),
                "count": bucket[3],
                "partial": True,
            }
            for bucket in buckets
        ],
    }


def parse_expense_desc(desc):
    parts = {}
    for segment in (desc or "").split("、"):
        segment = segment.strip()
        match = re.match(r"^(?P<name>.+?)\s*(?P<amount>\d+(?:\.\d+)?)$", segment)
        if match:
            parts[match.group("name").strip()] = float(match.group("amount"))
    return parts


def apply_day(ledger, day, aliases, year, month):
    """把一天的消费写进账本。只加不改。"""
    transactions = ledger["transactions"]
    daily = list(transactions.get("daily") or [])
    if any(int(e["day"]) == day["day"] for e in daily):
        return False, f"11/{day['day']:02d} 已在账本中，跳过"

    routine, capital = day["routine"], day["capital"]
    daily.append({
        "day": day["day"],
        "routine": routine,
        "capital": capital,
        "total": day["total"],
        "count": day["count"],
        "recordStatus": day["recordStatus"],
    })
    daily.sort(key=lambda e: int(e["day"]))

    # 汇总金额由逐日数组机械推导
    total = round(sum(float(e.get("total") or 0.0) for e in daily), 2)
    count = sum(int(e.get("count") or 0) for e in daily)
    recorded_days = sum(1 for e in daily if e.get("recordStatus") == "recorded")
    max_day = max(int(e["day"]) for e in daily)
    transactions["daily"] = daily
    transactions["byDay"] = [dict(e) for e in daily]
    transactions["total"] = total
    transactions["count"] = count
    transactions["recordedDays"] = recorded_days
    transactions["maxDay"] = max_day
    transactions["coverageRatio"] = round(len(daily) / max_day * 100, 1)
    transactions["avgPerRecordedDay"] = round(total / recorded_days, 2) if recorded_days else 0.0
    transactions["avgPerItem"] = round(total / count, 2) if count else 0.0

    # 单笔最大项：账本没有逐笔清单，历史最大值保留；新条目更大才替换
    max_item = transactions.get("maxItem")
    for item in day["items"]:
        candidate = {
            "amount": item["amount"],
            "category": item["category"],
            "note": item["label"],
            "date": f"2026-11-{day['day']:02d}",
        }
        if not max_item or candidate["amount"] > float(max_item.get("amount") or 0):
            max_item = candidate
    if max_item:
        transactions["maxItem"] = max_item

    # 逐笔条目：沿用账本既有字段结构，让新消费真正出现在「逐笔开支」列表
    items_list = list(transactions.get("items") or [])
    weekday = "一二三四五六日"[date(year, month, day["day"]).weekday()]
    for item in day["items"]:
        items_list.append({
            "date": f"{year:04d}-{month:02d}-{day['day']:02d}",
            "day": day["day"],
            "amount": item["amount"],
            "category": item["category"],
            "note": item["label"],
            "account": ROUTINE_ACCOUNT if item["type"] == "routine" else "",
            "kind": item["type"],
            "weekday": weekday,
            "color": CATEGORY_COLORS.get(item["category"], "#94A3B8"),
        })
    items_list.sort(key=lambda entry: (entry["date"], entry.get("note") or ""))
    transactions["items"] = items_list

    # 分类汇总：由逐笔条目机械推导，金额降序
    grouped = {}
    for item in items_list:
        entry = grouped.setdefault(item["category"], {"amount": 0.0, "count": 0, "kind": item["kind"], "color": item["color"]})
        entry["amount"] = round(entry["amount"] + item["amount"], 2)
        entry["count"] += 1
    transactions["byCategory"] = [
        {
            "category": category,
            "amount": entry["amount"],
            "count": entry["count"],
            "kind": entry["kind"],
            "color": entry["color"],
            "pct": round(entry["amount"] / total * 100, 1) if total else 0.0,
        }
        for category, entry in sorted(grouped.items(), key=lambda pair: -pair[1]["amount"])
    ]

    # 零消费日与待核实日：由逐日数组的记录状态推导
    transactions["zeroDays"] = [int(e["day"]) for e in daily if e.get("recordStatus") == "confirmed_zero"]
    transactions["reviewDays"] = [int(e["day"]) for e in daily if e.get("recordStatus") == "pending_review"]

    # 支出分类：日常餐饮及其他按子分类累加，资本性单列
    structure = ledger.get("expenseStructure") or []
    routine_index = next((i for i, s in enumerate(structure) if s.get("type") == "routine"), None)
    capital_index = next((i for i, s in enumerate(structure) if s.get("type") == "onetime_capital"), None)
    sub_parts = parse_expense_desc(structure[routine_index].get("desc")) if routine_index is not None else {}
    for item in day["items"]:
        if item["type"] == "capital":
            if capital_index is not None:
                structure[capital_index]["amount"] = round(
                    float(structure[capital_index].get("amount") or 0.0) + item["amount"], 2)
                desc = structure[capital_index].get("desc") or ""
                entry = f"11/{day['day']:02d} {item['label']} {item['amount']:.2f} 元"
                structure[capital_index]["desc"] = f"{desc} + {entry}" if desc else entry
        else:
            if routine_index is None:
                continue
            sub_parts[item["category"]] = round(sub_parts.get(item["category"], 0.0) + item["amount"], 2)
    if routine_index is not None:
        structure[routine_index]["amount"] = round(
            float(structure[routine_index].get("amount") or 0.0) + routine, 2)
        structure[routine_index]["desc"] = "、".join(
            f"{name}{amount:g}" for name, amount in sub_parts.items())
    ledger["expenseStructure"] = structure

    # 逐笔说明：只追加新的一天，保留原有口径文字
    note = transactions.get("note") or ""
    addition = f"11/{day['day']:02d}支出{day['count']}笔{day['total']:.2f}元"
    for loan in day.get("loans") or []:
        addition += f"（另转账{scrub(loan['who'], aliases)} {loan['amount']:.2f} 元往来应急借款，属暂付周转资本项单独标注，不计消费）"
    base = (note or "").rstrip("。； ")
    transactions["note"] = f"{base}；{addition}" if base else addition

    # 期间口径
    as_of = max_day
    ledger["asOf"] = f"2026-11-{as_of:02d}"
    ledger["updatedAt"] = date.today().isoformat()
    ledger["daysInPeriod"] = as_of

    summary = ledger.setdefault("summary", {})
    routine_total = round(sum(float(e.get("routine") or 0.0) for e in daily), 2)
    capital_total = round(sum(float(e.get("capital") or 0.0) for e in daily), 2)
    summary["expenseTotal"] = total
    summary["expenseTotalWithPro"] = total
    summary["routineTotal"] = routine_total
    summary["oneTimeTotal"] = capital_total
    summary["subscriptionTotal"] = capital_total
    summary["oneTimeRatio"] = round(capital_total / total * 100, 1) if total else 0.0
    summary["subscriptionRatio"] = summary["oneTimeRatio"]
    summary["dailyAverageRoutine"] = round(routine_total / as_of, 2) if as_of else 0.0
    summary["dailyAverageTotal"] = round(total / as_of, 2) if as_of else 0.0
    income = float(summary.get("incomeTotal") or 0.0)
    summary["netSavings"] = round(income - total, 2)
    summary["netSavingsExcludeFamily"] = summary["netSavings"]
    summary["savingsRate"] = round(income / total * 100, 1) if (total and income) else 0.0
    summary["savingsRateApplicable"] = bool(total and income)

    ledger["spendingRhythm"] = rebuild_spending_rhythm(ledger.get("spendingRhythm"), daily, as_of, year, month)

    for month_row in ledger.get("monthlySummaries") or []:
        if month_row.get("period") == f"2026-{month:02d}":
            month_row["through"] = f"2026-{month:02d}-{as_of:02d}"
            month_row["expense"] = total
            note_text = month_row.get("note") or ""
            marker = f"{month:02d}/{day['day']:02d}支出{day['total']:.2f}元已并入"
            if marker not in note_text:
                month_row["note"] = f"{note_text} {marker}。"

    for row in ledger.get("historicalComparison") or []:
        if "11月" in str(row.get("month")):
            row["expense"] = total
            row["savings"] = round(float(row.get("income") or 0.0) - total, 2)

    zeros = [
        f"{month:02d}/{int(e['day']):02d}"
        for e in daily if e.get("recordStatus") == "confirmed_zero"
    ]
    snapshot = str(ledger.get("assetSnapshotDate") or f"2026-{month:02d}-03")
    snapshot_label = snapshot[-5:]
    status = f"资产{snapshot_label}用户自报，消费截至{month:02d}/{as_of:02d}共{count}笔"
    if zeros:
        status += f"（{'、'.join(zeros)}确认零消费）"
    status += "；收入未完整核验"
    ledger["status"] = status

    return True, f"11/{day['day']:02d} 写入 {day['count']} 笔 {day['total']:.2f} 元"


def main(argv=None):
    parser = argparse.ArgumentParser(description="从知识库日记同步个人消费到财务账本")
    parser.add_argument("--ledger", required=True, help="financial_data.json 的本地路径")
    parser.add_argument("--out", required=True, help="更新后的账本输出路径")
    parser.add_argument("--knowledge-dir", default=None, help="知识库根目录，默认 ~/Documents/knowledge")
    parser.add_argument("--period", default="2026-11", help="要同步的月份")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)

    knowledge_dir = Path(args.knowledge_dir) if args.knowledge_dir else Path.home() / "Documents" / "knowledge"
    daily_dir = knowledge_dir / "01-Daily" / args.period
    if not daily_dir.exists():
        print(f"❌ 日记目录不存在：{daily_dir}")
        return 1

    ledger = json.loads(Path(args.ledger).read_text(encoding="utf-8"))
    period = str(ledger.get("period") or args.period)
    year, month = int(period.split("-")[0]), int(period.split("-")[1])
    aliases = load_aliases()
    applied, skipped = [], []
    for path in sorted(daily_dir.glob("*.md")):
        match = re.search(r"(\d{4})-(\d{2})-(\d{2})", path.name)
        if not match:
            continue
        day_value = int(match.group(3))
        parsed = parse_day(path.read_text(encoding="utf-8"), day_value)
        if parsed is None:
            skipped.append(f"{path.name}: 日记未写明个人实付合计，不动账本")
            continue
        if parsed.get("error"):
            print(f"❌ {path.name}: {parsed['error']}")
            return 1
        changed, message = apply_day(ledger, parsed, aliases, year, month)
        (applied if changed else skipped).append(message)

    for line in applied:
        print(f"✅ {line}")
    for line in skipped:
        print(f"ℹ️  {line}")
    print(f"合计写入 {len(applied)} 天")

    if args.dry_run:
        print("（dry-run，未写文件）")
        return 0
    Path(args.out).write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"✅ 已写出：{args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
