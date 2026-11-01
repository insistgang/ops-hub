# VitaFlow 维拓流 · 四账户精力管家

一个完全本地化的个人日程与精力管理系统：单文件 HTML 应用 + 局域网同步服务器，
无需任何 npm 依赖，数据完全掌握在自己手里。

## 快速开始

**macOS**：双击 `start-local-server.command`
**Windows**：先安装 [Node.js](https://nodejs.org/)，然后双击 `start-local-server-windows.bat`

启动后终端会显示访问地址（带 `?key=` 访问口令）：

- 本机用 `127.0.0.1` 那一行地址
- 手机/平板连同一 Wi-Fi 后用局域网 IP 那一行地址

需要在外网安全访问但没有自有域名时，推荐使用 Tailscale 私有网络，详见
`README-tailscale-private.md`。已有 Cloudflare 域名时也可使用 Tunnel + Access，详见
`README-cloudflare-private.md`。不要把本地服务端口直接映射到公网。

## 功能一览

以「四账户」模型追踪个人状态：🏃 体能、❤️ 情感、🧠 思维、🔥 意志。

- 日历、待办看板、连续打卡、番茄钟、每周复盘
- 四账户每日打分与趋势图表
- 自媒体运营中心（写作、文案、灵感、运营日历、IP 与竞品分析）
- 读书/观影/学习笔记、文学创作、小说大纲
- 幸福感、情绪、饮食、喝水、社会支持网络记录

## 架构

```
src/schedule-template.html  HTML 模板
src/styles.css              页面样式
src/app.js                  页面逻辑
src/modules/*.js            日历待办、健康工具、同步等功能模块
        │  npm run build:html
        ▼
schedule-system-2.0.html   生成后的单文件应用（UI + 逻辑 + 内嵌数据快照）
        │  localStorage（vitaflow_* 键）
        ▼
local-sync-server.mjs      局域网同步服务器（纯 Node 内置模块）
        │  GET/POST /api/data（口令鉴权，支持 patch 增量）
        ▼
my-schedule.json           主数据文件（服务器模式下的数据源）
```

两层数据来源：

1. **服务器模式**（推荐）：数据读写 `my-schedule.json`，多设备准实时同步
2. **直接双击 HTML**：使用内嵌数据快照，应急查看

服务器写入使用 revision 做并发保护：另一台设备已更新时不会静默覆盖，页面会要求选择
保留本机或采用服务器版本。每次成功写入前会保留最近 7 个有效版本：`my-schedule.json.bak`
是上一版，`.bak.1` 到 `.bak.6` 依次更旧。macOS/Linux 下，数据、备份与口令文件会自动
收紧为仅当前用户可读写（`0600`）。

同步请求默认上限为 32 MiB；确有需要时可通过 `VITAFLOW_MAX_REQUEST_BYTES` 环境变量设置字节数。格式错误或超过上限的请求会被拒绝，现有数据不会因此替换。

服务器只提供生成后的 VitaFlow HTML；数据只能通过带口令的同步 API 访问，项目源码、
口令和其他本地文件不会作为静态文件暴露。它仍是可信局域网工具，不应把端口映射到公网。

### 第三方离线资源

- Chart.js 4.4.0：来源为 `cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`，MIT License
- Font Awesome Free 6.0.0-beta3：来源为 `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/`，图标 CC BY 4.0、字体 SIL OFL 1.1、代码 MIT License

资源原文件保存在 `vendor/`，构建时连同字体一起内嵌进 HTML；页面运行不依赖公网 CDN。

## 访问口令

服务器首次启动自动生成口令，保存在 `sync-token.txt`（已被 git 忽略，**不要提交**）。
没有口令的设备（即使在同一 Wi-Fi）无法打开页面或读写数据。
更换口令：删除 `sync-token.txt` 后重启服务器。

## 克隆仓库后的一次性配置

```bash
npm run setup
```

这会启用 git clean filter：提交时自动把 HTML 里的内嵌数据快照替换为占位符，
避免每次数据变化产生几百 KB 的 diff。本地工作文件不受影响（双击打开仍带数据）。
配置同时启用 `required`：过滤器报错时 Git 会停止暂存，而不是直接提交原始文件。

**注意**：换新电脑克隆后如果忘了跑 `npm run setup`，提交 HTML 时可能把整份数据
快照带进 git 历史，造成隐私风险并让仓库膨胀。配置是每个克隆仓库单独保存的；新机器必须先执行上述命令。
Git 只备份代码和剥离数据后的页面，不会备份被忽略的 `my-schedule.json`。请另行安全备份个人数据。

## 测试

```bash
npm test
```

## 修改页面源码

优先改 `src/styles.css`、`src/app.js` 和 `src/modules/*.js`，然后运行：

```bash
npm run build:html
```

这会把拆分源码重新合并回 `schedule-system-2.0.html`，保留双击 HTML 可用的单文件形态。

## 迁移到新电脑

在旧电脑运行 `make-migration-package.command`，会先把 JSON 数据同步嵌入 HTML，
再生成 Windows 精简迁移包。详见 `README-migration.md` 与 `README-windows.md`。

## 本机保留版本

本机统一使用 `/Users/insistgang/Desktop/个人工具/ops-hub/vitaflow` 主工程。2026-10-03 核对确认，主工程包含原 `Projects/vitaflow` 旧版全部已保存的数据：旧版 42 项数据、400 条待办、51 天幸福感记录均完整保留，主版另有想法库、连续打卡记录、1 条待办和 3 天幸福感记录。旧版页面与 JSON 已按用户要求永久删除。

`schedule-system-2.0.html` 的内嵌快照已同步到主工程 `my-schedule.json` 的 44 项数据；主工程 JSON 内容未被修改。使用主工程时仍按上面的启动方式操作。

## 隐私说明

`my-schedule.json` 与 HTML 内嵌快照包含真实个人数据。
代码随 Ops-Hub 公开维护，但 `my-schedule.json`、`sync-token.txt`、Cloudflare 真实配置与本地备份始终由 `.gitignore` 排除，不进入公开仓库；不得把真实数据补进提交或公开 Pages。
本地数据仍以明文 JSON 保存；7 代自动备份用于误操作恢复，不能代替系统级或异地备份。
