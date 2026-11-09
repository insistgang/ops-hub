# VitaFlow 云同步

阿里云上的 Ops-Hub 地址为 `https://ops.insistgang.top/`；原阿里云地址 `https://finance.insistgang.top/ops-hub/` 和 GitHub Pages 地址仍可访问。阿里云网页通过独立发布目录部署，代码推送 GitHub 后不会自动更新该目录，需要另行发布。不同域名的浏览器存储各自独立，体重和首页重点等仅存在浏览器中的数据不会自动迁移。

按站主选择，知道网址的人可在 Ops-Hub 查看服务器上的日程、精力和笔记只读快照。匿名接口 `GET https://finance.insistgang.top/api/public` 按白名单返回这些内容，任何人都可能进一步传播；不要将秘密写入公开的日程或笔记。访客的浏览器记录不会被公开快照覆盖。写入接口 `/api/data` 仍需口令。

站主的 Mac 可运行本机后台桥接，将本机口令安全地附加到发往服务器的请求；网页不需要接收口令。浏览器允许访问回环网络后，打开 Ops-Hub 时可以自动连接。浏览器可能要求在「同步与数据设置」点击启用并确认一次本地网络权限。只有页面和电脑运行时浏览器里的编辑才能上传，关闭页面或电脑休眠时服务器保留最后一次成功同步的快照。

服务只同步 `vitaflow_*` 数据；首页重点、体重和知识库不属于该服务的同步范围。设备与服务器记录不同时，需要在冲突提示中核对并选择，系统不会静默覆盖。点击「使用本机记录」可停止连接并保留本机记录。

服务由阿里云上的 `ops-vita-sync.service` 运行：非 root 账户、回环地址监听，经 Nginx 提供 HTTPS 接口；数据和轮转备份在 `/var/lib/ops-vita-sync/`，服务器口令在 `/etc/ops-vita-sync/`。本机桥接口令文件位于 `~/.config/ops-hub/`，必须为当前用户所有且权限为 0600。本机桥接允许 `https://insistgang.top`、`https://finance.insistgang.top` 和 `https://ops.insistgang.top` 三个确切来源调用；浏览器按域名而非路径界定来源，这些域名下的脚本都必须可信。

旧版本地 `my-schedule.json` 已于 2026-11-08 按本人要求删除并退役，不得从旧副本或迁移包反向覆盖云端；应为云端当前数据保留独立备份。排查时先查看 `systemctl status ops-vita-sync` 与 `journalctl -u ops-vita-sync`，不要输出口令或个人数据；停用服务不会删除数据文件。设备丢失或口令泄露时需要轮换口令。
