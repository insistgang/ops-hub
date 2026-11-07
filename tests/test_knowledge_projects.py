import os
import sys
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import knowledge_source


def _touch(path: Path, when: datetime, text: str = "") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    stamp = when.timestamp()
    os.utime(path, (stamp, stamp))


class ParseProjectsTest(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)
        self.projects = self.root / "03-Projects"
        self.projects.mkdir(parents=True)

    def tearDown(self):
        self._tmp.cleanup()

    def test_extracts_directories_and_markdown_entries(self):
        _touch(self.projects / "项目甲" / "README.md", datetime(2026, 10, 30, 9, 0), "# 项目甲\n\n甲项目的一句话说明。\n")
        _touch(self.projects / "项目甲" / "细节.md", datetime(2026, 10, 31, 9, 0), "细节")
        _touch(self.projects / "2026-10-20-想法.md", datetime(2026, 10, 20, 9, 0), "---\ntitle: 内部标题\n---\n\n真正的第一段。\n")

        result = knowledge_source.parse_projects(self.root)
        names = [item["name"] for item in result["items"]]

        self.assertEqual(result["total"], 2)
        self.assertIn("项目甲", names)
        self.assertIn("2026-10-20-想法", names)
        self.assertEqual(result["warnings"], [])

        directory = next(item for item in result["items"] if item["name"] == "项目甲")
        self.assertEqual(directory["kind"], "dir")
        self.assertEqual(directory["file_count"], 2)
        self.assertEqual(directory["summary"], "甲项目的一句话说明。")

        markdown = next(item for item in result["items"] if item["name"] == "2026-10-20-想法")
        self.assertEqual(markdown["kind"], "file")
        self.assertEqual(markdown["date_hint"], "2026-10-20")
        # frontmatter 的 title 行不能被当成摘要
        self.assertEqual(markdown["summary"], "真正的第一段。")

    def test_summary_falls_back_to_newest_markdown_when_readme_missing(self):
        _touch(self.projects / "项目乙" / "旧.md", datetime(2026, 9, 1, 9, 0), "旧内容")
        _touch(self.projects / "项目乙" / "新.md", datetime(2026, 9, 20, 9, 0), "新内容的一句话。\n")

        result = knowledge_source.parse_projects(self.root)
        item = result["items"][0]

        self.assertEqual(item["name"], "项目乙")
        self.assertEqual(item["summary"], "新内容的一句话。")

    def test_bulk_timestamps_do_not_decide_recency(self):
        # 25 个文件同一分钟被批量刷新，不应盖过真实编辑时间
        bulk = datetime(2026, 11, 7, 14, 10)
        for index in range(25):
            _touch(self.projects / "被批量刷新的项目" / f"f{index}.md", bulk, f"内容 {index}")
        _touch(self.projects / "被批量刷新的项目" / "README.md", bulk, "# 旧项目\n\n正文。\n")
        _touch(self.projects / "真实编辑的项目" / "README.md", datetime(2026, 10, 15, 9, 0), "# 新项目\n\n正文。\n")

        result = knowledge_source.parse_projects(self.root)
        by_name = {item["name"]: item for item in result["items"]}

        self.assertEqual(len(result["notes"]), 1)
        self.assertIn("同时改动", result["notes"][0])
        self.assertEqual(result["warnings"], [], "批量时间戳是信息性说明，不应进警告")
        self.assertEqual(by_name["真实编辑的项目"]["updated_source"], "file")
        # 被批量刷新的项目回退到「只剩同一时间」的标记，并且排在真实编辑之后
        self.assertEqual(result["items"][0]["name"], "真实编辑的项目")

    def test_sorted_by_filename_date_first(self):
        _touch(self.projects / "2026-01-05-早期.md", datetime(2026, 11, 7, 9, 0), "早期")
        _touch(self.projects / "2026-10-05-近期.md", datetime(2026, 1, 1, 9, 0), "近期")

        result = knowledge_source.parse_projects(self.root)
        self.assertEqual([item["name"] for item in result["items"]],
                         ["2026-10-05-近期", "2026-01-05-早期"])

    def test_meta_files_are_not_projects(self):
        _touch(self.projects / "AGENTS.md", datetime(2026, 10, 1, 9, 0), "说明")
        _touch(self.projects / "claude.md", datetime(2026, 10, 2, 9, 0), "说明")
        _touch(self.projects / "03-Projects.md", datetime(2026, 10, 3, 9, 0), "索引")
        _touch(self.projects / "真实项目" / "README.md", datetime(2026, 10, 4, 9, 0), "# 真实项目\n\n正文。\n")

        result = knowledge_source.parse_projects(self.root)

        self.assertEqual([item["name"] for item in result["items"]], ["真实项目"])

    def test_same_name_directory_wins_over_note_file(self):
        _touch(self.projects / "某项目.md", datetime(2026, 9, 1, 9, 0), "一份笔记")
        _touch(self.projects / "某项目" / "README.md", datetime(2026, 9, 2, 9, 0), "# 某项目\n\n目录版本。\n")

        result = knowledge_source.parse_projects(self.root)

        self.assertEqual(result["total"], 1, "同名条目应合并为一条")
        self.assertEqual(result["items"][0]["kind"], "dir")
        self.assertEqual(result["items"][0]["summary"], "目录版本。")

    def test_items_carry_relative_path(self):
        _touch(self.projects / "带路径的项目" / "README.md", datetime(2026, 10, 5, 9, 0), "# 带路径\n\n正文。\n")

        result = knowledge_source.parse_projects(self.root)

        self.assertEqual(result["items"][0]["relative"], "03-Projects/带路径的项目")

    def test_missing_projects_directory_raises(self):
        with self.assertRaises(knowledge_source.KnowledgeSourceError):
            knowledge_source.parse_projects(self.root)

    def test_empty_projects_directory_raises(self):
        with self.assertRaises(knowledge_source.KnowledgeSourceError):
            knowledge_source.parse_projects(self.root)

    def test_collect_reports_projects_and_stays_read_only(self):
        _touch(self.projects / "项目甲" / "README.md", datetime(2026, 10, 30, 9, 0), "# 项目甲\n\n说明。\n")
        before = {p.name: p.stat().st_mtime for p in self.projects.rglob("*")}

        result = knowledge_source.collect(self.root)

        self.assertTrue(result["available"])
        self.assertEqual(result["projects"]["total"], 1)
        after = {p.name: p.stat().st_mtime for p in self.projects.rglob("*")}
        self.assertEqual(before, after, "投影过程不得改动知识库文件")


if __name__ == "__main__":
    unittest.main()

class ParseFinanceTest(unittest.TestCase):
    REVIEW = """# 2026-11 财务记录

> 消费截至 2026-11-07；更新于2026-11-07 21:20（北京时间）。

## 一、本月概况（消费截至 2026-11-07）

| 项目 | 金额（元） | 口径与证据 |
|---|---:|---|
| 已记录支出合计 | 746.50 | 共12笔 |
| 当前可用现金 | 43,014.00 | 含暂估 |

## 二、支出结构

| 类别 | 金额（元） | 明细与口径 |
|---|---:|---|
| 订阅AI | 468.00 | DeepSeek 充值 |
| 合计 | 746.50 | 与流水一致 |
"""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)
        self.finance = self.root / "06-Growth" / "Finance"
        self.finance.mkdir(parents=True)

    def tearDown(self):
        self._tmp.cleanup()

    def test_parses_latest_month_and_both_tables(self):
        (self.finance / "2026-10-financial-review.md").write_text("# 旧\n", encoding="utf-8")
        (self.finance / "2026-11-financial-review.md").write_text(self.REVIEW, encoding="utf-8")

        result = knowledge_source.parse_finance(self.root)

        self.assertEqual(result["month"], "2026-11")
        self.assertEqual(len(result["summary"]), 2)
        self.assertEqual(len(result["expenses"]), 2)
        self.assertEqual(result["summary"][1]["amount"], 43014.0)
        self.assertEqual(result["summary"][1]["amount_raw"], "43,014.00")
        self.assertIn("截至", result["as_of"])
        self.assertEqual(result["warnings"], [])

    def test_amounts_are_not_rounded_or_recomputed(self):
        (self.finance / "2026-11-financial-review.md").write_text(self.REVIEW, encoding="utf-8")
        result = knowledge_source.parse_finance(self.root)
        totals = [row["amount_raw"] for row in result["expenses"]]
        self.assertEqual(totals, ["468.00", "746.50"])

    def test_missing_directory_raises(self):
        with self.assertRaises(knowledge_source.KnowledgeSourceError):
            knowledge_source.parse_finance(self.root / "not-here")

    def test_missing_review_file_raises(self):
        with self.assertRaises(knowledge_source.KnowledgeSourceError):
            knowledge_source.parse_finance(self.root)
