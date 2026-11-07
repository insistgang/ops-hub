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

Ops-Hub 的「日程与精力」采用同一页面的原生工作区，今日待办和四账户摘要直接使用同一存储。全部日程、创作学习、弹窗及数据工具共用总台导航、风格与滚动；独立单文件版本继续保留。

```
src/schedule-template.html  HTML 模板
src/styles.css              页面样式
src/app.js                  页面逻辑
src/modules/*.js            日历待办、健康工具、同步等功能模块
        │  npm run build:html
        ▼
schedule-system-2.0.html   生成后的单文件应用（UI + 逻辑，不含私人快照）
        │  localStorage（vitaflow_* 键）
        ▼
local-sync-server.mjs      局域网同步服务器（纯 Node 内置模块）
        │  GET/POST /api/data（口令鉴权，支持 patch 增量）
        ▼
my-schedule.json           主数据文件（服务器模式下的数据源）
```

同一份源码还由 `build-native.mjs` 生成 `native-workspace.js` 与 `native-workspace.css`，挂载到父级 `#vitaflow-native`。`src/native/runtime.js` 负责单实例 DOM／上下文适配，`ui-handlers.json` 保存原生事件函数名单。生成物直接随仓库交付，浏览网站时不需要构建。

修改源码后执行 `npm run build:html` 同时更新两个入口；`npm run build:native` 可单独重建原生版本。`npm test` 会检查公开快照、原生隔离、存储兼容、私有连接和生成一致性。

两层数据来源：

1. **服务器模式**（推荐）：数据读写 `my-schedule.json`，多设备准实时同步
2. **直接双击公开 HTML**：使用当前浏览器的本机记录；首次打开为空。通过应用导出的私人 HTML 可以携带数据，用于应急查看和迁移，不能放入公开网站或 Git。

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

这会启用 git clean filter，作为提交时剥离私人 HTML 快照的额外防线。默认
`npm run build:html` 已主动清除生成页面的内嵌快照，`npm test` 也会检查公开页面是否干净；
不能仅凭 README 的配置步骤假定当前克隆已安装过滤器。
配置同时启用 `required`：过滤器报错时 Git 会停止暂存，而不是直接提交原始文件。

配置按克隆仓库单独保存，不会修改已有提交。显式导出或迁移后的私人 HTML 仍须与公开页面分开；
发布前重新执行构建和测试。Git 不备份被忽略的 `my-schedule.json`，请另行安全备份个人数据。

## 测试

```bash
npm test
```

## 修改页面源码

优先改 `src/styles.css`、`src/app.js` 和 `src/modules/*.js`，然后运行：

```bash
npm run build:html
```

这会把拆分源码重新合并回 `schedule-system-2.0.html`，生成不携带私人快照的完整单文件应用。
本机服务仍读取原 `my-schedule.json`；构建不会修改这份主数据。首次使用不生成示例待办、随机分数或虚构历史，缺失的状态显示为待记录。

## 迁移到新电脑

在旧电脑运行 `make-migration-package.command`，会先把 JSON 数据同步嵌入 HTML，
再生成 Windows 精简迁移包。详见 `README-migration.md` 与 `README-windows.md`。

## 本机保留版本

本机统一使用 `/Users/insistgang/Desktop/个人工具/ops-hub/vitaflow` 主工程。2026-10-03 核对确认，主工程包含原 `Projects/vitaflow` 旧版全部已保存的数据：旧版 42 项数据、400 条待办、51 天幸福感记录均完整保留，主版另有想法库、连续打卡记录、1 条待办和 3 天幸福感记录。旧版页面与 JSON 已按用户要求永久删除。

主工程 `my-schedule.json` 保留原有数据，默认生成页面不再携带它的 44 项快照。通过本机服务继续使用原真源；应急携带请使用应用的私人 HTML 导出功能。

## 隐私说明

`my-schedule.json` 与主动导出的私人 HTML 快照包含真实个人数据。
代码随 Ops-Hub 公开维护，但 `my-schedule.json`、`sync-token.txt`、Cloudflare 真实配置与本地备份始终由 `.gitignore` 排除，不进入公开仓库；不得把真实数据补进提交或公开 Pages。
本地数据仍以明文 JSON 保存；7 代自动备份用于误操作恢复，不能代替系统级或异地备份。
