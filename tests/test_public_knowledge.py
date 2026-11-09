"""知识库公开投影的脱敏回归测试。"""
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import sanitize_public

ALIASES = {
    "names": {"真名甲": "本人", "同事乙": "同事 A"},
    "relations": {},
    "ips": {},
    "paths": {"/Users/someone/Documents/knowledge": "~/knowledge"},
}


def knowledge_fixture():
    return {
        "available": True,
        "generated_at": "2026-11-09T21:53:36+08:00",
        "source_root": "/Users/someone/Documents/knowledge",
        "today": "2026-11-09",
        "warnings": [],
        "today_plan": {
            "date": "2026-11-09", "is_today": True, "file": "2026-11-09.md",
            "headline": "今日计划", "direction": "和真名甲推进论文", "capacity": "七成",
            "items": [{"n": 1, "title": "过第一批 10 张"}], "warnings": [],
        },
        "wip": {"file": "TODO.md", "items": [{"title": "写论文"}], "warnings": []},
        "hard_nodes": {"file": "硬节点台账.md", "active": [{"title": "657 张全图复核"}],
                       "overdue": [], "weekly": [], "monthly": [], "warnings": []},
        "projects": {"file": "03-Projects", "items": [{"name": "同事乙项目", "relative": "03-Projects/x"}],
                     "total": 1, "truncated": False, "warnings": [], "notes": []},
        "finance": {"file": "/Users/someone/Documents/knowledge/06-Growth/Finance/x.md",
                    "month": "2026-11", "as_of": "2026-11-08",
                    "summary": [{"label": "已记录支出合计", "amount": 790.5}], "expenses": [], "warnings": []},
        "energy": {"days": [], "latest": None, "warnings": []},
        "diary_todos": {"date": "2026-11-09", "items": []},
    }


class PublicKnowledgeTests(unittest.TestCase):
    def test_source_root_is_dropped(self):
        result = sanitize_public.build_public_knowledge(knowledge_fixture(), ALIASES)
        self.assertNotIn("source_root", result)
        self.assertNotIn("/Users/someone", json.dumps(result, ensure_ascii=False))

    def test_absolute_file_paths_are_reduced_to_names(self):
        result = sanitize_public.build_public_knowledge(knowledge_fixture(), ALIASES)
        finance_file = result["finance"]["file"]
        self.assertFalse(finance_file.startswith("/"))
        self.assertTrue(finance_file.endswith(".md"))

    def test_third_party_names_are_masked(self):
        result = sanitize_public.build_public_knowledge(knowledge_fixture(), ALIASES)
        blob = json.dumps(result, ensure_ascii=False)
        self.assertNotIn("真名甲", blob)
        self.assertNotIn("同事乙", blob)
        self.assertIn("同事 A", blob)

    def test_energy_and_diary_todos_are_not_duplicated(self):
        result = sanitize_public.build_public_knowledge(knowledge_fixture(), ALIASES)
        self.assertNotIn("energy", result)
        self.assertNotIn("diary_todos", result)

    def test_unavailable_snapshot_returns_none(self):
        self.assertIsNone(sanitize_public.build_public_knowledge({"available": False}, ALIASES))
        self.assertIsNone(sanitize_public.build_public_knowledge(None, ALIASES))

    def test_published_block_keeps_the_renderer_shape(self):
        result = sanitize_public.build_public_knowledge(knowledge_fixture(), ALIASES)
        for key in ("available", "today_plan", "wip", "hard_nodes", "projects", "finance"):
            self.assertIn(key, result)
        self.assertTrue(result["available"])


if __name__ == "__main__":
    unittest.main()
