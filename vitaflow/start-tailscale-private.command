#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR"

PORT="${PORT:-8787}"
SERVER_STARTED=0
SERVER_PID=""
OPEN_PID=""

cleanup() {
  if [ -n "$OPEN_PID" ] && kill -0 "$OPEN_PID" >/dev/null 2>&1; then
    kill "$OPEN_PID" >/dev/null 2>&1 || true
    wait "$OPEN_PID" 2>/dev/null || true
  fi
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
  echo "无法启动 Tailscale 私有访问：$1"
  exit 1
}

if ! command -v node >/dev/null 2>&1; then
  fail "没有找到 Node.js。"
fi

if ! command -v tailscale >/dev/null 2>&1; then
  fail "没有找到 Tailscale。请先安装并登录 Tailscale 客户端。"
fi

if [ ! -f "local-sync-server.mjs" ]; then
  fail "当前文件夹缺少 local-sync-server.mjs。"
fi

TAILSCALE_STATUS="$(tailscale status --json 2>/dev/null || true)"
if ! TAILSCALE_HOST="$(print -rn -- "$TAILSCALE_STATUS" | node -e '
  const fs = require("node:fs");
  try {
    const status = JSON.parse(fs.readFileSync(0, "utf8"));
    if (status.BackendState !== "Running") process.exit(1);
    const host = String(status.Self && status.Self.DNSName || "").replace(/\.$/, "");
    if (!host) process.exit(1);
    process.stdout.write(host);
  } catch {
    process.exit(1);
  }
')"; then
  fail "Tailscale 尚未连接。请先打开 Tailscale，登录并确认状态为 Connected。"
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
    fail "本地同步服务器没有正常就绪；请确认 ${PORT} 端口没有被其他程序占用。"
  fi
fi

TOKEN="$(node local-sync-server.mjs --print-token)"
PRIVATE_URL="https://${TAILSCALE_HOST}/schedule-system-2.0.html?key=${TOKEN}"

echo ""
echo "VitaFlow Tailscale 私有访问："
echo "  ${PRIVATE_URL}"
echo ""
echo "这个地址只对你的 Tailscale 私有网络开放，VitaFlow 访问口令仍是第二道保护。"
echo "保持此窗口打开；关闭窗口后，Tailscale Serve 会停止共享。"
echo ""

if [ "${VITAFLOW_NO_OPEN:-0}" != "1" ] && command -v open >/dev/null 2>&1; then
  (sleep 3; open "$PRIVATE_URL" >/dev/null 2>&1 || true) &
  OPEN_PID=$!
fi

tailscale serve --https=443 "$PORT"

