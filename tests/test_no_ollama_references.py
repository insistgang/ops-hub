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

    FAKE_MAC = {"device": "MacBook Air", "status": "Online", "services": []}

    def _patched(self, tcp_open, ping_ok, tailscale=None):
        return (
            patch.object(probe, "probe_ping", return_value=(ping_ok, 20.0 if ping_ok else None)),
            patch.object(
                probe,
                "probe_tcp",
                side_effect=lambda ip, port, timeout=1.5: (
                    tcp_open(port), 12.0 if tcp_open(port) else None
                ),
            ),
            patch.object(probe, "tailscale_status", return_value=tailscale or {}),
            patch.object(probe, "get_mac_stats", return_value=self.FAKE_MAC),
        )

    def test_windows_probe_reports_real_remote_services(self):
        a, b, c, d = self._patched(lambda port: port in {22, 445}, True)
        with a, b, c, d:
            windows = probe.probe_all()["windows"]

        self.assertTrue(windows["ssh_active"])
        self.assertTrue(windows["smb_active"])
        self.assertNotIn("ollama_active", windows)
        self.assertFalse(any("ollama" in item.casefold() for item in windows["services"]))

    def test_windows_online_when_only_tcp_reachable(self):
        """Tailscale 走 DERP 时不转发 ICMP：ping 全丢但端口握手成功，必须判在线。"""
        a, b, c, d = self._patched(lambda port: port in {22, 445}, False)
        with a, b, c, d:
            windows = probe.probe_all()["windows"]

        self.assertEqual("Online", windows["status"])
        self.assertIsNotNone(windows["latency_ms"])

    def test_windows_offline_but_control_plane_online(self):
        """控制面说在线、端口却无响应：状态必须如实报离线，同时保留链路线索。"""
        peer = {"100.98.218.25": {"online": True, "relay": "hkg", "direct": False,
                                 "os": "windows", "last_seen": "", "host": "PC"}}
        a, b, c, d = self._patched(lambda port: False, False, tailscale=peer)
        with a, b, c, d:
            windows = probe.probe_all()["windows"]

        self.assertEqual("Offline", windows["status"])
        self.assertTrue(windows["control_online"])
        self.assertEqual("DERP · hkg", windows["via"])


if __name__ == "__main__":
    unittest.main()
