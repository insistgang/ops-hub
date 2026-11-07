import socket
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import probe


class PingCommandTests(unittest.TestCase):
    def test_macos_uses_wait_flag_not_ttl(self):
        with patch.object(sys, "platform", "darwin"):
            cmd = probe._ping_cmd("10.0.0.1", 2)
        self.assertIn("-W", cmd)
        self.assertNotIn("-t", cmd)  # macOS 的 -t 是 TTL，用它当超时会误判离线
        self.assertEqual(cmd[cmd.index("-W") + 1], "2000")

    def test_linux_wait_is_seconds(self):
        with patch.object(sys, "platform", "linux"):
            cmd = probe._ping_cmd("10.0.0.1", 2)
        self.assertEqual(cmd[cmd.index("-W") + 1], "2")


class TcpProbeTests(unittest.TestCase):
    def test_open_port_reports_latency(self):
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.bind(("127.0.0.1", 0))
        server.listen(1)
        self.addCleanup(server.close)
        port = server.getsockname()[1]
        ok, ms = probe.probe_tcp("127.0.0.1", port, timeout=2)
        self.assertTrue(ok)
        self.assertIsNotNone(ms)

    def test_closed_port_is_offline_without_latency(self):
        ok, ms = probe.probe_tcp("127.0.0.1", 1, timeout=0.5)
        self.assertFalse(ok)
        self.assertIsNone(ms)


class TailscaleTests(unittest.TestCase):
    def test_missing_cli_falls_back_silently(self):
        with patch.object(probe.subprocess, "run", side_effect=FileNotFoundError):
            self.assertEqual(probe.tailscale_status(), {})

    def test_via_label(self):
        self.assertEqual(probe._via_label({"direct": True, "relay": "hkg"}), "直连")
        self.assertEqual(probe._via_label({"direct": False, "relay": "hkg"}), "DERP · hkg")
        self.assertEqual(probe._via_label({}), "")


if __name__ == "__main__":
    unittest.main(verbosity=2)
