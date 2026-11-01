# VitaFlow 私有远程访问

这套方案使用 **Cloudflare Tunnel + Cloudflare Access**。它不会把路由器端口直接暴露到公网，
也不会把日记和计划上传到 Cloudflare 数据库；`my-schedule.json` 仍只保存在这台电脑上。

访问顺序是：

```text
你的设备 -> Cloudflare Access 登录门禁 -> 加密 Tunnel -> 本机 VitaFlow -> VitaFlow 访问口令
```

Cloudflare Access 是第一道门禁，地址中的 VitaFlow `key` 是第二道保护。两者都要保留。

## 准备条件

- 一个已经托管在 Cloudflare 的域名
- 一个只给 VitaFlow 使用的子域名，例如 `vitaflow.example.com`
- 这台 Mac 保持开机并联网；电脑关机后，远程访问自然停止
- Node.js 与 `cloudflared` 已安装

安装 `cloudflared`：

```bash
brew install cloudflared
```

## 第一次配置

1. 双击 `setup-private-remote.command`。
2. 输入完整子域名，例如 `vitaflow.example.com`。
3. 浏览器打开 Cloudflare 后，登录并授权这个域名。
4. 脚本暂停时，在 Cloudflare Zero Trust 中进入 `Access -> Applications`。
5. 新建 `Self-hosted` 应用，域名填写刚才的完整子域名。
6. 添加 `Allow` 策略，只包含你自己的邮箱；不要使用 `Bypass` 策略。
7. 保存应用后回到终端，输入 `ACCESS READY`。脚本这时才会发布 DNS。

脚本会把实际配置写入 `~/.cloudflared/vitaflow.yml`，隧道凭据保存在同一私有目录。
项目仓库里只有不含账号信息的示例。不要把 `cert.pem`、隧道 JSON、实际配置或访问口令
复制到项目、聊天记录或 GitHub。

## 日常启动

双击 `start-private-remote.command`。它会：

1. 检查 Access 已确认的标记；
2. 启动或复用 VitaFlow 本地同步服务器；
3. 启动加密隧道；
4. 打开带 VitaFlow 访问口令的远程地址。

第一次从某台设备访问时，先完成 Cloudflare Access 邮箱验证。保持终端窗口打开；关闭窗口后，
脚本会停止它自己启动的本地服务和 Tunnel。若普通局域网服务已经在运行，脚本只复用它，不会
在退出时关闭它。

## 安全检查

- Cloudflare Access 应用中的域名必须与脚本显示的域名完全一致。
- Access 策略只允许你的邮箱，不创建公开或 Bypass 规则。
- 不在截图、消息或公开文档中分享带 `?key=` 的完整地址。
- 不在 Tunnel 中使用 `debug` 日志级别，避免请求地址和请求头进入日志。
- 不做路由器端口映射；Tunnel 不需要入站端口。
- 定期更新 `cloudflared`：`brew upgrade cloudflared`。

## 停用

关闭 `start-private-remote.command` 的终端窗口会立即停止当前远程连接。若要永久撤销，先在
Cloudflare DNS 删除该子域名记录，再删除对应 Access 应用，最后删除名为 `vitaflow` 的 Tunnel。
本地 VitaFlow 数据不受影响。
