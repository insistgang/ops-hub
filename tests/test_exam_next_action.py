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

    def test_awaiting_result_is_not_labeled_as_exam_day(self):
        updated = collector.apply_exam_state({
            "type": "exam",
            "phase": "awaiting_result",
            "target_date": "2026-09-12",
            "next_action": "等待初试成绩公布",
        }, today=date(2026, 11, 2))
        self.assertIsNone(updated["days_left"])
        self.assertEqual(updated["next_action"], "等待初试成绩公布")

    def test_career_label_maps_copilot_stages(self):
        self.assertEqual(collector.career_label({"status": "applied", "stage": "简历筛选-初筛进行中"}), "初筛")
        self.assertEqual(collector.career_label({"status": "applied", "stage": "已投递"}), "已投递")
        self.assertEqual(collector.career_label({"status": "todo", "stage": "准备投递"}), "准备中")
        self.assertEqual(collector.career_label({"status": "offer", "stage": "已接受实习 Offer"}), "已录用")

    def test_jiaoxi_days_left_from_known_date(self):
        self.assertEqual(
            collector.calculate_days_left("2026-09-12", today=date(2026, 8, 30)),
            13,
        )


if __name__ == "__main__":
    unittest.main()
