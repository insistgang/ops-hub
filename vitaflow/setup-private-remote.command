#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR"

umask 077

TUNNEL_NAME="${VITAFLOW_TUNNEL_NAME:-vitaflow}"
CLOUDFLARED_DIR="${HOME}/.cloudflared"
CONFIG_FILE="${VITAFLOW_CLOUDFLARED_CONFIG:-${HOME}/.cloudflared/vitaflow.yml}"
HOSTNAME="${1:-}"

fail() {
  echo ""
  echo "配置没有完成：$1"
  exit 1
}

if ! command -v node >/dev/null 2>&1; then
  fail "没有找到 Node.js。"
fi

if ! command -v cloudflared >/dev/null 2>&1; then
  fail "没有找到 cloudflared。请先运行 brew install cloudflared。"
fi

if [ -z "$HOSTNAME" ]; then
  echo "请输入准备给 VitaFlow 使用的完整域名，例如 vitaflow.example.com："
  IFS= read -r HOSTNAME
fi

if ! HOSTNAME="$(node -e '
  const host = String(process.argv[1] || "").trim().toLowerCase();
  const label = "[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?";
  const valid = host.length <= 253 && new RegExp(`^${label}(?:\\.${label})+$`).test(host);
  if (!valid) process.exit(1);
  process.stdout.write(host);
' "$HOSTNAME")"; then
  fail "域名格式不正确，请只输入类似 vitaflow.example.com 的完整域名。"
fi

mkdir -p "$CLOUDFLARED_DIR" "$(dirname "$CONFIG_FILE")"
chmod 700 "$CLOUDFLARED_DIR" 2>/dev/null || true

if [ ! -f "${CLOUDFLARED_DIR}/cert.pem" ]; then
  echo "正在打开 Cloudflare 登录页面。完成授权后回到这个窗口。"
  cloudflared tunnel login
fi

find_tunnel_id() {
  cloudflared tunnel list --output json | VITAFLOW_TUNNEL_LOOKUP="$TUNNEL_NAME" node -e '
    const fs = require("node:fs");
    const tunnels = JSON.parse(fs.readFileSync(0, "utf8"));
    const match = tunnels.find(item => item.name === process.env.VITAFLOW_TUNNEL_LOOKUP);
    process.stdout.write(match ? String(match.id || match.uuid || "") : "");
  '
}

echo "正在检查名为 ${TUNNEL_NAME} 的专用隧道..."
TUNNEL_ID="$(find_tunnel_id)"
if [ -z "$TUNNEL_ID" ]; then
  cloudflared tunnel create "$TUNNEL_NAME"
  TUNNEL_ID="$(find_tunnel_id)"
fi

if [ -z "$TUNNEL_ID" ]; then
  fail "隧道已经创建，但没有读到它的编号。"
fi

CREDENTIALS_FILE="${CLOUDFLARED_DIR}/${TUNNEL_ID}.json"
if [ ! -f "$CREDENTIALS_FILE" ]; then
  fail "找到了隧道，但本机缺少它的凭据文件：${CREDENTIALS_FILE}。请换一个 VITAFLOW_TUNNEL_NAME 后重试，或从原设备安全迁移凭据。"
fi
chmod 600 "$CREDENTIALS_FILE" 2>/dev/null || true

ACCESS_READY_FILE="${CONFIG_FILE}.access-ready"
ACCESS_ALREADY_CONFIRMED=0
if [ -f "$CONFIG_FILE" ] && [ -f "$ACCESS_READY_FILE" ]; then
  EXISTING_HOSTNAME="$(sed -nE 's/^[[:space:]]*-[[:space:]]*hostname:[[:space:]]*"?([^"[:space:]]+)"?[[:space:]]*$/\1/p' "$CONFIG_FILE" | head -n 1)"
  EXISTING_TUNNEL="$(sed -nE 's/^[[:space:]]*tunnel:[[:space:]]*"?([^"[:space:]]+)"?[[:space:]]*$/\1/p' "$CONFIG_FILE" | head -n 1)"
  CONFIRMED_HOSTNAME="$(sed -n 's/^hostname=//p' "$ACCESS_READY_FILE" | head -n 1)"
  CONFIRMED_TUNNEL="$(sed -n 's/^tunnel=//p' "$ACCESS_READY_FILE" | head -n 1)"
  if [ "$EXISTING_HOSTNAME" = "$HOSTNAME" ] && [ "$EXISTING_TUNNEL" = "$TUNNEL_ID" ] && \
     [ "$CONFIRMED_HOSTNAME" = "$HOSTNAME" ] && [ "$CONFIRMED_TUNNEL" = "$TUNNEL_ID" ]; then
    ACCESS_ALREADY_CONFIRMED=1
  fi
fi

TEMP_CONFIG="${CONFIG_FILE}.tmp.$$"
cleanup_temp() {
  rm -f "$TEMP_CONFIG"
}
trap cleanup_temp EXIT

{
  printf 'tunnel: "%s"\n' "$TUNNEL_ID"
  printf 'credentials-file: "%s"\n' "$CREDENTIALS_FILE"
  printf 'ingress:\n'
  printf '  - hostname: "%s"\n' "$HOSTNAME"
  printf '    service: http://127.0.0.1:8787\n'
  printf '  - service: http_status:404\n'
} > "$TEMP_CONFIG"
chmod 600 "$TEMP_CONFIG"

echo ""
echo "隧道已准备好，但域名还没有发布。请先建立 Cloudflare Access 门禁："
echo "  1. 打开 Cloudflare Zero Trust：Access -> Applications。"
echo "  2. 新建 Self-hosted 应用，域名填写：${HOSTNAME}"
echo "  3. 添加 Allow 策略，只允许你自己的邮箱。不要使用 Bypass。"
echo "  4. 保存应用，确认应用列表里已经出现这个域名。"
echo ""
echo "这一步必须先完成；否则发布域名会让登录门禁缺失。"

if [ "${VITAFLOW_NO_OPEN:-0}" != "1" ] && command -v open >/dev/null 2>&1; then
  open "https://one.dash.cloudflare.com/" >/dev/null 2>&1 || true
fi

echo "完成 Access 配置后，在下面完整输入：ACCESS READY"
IFS= read -r ACCESS_CONFIRMATION
if [ "$ACCESS_CONFIRMATION" != "ACCESS READY" ]; then
  fail "没有收到确认，DNS 未发布。你可以稍后重新运行本脚本。"
fi

echo "正在把 ${HOSTNAME} 连接到专用隧道..."
if [ "$ACCESS_ALREADY_CONFIRMED" -eq 1 ]; then
  echo "现有 DNS 与 Access 确认仍匹配，无需重复发布。"
else
  cloudflared tunnel route dns "$TUNNEL_ID" "$HOSTNAME"
fi

mv -f "$TEMP_CONFIG" "$CONFIG_FILE"
trap - EXIT

{
  printf 'hostname=%s\n' "$HOSTNAME"
  printf 'tunnel=%s\n' "$TUNNEL_ID"
  printf 'confirmed_at=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
} > "$ACCESS_READY_FILE"
chmod 600 "$ACCESS_READY_FILE"

echo ""
echo "私有远程访问已配置。以后双击 start-private-remote.command 即可启动。"
echo "本机私有配置：${CONFIG_FILE}"
