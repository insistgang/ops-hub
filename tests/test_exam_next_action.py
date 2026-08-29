import unittest
import sys
from datetime import date
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

import collector


class ExamNextActionTests(unittest.TestCase):
    def test_strips_stale_day_count_and_stamps_live_countdown(self):
        self.assertEqual(
            collector.stamp_exam_next_action("考前 17 天高频考点突击与真题模拟", 13),
            "考前 13 天 · 高频考点突击与真题模拟",
        )

    def test_prefixes_plain_action_text(self):
        self.assertEqual(
            collector.stamp_exam_next_action("高频考点突击与真题模拟", 13),
            "考前 13 天 · 高频考点突击与真题模拟",
        )

    def test_is_idempotent(self):
        once = collector.stamp_exam_next_action("高频考点突击与真题模拟", 13)
        self.assertEqual(collector.stamp_exam_next_action(once, 13), once)

    def test_exam_day_uses_today_label(self):
        self.assertEqual(
            collector.stamp_exam_next_action("高频考点突击与真题模拟", 0),
            "今日考试 · 高频考点突击与真题模拟",
        )

    def test_jiaoxi_days_left_from_known_date(self):
        self.assertEqual(
            collector.calculate_days_left("2026-09-12", today=date(2026, 8, 30)),
            13,
        )


if __name__ == "__main__":
    unittest.main()
