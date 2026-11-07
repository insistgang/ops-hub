import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import collector
import sanitize_public


class PublicSnapshotSafetyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.data = Path(self.temp.name) / "data"
        self.public = self.data / "public"
        self.public.mkdir(parents=True)
        self.aliases = self.data / "private_aliases.json"
        self.config = {
            "names": {"PrivateExample": "角色甲"},
            "relations": {}, "ips": {}, "paths": {},
        }
        self.aliases.write_text(json.dumps(self.config), encoding="utf-8")
        self.source = {"meta": {}, "message": "PrivateExample"}
        (self.data / "status.json").write_text(json.dumps(self.source), encoding="utf-8")
        self.old_files = {name: "previous safe snapshot\n" for name in
                          ("status.json", "status.js", "memory_rules.js")}
        for name, content in self.old_files.items():
            (self.public / name).write_text(content, encoding="utf-8")
        for module, name, value in (
            (sanitize_public, "DATA_DIR", self.data),
            (sanitize_public, "PUBLIC_DIR", self.public),
            (sanitize_public, "ALIASES_PATH", self.aliases),
            (collector, "DATA_DIR", self.data),
        ):
            self.enterContext(patch.object(module, name, value))
        self.enterContext(contextlib.redirect_stdout(io.StringIO()))

    def assert_public_unchanged(self):
        self.assertEqual({p.name: p.read_text(encoding="utf-8") for p in self.public.iterdir()},
                         self.old_files)

    def test_missing_alias_config_keeps_previous_public_files(self):
        self.aliases.unlink()
        self.assertFalse(sanitize_public.write_public_files())
        self.assert_public_unchanged()

    def test_invalid_alias_config_keeps_previous_public_files(self):
        for invalid in ([], {}, {**self.config, "names": []},
                        {**self.config, "names": {"": "hidden"}},
                        {**self.config, "names": {"PrivateExample": 7}}):
            with self.subTest(config_type=type(invalid).__name__):
                self.aliases.write_text(json.dumps(invalid), encoding="utf-8")
                self.assertFalse(sanitize_public.write_public_files())
                self.assert_public_unchanged()

    def test_malformed_alias_json_keeps_previous_public_files(self):
        self.aliases.write_text("{broken", encoding="utf-8")
        self.assertFalse(sanitize_public.write_public_files())
        self.assert_public_unchanged()

    def test_remaining_identifier_is_rejected_before_any_public_write(self):
        # Keys are intentionally not rewritten by scrub_deep. A known identifier
        # here exercises the independent final check rather than the scrubber.
        (self.data / "memory_rules.json").write_text(
            json.dumps({"PrivateExample": "rule"}), encoding="utf-8")
        self.assertFalse(sanitize_public.write_public_files())
        self.assert_public_unchanged()

    def test_valid_generation_scrubs_and_preserves_private_source(self):
        source_bytes = (self.data / "status.json").read_bytes()
        self.assertTrue(sanitize_public.write_public_files())
        public = json.loads((self.public / "status.json").read_text(encoding="utf-8"))
        self.assertEqual(public["message"], "角色甲")
        self.assertTrue(public["meta"]["sanitized"])
        self.assertEqual((self.data / "status.json").read_bytes(), source_bytes)

    def test_sanitization_failure_blocks_pipeline_push_and_retains_local_snapshot(self):
        self.aliases.unlink()
        with patch.object(collector.probe, "probe_all", return_value={}), \
             patch.object(collector, "load_career_records", return_value=[]), \
             patch.object(collector, "gitops_push") as push:
            self.assertFalse(collector.run_pipeline(push=True))
            push.assert_not_called()
        self.assertTrue((self.data / "status.json").exists())
        self.assert_public_unchanged()

    def test_unexpected_sanitizer_error_also_blocks_pipeline_push(self):
        with patch.object(collector.probe, "probe_all", return_value={}), \
             patch.object(collector, "load_career_records", return_value=[]), \
             patch.object(sanitize_public, "write_public_files", side_effect=OSError("test failure")), \
             patch.object(collector, "gitops_push") as push:
            self.assertFalse(collector.run_pipeline(push=True))
            push.assert_not_called()
        self.assert_public_unchanged()


if __name__ == "__main__":
    unittest.main()


class PrivateAddressMaskingTests(unittest.TestCase):
    """新地址漏登记也不能外泄：私网/CGNAT 一律按网段兜底掩码。"""

    def test_private_ranges_masked(self):
        cases = {
            "10.120.61.77": "10.120.x.x",
            "192.168.1.5": "192.168.x.x",
            "172.16.4.9": "172.16.x.x",
            "100.98.218.25": "100.98.x.x",
            "127.0.0.1": "127.0.x.x",
        }
        for raw, masked in cases.items():
            self.assertEqual(sanitize_public.mask_private_ips(raw), masked)

    def test_public_ip_and_versions_untouched(self):
        self.assertEqual(sanitize_public.mask_private_ips("223.6.255.45"), "223.6.255.45")
        self.assertEqual(sanitize_public.mask_private_ips("v1.2.1"), "v1.2.1")

    def test_unregistered_private_ip_scrubbed_from_snapshot(self):
        status = {
            "meta": {"version": "test"},
            "topology": {"jetson": {"ip": "10.120.61.77", "ssh_cmd": "ssh jetson@10.120.61.77"}},
            "career_summary": {"stats": {}, "records": []},
            "projects_and_exams": [],
            "daily_checks": {"date": "2026-11-07", "checks": {}, "history": []},
            "device_allocation": {},
        }
        aliases = {"names": {}, "relations": {}, "ips": {}, "paths": {}}  # 故意不登记
        public = sanitize_public.build_public_status(status, aliases)
        blob = json.dumps(public, ensure_ascii=False)
        self.assertNotIn("10.120.61.77", blob)
        self.assertIn("10.120.x.x", blob)
