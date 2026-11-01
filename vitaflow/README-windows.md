# VitaFlow Windows 使用说明

## 需要的文件

精简 Windows 包只需要这些文件：

- `schedule-system-2.0.html`
- `my-schedule.json`
- `local-sync-server.mjs`
- `start-local-server-windows.bat`
- `README-windows.md`

## 新 Windows 电脑怎么用

1. 安装 Node.js: https://nodejs.org/
2. 解压迁移包到一个固定文件夹。
3. 双击 `start-local-server-windows.bat`。
4. 不要关闭弹出的命令行窗口。
5. 电脑访问 `Windows电脑` 那一行地址。
6. 手机/平板和电脑连同一个 Wi-Fi 后，访问 `手机/平板` 那一行地址。

## 访问口令（key）

- 第一次启动时会自动生成访问口令，保存在 `sync-token.txt`。
- 命令行窗口里显示的地址已带上 `?key=口令`，直接用那个地址打开。
- 手机/平板第一次用带 key 的地址打开后，之后不带 key 的书签也能访问。
- 没有口令的人（即使连同一个 Wi-Fi）打不开页面、也读不到数据。
- 想更换口令：删除 `sync-token.txt` 后重启服务器，然后用新地址重新打开一次。

## 重要说明

- 通过脚本启动时，主数据来自 `my-schedule.json`。
- `schedule-system-2.0.html` 里面也内嵌了一份当前数据，方便应急直接打开。
- 以后迁移前，先在旧电脑运行 `make-migration-package.command`，它会先把 JSON 同步进 HTML，再生成新的 Windows 精简包。
- 如果 Windows 第一次弹出防火墙提示，请允许 Node.js 在专用网络访问。
