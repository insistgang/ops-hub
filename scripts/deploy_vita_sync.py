#!/usr/bin/env python3
"""scripts/deploy_vita_sync.py: 把阿里云上的 VitaFlow 同步服务纳入仓库管理。

现状
----
服务端 /opt/ops-vita-sync/local-sync-server.mjs 与仓库 vitaflow/local-sync-server.mjs
是同一份代码，但 systemd unit、nginx 路由与部署步骤原先只存在于机器上，
换机器或重建服务器时无法从仓库复现。本脚本补齐这一段：

* --check（默认）：只读核对仓库与服务器的服务代码、systemd unit、nginx 路由片段与限流 zone。
* --nginx-diff：打印仓库与服务器 nginx 配置的差异。
* --deploy：显式部署服务代码与 systemd unit（备份 → 安装 → daemon-reload → 重启 → 复核）。
* --install-nginx：显式安装 nginx 托管区域（备份 → nginx -t 门禁 → reload，失败回滚）。

边界
----
* 只写服务代码、systemd unit 与 nginx 托管区域；绝不触碰 /etc/ops-vita-sync/sync-token
  与 /var/lib/ops-vita-sync 下的账号数据。
* nginx 只改带标注的托管区域，其余内容（鉴权、TLS、站点根目录）原样保留。
* 部署是显式动作，不进入 09:00/21:00 定时流水线；定时任务只做只读核对。
"""

import argparse
import difflib
import hashlib
import os
import shutil
import subprocess
import sys
import tempfile
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
NGINX_LIMIT = "/etc/nginx/conf.d/ops-vita-sync-limit.conf"
HEALTH_URL = "http://127.0.0.1:18787/api/public"
PUBLIC_URL = "https://finance.insistgang.top/api/public"

LOCAL_SERVER = BASE_DIR / "vitaflow" / "local-sync-server.mjs"
LOCAL_UNIT = BASE_DIR / "vitaflow" / "sync-service" / f"{SERVICE}.service"
LOCAL_ROUTES = BASE_DIR / "vitaflow" / "sync-service" / "finance-api-routes.nginx"
LOCAL_LIMIT = BASE_DIR / "vitaflow" / "sync-service" / "ops-vita-sync-limit.conf"
LOCAL_DROPIN = BASE_DIR / "vitaflow" / "sync-service" / "public-read.conf"
LOCAL_BRIDGE_TEMPLATE = BASE_DIR / "vitaflow" / "sync-service" / "com.insistgang.opshub.vitaflow-bridge.plist.template"
REMOTE_DROPIN_DIR = "/etc/systemd/system/ops-vita-sync.service.d"
REMOTE_DROPIN = f"{REMOTE_DROPIN_DIR}/public-read.conf"

# 本机桥接（浏览器 ⇄ 阿里云同步服务）的部署位置
BRIDGE_DEPLOY_DIR = Path.home() / ".local" / "share" / "ops-hub"
BRIDGE_DEPLOYED_SCRIPT = BRIDGE_DEPLOY_DIR / "vitaflow-local-bridge.mjs"
BRIDGE_PLIST = Path.home() / "Library" / "LaunchAgents" / "com.insistgang.opshub.vitaflow-bridge.plist"
BRIDGE_TOKEN = Path.home() / ".config" / "ops-hub" / "vitaflow-sync-token"
BRIDGE_PORT = 18789
LOCAL_BRIDGE_SOURCE = BASE_DIR / "scripts" / "vitaflow-local-bridge.mjs"

REGION_BEGIN = "# BEGIN ops-hub managed: vita sync routes"
REGION_END = "# END ops-hub managed: vita sync routes"

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
DROPIN_DIR="$7"
NEW_DROPIN="$8"
DO_DROPIN="$9"
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
if [ "$DO_DROPIN" = "1" ]; then
  mkdir -p "$DROPIN_DIR"
  if [ -f "$DROPIN_DIR/public-read.conf" ]; then
    cp -a "$DROPIN_DIR/public-read.conf" "/root/ops-vita-sync-dropin-before-$TS.conf"
  fi
  install -o root -g root -m 644 "$NEW_DROPIN" "$DROPIN_DIR/public-read.conf"
  systemctl daemon-reload
fi
if [ "$DO_CODE" = "1" ] || [ "$DO_UNIT" = "1" ] || [ "$DO_DROPIN" = "1" ]; then
  systemctl restart ops-vita-sync
  sleep 1
fi

# 备份各保留最近 5 份，避免每次部署都在 /root 堆文件
ls -1t /root/ops-vita-sync-server-before-*.mjs 2>/dev/null | tail -n +6 | xargs -r rm -f || true
ls -1t /root/ops-vita-sync-unit-before-*.service 2>/dev/null | tail -n +6 | xargs -r rm -f || true
ls -1t /root/ops-vita-sync-dropin-before-*.conf 2>/dev/null | tail -n +6 | xargs -r rm -f || true
rm -f "$NEW_CODE" "$NEW_UNIT"
echo "SERVICE $(systemctl is-active ops-vita-sync)"
md5sum "$SERVER_TARGET" "$UNIT_TARGET"
"""

REMOTE_INSTALL_NGINX = r"""#!/bin/bash
set -euo pipefail
SITE="$1"
SITE_NEW="$2"
LIMIT="$3"
LIMIT_NEW="$4"
DO_SITE="$5"
DO_LIMIT="$6"
TS=$(date -u +%Y%m%dT%H%M%SZ)

if [ "$DO_SITE" = "1" ]; then
  cp -a "$SITE" "/root/ops-vita-nginx-before-$TS.conf"
  install -o root -g root -m 644 "$SITE_NEW" "$SITE"
fi
if [ "$DO_LIMIT" = "1" ]; then
  cp -a "$LIMIT" "/root/ops-vita-nginx-limit-before-$TS.conf"
  install -o root -g root -m 644 "$LIMIT_NEW" "$LIMIT"
fi

# 语法门禁：不过就回滚，绝不 reload 半套配置
if ! nginx -t; then
  echo "NGINX_TEST_FAILED"
  if [ "$DO_SITE" = "1" ] && [ -f "/root/ops-vita-nginx-before-$TS.conf" ]; then
    cp -a "/root/ops-vita-nginx-before-$TS.conf" "$SITE"
  fi
  if [ "$DO_LIMIT" = "1" ] && [ -f "/root/ops-vita-nginx-limit-before-$TS.conf" ]; then
    cp -a "/root/ops-vita-nginx-limit-before-$TS.conf" "$LIMIT"
  fi
  rm -f "$SITE_NEW" "$LIMIT_NEW"
  exit 1
fi

systemctl reload nginx
sleep 1
echo "NGINX $(systemctl is-active nginx)"

ls -1t /root/ops-vita-nginx-before-*.conf 2>/dev/null | tail -n +6 | xargs -r rm -f || true
ls -1t /root/ops-vita-nginx-limit-before-*.conf 2>/dev/null | tail -n +6 | xargs -r rm -f || true
rm -f "$SITE_NEW" "$LIMIT_NEW"
"""


def md5_bytes(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


def md5_file(path: Path) -> str:
    return md5_bytes(path.read_bytes())


def assert_writable_paths(paths):
    """部署只允许写服务代码、systemd unit 与 nginx 托管区域，其余路径一律拒绝。"""
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


def normalize_block(text: str) -> str:
    """比较用：去掉行尾空白与首尾空行，但保留缩进（缩进变了就是配置变了）。"""
    lines = [line.rstrip() for line in text.splitlines()]
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    return "\n".join(lines)


def extract_managed_region(text: str) -> str | None:
    """已标注的托管区域正文；没有标注时返回 None。"""
    lines = text.splitlines()
    start = end = None
    for index, line in enumerate(lines):
        if line.strip() == REGION_BEGIN:
            start = index
        elif line.strip() == REGION_END and start is not None:
            end = index
            break
    if start is None or end is None:
        return None
    return "\n".join(lines[start + 1:end])


def extract_api_blocks(text: str) -> str | None:
    """旧结构：按花括号配对取出 /api/public 与 /api/data 两段路由。"""
    lines = text.splitlines()
    start = None
    for index, line in enumerate(lines):
        if "location = /api/public {" in line:
            start = index
            break
    if start is None:
        return None
    while start > 0 and lines[start - 1].strip().startswith("#"):
        start -= 1
    for index, line in enumerate(lines):
        if "location = /api/data {" not in line:
            continue
        depth = 0
        for cursor in range(index, len(lines)):
            depth += lines[cursor].count("{") - lines[cursor].count("}")
            if depth == 0:
                return "\n".join(lines[start:cursor + 1])
        break
    return None


def region_of(text: str) -> str | None:
    """托管区域正文：优先读标注区域，否则回退到旧结构的两段路由。"""
    return extract_managed_region(text) or extract_api_blocks(text)


def build_region(body: str) -> str:
    """标注包裹托管区域；保留首行缩进，只去掉首尾空行。"""
    lines = [line.rstrip() for line in body.splitlines()]
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    return "    " + REGION_BEGIN + "\n" + "\n".join(lines) + "\n    " + REGION_END


def replace_region(text: str, body: str) -> str:
    """把托管区域写进站点配置：已有标注就替换，没有就按旧结构定位替换。"""
    marked = extract_managed_region(text)
    if marked is not None:
        lines = text.splitlines()
        start = next(i for i, line in enumerate(lines) if line.strip() == REGION_BEGIN)
        end = next(i for i, line in enumerate(lines) if line.strip() == REGION_END)
        return "\n".join(lines[:start] + build_region(body).splitlines() + lines[end + 1:]) + "\n"
    legacy = extract_api_blocks(text)
    if legacy is None:
        raise ValueError("站点配置里找不到 /api/public 与 /api/data 路由块")
    return text.replace(legacy, build_region(body), 1)


def unified_diff(before: str, after: str, label: str) -> str:
    return "".join(difflib.unified_diff(
        before.splitlines(keepends=True), after.splitlines(keepends=True),
        fromfile=f"server/{label}", tofile=f"repo/{label}", n=3,
    ))


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
    return result.stdout


def remote_file(path: str) -> str:
    return remote_text(f"cat {path}")


def probe() -> dict:
    """只读核对：本地与服务器的代码、unit、nginx 路由与限流 zone。"""
    site = remote_file(NGINX_SITE)
    region = region_of(site) or ""
    snippet = LOCAL_ROUTES.read_text(encoding="utf-8") if LOCAL_ROUTES.exists() else ""
    limit_remote = remote_file(NGINX_LIMIT)
    limit_local = LOCAL_LIMIT.read_text(encoding="utf-8") if LOCAL_LIMIT.exists() else ""
    return {
        "local_code_md5": md5_file(LOCAL_SERVER),
        "remote_code_md5": remote_md5(SERVER_TARGET),
        "local_unit_md5": md5_file(LOCAL_UNIT),
        "remote_unit_md5": remote_md5(UNIT_TARGET),
        "service_state": remote_text(f"systemctl is-active {SERVICE}").strip() or "unknown",
        "health_code": remote_text(f"curl -s -o /dev/null -w '%{{http_code}}' {HEALTH_URL}").strip() or "000",
        "nginx_route": remote_text(f"grep -c 18787 {NGINX_SITE} || true").strip() or "0",
        "routes_match": normalize_block(region) == normalize_block(snippet),
        "region_marked": extract_managed_region(site) is not None,
        "dropin_match": remote_file(REMOTE_DROPIN).strip() == LOCAL_DROPIN.read_text(encoding="utf-8").strip(),
        "bridge": bridge_status(),
        "limit_match": limit_remote.strip() == limit_local.strip(),
        "site_text": site,
        "limit_remote_text": limit_remote,
    }


def node_binary() -> str:
    """launchd 需要绝对路径：优先本机自装的 node。"""
    candidates = [
        Path.home() / ".local" / "bin" / "node",
        Path("/opt/homebrew/bin/node"),
        Path("/usr/local/bin/node"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    return shutil.which("node") or "/usr/bin/env node"


def render_bridge_plist() -> str:
    """把仓库里的 plist 模板渲染成本机可用的 launchd 配置。"""
    template = LOCAL_BRIDGE_TEMPLATE.read_text(encoding="utf-8")
    return (template
            .replace("__PORT__", str(BRIDGE_PORT))
            .replace("__NODE_BIN__", node_binary())
            .replace("__BRIDGE_SCRIPT__", str(BRIDGE_DEPLOYED_SCRIPT))
            .replace("__LOG_DIR__", str(Path.home() / ".config" / "ops-hub" / "logs")))


def bridge_status() -> dict:
    """本机桥接的部署状态：脚本副本、launchd 配置与令牌。"""
    copy_match = (BRIDGE_DEPLOYED_SCRIPT.exists()
                  and md5_file(BRIDGE_DEPLOYED_SCRIPT) == md5_file(LOCAL_BRIDGE_SOURCE))
    plist_present = BRIDGE_PLIST.exists()
    plist_match = plist_present and BRIDGE_PLIST.read_text(encoding="utf-8") == render_bridge_plist()
    return {
        "copy_match": copy_match,
        "plist_present": plist_present,
        "plist_match": plist_match,
        "token_present": BRIDGE_TOKEN.exists(),
        "running": bool(shutil.which("pgrep")) and subprocess.run(
            ["pgrep", "-f", "vitaflow-local-bridge.mjs"], stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL).returncode == 0,
    }


def install_bridge() -> bool:
    """把桥接脚本与 launchd 配置装到本机；令牌永不生成。"""
    BRIDGE_DEPLOY_DIR.mkdir(parents=True, exist_ok=True)
    os.chmod(BRIDGE_DEPLOY_DIR, 0o700)
    log_dir = Path.home() / ".config" / "ops-hub" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)

    changed = False
    if not BRIDGE_DEPLOYED_SCRIPT.exists() or md5_file(BRIDGE_DEPLOYED_SCRIPT) != md5_file(LOCAL_BRIDGE_SOURCE):
        if BRIDGE_DEPLOYED_SCRIPT.exists():
            stamp = time.strftime("%Y%m%dT%H%M%S")
            shutil.copy2(BRIDGE_DEPLOYED_SCRIPT, BRIDGE_DEPLOY_DIR / f"vitaflow-local-bridge.before-{stamp}.mjs")
        shutil.copy2(LOCAL_BRIDGE_SOURCE, BRIDGE_DEPLOYED_SCRIPT)
        os.chmod(BRIDGE_DEPLOYED_SCRIPT, 0o600)
        changed = True
        print("✅ 已更新本机桥接脚本副本")

    plist = render_bridge_plist()
    if not BRIDGE_PLIST.exists() or BRIDGE_PLIST.read_text(encoding="utf-8") != plist:
        BRIDGE_PLIST.parent.mkdir(parents=True, exist_ok=True)
        if BRIDGE_PLIST.exists():
            stamp = time.strftime("%Y%m%dT%H%M%S")
            shutil.copy2(BRIDGE_PLIST, BRIDGE_PLIST.with_name(BRIDGE_PLIST.name + f".before-{stamp}"))
        BRIDGE_PLIST.write_text(plist, encoding="utf-8")
        changed = True
        print("✅ 已写入本机 launchd 配置")

    if changed:
        label = BRIDGE_PLIST.stem
        domain = f"gui/{os.getuid()}"
        # 先 enable：被标记为 disabled 的服务直接 bootstrap 会报 I/O error。
        subprocess.run(["launchctl", "enable", f"{domain}/{label}"],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        loaded = subprocess.run(["launchctl", "print", f"{domain}/{label}"],
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
        if loaded:
            subprocess.run(["launchctl", "kickstart", "-k", f"{domain}/{label}"],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print("✅ 已重启本机桥接")
        else:
            load = subprocess.run(["launchctl", "bootstrap", domain, str(BRIDGE_PLIST)],
                                  stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if load.returncode != 0:
                print(f"⚠️  launchctl 加载失败: {load.stderr.strip()}")
                return False
            print("✅ 已注册并启动本机桥接")

        # 加载后必须确认进程真的在跑，失败就回滚 plist，避免桥接悄悄停掉。
        deadline = time.time() + 10
        while time.time() < deadline and not bridge_status()["running"]:
            time.sleep(1)
        if not bridge_status()["running"]:
            backups = sorted(BRIDGE_PLIST.parent.glob(BRIDGE_PLIST.name + ".before-*"))
            if backups:
                shutil.copy2(backups[-1], BRIDGE_PLIST)
                subprocess.run(["launchctl", "bootout", f"{domain}/{label}"],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                subprocess.run(["launchctl", "enable", f"{domain}/{label}"],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                subprocess.run(["launchctl", "bootstrap", domain, str(BRIDGE_PLIST)],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                print("❌ 桥接未恢复，已回滚上一次的 launchd 配置")
            return False
    elif not bridge_status()["running"]:
        print("ℹ️  配置未变化，但桥接未在运行，可执行 launchctl kickstart 启动。")

    if not BRIDGE_TOKEN.exists():
        print(f"⚠️  桥接令牌缺失：{BRIDGE_TOKEN}（本脚本不生成口令，请自行放置 0600 权限的令牌文件）")
    return True


def public_status_code() -> str:
    try:
        with urllib.request.urlopen(PUBLIC_URL, timeout=20) as response:
            return str(response.status)
    except (urllib.error.URLError, OSError):
        return "000"


def wait_healthy(expected_state: str = "active", attempts: int = 10) -> bool:
    for _ in range(attempts):
        state = remote_text(f"systemctl is-active {SERVICE}").strip()
        code = remote_text(f"curl -s -o /dev/null -w '%{{http_code}}' {HEALTH_URL}").strip()
        if state == expected_state and code == "200":
            return True
        time.sleep(1)
    return False


def deploy(code_changed: bool, unit_changed: bool, dropin_changed: bool = False) -> bool:
    """把仓库里的服务代码、unit 与 drop-in 装到服务器并重启复核。"""
    assert_writable_paths([SERVER_TARGET, UNIT_TARGET, REMOTE_DROPIN])
    stamp = f"{os.getpid()}"
    new_code = f"/tmp/ops-vita-sync-code-{stamp}.mjs"
    new_unit = f"/tmp/ops-vita-sync-unit-{stamp}.service"
    new_dropin = f"/tmp/ops-vita-sync-dropin-{stamp}.conf"

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
    if dropin_changed:
        upload = run_scp(LOCAL_DROPIN, new_dropin)
        if upload.returncode != 0:
            print(f"❌ 上传 systemd drop-in 失败: {upload.stderr.strip()}")
            return False

    prefix = remote_root_prefix()
    command = (
        f"{prefix}bash -s -- {SERVER_TARGET} {UNIT_TARGET} {new_code} {new_unit} "
        f"{'1' if code_changed else '0'} {'1' if unit_changed else '0'} "
        f"{REMOTE_DROPIN_DIR} {new_dropin} {'1' if dropin_changed else '0'}"
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


def install_nginx(site_changed: bool, limit_changed: bool) -> bool:
    """安装 nginx 托管区域：nginx -t 不过就回滚，绝不 reload 半套配置。"""
    assert_writable_paths([NGINX_SITE, NGINX_LIMIT])
    stamp = f"{os.getpid()}"
    new_site = f"/tmp/ops-vita-nginx-site-{stamp}.conf"
    new_limit = f"/tmp/ops-vita-nginx-limit-{stamp}.conf"

    if site_changed:
        with tempfile.TemporaryDirectory(prefix="ops-vita-nginx-") as tmp:
            target = Path(tmp) / "site.conf"
            target.write_text(
                replace_region(remote_file(NGINX_SITE), LOCAL_ROUTES.read_text(encoding="utf-8")),
                encoding="utf-8")
            upload = run_scp(target, new_site)
            if upload.returncode != 0:
                print(f"❌ 上传站点配置失败: {upload.stderr.strip()}")
                return False
    if limit_changed:
        upload = run_scp(LOCAL_LIMIT, new_limit)
        if upload.returncode != 0:
            print(f"❌ 上传限流 zone 配置失败: {upload.stderr.strip()}")
            return False

    prefix = remote_root_prefix()
    command = (
        f"{prefix}bash -s -- {NGINX_SITE} {new_site} {NGINX_LIMIT} {new_limit} "
        f"{'1' if site_changed else '0'} {'1' if limit_changed else '0'}"
    )
    result = subprocess.run(
        ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", SSH_HOST, command],
        input=REMOTE_INSTALL_NGINX, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=300,
    )
    print(result.stdout.strip())
    if result.returncode != 0:
        # 退出码可能来自最后的清理行；以服务器实际状态为准，不误报回滚。
        print(f"⚠️  远端脚本退出码 {result.returncode}，正在复核服务器实际状态。")
    state = probe()
    if state["routes_match"] and state["region_marked"] and state["service_state"] == "active":
        print("✅ 服务器状态复核通过：托管区域已安装，服务与 nginx 正常。")
        return True
    print("❌ nginx 安装后复核未通过，请检查服务器日志与备份。")
    return False


def report(state: dict) -> bool:
    """打印核对结果，返回 True 表示仓库与服务器一致。"""
    code_ok = state["local_code_md5"] == state["remote_code_md5"]
    unit_ok = state["local_unit_md5"] == state["remote_unit_md5"]
    routes_ok = state["routes_match"]
    limit_ok = state["limit_match"]
    healthy = state["service_state"] == "active" and state["health_code"] == "200"

    print("🔎 阿里云 VitaFlow 同步服务核对")
    print(f"   服务代码: {'✅ 一致' if code_ok else '❌ 不一致'}  {state['local_code_md5'][:12]} / {state['remote_code_md5'][:12] or '缺失'}")
    print(f"   systemd unit: {'✅ 一致' if unit_ok else '❌ 不一致'}  {state['local_unit_md5'][:12]} / {state['remote_unit_md5'][:12] or '缺失'}")
    marked = "已标注" if state["region_marked"] else "未标注（首次安装会补托管标注）"
    print(f"   nginx 路由片段: {'✅ 一致' if routes_ok else '❌ 不一致'}  /api/public 与 /api/data 指向 127.0.0.1:18787 · {marked}")
    print(f"   nginx 限流 zone: {'✅ 一致' if limit_ok else '❌ 不一致'}  {NGINX_LIMIT}")
    print(f"   systemd drop-in: {'✅ 一致' if state['dropin_match'] else '❌ 不一致'}  {REMOTE_DROPIN}")
    bridge = state["bridge"]
    print(f"   本机桥接: 脚本副本 {'✅ 一致' if bridge['copy_match'] else '❌ 不一致'} · plist {'✅ 一致' if bridge['plist_match'] else '❌ 不一致'} · "
          f"令牌 {'✅ 存在' if bridge['token_present'] else '❌ 缺失'} · 进程 {'运行中' if bridge['running'] else '未运行'}")
    print(f"   运行状态: {state['service_state']} · 健康端点 {state['health_code']} · nginx 路由 {state['nginx_route']} 处")
    if not healthy:
        print("⚠️  服务未处于健康状态")
    return code_ok and unit_ok and routes_ok and limit_ok


def nginx_diff(state: dict) -> None:
    """打印仓库与服务器的 nginx 差异。"""
    snippet = LOCAL_ROUTES.read_text(encoding="utf-8")
    region = region_of(state["site_text"]) or ""
    if normalize_block(region) == normalize_block(snippet):
        print("✅ nginx 托管区域与仓库一致，无需改动。")
    else:
        print(unified_diff(region, snippet, "api-routes") or "（仅空白差异）")
    if state["limit_remote_text"].strip() != LOCAL_LIMIT.read_text(encoding="utf-8").strip():
        print(unified_diff(state["limit_remote_text"], LOCAL_LIMIT.read_text(encoding="utf-8"), "sync-limit"))


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="核对/部署阿里云 VitaFlow 同步服务")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="只读核对（默认）")
    mode.add_argument("--deploy", action="store_true", help="显式部署服务代码与 systemd unit")
    mode.add_argument("--nginx-diff", action="store_true", help="打印 nginx 配置差异")
    mode.add_argument("--install-nginx", action="store_true", help="显式安装 nginx 托管区域")
    mode.add_argument("--bridge-status", action="store_true", help="只打印本机桥接部署状态")
    mode.add_argument("--bridge-install", action="store_true", help="安装本机桥接脚本副本与 launchd 配置")
    parser.add_argument("--dry-run", action="store_true", help="只打印将要执行的动作")
    parser.add_argument("--strict", action="store_true", help="存在差异时以退出码 1 结束")
    args = parser.parse_args(argv)

    missing = [path for path in (LOCAL_SERVER, LOCAL_UNIT, LOCAL_ROUTES, LOCAL_LIMIT) if not path.exists()]
    if missing:
        print(f"❌ 仓库内缺少必要文件: {', '.join(path.name for path in missing)}")
        return 1

    if args.bridge_install:
        install_bridge()
        state = probe()
        report(state)
        return 0

    state = probe()
    if args.bridge_status:
        bridge = state["bridge"]
        print("🔎 本机桥接部署状态")
        print(f"   脚本副本: {'✅ 一致' if bridge['copy_match'] else '❌ 不一致'}  {BRIDGE_DEPLOYED_SCRIPT}")
        print(f"   launchd 配置: {'✅ 一致' if bridge['plist_match'] else '❌ 不一致'}  {BRIDGE_PLIST}")
        print(f"   令牌文件: {'✅ 存在' if bridge['token_present'] else '❌ 缺失'}  {BRIDGE_TOKEN}")
        print(f"   进程: {'运行中' if bridge['running'] else '未运行'}")
        return 0

    consistent = report(state)
    code_changed = state["local_code_md5"] != state["remote_code_md5"]
    unit_changed = state["local_unit_md5"] != state["remote_unit_md5"]
    site_changed = not state["routes_match"] or not state["region_marked"]
    limit_changed = not state["limit_match"]
    dropin_changed = not state["dropin_match"]

    if args.nginx_diff:
        nginx_diff(state)
        return 0

    if args.install_nginx:
        if not site_changed and not limit_changed:
            print("✅ nginx 配置与仓库一致，无需安装。")
            return 0
        actions = []
        if site_changed:
            if state["routes_match"]:
                actions.append("为 nginx 路由片段补托管标注")
            else:
                actions.append("写入 nginx 托管区域")
        if limit_changed:
            actions.append("更新限流 zone")
        print(f"🛠️  计划动作: {'、'.join(actions)}")
        if args.dry_run:
            print("ℹ️  dry-run：未对服务器做任何修改。")
            return 0
        if not install_nginx(site_changed, limit_changed):
            return 1
        after = probe()
        report(after)
        print(f"✅ nginx 配置已安装并复核；公网端点 {public_status_code()}")
        return 0

    if not args.deploy:
        if args.strict and not consistent:
            return 1
        return 0

    actions = plan_actions(code_changed, unit_changed)
    if dropin_changed:
        actions.append("更新 systemd drop-in")
    print(f"🛠️  计划动作: {'、'.join(actions)}")
    if not code_changed and not unit_changed and not dropin_changed:
        print("✅ 仓库与服务器已一致，无需部署。")
        return 0
    if args.dry_run:
        print("ℹ️  dry-run：未对服务器做任何修改。")
        return 0

    if not deploy(code_changed, unit_changed, dropin_changed):
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
