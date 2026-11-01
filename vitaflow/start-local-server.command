#!/bin/zsh
set -e

SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR"

PORT="${PORT:-8787}"
HTML_FILE="schedule-system-2.0.html"
TOKEN=""

print_urls() {
  echo ""
  echo "访问地址（地址里的 key 是访问口令，别分享给不信任的人）："
  echo "  本机电脑: http://127.0.0.1:${PORT}/${HTML_FILE}?key=${TOKEN}"
  if command -v ifconfig >/dev/null 2>&1; then
    ifconfig | awk '/inet / && $2 !~ /^127\./ {print $2}' | sort -u | while read -r ip; do
      if [ -n "$ip" ]; then
        echo "  手机/平板: http://${ip}:${PORT}/${HTML_FILE}?key=${TOKEN}"
      fi
    done
  fi
  echo ""
}

pause_before_close() {
  echo ""
  echo "按任意键关闭这个窗口..."
  if [[ -t 0 ]]; then
    read -k 1 || true
  fi
}

if ! command -v node >/dev/null 2>&1; then
  echo "没有找到 Node.js。请先安装 Node.js，然后再运行这个脚本。"
  pause_before_close
  exit 1
fi

if [ ! -f "local-sync-server.mjs" ]; then
  echo "当前文件夹里没有 local-sync-server.mjs，请把脚本放在日程系统文件夹里运行。"
  pause_before_close
  exit 1
fi

TOKEN="$(node local-sync-server.mjs --print-token)"

if curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
  echo "VitaFlow 本地同步服务器已经在运行。"
  print_urls
  if command -v open >/dev/null 2>&1; then
    open "http://127.0.0.1:${PORT}/${HTML_FILE}?key=${TOKEN}" >/dev/null 2>&1 || true
  fi
  pause_before_close
  exit 0
fi

echo "正在启动 VitaFlow 本地同步服务器..."
echo "文件夹: ${SCRIPT_DIR}"
print_urls
echo "提示：保持这个窗口打开；关闭窗口后，手机/平板就不能继续访问。"
echo ""

if command -v open >/dev/null 2>&1; then
  open "http://127.0.0.1:${PORT}/${HTML_FILE}?key=${TOKEN}" >/dev/null 2>&1 || true
fi

node local-sync-server.mjs "$PORT"
