import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
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
        stages = ["准备中", "已投递", "初筛", "已录用", "笔试中", "面试中"]
        ordered = sorted(stages, key=ops_common.career_stage_rank)
        self.assertEqual(ordered, ["面试中", "笔试中", "已录用", "初筛", "已投递", "准备中"])

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


if __name__ == "__main__":
    unittest.main()
