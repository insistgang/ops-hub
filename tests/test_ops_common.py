import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import collector
import finance_publish
import finance_sync
import knowledge_source
import ops_common
import sanitize_public


class OpsCommonAndSanitizeTests(unittest.TestCase):
    def test_route_task_matches_three_devices_and_fallback(self):
        self.assertEqual(ops_common.route_task("写毕业小论文")["target"], "mac")
        self.assertEqual(ops_common.route_task("跑 YOLOv11 训练")["target"], "windows")
        self.assertEqual(ops_common.route_task("Jetson 视觉传感器")["target"], "jetson")
        self.assertEqual(ops_common.route_task("整理书桌")["target"], "general")
        self.assertIsNone(ops_common.route_task("  "))

    def test_career_stage_rank_orders_active_stages_first(self):
        stages = ["已结束", "准备中", "已投递", "初筛", "已录用", "笔试中", "面试中"]
        ordered = sorted(stages, key=ops_common.career_stage_rank)
        self.assertEqual(ordered, ["面试中", "笔试中", "已录用", "初筛", "已投递", "准备中", "已结束"])
        # 含「面」字的放弃/拒绝阶段绝不能误标为「面试中」
        self.assertEqual(
            collector.career_label({
                "status": "rejected",
                "stage": "已放弃（视频面试已结束，因岗位为销售方向主动放弃）",
            }),
            "已结束",
        )

    def test_public_status_preserves_scrubbed_workflow_collab_mode_and_strips_network(self):
        aliases = {
            "names": {"Alice": "合作者A"},
            "relations": {},
            "ips": {"100.98.1.2": "已隐藏"},
            "paths": {},
        }
        source = {
            "meta": {},
            "device_allocation": {
                "devices": [{"id": "win", "name": "Win", "network": "100.98.1.2"}],
                "project_workflows": [
                    {
                        "project": "Alice 协作项目",
                        "mac_role": "写作",
                        "win_role": "训练",
                        "collab_mode": "与 Alice 通过 Git 仓库同步",
                    }
                ],
            },
        }
        public = sanitize_public.build_public_status(source, aliases)
        dev = public["device_allocation"]["devices"][0]
        wf = public["device_allocation"]["project_workflows"][0]
        self.assertNotIn("network", dev)
        self.assertEqual(wf["project"], "合作者A 协作项目")
        self.assertEqual(wf["collab_mode"], "与 合作者A 通过 Git 仓库同步")

    def test_finance_classify_covers_real_diary_categories_and_fails_closed(self):
        self.assertEqual(finance_sync.classify("张哥课程"), ("学习学业", "capital"))
        self.assertEqual(finance_sync.classify("炸串"), ("餐饮", "routine"))
        self.assertEqual(finance_sync.classify("矿泉水"), ("食品采购", "routine"))
        self.assertEqual(finance_sync.classify("域名续费"), ("订阅AI", "capital"))
        self.assertIsNone(finance_sync.classify("未知商品"))

    def test_finance_publish_skips_already_settled_days_before_parsing(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            daily = root / "01-Daily" / "2026-11"
            daily.mkdir(parents=True)
            (daily / "2026-11-10.md").write_text(
                "- 支出：神秘未归类项 10.00 元，当日个人实付支出合计 **10.00 元**\n",
                encoding="utf-8",
            )
            ledger = {"period": "2026-11", "transactions": {"daily": [{"day": 10, "total": 10.0}]}}
            applied, changed = finance_publish.sync_from_diary(ledger, root)
            self.assertEqual(applied, [])
            self.assertFalse(changed)

    def test_knowledge_finance_treats_unverified_cells_as_honest_none_without_warning(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            fin = root / "06-Growth" / "Finance"
            fin.mkdir(parents=True)
            (fin / "2026-11-financial-review.md").write_text(
                "# 2026-11 财务复盘\n\n## 一、本月概况\n\n| 项目 | 金额 | 口径 |\n|---|---:|---|\n"
                "| 当前可用现金 | 43,014.00 | 已核 |\n"
                "| 广义总资产 | 未核实 | 含待核项 |\n"
                "| 异常项 | 乱码金额 | 测试告警 |\n",
                encoding="utf-8",
            )
            parsed = knowledge_source.parse_finance(root)
            by_label = {row["label"]: row for row in parsed["summary"]}
            self.assertEqual(by_label["当前可用现金"]["amount"], 43014.0)
            self.assertIsNone(by_label["广义总资产"]["amount"])
            self.assertEqual(len(parsed["warnings"]), 1)
            self.assertIn("乱码金额", parsed["warnings"][0])


if __name__ == "__main__":
    unittest.main()
