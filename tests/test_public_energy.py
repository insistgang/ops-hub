import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import sanitize_public

ALIASES = {
    "names": {"张三": "A同学"},
    "relations": {"姐姐": "家人甲"},
    "ips": {},
    "paths": {"/Users/someone/secret": "~/redacted"},
}

KNOWLEDGE = {
    "generated_at": "2026-11-07T23:41:00+08:00",
    "energy": {
        "days": [
            {
                "date": "2026-11-07",
                "file": "01-Daily/2026-11/2026-11-07.md",
                "metrics": {
                    "精力": {"score": 7.8, "scale": 10, "basis": "昨夜与张三聊到很晚"},
                    "专注": {"score": 7.5, "scale": 10, "basis": "在 /Users/someone/secret 里调试"},
                },
                "extra": {"睡眠": "约 8.5h", "运动": "和姐姐散步"},
            }
        ]
    },
}


class PublicEnergyTest(unittest.TestCase):
    def test_keeps_scores_and_drops_local_paths(self):
        result = sanitize_public.build_public_energy(KNOWLEDGE, ALIASES)
        self.assertIsNotNone(result)
        day = result["days"][0]
        self.assertEqual(day["date"], "2026-11-07")
        self.assertEqual(day["metrics"]["精力"]["score"], 7.8)
        self.assertNotIn("file", day, "公开产物不能带本地文件路径")

    def test_scrubs_names_relations_and_paths(self):
        result = sanitize_public.build_public_energy(KNOWLEDGE, ALIASES)
        blob = repr(result)
        self.assertNotIn("张三", blob)
        self.assertNotIn("姐姐", blob)
        self.assertNotIn("/Users/someone/secret", blob)
        self.assertIn("A同学", blob)

    def test_missing_energy_returns_none(self):
        self.assertIsNone(sanitize_public.build_public_energy({}, ALIASES))
        self.assertIsNone(sanitize_public.build_public_energy(None, ALIASES))

    def test_empty_days_returns_none(self):
        self.assertIsNone(sanitize_public.build_public_energy({"energy": {"days": []}}, ALIASES))


if __name__ == "__main__":
    unittest.main()
