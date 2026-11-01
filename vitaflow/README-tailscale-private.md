# VitaFlow Tailscale 私有访问

这是没有自有域名时推荐的远程访问方式。Tailscale Serve 只把 VitaFlow 分享到你的私有
Tailscale 网络（tailnet），不会创建公开互联网入口，也不需要路由器端口映射。

访问顺序：

```text
已登录 Tailscale 的设备 -> 加密 tailnet -> 本机 Tailscale Serve -> VitaFlow 访问口令
```

Tailscale 设备身份是第一道门禁，VitaFlow 地址中的 `key` 是第二道保护。

## 第一次准备

1. 在 Mac 安装并登录 Tailscale，允许 macOS 添加 VPN 配置。
2. 在手机或平板安装 Tailscale，并使用同一个账号登录。
3. 确认两台设备都出现在 Tailscale 的 Machines 页面并显示已连接。

## 日常启动

双击 `start-tailscale-private.command`。脚本会：

1. 确认 Tailscale 已连接并取得本机私有 MagicDNS 名称；
2. 以 `127.0.0.1` 启动或复用 VitaFlow 同步服务器；
3. 使用 Tailscale Serve 提供 tailnet 内的 HTTPS 地址；
4. 打开带 VitaFlow 访问口令的页面。

保持终端窗口打开。脚本使用前台 Serve，不添加 `--bg`；关闭窗口后私有共享会停止，脚本自己
启动的 VitaFlow 服务也会停止。如果普通局域网服务已经运行，脚本会复用它，并且不会在退出时
关闭它。

第一次使用 Serve 时，Tailscale 可能要求管理员在网页中启用 tailnet HTTPS。按页面提示启用后，
重新双击启动脚本即可。

## 安全边界

- 不要使用 Funnel；Funnel 会把服务公开到整个互联网。
- 不要分享带 `?key=` 的完整地址。
- 手机丢失或不再使用时，及时从 Tailscale Machines 页面移除该设备。
- Tailscale 账号建议开启双重验证。
- `my-schedule.json`、备份和访问口令仍只保存在这台 Mac，不会写入项目仓库。

有自有域名且确实需要基于邮箱的网页门禁时，仍可改用 `README-cloudflare-private.md` 中的
Cloudflare Tunnel + Access 方案。
