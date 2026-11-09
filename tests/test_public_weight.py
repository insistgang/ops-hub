"""公开体重投影的脱敏规则回归测试。

本人 2026-11-10 明确选择公开自己的体重记录：只发布本人，不含本机小组与他人。
"""
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import sanitize_public

ALIASES = {
    "names": {"真名甲": "本人"},
    "relations": {"外部称谓": "外部合作方"},
    "ips": {},
    "paths": {"/Users/someone/Desktop/secret": "~/secret"},
}


def build(weight):
    return sanitize_public.build_public_weight(weight, ALIASES)


def owner(user_id="usr-leo", name="Leo (insistgang)", goal=85.0):
    return {
        "id": user_id, "name": name, "goal": goal,
        "createdAt": "2026-11-09T08:00:00.000Z",
        "updatedAt": "2026-11-09T08:00:00.000Z",
    }


def record(record_id, user_id="usr-leo", date="2026-11-09", weight=99.5, note="晨起空腹基准"):
    return {
        "id": record_id, "userId": user_id, "date": date, "weight": weight, "note": note,
        "createdAt": "2026-11-09T08:00:00.000Z", "updatedAt": "2026-11-09T08:00:00.000Z",
    }


class PublicWeightProjectionTests(unittest.TestCase):
    def test_publishes_only_the_active_user_and_their_records(self):
        result = build({
            "version": 1, "activeUserId": "usr-leo",
            "users": [owner()],
            "records": [record("rec-1")],
            "groups": [],
        })
        self.assertEqual(result["activeUserId"], "usr-leo")
        self.assertEqual([u["id"] for u in result["users"]], ["usr-leo"])
        self.assertEqual([r["id"] for r in result["records"]], ["rec-1"])
        self.assertEqual(result["records"][0]["weight"], 99.5)
        self.assertEqual(result["users"][0]["goal"], 85.0)

    def test_local_groups_are_never_published(self):
        result = build({
            "version": 1, "activeUserId": "usr-leo",
            "users": [owner()],
            "records": [record("rec-1")],
            "groups": [{"id": "g1", "name": "本机小组", "memberIds": ["usr-leo"]}],
        })
        # 键必须保留（Store 的 validateState 要求 groups 是数组），内容必须为空。
        self.assertEqual(result["groups"], [])
        self.assertNotIn("g1", json.dumps(result, ensure_ascii=False))
        self.assertNotIn("本机小组", json.dumps(result, ensure_ascii=False))
        self.assertNotIn("memberIds", json.dumps(result, ensure_ascii=False))

    def test_other_users_and_their_records_are_not_published(self):
        result = build({
            "version": 1, "activeUserId": "usr-leo",
            "users": [owner(), owner(user_id="usr-other", name="同组他人", goal=60.0)],
            "records": [record("rec-1"), record("rec-2", user_id="usr-other", weight=60.0)],
            "groups": [],
        })
        self.assertEqual([u["id"] for u in result["users"]], ["usr-leo"])
        self.assertEqual([r["id"] for r in result["records"]], ["rec-1"])
        self.assertNotIn("同组他人", json.dumps(result, ensure_ascii=False))
        self.assertNotIn("60.0", json.dumps(result, ensure_ascii=False))

    def test_ambiguous_owner_is_not_guessed(self):
        self.assertIsNone(build({
            "version": 1,
            "users": [owner(user_id="usr-a"), owner(user_id="usr-b")],
            "records": [record("rec-1", user_id="usr-a")],
        }))

    def test_single_user_without_active_id_is_published(self):
        result = build({
            "version": 1, "users": [owner()], "records": [record("rec-1")], "groups": [],
        })
        self.assertEqual(result["activeUserId"], "usr-leo")

    def test_invalid_records_are_skipped_without_placeholders(self):
        result = build({
            "version": 1, "activeUserId": "usr-leo",
            "users": [owner()],
            "records": [
                record("rec-bad-date", date="2026-13-45"),
                record("rec-bad-weight", weight="99.5"),
                {"id": "", "userId": "usr-leo", "date": "2026-11-09", "weight": 88.0},
                {"id": "rec-missing-user", "date": "2026-11-09", "weight": 88.0},
                record("rec-good"),
            ],
            "groups": [],
        })
        self.assertEqual([r["id"] for r in result["records"]], ["rec-good"])

    def test_no_records_means_nothing_is_published(self):
        self.assertIsNone(build({
            "version": 1, "activeUserId": "usr-leo",
            "users": [owner()], "records": [], "groups": [],
        }))

    def test_notes_and_names_go_through_scrub_text(self):
        result = build({
            "version": 1, "activeUserId": "usr-leo",
            "users": [owner(name="真名甲")],
            "records": [record("rec-1", note="和真名甲一起称重 /Users/someone/Desktop/secret")],
            "groups": [],
        })
        self.assertEqual(result["users"][0]["name"], "本人")
        note = result["records"][0]["note"]
        self.assertNotIn("真名甲", note)
        self.assertNotIn("/Users/someone", note)

    def test_missing_or_malformed_source_returns_none(self):
        self.assertIsNone(build(None))
        self.assertIsNone(build({}))
        self.assertIsNone(build({"users": "nope", "records": []}))
        self.assertIsNone(build({"users": [], "records": []}))

    def test_projection_keeps_the_store_top_level_shape(self):
        # Store 的 validateState 要求 version/users/records/groups 齐备，
        # 缺一个键浏览器就会把整份状态判为格式异常而拒绝加载。
        result = build({
            "version": 1, "activeUserId": "usr-leo",
            "users": [owner()],
            "records": [record("rec-1")],
            "groups": [],
        })
        self.assertEqual(result["version"], 1)
        for key in ("users", "records", "groups"):
            self.assertIsInstance(result[key], list, f"{key} 必须是数组")
        self.assertIsNotNone(result["activeUserId"])

    def test_goal_must_stay_numeric(self):
        result = build({
            "version": 1, "activeUserId": "usr-leo",
            "users": [owner(goal="85")],
            "records": [record("rec-1")],
            "groups": [],
        })
        self.assertIsNone(result["users"][0]["goal"])


if __name__ == "__main__":
    unittest.main()
