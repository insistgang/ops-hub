# AGENTS.md — Ops-Hub 智能体与开发者协作契约

> **项目名称**：Ops-Hub（个人数字化运营工作总台）
> **代码仓库**：`Desktop/个人工具/ops-hub`
> **规格参考**：详见 `docs/PRD.md`
> **所有在本项目中工作的 AI 智能体与协作者均须严格遵循本契约。**

---

## 1. 核心定位与架构原则

### 1.1 项目使命
Ops-Hub 是承载个人的三端算力调度（Mac + Windows 4070S + Jetson 边缘硬件）、多线项目推进、求职进度跟踪、备考冲刺、日程精力及生活记录的**个人数字化运营工作总台**。它开源公开在 GitHub 上，既是日常工作流的控制塔，也是高标准的工程 Showcase。

### 1.2 不可动摇的三大铁律
1. 🚫 **零 Mock 假数据铁律 (Zero-Mock Axiom)**：
   - 严禁制造任何捏造的假数据。所有展示的数据必须 100% 真实、有据可循。
   - 求职记录必须来自真实来源：`scripts/collector.py::load_career_records()` 优先单向读取 `../Career-Copilot/data/applications.json` 投影至本机 `data/career_records.json`，上游不可用时才回退本地记录。Ops-Hub 不回写 Career-Copilot，不得宣称双向同步；公开字段与托管边界见 `docs/career-copilot-integration.md`。项目和设备信息来自真实工程与硬件探针。
2. ⚡ **零构建纯净单页架构 (Zero-Build Vanilla Stack)**：
   - 页面采用 `HTML5 + Tailwind CSS (CDN) + Lucide Icons (锁版本)`。
   - 根目录下直接放置 `index.html`，无需 Node 运行时打包步骤。克隆即用、双击即看、GitHub Pages 秒级上线。
3. 🏛️ **三端算力分工与场景秩序**：
   - **MacBook Air (M5)**：移动生产力中枢，负责思考、写作、投递跟踪、总台控制。原则：**带去图书馆专注完成**。
   - **Windows 4070S**：常驻算力后端，负责 CUDA 训练、批量构建、远程执行与冷备仓库（Tailscale Mesh）。
   - **Jetson 边缘硬件 (Yahboom)**：端侧 AI 感知节点，负责机器人/视觉感知模型部署（局域网直连）。

---

## 2. 目录架构与职责划分

```text
Desktop/个人工具/ops-hub/
├── index.html                 # 现代化纯净单页工作总台（八大工作区 Tab，四套视觉风格）
├── css/
│   ├── custom.css             # 总台布局、交互样式与日间覆盖层
│   └── site-styles.css        # 四套风格令牌与三个原生工作区统一外观覆盖
├── js/
│   ├── core.js                # 前端公共底座（北京时间日界、esc() 转义、同源分流表、公开知识库去缓存刷新）
│   ├── site-style.js          # 网站风格独立偏好与跨标签同步
│   ├── compute.js             # 三端算力拓扑、设备分工矩阵、智能任务分流与 SSH 复制
│   ├── app.js                 # 宿主控制器（快照拉取、时效、Hero 指标、求职、项目雷达、记忆四勾、Tab 切换）
│   ├── today.js               # 今日重点（最多 3 件）、昨日未完成带入与按日存储
│   ├── life-today.js          # 体重与财务的今日摘要投影（只读工作区 API）
│   ├── vitaflow.js            # VitaFlow 原生工作区宿主导航与本机回环桥接/私有连接控制
│   ├── vitaflow-public.js     # VitaFlow 公开只读快照渲染（仅存内存，不污染访客存储）
│   ├── vitaflow-today.js      # 今日首页的共享待办与四账户精力摘要
│   ├── diary-todos.js         # 日记待办公开投影与按需单向导入 VitaFlow
│   ├── knowledge-today.js     # 知识库今日必做、WIP 与硬节点雷达渲染
│   ├── knowledge-projects.js  # 知识库项目台账渲染（归档结构 + 旧结构回退）
│   ├── knowledge-finance.js   # 知识库月度财务复盘投影渲染
│   └── knowledge-energy.js    # 日记最近 7 天精力/情绪/专注参考投影
├── data/                      # 本地真源（git-ignore）与 public/ 脱敏公开产物
│   ├── status.{json,js}       # 本机运行时完整快照与 file:/// 预加载镜像
│   ├── career_records.json    # Career-Copilot 采集投影与本地回退记录
│   ├── projects.json          # 本地项目候选路径与考期配置
│   ├── daily_checks.json      # CLI 今日四勾打卡状态与跨天历史归档
│   ├── memory_rules.{json,js} # 个人场景契约与聚焦防散基线
│   ├── device_allocation.json # 三端设备分工与项目多端流转表
│   ├── knowledge.json         # 知识库只读完整快照（仅本机）
│   ├── weight_records.json    # 个人体重真源记录（仅本机）
│   ├── private/               # 本机私有 JS 镜像（knowledge.js、weight.js，git-ignore）
│   └── public/                # 经 sanitize_public.py 脱敏校验后的公开快照产物（入 Git）
├── ops                        # 全局 CLI 薄入口（Python 3 标准库，无第三方依赖）
├── build.mjs                  # 统一构建/一致性校验管线（汇总 VitaFlow / 体重 / 财务原生产物）
├── scripts/
│   ├── ops_common.py          # Python 公共底座（原子写入、四勾跨天归档、同源任务分流规则、阶段排序）
│   ├── cli_commands.py        # ops CLI 各子命令实现
│   ├── probe.py               # 三端网络与硬件服务 Level 2 探针脚本
│   ├── collector.py           # 全量采集、脱敏触发与 GitOps 自动提交推送核心
│   ├── sanitize_public.py     # 白名单裁剪、姓名/路径/私网 IP 脱敏与泄露阻断器
│   ├── knowledge_source.py    # 知识库只读解析器（今日计划 + 硬节点 + 项目台账 + 财务复盘 + 日记精力/待办）
│   ├── sync_all.py            # 五步定时同步总入口：采集+GitOps → 阿里云发布 → 账本同步 → 线上核验 → 同步服务核对
│   ├── publish_aliyun.py      # 阿里云独立 release 发布、MD5 复核、nginx 切换与历史滚动清理
│   ├── deploy_vita_sync.py    # 阿里云 ops-vita-sync 同步服务：只读核对与显式部署（不碰口令与数据目录）
│   ├── finance_sync.py        # 日记个人实付消费解析与账本合并引擎
│   ├── finance_publish.py     # 账本远端合并、脱敏发布与历史备份滚动清理
│   └── vitaflow-local-bridge.mjs # 本机回环免口令安全同步桥接服务
├── vitaflow/                  # VitaFlow 原生工作区源码、WOFF2 离线资源、同步服务与 tests/
│   └── sync-service/                     # 同步服务部署真源：systemd unit + drop-in + nginx 路由/限流 + 本机桥接 plist 模板
├── weight-tracker/            # 通用体重记录源码、原生构建器与 tests/
├── finance/                   # 财务原生界面、只读内存运行时与隔离测试
├── tests/                     # Python + Node 全量回归测试套件
└── docs/
    ├── PRD.md                 # 产品与架构规格说明
    ├── career-copilot-integration.md # Career-Copilot 单向数据流与本机托管边界
    ├── finance-access.md      # 财务账本鉴权与访问边界说明
    └── aliyun-vita-sync.md    # 阿里云 VitaFlow 云同步与本机桥接说明
```

**静态预加载覆盖顺序**：`data/public/status.js` → `data/status.js`、`data/public/knowledge.js` → `data/private/knowledge.js`、`data/public/weight.js` → `data/private/weight.js`。同名全局变量后者覆盖前者：本机优先读真源，公开站 404 后自动回退脱敏快照，并由 `js/core.js` / `js/app.js` 在 HTTP(S) 下附带 `?t=` 去缓存拉取最新公开 JSON。

---

## 3. 页面模块与接入边界

总台默认暗色主题（`ops_theme` 保存明暗，`ops_style` 保存 `classic/paper/forest/ocean` 四套风格），亮色通过 `css/custom.css` 的 `html:not(.dark)` 覆盖层实现（新增 Tailwind 色阶须同步补亮色规则）。默认入口为「今日」，另有求职、项目、秩序、体重、财务、日程与精力、算力七个工作区 Tab。宿主只操作 `[data-ops-tab][data-tab]` 与 `[data-ops-workspace]`，不得匹配原生工作区内部导航。

0. **今日首页 (`#tab-today`)**
   - 网页日界统一为北京时间（`OpsCore.calendarDay()`）。重点最多 3 件（`ops_focus_YYYY-MM-DD`），昨日未完成项仅显式带入今天、不改写昨日记录。
   - 重点与四勾只在写入成功后更新界面；损坏记录原样保留并提示，跨标签页冲突时刷新并要求核对重试。
   - 「知识库 · 今日必做」与整幅「硬节点雷达」（`#hard-nodes-card`）只读展示知识库投影，方向与容量限 3 行并写入 `title`；私有与公开快照均无数据时整块隐藏。
1. **求职投递看板 (`#tab-career`)**
   - 支持「全部 / 面试中 / 笔试中 / 已录用 / 初筛 / 已投递」六档筛选，推进中阶段（面试 > 笔试 > 录用 > 初筛 > 已投递）自动置顶。
2. **多线项目雷达 (`#tab-projects`)**
   - 自动提取本地工程最新 Git Commit 与提交时间，展示下一步行动与六级（CET-6）考期倒计时（教资归档保留但不在页面展示）。下方挂载「知识库项目台账」。
3. **个人记忆与秩序 (`#tab-memory`)**
   - 每日四勾（起了、动了、写了、关了：网页打卡存 `localStorage`，CLI 写入 `daily_checks.json`）、场景分工契约与认知防散原则（同时最多 3 件活跃事项，单时段聚焦一件）。
4. **三端算力总台 (`#tab-compute`)**
   - 三端硬件快照卡片、与 CLI 同源的任务智能分流决策器、专属分工矩阵、多端协同流转表及本机/脱敏自适应 SSH 快捷复制。

### VitaFlow 接入边界
- 原生挂载在 `#vitaflow-native`（无 iframe，单实例，Chart.js 在真实 `window` 上初始化），事件函数白名单见 `vitaflow/src/native/ui-handlers.json`（新增交互须同步名单与测试）。
- 今日与详情共用 `vitaflow_*` 存储；公开只读快照仅存内存，不覆盖访客本机记录。本机回环桥接或私有连接沿用 `revision` 与冲突选择，空口令绝不回退旧凭据。
- 修改 `vitaflow/` 源码后运行 `node build.mjs` 及 `(cd vitaflow && npm test)`。旧本地 `my-schedule.json` 已于 2026-11-08 退役，以阿里云 `ops-vita-sync` 当前记录为准，严禁从旧副本覆盖云端。
- **服务端同步服务以仓库为准**：服务代码 `vitaflow/local-sync-server.mjs` 与 unit `vitaflow/sync-service/ops-vita-sync.service` 是唯一真源，服务器 `/opt/ops-vita-sync/` 只是部署副本。`ops sync-service status` 只读核对，`ops sync-service deploy` 显式部署；部署脚本只写服务代码、unit（含 drop-in）与 nginx 托管区域三处路径，严禁写入 `/etc/ops-vita-sync/sync-token` 与 `/var/lib/ops-vita-sync/`，定时流水线只做核对不自动部署。
- **nginx 路由同样以仓库为准**：`vitaflow/sync-service/finance-api-routes.nginx` 是 `/api/public` 与 `/api/data` 两段路由的唯一真源，线上以 `# BEGIN/END ops-hub managed` 标注圈定托管区域，其余站点内容（鉴权、TLS、账本路径）不得改动；`ops sync-service nginx-install` 走「备份 → `nginx -t` 门禁 → reload」，不过就回滚。systemd drop-in `public-read.conf` 决定公开只读开关与允许来源域名，丢失会导致 finance/ops 域名被拒；本机桥接由 `ops sync-service bridge-install` 部署，脚本副本与 launchd 配置以仓库为准，令牌永不生成。

### 知识库接入边界
- **单向只读**：`~/Documents/knowledge`（可用 `OPS_KNOWLEDGE_DIR` 覆盖）是唯一写入口，任何回写均视为 bug。
- **白名单与诚实降级**：仅解析 `01-Daily/今日计划/`、`00-Inbox/硬节点台账.md`、`04-Resources/Archive/项目管理/`（`项目索引/*.md` 条目 + `03-Projects.md` 的「当前主线」表格，旧结构 `03-Projects/` 回退）、`03-Growth/Finance/*-review.md`（旧 `06-Growth/Finance/` 回退）与日记状态/待办复选项；缺失或无法解析时写 `warnings` 或隐藏对应区块，严禁造假或阻断硬件探针。
- **公开脱敏授权**：本人已明确选择公开个人计划、WIP、硬节点、项目台账、月度财务复盘摘要、最近 7 天日记精力（含依据）及指定日记待办复选项（仅本人，同事与外部导师一律经 `private_aliases.json` 代号化，本地绝对路径与私网 IP 全部剥离/掩码）。公开产物进入 Git 历史与公网，扩大公开范围前必须经本人明确确认。

### 体重与财务接入边界
- **体重 (`#weight-native`)**：节点加 `weight-` 前缀，沿用 `weight-tracker:universal:v1` 格式。公开投影仅含本人记录（丢弃本机小组与他人）；浏览器已有记录时仅补齐缺失基准项，绝不覆盖或清空现有本机数据，存储损坏时原样保留待人工恢复。
- **财务 (`#finance-native`)**：节点加 `finance-` 前缀，页面初始化自动请求 `https://finance.insistgang.top/data/financial_data.json`，账本**仅保存在页面内存**，不写 `localStorage` / `IndexedDB` / 公开快照，401/403 时清空可见值并如实提示，不索取密码。未经本人独立确认，不得修改服务器鉴权或 CORS 配置。

### 静态资源缓存版本
`index.html` 中所有本地 js/css 均带 `?v=x.y.z`。**修改任何前端代码或原生产物后必须同步提升对应版本号**，`tests/test_asset_versions.cjs` 会在测试阶段强制拦截漏升版本。

---

## 4. CLI 命令行套件规范 (`ops`)

纯 Python 3 标准库实现，零第三方 pip 依赖：
* `ops status`：终端彩色打印三端算力、求职置顶摘要、项目与六级倒计时、知识库必做与硬节点、体重及今日四勾。
* `ops dispatch [关键词]`：展示三端分工矩阵，或按前后端同源规则给出任务归宿与 SSH 指引。
* `ops sync [--push] [--all]`：采集刷新快照；`--push` 触发 GitOps（带文件锁与脏工作区保护：暂存区含非托管文件时跳过提交并提示整理；仅存在于工作区的未暂存改动不阻断，本次只提交托管产物）；`--all` 执行完整四步流水线（采集+GitHub+阿里云+账本）。
* `ops career <list|add|update>`：查看求职投影；`add/update` 仅在上游 Career-Copilot 缺失时作为回退维护。
* `ops check <起了|动了|写了|关了>`：打卡今日四勾（跨天自动归档重置）。
* `ops weight [数值]` / `ops memory` / `ops quota`：管理个人体重、查看秩序基线、读取 AI 额度快照并判定早停。
* `ops publish` / `ops finance`：发布公开产物至阿里云（保留最近 10 个 release 与 5 份 nginx 备份）；同步日记实付消费至财务账本（保留最近 10 个 release 与 5 份账本备份）。
* `ops sync-service <status|deploy|nginx-diff|nginx-install|bridge-status|bridge-install>`：只读核对或显式部署阿里云 `ops-vita-sync` 同步服务、nginx 托管区域与本机桥接（部署保留最近 5 份备份）。
* `ops serve [--port 3000]`：启动仅监听 `127.0.0.1` 的本地预览服务。
* `ops schedule <install|status|uninstall>`：管理 macOS `launchd` 早晚（09:00 / 21:00）定时同步服务。

---

## 5. 本地验证入口（提交前必跑）

- **统一构建校验**：`node build.mjs` 生成全部原生产物，`node build.mjs --check` 校验产物与源码一致。
- **Python 回归测试**：`python3 -m unittest discover -s tests -p 'test_*.py'`
- **前端与体重 Node 测试**：`node --test tests/*.cjs weight-tracker/tests/*.cjs`（含静态资源 `?v=` 版本守卫）
- **JS 语法检查**：`for f in js/*.js; do node --check "$f"; done`
- **财务与桥接测试**：`node finance/test-native-workspace.mjs && node --test finance/tests/*.mjs tests/test_vitaflow_local_bridge.mjs`
- **VitaFlow 全套测试**：`(cd vitaflow && npm test)`
