"""阿里云 VitaFlow 同步服务部署脚本的回归测试。"""
import hashlib
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import deploy_vita_sync as deploy

BASE_DIR = Path(__file__).resolve().parents[1]


class DeployPlanTests(unittest.TestCase):
    def test_no_drift_needs_no_action(self):
        self.assertEqual(deploy.plan_actions(False, False), ["无需部署（仓库与服务器已一致）"])

    def test_code_drift_triggers_update_and_restart(self):
        actions = deploy.plan_actions(True, False)
        self.assertIn("更新服务代码", actions)
        self.assertIn("重启服务", actions)
        self.assertNotIn("更新 systemd unit", actions)

    def test_unit_drift_triggers_update_and_restart(self):
        actions = deploy.plan_actions(False, True)
        self.assertIn("更新 systemd unit", actions)
        self.assertIn("重启服务", actions)

    def test_both_drift_triggers_everything(self):
        actions = deploy.plan_actions(True, True)
        self.assertEqual(actions, ["更新服务代码", "更新 systemd unit", "重启服务"])


class ProtectedPathTests(unittest.TestCase):
    def test_service_and_unit_paths_are_writable(self):
        self.assertEqual(
            deploy.assert_writable_paths([deploy.SERVER_TARGET, deploy.UNIT_TARGET]),
            [deploy.SERVER_TARGET, deploy.UNIT_TARGET],
        )

    def test_token_and_data_paths_are_refused(self):
        for path in ("/etc/ops-vita-sync/sync-token", "/var/lib/ops-vita-sync/my-schedule.json"):
            with self.assertRaises(ValueError):
                deploy.assert_writable_paths([path])

    def test_remote_install_script_never_touches_protected_paths(self):
        for protected in deploy.PROTECTED_REMOTE_PATHS:
            self.assertNotIn(protected, deploy.REMOTE_INSTALL)


class RepositoryArtifactsTests(unittest.TestCase):
    def test_service_source_and_unit_exist(self):
        self.assertTrue(deploy.LOCAL_SERVER.exists())
        self.assertTrue(deploy.LOCAL_UNIT.exists())

    def test_nginx_sources_exist(self):
        self.assertTrue(deploy.LOCAL_ROUTES.exists())
        self.assertTrue(deploy.LOCAL_LIMIT.exists())

    def test_routes_snippet_points_at_the_sync_service(self):
        snippet = deploy.LOCAL_ROUTES.read_text(encoding="utf-8")
        self.assertIn("location = /api/public {", snippet)
        self.assertIn("location = /api/data {", snippet)
        self.assertEqual(snippet.count("proxy_pass http://127.0.0.1:18787;"), 2)
        self.assertIn("client_max_body_size 32m;", snippet)

    def test_limit_zone_snippet_declares_the_shared_zone(self):
        limit = deploy.LOCAL_LIMIT.read_text(encoding="utf-8")
        self.assertIn("limit_req_zone $binary_remote_addr zone=ops_vita_sync_limit:10m rate=60r/m;", limit)
        self.assertNotIn("htpasswd", limit)


    def test_unit_keeps_the_server_hardening(self):
        unit = deploy.LOCAL_UNIT.read_text(encoding="utf-8")
        self.assertIn("User=ops-vita", unit)
        self.assertIn("ExecStart=/usr/bin/node /opt/ops-vita-sync/local-sync-server.mjs", unit)
        self.assertIn("Environment=HOST=127.0.0.1", unit)
        self.assertIn("Environment=PORT=18787", unit)
        self.assertIn("ProtectSystem=strict", unit)
        self.assertIn("NoNewPrivileges=true", unit)

    def test_unit_carries_no_inline_secret(self):
        unit = deploy.LOCAL_UNIT.read_text(encoding="utf-8")
        for line in unit.splitlines():
            if not line.startswith("Environment="):
                continue
            value = line.split("=", 1)[1]
            if value.startswith("VITAFLOW_TOKEN_FILE="):
                self.assertTrue(value.endswith("/etc/ops-vita-sync/sync-token"))
                continue
            self.assertNotRegex(value, r"[A-Za-z0-9_-]{32,}")

    def test_service_code_is_the_one_deployed_to_aliyun(self):
        self.assertEqual(deploy.SERVER_TARGET, "/opt/ops-vita-sync/local-sync-server.mjs")
        self.assertEqual(deploy.LOCAL_SERVER.name, "local-sync-server.mjs")
        self.assertEqual(deploy.LOCAL_SERVER.parent.name, "vitaflow")

    def test_md5_helper_matches_hashlib(self):
        self.assertEqual(deploy.md5_bytes(b"ops-hub"), hashlib.md5(b"ops-hub").hexdigest())

class NginxRegionTests(unittest.TestCase):
    LEGACY_SITE = """server {
    server_name finance.insistgang.top;
    root /var/www/finance;

    # OPS-HUB VITAFLOW PUBLIC READ (GET-only enforced by upstream)
    location = /api/public {
        auth_basic off;
        proxy_pass http://127.0.0.1:18787;
    }

    # OPS-HUB VITAFLOW SYNC (private API only)
    location = /api/data {
        auth_basic off;
        client_max_body_size 32m;
        proxy_pass http://127.0.0.1:18787;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
"""

    def test_legacy_blocks_are_extracted(self):
        region = deploy.extract_api_blocks(self.LEGACY_SITE)
        self.assertIsNotNone(region)
        self.assertIn("location = /api/public {", region)
        self.assertIn("location = /api/data {", region)
        self.assertNotIn("location / {", region)

    def test_marked_region_takes_precedence(self):
        body = "    location = /api/public {\n        proxy_pass http://127.0.0.1:18787;\n    }"
        site = deploy.build_region(body)
        self.assertEqual(deploy.extract_managed_region(site).strip(), body.strip())
        self.assertIsNone(deploy.extract_managed_region(self.LEGACY_SITE))

    def test_replace_region_keeps_the_rest_of_the_site(self):
        snippet = deploy.LOCAL_ROUTES.read_text(encoding="utf-8")
        updated = deploy.replace_region(self.LEGACY_SITE, snippet)
        self.assertIn("root /var/www/finance;", updated)
        self.assertIn("try_files $uri $uri/ /index.html;", updated)
        self.assertIn(deploy.REGION_BEGIN, updated)
        self.assertIn(deploy.REGION_END, updated)
        self.assertEqual(updated.count("location = /api/public {"), 1)

    def test_replace_region_is_idempotent(self):
        snippet = deploy.LOCAL_ROUTES.read_text(encoding="utf-8")
        once = deploy.replace_region(self.LEGACY_SITE, snippet)
        twice = deploy.replace_region(once, snippet)
        self.assertEqual(once, twice)

    def test_replace_region_rejects_sites_without_routes(self):
        with self.assertRaises(ValueError):
            deploy.replace_region("server {\n    location / { return 404; }\n}\n", "body")

    def test_diff_is_empty_when_blocks_match(self):
        snippet = deploy.LOCAL_ROUTES.read_text(encoding="utf-8")
        region = deploy.extract_api_blocks(self.LEGACY_SITE)
        self.assertNotEqual(deploy.normalize_block(region), deploy.normalize_block(snippet))
        self.assertTrue(deploy.unified_diff(region, snippet, "api-routes"))

    def test_normalization_keeps_leading_indentation(self):
        self.assertNotEqual(
            deploy.normalize_block("    location = /api/public {"),
            deploy.normalize_block("location = /api/public {"),
        )

    def test_normalization_ignores_only_trailing_whitespace(self):
        self.assertEqual(
            deploy.normalize_block("    proxy_pass http://127.0.0.1:18787;   \n\n"),
            deploy.normalize_block("    proxy_pass http://127.0.0.1:18787;"),
        )



if __name__ == "__main__":
    unittest.main()
