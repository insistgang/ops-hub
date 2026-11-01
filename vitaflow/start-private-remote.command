#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR"

PORT="${PORT:-8787}"
CLOUDFLARED_DIR="${HOME}/.cloudflared"
CONFIG_FILE="${VITAFLOW_CLOUDFLARED_CONFIG:-${HOME}/.cloudflared/vitaflow.yml}"
ACCESS_READY_FILE="${CONFIG_FILE}.access-ready"
SERVER_STARTED=0
SERVER_PID=""

cleanup() {
  if [ "$SERVER_STARTED" -eq 1 ] && [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

stop_with_signal() {
  cleanup
  trap - EXIT
  exit 130
}

trap cleanup EXIT
trap stop_with_signal INT TERM

fail() {
  echo ""
  echo "无法启动私有远程访问：$1"
  exit 1
}

if ! command -v node >/dev/null 2>&1; then
  fail "没有找到 Node.js。"
fi

if ! command -v cloudflared >/dev/null 2>&1; then
  fail "没有找到 cloudflared。请先运行 brew install cloudflared。"
fi

if [ ! -f "$CONFIG_FILE" ]; then
  fail "还没有隧道配置。请先双击 setup-private-remote.command。"
fi

if [ ! -f "$ACCESS_READY_FILE" ]; then
  fail "还没有确认 Cloudflare Access 门禁。请重新运行 setup-private-remote.command 完成配置。"
fi

HOSTNAME="$(sed -nE 's/^[[:space:]]*-[[:space:]]*hostname:[[:space:]]*"?([^"[:space:]]+)"?[[:space:]]*$/\1/p' "$CONFIG_FILE" | head -n 1)"
if [ -z "$HOSTNAME" ]; then
  fail "配置里没有找到远程域名。"
fi

CONFIG_TUNNEL="$(sed -nE 's/^[[:space:]]*tunnel:[[:space:]]*"?([^"[:space:]]+)"?[[:space:]]*$/\1/p' "$CONFIG_FILE" | head -n 1)"
CONFIRMED_HOSTNAME="$(sed -n 's/^hostname=//p' "$ACCESS_READY_FILE" | head -n 1)"
CONFIRMED_TUNNEL="$(sed -n 's/^tunnel=//p' "$ACCESS_READY_FILE" | head -n 1)"
if [ "$CONFIRMED_HOSTNAME" != "$HOSTNAME" ] || [ "$CONFIRMED_TUNNEL" != "$CONFIG_TUNNEL" ]; then
  fail "隧道配置与 Access 确认不一致。请重新运行 setup-private-remote.command。"
fi

is_vitaflow_ready() {
  local health_json
  health_json="$(curl -fsS "http://127.0.0.1:${PORT}/api/health" 2>/dev/null)" || return 1
  print -rn -- "$health_json" | node -e '
    const fs = require("node:fs");
    try {
      const health = JSON.parse(fs.readFileSync(0, "utf8"));
      if (health.ok !== true || health.authRequired !== true) process.exit(1);
    } catch {
      process.exit(1);
    }
  '
}

if is_vitaflow_ready; then
  echo "VitaFlow 本地同步服务器已经在运行，将复用现有服务。"
else
  echo "正在以仅本机可访问的方式启动 VitaFlow 同步服务器..."
  HOST=127.0.0.1 PORT="$PORT" node local-sync-server.mjs &
  SERVER_PID=$!
  SERVER_STARTED=1

  SERVER_READY=0
  for _ in {1..40}; do
    if is_vitaflow_ready; then
      SERVER_READY=1
      break
    fi
    if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
      break
    fi
    sleep 0.25
  done

  if [ "$SERVER_READY" -ne 1 ]; then
    fail "本地同步服务器没有正常就绪。"
  fi
fi

TOKEN="$(node local-sync-server.mjs --print-token)"

REMOTE_URL="https://${HOSTNAME}/schedule-system-2.0.html?key=${TOKEN}"
LOCAL_URL="http://127.0.0.1:${PORT}/schedule-system-2.0.html?key=${TOKEN}"

echo ""
echo "VitaFlow 私有远程访问正在启动："
echo "  远程地址: ${REMOTE_URL}"
echo "  本机地址: ${LOCAL_URL}"
echo ""
echo "远程访问会先经过 Cloudflare Access，再经过 VitaFlow 自己的访问口令。"
echo "保持这个窗口打开；关闭窗口后远程连接会停止。"
echo ""

if [ "${VITAFLOW_NO_OPEN:-0}" != "1" ] && command -v open >/dev/null 2>&1; then
  (sleep 3; open "$REMOTE_URL" >/dev/null 2>&1 || true) &
fi

cloudflared tunnel --config "$CONFIG_FILE" --no-autoupdate --loglevel info run
