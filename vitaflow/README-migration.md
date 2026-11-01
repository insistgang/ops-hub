# VitaFlow 迁移说明

## 新电脑使用步骤

1. 解压迁移包到一个固定文件夹。
2. 确认新电脑已安装 Node.js。
3. 双击 `start-local-server.command`。
4. 终端窗口保持打开。
5. 电脑访问终端里显示的本机地址；手机/平板访问终端里显示的局域网地址。

## 必须一起迁移的文件

- `schedule-system-2.0.html`
- `my-schedule.json`
- `local-sync-server.mjs`
- `start-local-server.command`

## 可选但建议一起迁移的文件

- `sync-json-into-html.mjs`
- `make-migration-package.command`
- `test-local-sync-client.mjs`
- `test-local-sync-server.mjs`

## 访问口令（key）

- 服务器第一次启动时会自动生成访问口令，保存在 `sync-token.txt`。
- 终端里显示的访问地址已带上 `?key=口令`，直接用那个地址打开即可。
- 手机/平板第一次用带 key 的地址打开后，浏览器会记住口令，之后收藏的书签不带 key 也能访问。
- 没有口令的人（即使连同一个 Wi-Fi）打不开页面、也读不到数据。
- 口令别发给不信任的人；想更换口令，删除 `sync-token.txt` 后重启服务器即可（换口令后手机需要重新用新地址打开一次）。
- 换新电脑后会生成新的口令，属于正常现象。

## 注意

- 通过 `start-local-server.command` 打开时，主数据来自 `my-schedule.json`。
- 直接双击 HTML 时，主数据来自 HTML 内嵌数据。
- 打包前运行 `make-migration-package.command` 会自动把 JSON 同步进 HTML。
- 项目不再包含互联网云同步原型；多设备同步只走本地局域网服务。
