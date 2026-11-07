import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import knowledge_source

ENTRY = """---
title: 2026年11月3日
---

# 2026年11月3日 周一

## 状态

- 精力：7.2/10（推断依据：昨夜 01:00 入睡）
- 情绪：6.0/10（推断依据：白天被会议打断）
- 专注：8.0/10（推断依据：上午连续两小时写作）

## 生活日志

- 睡眠：约 6.5h
- 运动：约 20 分钟
"""


class ParseEnergyTest(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)
        self.daily = self.root / "01-Daily" / "2026-11"
        self.daily.mkdir(parents=True)

    def tearDown(self):
        self._tmp.cleanup()

    def _write(self, day, text=ENTRY):
        (self.daily / f"2026-11-{day}.md").write_text(text, encoding="utf-8")

    def test_extracts_scores_and_basis(self):
        self._write("03")
        result = knowledge_source.parse_energy(self.root)

        self.assertEqual(len(result["days"]), 1)
        latest = result["latest"]
        self.assertEqual(latest["date"], "2026-11-03")
        self.assertEqual(latest["metrics"]["精力"]["score"], 7.2)
        self.assertEqual(latest["metrics"]["精力"]["scale"], 10)
        self.assertIn("01:00", latest["metrics"]["精力"]["basis"])
        self.assertEqual(latest["metrics"]["专注"]["score"], 8.0)

    def test_sleep_and_exercise_fall_back_to_document_body(self):
        self._write("03")
        result = knowledge_source.parse_energy(self.root)
        extra = result["latest"]["extra"]
        self.assertIn("睡眠", extra)
        self.assertIn("6.5h", extra["睡眠"])

    def test_orders_newest_first_and_limits_days(self):
        for day in ("01", "02", "03"):
            self._write(day)
        result = knowledge_source.parse_energy(self.root, days=2)

        self.assertEqual([d["date"] for d in result["days"]], ["2026-11-03", "2026-11-02"])

    def test_missing_directory_raises(self):
        with self.assertRaises(knowledge_source.KnowledgeSourceError):
            knowledge_source.parse_energy(self.root / "nope")

    def test_entry_without_status_section_is_skipped(self):
        self._write("03", "# 2026年11月3日\n\n## 今日记录\n\n普通记录。\n")
        with self.assertRaises(knowledge_source.KnowledgeSourceError):
            knowledge_source.parse_energy(self.root)


if __name__ == "__main__":
    unittest.main()
