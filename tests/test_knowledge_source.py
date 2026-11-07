import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import knowledge_source
import sanitize_public

PLAN = """---
title: 今日计划 2026-11-07
date: 2026-11-07
type: daily-plan
---

# 📋 今日计划 -- 2026年11月7日 周六

> **方向**：先把本人动作做掉。
> **今日容量**：七成。

## 🎯 今日必做（2 件）

### 1. [P0·大论文] 过第一批 10 张 `[必须本人]`
- **完成标准**：把 10 行填上字。
- **预计**：45--60 分钟。
- **第一步**（5 分钟）：双击启动器。

### 2. [P2·六级] 一次 25 分钟专项
- **完成标准**：只重做本周错题。
"""

NODES = """# 硬节点台账

## 活跃节点

| 日期 | 类型 | 事项 | 决策日 | 影响 | 来源 | 状态 |
|---|---|---|---|---|---|---|
| 2026-11-15 | 里程碑 | 全图复核目标 | — | 影响甲 | 某来源 | 活跃 |
| 2026-11-01 起 | 续费核对 | 域名续费决策 | 2026-11-30 前 | 影响乙 | 某来源 | 活跃 |
| 2026-10-20 | 到期 | 已过期的活跃节点 | — | 影响丙 | 某来源 | 活跃 |
| 2026-11-06 | 放榜 | 已经办结的节点 | — | 影响丁 | 某来源 | 已闭环 |

| 2026-11-16 至 11-18 | 里程碑 | 数据冻结 | — | 影响戊 | 某来源 | 活跃 |

## 已逾期未闭环

| 原定日期 | 事项 | 逾期天数 | 处置 |
|---|---|---|---|
| 2026-10-23 | 已闭环的事项 | — | **已于 2026-11-01 全面闭环** |
| 2026-10-20 | 真逾期事项 | 18 | 尚未处理 |

## 每周固定

| 触发 | 事项 | 说明 |
|---|---|---|
| 每周日 | 周复盘 | 技能入口 |
"""


class KnowledgeSourceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "01-Daily" / "今日计划").mkdir(parents=True)
        (self.root / "00-Inbox").mkdir(parents=True)
        (self.root / "01-Daily" / "今日计划" / "2026-11-07.md").write_text(PLAN, encoding="utf-8")
        (self.root / "00-Inbox" / "硬节点台账.md").write_text(NODES, encoding="utf-8")
        self.today = date(2026, 11, 7)

    def test_today_plan_items(self):
        plan = knowledge_source.parse_today_plan(self.root, self.today)
        self.assertTrue(plan["is_today"])
        self.assertEqual(plan["date"], "2026-11-07")
        self.assertEqual(len(plan["items"]), 2)
        first = plan["items"][0]
        self.assertEqual(first["n"], 1)
        self.assertEqual(first["tag"], "P0·大论文")
        self.assertEqual(first["assignee"], "必须本人")
        self.assertEqual(first["title"], "过第一批 10 张")
        self.assertIn("填上字", first["done_standard"])
        self.assertEqual(first["estimate"], "45--60 分钟。")
        # 第二项没有 [必须本人] 标记，不得凭空补上
        self.assertEqual(plan["items"][1]["assignee"], "")

    def test_today_plan_falls_back_and_flags(self):
        plan = knowledge_source.parse_today_plan(self.root, date(2026, 12, 1))
        self.assertFalse(plan["is_today"])
        self.assertEqual(plan["file"], "2026-11-07.md")
        self.assertTrue(any("已回退" in w for w in plan["warnings"]))

    def test_hard_nodes_classification(self):
        nodes = knowledge_source.parse_hard_nodes(self.root, self.today)
        titles = {row["title"] for row in nodes["active"]}
        self.assertIn("全图复核目标", titles)
        self.assertNotIn("已经办结的节点", titles)  # 已闭环不入活跃
        self.assertIn("数据冻结", titles)  # 区间行也要解析到

        active = {row["title"]: row for row in nodes["active"]}
        self.assertEqual(active["全图复核目标"]["days_left"], 8)
        # 区间「2026-11-16 至 11-18」按截止日 11-18 计算
        self.assertEqual(active["数据冻结"]["effective_date"], "2026-11-18")
        self.assertEqual(active["数据冻结"]["days_left"], 11)

    def test_decision_date_beats_past_start(self):
        nodes = knowledge_source.parse_hard_nodes(self.root, self.today)
        active = {row["title"]: row for row in nodes["active"]}
        domain = active["域名续费决策"]
        self.assertEqual(domain["day_basis"], "决策日")
        self.assertEqual(domain["effective_date"], "2026-11-30")
        self.assertEqual(domain["days_left"], 23)

    def test_overdue_split(self):
        nodes = knowledge_source.parse_hard_nodes(self.root, self.today)
        overdue_titles = {row["title"] for row in nodes["overdue"]}
        self.assertIn("已过期的活跃节点", overdue_titles)
        self.assertIn("真逾期事项", overdue_titles)
        self.assertNotIn("已闭环的事项", overdue_titles)  # 处置列写明闭环

    def test_missing_knowledge_dir_degrades(self):
        missing = self.root / "not-here"
        result = knowledge_source.collect(missing, self.today)
        self.assertFalse(result["available"])
        self.assertIn("不存在", result["error"])
        self.assertIsNone(result["today_plan"])  # 绝不填假数据

    def test_collect_available(self):
        result = knowledge_source.collect(self.root, self.today)
        self.assertTrue(result["available"])
        self.assertFalse(result["degraded"])
        self.assertEqual(len(result["today_plan"]["items"]), 2)
        self.assertTrue(result["hard_nodes"]["active"])

    def test_public_snapshot_drops_knowledge(self):
        status = {
            "meta": {"version": "test"},
            "career_summary": {"stats": {}, "records": []},
            "projects_and_exams": [],
            "daily_checks": {"date": "2026-11-07", "checks": {}, "history": []},
            "topology": {},
            "device_allocation": {},
            "knowledge": {"available": True, "today_plan": {"direction": "私有内容"}},
        }
        aliases = {"names": {}, "relations": {}, "ips": {}, "paths": {}}
        public = sanitize_public.build_public_status(status, aliases)
        self.assertNotIn("knowledge", public)
        self.assertNotIn("私有内容", str(public))


if __name__ == "__main__":
    unittest.main(verbosity=2)
