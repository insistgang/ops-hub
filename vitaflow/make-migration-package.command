#!/bin/zsh
set -e

SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR"

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

if ! command -v zip >/dev/null 2>&1; then
  echo "没有找到 zip 命令，无法生成迁移包。"
  pause_before_close
  exit 1
fi

echo "正在把 my-schedule.json 同步嵌入 schedule-system-2.0.html..."
node sync-json-into-html.mjs

TS="$(date +%Y%m%d-%H%M%S)"
ZIP_FILE="vitaflow-windows-${TS}.zip"

echo "正在生成 Windows 精简迁移包：${ZIP_FILE}"
zip -q "$ZIP_FILE" \
  schedule-system-2.0.html \
  my-schedule.json \
  local-sync-server.mjs \
  start-local-server-windows.bat \
  README-windows.md

echo ""
echo "迁移包已生成：${SCRIPT_DIR}/${ZIP_FILE}"
echo "把这个 zip 拷到 Windows 新电脑，解压后双击 start-local-server-windows.bat。"

pause_before_close
