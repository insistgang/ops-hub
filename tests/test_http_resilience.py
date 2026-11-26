"""出站 HTTP 容错回归：定时任务遇到代理抖动时必须能自愈，而不是整轮失败。

背景：launchd 定时任务运行时，Clash Verge 的 TUN/Fake-IP 可能短暂不可用，
解析出的 198.18.0.0/15 地址无法直达，urlopen 会抛 gaierror/URLError。
ops_common 的取数入口必须先重试、再回退本地代理，全失败才抛错。
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import ops_common


class _FakeResponse:
    def __init__(self, body: bytes, status: int = 200):
        self._body = body
        self.status = status

    def read(self):
        return self._body

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class FetchResilienceTests(unittest.TestCase):
    def test_retries_then_succeeds_without_proxy(self):
        calls = {"n": 0}

        def fake_read(url, timeout, proxy=None):
            calls["n"] += 1
            if calls["n"] < 3:
                raise OSError("nodename nor servname provided")
            return b"ok"

        original = ops_common._read_once
        ops_common._read_once = fake_read
        try:
            body = ops_common.fetch_bytes("https://example.invalid/x", retries=(0, 0, 0), proxies=())
        finally:
            ops_common._read_once = original
        self.assertEqual(body, b"ok")
        self.assertEqual(calls["n"], 3)

    def test_falls_back_to_proxy_after_direct_exhausted(self):
        seen = []

        def fake_read(url, timeout, proxy=None):
            seen.append(proxy)
            if proxy is None:
                raise OSError("nodename nor servname provided")
            return b"via-proxy"

        original = ops_common._read_once
        ops_common._read_once = fake_read
        try:
            body = ops_common.fetch_bytes(
                "https://example.invalid/x", retries=(0,), proxies=("http://127.0.0.1:7897",)
            )
        finally:
            ops_common._read_once = original
        self.assertEqual(body, b"via-proxy")
        self.assertEqual(seen, [None, "http://127.0.0.1:7897"])

    def test_all_paths_failing_raises_last_error(self):
        def fake_read(url, timeout, proxy=None):
            raise OSError("nodename nor servname provided")

        original = ops_common._read_once
        ops_common._read_once = fake_read
        try:
            with self.assertRaises(OSError):
                ops_common.fetch_bytes(
                    "https://example.invalid/x", retries=(0,), proxies=("http://127.0.0.1:7897",)
                )
        finally:
            ops_common._read_once = original

    def test_fetch_with_status_preserves_http_status(self):
        def fake_read(url, timeout, proxy=None):
            return b"body", 204

        original = ops_common._read_once_with_status
        ops_common._read_once_with_status = fake_read
        try:
            body, status = ops_common.fetch_with_status(
                "https://example.invalid/x", retries=(0,), proxies=()
            )
        finally:
            ops_common._read_once_with_status = original
        self.assertEqual(body, b"body")
        self.assertEqual(status, 204)

    def test_fetch_json_parses_payload(self):
        def fake_read(url, timeout, proxy=None):
            return b'{"period": "2026-11", "expenseTotal": 3170.5}'

        original = ops_common._read_once
        ops_common._read_once = fake_read
        try:
            data = ops_common.fetch_json("https://example.invalid/x", retries=(0,), proxies=())
        finally:
            ops_common._read_once = original
        self.assertEqual(data["period"], "2026-11")
        self.assertEqual(data["expenseTotal"], 3170.5)

    def test_proxy_opener_rejects_unsupported_scheme(self):
        self.assertIsNone(ops_common._proxy_opener("socks5://127.0.0.1:7891"))
        self.assertIsNotNone(ops_common._proxy_opener("http://127.0.0.1:7897"))

    def test_default_retry_budget_is_bounded(self):
        """重试预算必须有界，不能让定时任务无限等待。"""
        self.assertTrue(ops_common.HTTP_RETRY_DELAYS)
        self.assertLessEqual(sum(ops_common.HTTP_RETRY_DELAYS), 60)
        self.assertTrue(ops_common.PROXY_CANDIDATES)


if __name__ == "__main__":
    unittest.main()
