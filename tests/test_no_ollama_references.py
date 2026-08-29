import unittest
import sys
from pathlib import Path
from unittest.mock import patch


PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

import probe

OPERATIONAL_FILES = (
    "AGENTS.md",
    "README.md",
    "index.html",
    "ops",
    "js/app.js",
    "scripts/probe.py",
    "data/device_allocation.json",
    "data/memory_rules.json",
    "data/memory_rules.js",
    "data/status.json",
    "data/status.js",
    "docs/PRD.md",
    "docs/PRD_REVIEW.md",
)


class RemovedLocalModelServiceTests(unittest.TestCase):
    def test_operational_surfaces_do_not_reference_removed_service(self):
        stale_files = []
        for relative_path in OPERATIONAL_FILES:
            content = (PROJECT_ROOT / relative_path).read_text(encoding="utf-8")
            if "ollama" in content.casefold():
                stale_files.append(relative_path)

        self.assertEqual([], stale_files)

    def test_windows_probe_reports_real_remote_services(self):
        fake_mac = {
            "device": "MacBook Air",
            "status": "Online",
            "services": [],
        }

        with (
            patch.object(
                probe,
                "probe_ping",
                side_effect=[(True, 20.0), (False, None)],
            ),
            patch.object(
                probe,
                "probe_port",
                side_effect=lambda _ip, port, timeout=1.5: port in {22, 445},
            ),
            patch.object(probe, "get_mac_stats", return_value=fake_mac),
        ):
            windows = probe.probe_all()["windows"]

        self.assertTrue(windows["ssh_active"])
        self.assertTrue(windows["smb_active"])
        self.assertNotIn("ollama_active", windows)
        self.assertFalse(any("ollama" in item.casefold() for item in windows["services"]))


if __name__ == "__main__":
    unittest.main()
