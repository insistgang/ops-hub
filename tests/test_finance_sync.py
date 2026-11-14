"""日记→账本同步的回归测试。

口径：只加不改、重复运行不产生重复记录、日记缺失不补零、
应急借款不计消费只单独标注。
"""
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import finance_sync


def ledger_fixture():
    """自洽的小账本：逐日合计、逐笔条目与汇总三者必须对得上。"""
    return {
        "period": "2026-11",
        "asOf": "2026-11-03",
        "updatedAt": "2026-11-03",
        "daysInPeriod": 3,
        "status": "资产11/03用户自报，消费截至11/03共4笔；收入未完整核验",
        "assetSnapshotDate": "2026-11-03",
        "summary": {
            "incomeTotal": 0.0, "expenseTotal": 46.5, "routineTotal": 46.5,
            "oneTimeTotal": 0.0, "dailyAverageRoutine": 15.5, "dailyAverageTotal": 15.5,
            "netSavings": -46.5, "netSavingsExcludeFamily": -46.5,
            "receivablesTotal": 16000.0, "totalAssets": 61014.0, "totalNetAssets": 61014.0,
        },
        "receivables": [
            {"title": "个人借款B", "amount": 3000.0, "type": "个人借款",
             "status": "10/28 晚从中信转出；姓名与回款日未知，匿名展示；现金转应收，不是消费或本人负债",
             "desc": "10/28 晚从中信转出；匿名展示"},
        ],
        "expenseStructure": [
            {"category": "日常餐饮及其他", "amount": 46.5, "type": "routine",
             "desc": "餐饮43、日用品3、交通0.5", "color": "#EC4899"},
        ],
        "transactions": {
            "coverage": "partial", "note": "截至2026-11-03已记录4笔46.50元",
            "total": 46.5, "count": 4, "recordedDays": 1, "maxDay": 3,
            "coverageRatio": 66.7, "avgPerRecordedDay": 46.5, "avgPerItem": 11.63,
            "maxItem": {"amount": 28.0, "category": "餐饮", "note": "午餐水饺及拼盘", "date": "2026-11-01"},
            "daily": [
                {"day": 1, "routine": 46.5, "capital": 0.0, "total": 46.5, "count": 4, "recordStatus": "recorded"},
                {"day": 3, "routine": 0.0, "capital": 0.0, "total": 0.0, "count": 0, "recordStatus": "confirmed_zero"},
            ],
            "byDay": [],
            "zeroDays": [3],
            "reviewDays": [],
            "byCategory": [],
            "items": [
                {"date": "2026-11-01", "day": 1, "amount": 28.0, "category": "餐饮", "note": "午餐水饺及拼盘",
                 "account": "中信", "kind": "routine", "weekday": "日", "color": "#EC4899"},
                {"date": "2026-11-01", "day": 1, "amount": 15.0, "category": "餐饮", "note": "晚餐黄焖鸡米饭",
                 "account": "中信", "kind": "routine", "weekday": "日", "color": "#EC4899"},
                {"date": "2026-11-01", "day": 1, "amount": 3.0, "category": "日用品", "note": "宿舍洗衣",
                 "account": "中信", "kind": "routine", "weekday": "日", "color": "#94A3B8"},
                {"date": "2026-11-01", "day": 1, "amount": 0.5, "category": "交通", "note": "电动车充电",
                 "account": "中信", "kind": "routine", "weekday": "日", "color": "#0EA5E9"},
            ],
        },
        "spendingRhythm": {},
        "monthlySummaries": [{"period": "2026-11", "through": "2026-11-03", "expense": 46.5, "note": "原说明"}],
        "historicalComparison": [{"month": "11月（已记录）", "expense": 46.5, "income": 0.0, "savings": -46.5}],
    }


DAY_TEXT = (
    "- 支出：午餐黄焖鸡米饭 18.00 元 + 晚餐一食堂猪脚饭 19.00 元，"
    "当日个人实付支出合计 **37.00 元**（日常支出走中信；"
    "另转账测试对象甲 200.00 元往来应急借款，属暂付周转资本项单独标注）\n"
)


class FinanceSyncTests(unittest.TestCase):
    def test_parse_day_extracts_items_and_total(self):
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed["total"], 37.0)
        self.assertEqual(parsed["count"], 2)
        self.assertEqual(parsed["routine"], 37.0)
        self.assertEqual(parsed["capital"], 0.0)
        self.assertEqual([i["category"] for i in parsed["items"]], ["餐饮", "餐饮"])
        self.assertEqual(parsed["loans"][0]["amount"], 200.0)

    def test_unknown_account_and_partial_day_are_not_invented(self):
        text = ("- 支出：午餐 10.00 元 + 电动车充电 1.00 元，当日个人实付支出合计 **11.00 元**"
                "（截至 18:00，当天尚未结束）")
        parsed = finance_sync.parse_day(text, 9)
        self.assertEqual("pending_review", parsed["recordStatus"])
        self.assertEqual("", parsed["routineAccount"])
        self.assertEqual(["餐饮", "交通"], [i["category"] for i in parsed["items"]])
        ledger = ledger_fixture()
        finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
        items = [i for i in ledger["transactions"]["items"] if i["day"] == 9]
        self.assertEqual(["", ""], [i["account"] for i in items])
        self.assertIn(9, ledger["transactions"]["reviewDays"])

    def test_unknown_category_fails_closed(self):
        text = "- 支出：未知商品 8.00 元，当日个人实付支出合计 **8.00 元**"
        self.assertIn("无法确定支出分类", finance_sync.parse_day(text, 9)["error"])

    def test_parse_day_without_total_line_returns_none(self):
        self.assertIsNone(finance_sync.parse_day("今天没有写消费。\n", 9))

    def test_parse_day_rejects_mismatched_sum(self):
        text = "- 支出：午餐黄焖鸡米饭 18.00 元，当日个人实付支出合计 **99.00 元**\n"
        parsed = finance_sync.parse_day(text, 9)
        self.assertIn("error", parsed)
        self.assertIn("不一致", parsed["error"])

    def test_apply_day_adds_daily_entries_items_and_categories(self):
        ledger = ledger_fixture()
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        changed, _ = finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
        self.assertTrue(changed)

        transactions = ledger["transactions"]
        self.assertEqual(len(transactions["daily"]), 3)
        self.assertEqual(transactions["daily"][-1]["day"], 9)
        self.assertEqual(transactions["daily"][-1]["total"], 37.0)
        self.assertEqual(transactions["daily"][-1]["recordStatus"], "recorded")
        self.assertEqual(transactions["total"], 83.5)
        self.assertEqual(transactions["count"], 6)
        self.assertEqual(transactions["maxDay"], 9)
        self.assertEqual(len(transactions["items"]), 6)
        self.assertEqual(transactions["items"][-1]["weekday"], "一")
        self.assertEqual(transactions["items"][-1]["account"], "中信")

        # 逐笔合计必须与逐日汇总一致
        self.assertEqual(round(sum(i["amount"] for i in transactions["items"]), 2), transactions["total"])

        # 分类汇总由逐笔条目推导
        by_category = {c["category"]: c for c in transactions["byCategory"]}
        self.assertEqual(by_category["餐饮"]["amount"], 43.0 + 37.0)
        self.assertEqual(by_category["餐饮"]["count"], 4)

    def test_apply_day_is_idempotent(self):
        ledger = ledger_fixture()
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
        total_after_first = ledger["transactions"]["total"]
        items_after_first = len(ledger["transactions"]["items"])

        changed, message = finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
        self.assertFalse(changed)
        self.assertIn("已在账本中", message)
        self.assertEqual(ledger["transactions"]["total"], total_after_first)
        self.assertEqual(len(ledger["transactions"]["items"]), items_after_first)

    def test_unconfirmed_old_diary_never_creates_a_receivable(self):
        for existing_correction in (False, True):
            with self.subTest(existing_correction=existing_correction):
                ledger = ledger_fixture()
                if existing_correction:
                    ledger["receivables"].append({"title": "个人借款A", "amount": 7300.0,
                        "status": "测试转账对方未收，未形成借款"})
                original = json.dumps(ledger["receivables"], sort_keys=True)
                parsed = finance_sync.parse_day(DAY_TEXT, 9)
                finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
                self.assertEqual(original, json.dumps(ledger["receivables"], sort_keys=True))
                self.assertEqual(ledger["summary"]["receivablesTotal"], 16000.0)
                self.assertIn("是否形成借款待核", ledger["transactions"]["note"])

    def test_partial_income_never_becomes_a_savings_rate(self):
        ledger = ledger_fixture()
        ledger["incomeRecordStatus"] = "unrecorded"
        ledger["incomeCoverage"] = "partial"
        ledger["summary"]["incomeTotal"] = 1370.0
        ledger["incomeBreakdown"] = [{"source": "家庭支持", "amount": 1100.0},
                                      {"source": "劳务收入", "amount": 270.0}]
        finance_sync.apply_day(ledger, finance_sync.parse_day(DAY_TEXT, 9), {}, 2026, 11)
        self.assertFalse(ledger["summary"]["savingsRateApplicable"])
        self.assertIsNone(ledger["summary"]["savingsRate"])
        self.assertEqual(ledger["summary"]["netSavings"], 1286.5)
        self.assertEqual(ledger["summary"]["netSavingsExcludeFamily"], 186.5)

    def test_loan_is_noted_but_never_counted_as_expense(self):
        ledger = ledger_fixture()
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        finance_sync.apply_day(ledger, parsed, {"测试对象甲": "匿名对象"}, 2026, 11)
        transactions = ledger["transactions"]
        self.assertEqual(transactions["total"], 83.5)
        self.assertNotIn(200.0, [i["amount"] for i in transactions["items"]])
        self.assertIn("匿名对象 200.00 元", transactions["note"])
        self.assertIn("不计消费", transactions["note"])
        self.assertNotIn("测试对象甲", json.dumps(ledger, ensure_ascii=False))

    def test_explicitly_confirmed_loan_becomes_a_receivable_not_an_expense(self):
        ledger = ledger_fixture()
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        parsed["loans"][0]["confirmed"] = True
        finance_sync.apply_day(ledger, parsed, {"测试对象甲": "匿名对象"}, 2026, 11)
        # 借出按账本既有口径记应收：资产快照另有日期，现金不动
        self.assertEqual(len(ledger["receivables"]), 2)
        added = ledger["receivables"][-1]
        self.assertEqual(added["amount"], 200.0)
        self.assertEqual(added["type"], "个人借款")
        titles = [row["title"] for row in ledger["receivables"]]
        self.assertIn("个人借款B", titles, "原有应收条目必须保留")
        self.assertEqual(added["title"], "个人借款C", "新条目取不冲突的编号")
        self.assertEqual(len(set(titles)), len(titles), "应收标题不得重复")
        self.assertEqual(ledger["summary"]["receivablesTotal"], 16200.0)
        self.assertEqual(ledger["summary"]["totalAssets"], 61214.0)
        self.assertEqual(ledger["summary"]["totalNetAssets"], 61214.0)
        # 现金是 11-03 的自报快照，支出与借出都不从中扣减
        self.assertNotIn("availableCash", ledger["summary"])
        # 消费合计里不含这笔借出
        self.assertEqual(ledger["transactions"]["total"], 83.5)

    def test_loan_receivable_is_not_duplicated_on_rerun(self):
        ledger = ledger_fixture()
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        parsed["loans"][0]["confirmed"] = True
        finance_sync.apply_day(ledger, parsed, {"测试对象甲": "匿名对象"}, 2026, 11)
        finance_sync.apply_day(ledger, parsed, {"测试对象甲": "匿名对象"}, 2026, 11)
        self.assertEqual(len(ledger["receivables"]), 2)
        self.assertEqual(ledger["summary"]["receivablesTotal"], 16200.0)

    def test_existing_included_loan_is_not_added_again(self):
        ledger = ledger_fixture()
        ledger["receivables"].append({"title": "个人借款A", "amount": 7300.0, "type": "个人借款",
                                      "status": "11/09 微信转出应急借款 200 元已并入；原有借款"})
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        parsed["loans"][0]["confirmed"] = True
        finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
        self.assertEqual(len(ledger["receivables"]), 2)
        self.assertEqual(ledger["summary"]["receivablesTotal"], 16000.0)

    def test_new_loan_preserves_unknown_asset_totals(self):
        ledger = ledger_fixture()
        ledger["summary"]["totalAssets"] = None
        ledger["summary"]["totalNetAssets"] = None
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        parsed["loans"][0]["confirmed"] = True
        finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
        self.assertIsNone(ledger["summary"]["totalAssets"])
        self.assertIsNone(ledger["summary"]["totalNetAssets"])
        self.assertEqual(ledger["summary"]["receivablesTotal"], 16200.0)

    def test_existing_consumption_new_loan_reports_change(self):
        ledger = ledger_fixture()
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        parsed["loans"][0]["confirmed"] = True
        no_loan = {**parsed, "loans": []}
        finance_sync.apply_day(ledger, no_loan, {}, 2026, 11)
        changed, _ = finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
        self.assertTrue(changed)
        self.assertEqual(len(ledger["receivables"]), 2)
        changed, _ = finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
        self.assertFalse(changed)
        self.assertEqual(len(ledger["receivables"]), 2)

    def test_summary_daily_baseline_and_runway_stay_untouched(self):
        ledger = ledger_fixture()
        ledger["summary"]["dailyBaseline"] = 42.7
        ledger["summary"]["runwayMonths"] = 13.5
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
        self.assertEqual(ledger["summary"]["dailyBaseline"], 42.7)
        self.assertEqual(ledger["summary"]["runwayMonths"], 13.5)

    def test_missing_diary_days_are_not_zero_filled(self):
        ledger = ledger_fixture()
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
        days = {e["day"] for e in ledger["transactions"]["daily"]}
        self.assertNotIn(2, days)
        self.assertNotIn(4, days)

    def test_expense_structure_desc_keeps_sub_breakdown(self):
        ledger = ledger_fixture()
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
        routine = next(s for s in ledger["expenseStructure"] if s["type"] == "routine")
        self.assertEqual(routine["amount"], 46.5 + 37.0)
        self.assertIn("餐饮80", routine["desc"])
        self.assertIn("日用品3", routine["desc"])
        self.assertIn("交通0.5", routine["desc"])

    def test_spending_rhythm_uses_real_month_prefix(self):
        ledger = ledger_fixture()
        parsed = finance_sync.parse_day(DAY_TEXT, 9)
        finance_sync.apply_day(ledger, parsed, {}, 2026, 11)
        rhythm = ledger["spendingRhythm"]
        self.assertEqual(rhythm["asOf"], "11-09")
        self.assertEqual(rhythm["month"]["range"], "11-01 ~ 11-09")
        self.assertEqual(rhythm["day"]["range"], "11-09")
        self.assertEqual(rhythm["weekday"], "一")


if __name__ == "__main__":
    unittest.main()
