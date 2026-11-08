# VitaFlow 云同步

Ops-Hub 网站可直接打开；跨设备同步需在「日程与精力 → 同步与数据设置」主动连接。
同步地址为 `https://finance.insistgang.top/`，首次连接时填写设备上的同步口令。
口令只存放在当前浏览器，不加入网址；旧本地连接设置仍可使用。

服务只同步 `vitaflow_*` 数据；首页重点、体重和知识库不是该服务的同步范围。
服务器首次为空，第一台设备连接后会按现有同步流程初始化。若设备与服务器已有不同记录，
需在冲突提示中核对并选择，系统不会静默覆盖；空记录的待同步修改也会保守保留。

服务由阿里云上的 `ops-vita-sync.service` 运行：非 root 账户、回环地址监听，
通过 Nginx 的 HTTPS `/api/data` 暴露；数据和轮转备份在 `/var/lib/ops-vita-sync/`，
口令文件在 `/etc/ops-vita-sync/`。服务只接收 `https://insistgang.top` 的浏览器来源，
口令通过请求头传递，不支持网址参数或 Cookie。

应保留现有本机数据和独立备份。排查时先查看 `systemctl status ops-vita-sync` 与
`journalctl -u ops-vita-sync`，不要输出口令或私人数据；停用服务不会删除数据文件。
浏览器保存口令的安全性依赖网站同源脚本的可信程度，设备丢失或口令泄露时需要轮换。
