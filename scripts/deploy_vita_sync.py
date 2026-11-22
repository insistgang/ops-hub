#!/usr/bin/env python3
"""scripts/deploy_vita_sync.py: 把阿里云上的 VitaFlow 同步服务纳入仓库管理。

现状
----
服务端 /opt/ops-vita-sync/local-sync-server.mjs 与仓库 vitaflow/local-sync-server.mjs
是同一份代码，但 systemd unit、nginx 路由与部署步骤原先只存在于机器上，
换机器或重建服务器时无法从仓库复现。本脚本补齐这一段：

* --check（默认）：只读核对仓库与服务器的服务代码、systemd unit、运行状态与健康端点。
* --deploy：显式部署（备份 → 安装 → daemon-reload → 重启 → 复核）。

边界
----
* 只写服务代码与 systemd unit 两处；绝不触碰 /etc/ops-vita-sync/sync-token
  与 /var/lib/ops-vita-sync 下的账号数据。
* 部署是显式动作，不进入 09:00/21:00 定时流水线；定时任务只做只读核对。
"""

import argparse
import hashlib
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SSH_HOST = os.environ.get("OPS_ALIYUN_HOST", "aliyun")

SERVICE = "ops-vita-sync"
SERVER_DIR = "/opt/ops-vita-sync"
SERVER_TARGET = f"{SERVER_DIR}/local-sync-server.mjs"
UNIT_TARGET = "/etc/systemd/system/ops-vita-sync.service"
NGINX_SITE = "/etc/nginx/sites-available/finance.insistgang.top"
HEALTH_URL = "http://127.0.0.1:18787/api/public"
PUBLIC_URL = "https://finance.insistgang.top/api/public"

LOCAL_SERVER = BASE_DIR / "vitaflow" / "local-sync-server.mjs"
LOCAL_UNIT = BASE_DIR / "vitaflow" / "sync-service" / f"{SERVICE}.service"

# 只读核对可以碰，但部署脚本永远不写这些路径：口令与账号数据。
PROTECTED_REMOTE_PATHS = (
    "/etc/ops-vita-sync/sync-token",
    "/var/lib/ops-vita-sync",
)

REMOTE_INSTALL = r"""#!/bin/bash
set -euo pipefail
SERVER_TARGET="$1"
UNIT_TARGET="$2"
NEW_CODE="$3"
NEW_UNIT="$4"
DO_CODE="$5"
DO_UNIT="$6"
TS=$(date -u +%Y%m%dT%H%M%SZ)

if [ "$DO_CODE" = "1" ]; then
  cp -a "$SERVER_TARGET" "/root/ops-vita-sync-server-before-$TS.mjs"
  install -o root -g root -m 644 "$NEW_CODE" "$SERVER_TARGET"
fi
if [ "$DO_UNIT" = "1" ]; then
  cp -a "$UNIT_TARGET" "/root/ops-vita-sync-unit-before-$TS.service"
  install -o root -g root -m 644 "$NEW_UNIT" "$UNIT_TARGET"
  systemctl daemon-reload
fi
if [ "$DO_CODE" = "1" ] || [ "$DO_UNIT" = "1" ]; then
  systemctl restart ops-vita-sync
  sleep 1
fi

# 备份各保留最近 5 份，避免每次部署都在 /root 堆文件
ls -1t /root/ops-vita-sync-server-before-*.mjs 2>/dev/null | tail -n +6 | xargs -r rm -f
ls -1t /root/ops-vita-sync-unit-before-*.service 2>/dev/null | tail -n +6 | xargs -r rm -f
rm -f "$NEW_CODE" "$NEW_UNIT"
echo "SERVICE $(systemctl is-active ops-vita-sync)"
md5sum "$SERVER_TARGET" "$UNIT_TARGET"
"""


def md5_bytes(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


def md5_file(path: Path) -> str:
    return md5_bytes(path.read_bytes())


def assert_writable_paths(paths):
    """部署只允许写服务代码与 systemd unit，其余路径一律拒绝。"""
    for path in paths:
        for protected in PROTECTED_REMOTE_PATHS:
            if path == protected or path.startswith(protected.rstrip("/") + "/"):
                raise ValueError(f"拒绝写入受保护路径: {path}")
    return list(paths)


def plan_actions(code_changed: bool, unit_changed: bool) -> list[str]:
    """根据差异给出将要执行的动作，纯函数便于回归测试。"""
    actions = []
    if code_changed:
        actions.append("更新服务代码")
    if unit_changed:
        actions.append("更新 systemd unit")
    if code_changed or unit_changed:
        actions.append("重启服务")
    return actions or ["无需部署（仓库与服务器已一致）"]


def run_ssh(command: str, timeout: int = 60):
    return subprocess.run(
        ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", SSH_HOST, command],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=timeout,
    )


def run_scp(local: Path, remote: str, timeout: int = 120):
    return subprocess.run(
        ["scp", "-q", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", str(local), f"{SSH_HOST}:{remote}"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=timeout,
    )


def remote_root_prefix() -> str:
    """普通用户登录时用 sudo -n 提权执行写操作。"""
    result = run_ssh("whoami")
    user = result.stdout.strip()
    return "" if user == "root" else "sudo -n "


def remote_md5(path: str) -> str:
    result = run_ssh(f"md5sum {path}")
    if result.returncode != 0:
        return ""
    return result.stdout.split()[0] if result.stdout.split() else ""


def remote_text(command: str) -> str:
    result = run_ssh(command)
    if result.returncode != 0:
        return ""
    return result.stdout.strip()


def probe() -> dict:
    """只读核对：本地与服务器的代码、unit、运行状态与路由。"""
    return {
        "local_code_md5": md5_file(LOCAL_SERVER),
        "remote_code_md5": remote_md5(SERVER_TARGET),
        "local_unit_md5": md5_file(LOCAL_UNIT),
        "remote_unit_md5": remote_md5(UNIT_TARGET),
        "service_state": remote_text(f"systemctl is-active {SERVICE}") or "unknown",
        "health_code": remote_text(f"curl -s -o /dev/null -w '%{{http_code}}' {HEALTH_URL}") or "000",
        "nginx_route": remote_text(f"grep -c 18787 {NGINX_SITE} || true") or "0",
    }


def public_status_code() -> str:
    try:
        with urllib.request.urlopen(PUBLIC_URL, timeout=20) as response:
            return str(response.status)
    except (urllib.error.URLError, OSError):
        return "000"


def wait_healthy(expected_state: str = "active", attempts: int = 10) -> bool:
    for _ in range(attempts):
        state = remote_text(f"systemctl is-active {SERVICE}")
        code = remote_text(f"curl -s -o /dev/null -w '%{{http_code}}' {HEALTH_URL}")
        if state == expected_state and code == "200":
            return True
        time.sleep(1)
    return False


def deploy(code_changed: bool, unit_changed: bool) -> bool:
    """把仓库里的服务代码与 unit 装到服务器并重启复核。"""
    assert_writable_paths([SERVER_TARGET, UNIT_TARGET])
    stamp = f"{os.getpid()}"
    new_code = f"/tmp/ops-vita-sync-code-{stamp}.mjs"
    new_unit = f"/tmp/ops-vita-sync-unit-{stamp}.service"

    if code_changed:
        upload = run_scp(LOCAL_SERVER, new_code)
        if upload.returncode != 0:
            print(f"❌ 上传服务代码失败: {upload.stderr.strip()}")
            return False
    if unit_changed:
        upload = run_scp(LOCAL_UNIT, new_unit)
        if upload.returncode != 0:
            print(f"❌ 上传 systemd unit 失败: {upload.stderr.strip()}")
            return False

    prefix = remote_root_prefix()
    command = (
        f"{prefix}bash -s -- {SERVER_TARGET} {UNIT_TARGET} {new_code} {new_unit} "
        f"{'1' if code_changed else '0'} {'1' if unit_changed else '0'}"
    )
    result = subprocess.run(
        ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", SSH_HOST, command],
        input=REMOTE_INSTALL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=300,
    )
    if result.returncode != 0:
        print(f"❌ 服务器端安装失败: {result.stderr.strip()}")
        return False
    print(result.stdout.strip())
    return wait_healthy()


def report(state: dict) -> bool:
    """打印核对结果，返回 True 表示仓库与服务器一致。"""
    code_ok = state["local_code_md5"] == state["remote_code_md5"]
    unit_ok = state["local_unit_md5"] == state["remote_unit_md5"]
    healthy = state["service_state"] == "active" and state["health_code"] == "200"

    print("🔎 阿里云 VitaFlow 同步服务核对")
    print(f"   服务代码: {'✅ 一致' if code_ok else '❌ 不一致'}  {state['local_code_md5'][:12]} / {state['remote_code_md5'][:12] or '缺失'}")
    print(f"   systemd unit: {'✅ 一致' if unit_ok else '❌ 不一致'}  {state['local_unit_md5'][:12]} / {state['remote_unit_md5'][:12] or '缺失'}")
    print(f"   运行状态: {state['service_state']} · 健康端点 {state['health_code']} · nginx 路由 {state['nginx_route']} 处")
    if not healthy:
        print("⚠️  服务未处于健康状态")
    return code_ok and unit_ok


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="核对/部署阿里云 VitaFlow 同步服务")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="只读核对（默认）")
    mode.add_argument("--deploy", action="store_true", help="显式部署到服务器")
    parser.add_argument("--dry-run", action="store_true", help="只打印将要执行的动作")
    parser.add_argument("--strict", action="store_true", help="存在差异时以退出码 1 结束")
    args = parser.parse_args(argv)

    if not LOCAL_SERVER.exists() or not LOCAL_UNIT.exists():
        print("❌ 仓库内缺少服务代码或 systemd unit，无法核对。")
        return 1

    state = probe()
    consistent = report(state)
    code_changed = state["local_code_md5"] != state["remote_code_md5"]
    unit_changed = state["local_unit_md5"] != state["remote_unit_md5"]

    if not args.deploy:
        if args.strict and not consistent:
            return 1
        return 0

    actions = plan_actions(code_changed, unit_changed)
    print(f"🛠️  计划动作: {'、'.join(actions)}")
    if consistent:
        print("✅ 仓库与服务器已一致，无需部署。")
        return 0
    if args.dry_run:
        print("ℹ️  dry-run：未对服务器做任何修改。")
        return 0

    if not deploy(code_changed, unit_changed):
        print("❌ 部署失败，服务器保留原有版本与备份。")
        return 1

    after = probe()
    if not report(after):
        print("❌ 部署后核对未通过，请检查服务器日志。")
        return 1
    print(f"✅ 同步服务已部署并复核通过；公网端点 {public_status_code()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
