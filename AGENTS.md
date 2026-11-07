# AGENTS.md — Ops-Hub 智能体与开发者协作契约

> **项目名称**：Ops-Hub（个人数字化运营工作总台）  
> **代码仓库**：`Desktop/个人工具/ops-hub`  
> **真源设计**：详见 `docs/PRD.md` 与 `docs/PRD_REVIEW.md`  
> **所有在本项目中工作的 AI 智能体与协作者均须严格遵循本契约。**

---

## 1. 核心定位与架构原则

### 1.1 项目使命
Ops-Hub 是承载个人的三端算力调度（Mac + Windows 4070S + Jetson 边缘硬件）、多线项目推进、求职进度跟踪、备考冲刺及生活打卡的**个人数字化运营工作总台**。它开源公开在 GitHub 上，既是日常工作流的控制塔，也是高标准的工程 Showcase。

### 1.2 不可动摇的三大铁律
1. 🚫 **零 Mock 假数据铁律 (Zero-Mock Axiom)**：
   - 严禁制造任何捏造的假数据。所有展示的数据必须 100% 真实、有据可循。
   - 数据源必须有真实来源：本项目求职记录来自 `data/career_records.json`，项目和设备信息来自现有工程与硬件探针。Career-Copilot 主工程在 `../Career-Copilot/`，其 `data/applications.json` 与本项目记录分开维护；未实现同步前不得宣称两者自动互通。
2. ⚡ **零构建纯净单页架构 (Zero-Build Vanilla Stack)**：
   - 页面采用 `HTML5 + Tailwind CSS (CDN) + Lucide Icons (锁版本)`。
   - 根目录下直接放置 `index.html`，无需复杂的 Node 构建或打包步骤。克隆即用、双击即看、GitHub Pages 秒级上线。
3. 🏛️ **三端算力分工与场景秩序**：
   - **MacBook Air (M5)**：移动生产力中枢，负责思考、写作、投递跟踪、总台控制。原则：**带去图书馆专注完成**。
   - **Windows 4070S**：常驻算力后端，负责 CUDA 训练、批量构建、远程执行与冷备仓库（Tailscale `已隐藏`）。
   - **Jetson 边缘硬件 (Yahboom)**：端侧 AI 感知节点，负责机器人/视觉感知模型部署（局域网 `已隐藏`，`地址已隐藏`）。

---

## 2. 目录架构与职责划分

```text
Desktop/个人工具/ops-hub/
├── index.html                 # 现代化纯净版单页工作总台（Tab 切换式，三端拓扑）
├── css/
│   ├── custom.css             # 总台布局、交互样式与明暗覆盖
│   └── site-styles.css        # 四套风格、明暗令牌与原生工作区一致覆盖
├── js/
│   ├── app.js                 # 核心前端逻辑（Tab 切换、数据加载、指标计算、交互；所有 innerHTML 注入必须过 esc() 转义）
│   ├── vitaflow.js            # 原生工作区导航与私有连接设置
│   ├── vitaflow-today.js      # 今日的共享待办和精力摘要
│   ├── site-style.js          # 网站风格独立偏好与跨标签同步
│   ├── today.js               # 今日重点、昨日未完成衔接与浏览器按日存储
│   ├── life-today.js          # 体重与财务的今日摘要投影（只读工作区 API）
│   ├── knowledge-today.js     # 知识库今日投影渲染（私有快照缺失时整块隐藏）
│   └── knowledge-projects.js  # 知识库项目台账渲染（挂在项目雷达 Tab，无数据即隐藏）
├── data/                      # 本地真源与 public/ 脱敏产物；私有真源不进入 Git
│   ├── status.json            # 探针自动汇总的运行时状态快照（三端延迟、时间戳、统计）
│   ├── status.js              # status.json 的 JS 镜像（file:/// 零 CORS 预加载）
│   ├── career_records.json    # 本地真源：真实求职企业与投递状态（公开版已脱敏，不入库）
│   ├── projects.json          # 本地真源：真实项目配置（公开版已脱敏，不入库）
│   ├── daily_checks.json      # 今日四勾打卡状态与历史归档（跨天自动归档重置）
│   ├── memory_rules.json      # 个人记忆、场景分工与专注秩序原则沉淀
│   ├── memory_rules.js        # memory_rules.json 的 JS 镜像
│   ├── device_allocation.json # 三端设备任务分工与项目流转矩阵
│   ├── knowledge.json         # 知识库只读投影快照（私有真源，不入库）
│   └── private/knowledge.js   # 知识库快照的 JS 镜像（仅本机，公开站无此文件）
├── ops                        # 可执行全局 CLI 入口（Python 3 编写，无第三方库依赖）
├── build.mjs                  # 统一构建/校验入口（零依赖，汇总三个原生工作区产物）
│
├── 加载顺序：data/public/status.js → data/status.js → data/private/knowledge.js
│   前两个同名全局变量后者覆盖前者，公开站 404 后自动回退到脱敏快照。
├── vitaflow/                  # 本地 VitaFlow 精力管家源码与独立同步服务；my-schedule.json、口令和备份不进入仓库
├── weight-tracker/            # 通用体重记录前端；应用源码在 src/index.html，公开站不再发布独立页
├── finance/                   # 财务原生界面与只读适配；不包含私人账本或凭据
├── scripts/
│   ├── probe.py               # 三端网络与硬件服务 Level 2 探针脚本 (Mac+Win+Jetson)
│   ├── collector.py           # 全量数据汇总、原子写入、跨天归档与 GitOps 自动提交推送核心
│   ├── knowledge_source.py    # knowledge 知识库只读解析器（今日计划 + 硬节点台账 + 项目台账）
│   └── com.insistgang.opshub.plist # macOS 原生 launchd 定时同步服务描述文件
├── tests/                     # 回归测试
├── LICENSE                    # MIT
└── docs/
    ├── PRD.md                 # 经过需求访谈确立的 PRD 需求规格书
    └── PRD_REVIEW.md          # 3 遍深度审阅报告
```

---

## 3. 页面模块与 Tab 规范

总台 UI 采用 **现代极客风 + 日间/夜间双主题**（暗色为默认，头部按钮切换，选择持久化在 localStorage `ops_theme`；亮色通过 `custom.css` 的 `html:not(.dark)` 覆盖层实现，新增 Tailwind 色阶时必须同步补覆盖规则）。默认入口为「今日」，另有求职、项目、秩序、体重、财务、VitaFlow 与算力七个 Tab。宿主只操作 `[data-ops-tab][data-tab]` 与 `[data-ops-workspace]`，不能匹配内部导航。核心模块约定：

0. **今日首页**
   - `js/today.js` 复用 `app.js` 的 `calendarDay()` 和 `dateOrdinal()`；脚本加载顺序不得颠倒。网页日界统一为北京时间。
   - 重点最多 3 件，存储键 `ops_focus_YYYY-MM-DD`；昨日未完成项只能显式带入今天，不改写昨日，不重复带入同文事项。
   - 重点与四勾只在写入成功后更新界面；损坏记录保留并提示，旧标签页发现存储变化时刷新、提示重试。
   - 现有时钟在换日时发送 `ops:day-changed`，今日首页同时监听页面可见性与相关 storage 事件。
   - 「知识库 · 今日必做」只读渲染 `data/private/knowledge.js`；快照由 `scripts/collector.py` 调用 `scripts/knowledge_source.py` 生成。该文件缺失时整块隐藏，公开站不显示任何知识库内容。
   - 「硬节点雷达」是栅格之下的整幅卡片（`#hard-nodes-card`），逾期置顶、按剩余天数着色，窄屏自动降为单列。
   - 今日计划的方向与容量为长文本，卡片内限 3 行并写入 `title`，不要改成整段展开，否则会把左栏撑爆。
1. **Tab 1: 🎯 求职投递全景看板 (Career Pipeline)**
   - 过滤标签：全部、面试中、笔试中、初筛、已投递、Offer。
   - 字段：公司名称、岗位、投递日期、状态 Badge、简历指引、跟进备注。
   - 默认排序：推进中（面试/笔试）自动高亮置顶。
2. **Tab 2: 🚀 多线项目推进雷达 (Project Radar)**
   - 外部合作项目 (`~/Desktop/合作项目/jiefu`)：Chrome 插件 V3 + 利润核算。
   - 端侧硬件项目 (`~/Desktop/合作项目/andy`)：端侧硬件伴侣机器人 (`xiaozhi-esp32` + `py-xiaozhi`)。
   - 毕业小论文 (`~/Desktop/论文与阅读/lunwen`)：违建 YOLOv11 主线 + E-PAS Sensors 改投。
   - 自动提取本地 Git 最新提交时间与 Commit 信息，展示 Next Action。
   - 考试倒计时：六级（2026-12）。
   - 雷达下方「知识库项目台账」只读投影 `03-Projects`，规则见「知识库接入边界」。
3. **Tab 3: 🧠 个人记忆与秩序中枢 (Personal Memory & Order Hub)**
   - 每日四勾：起了、动了、写了、关了（Web 点击打卡持久化在浏览器 localStorage、按日期隔离；CLI 写入 `daily_checks.json`，仍是跨设备真源）。
   - 场景契约：图书馆（思考/写作/Mac）vs 实验室（算力/充电/4070S/Jetson）vs 宿舍（关机恢复）。
   - 认知原则：同时最多 3 件活跃事项，每个工作时段聚焦一件；新想法入 `00-Inbox/`；已到期补剂提醒不再延续。具体作息以当月计划与当天安排为准。
4. **Tab 4: 🖥️ 三端算力与拓扑 (Compute & Topology)**
   - Mac M5 (`已隐藏`)、Win 4070S (`已隐藏`) 与 Jetson 边缘 (`已隐藏`) 实时网络延迟卡片。
   - 一键复制 SSH 登录命令（Win 与 Jetson 均支持）。
   - Windows SSH (`22`) 与 SMB (`445`) 实时服务状态。
   - 外部直达：`（本地私有模块，公开版已移除）`。

### VitaFlow 接入边界

- 全部模块挂载在同一 document 的 `#vitaflow-native`，不使用 VitaFlow iframe。`vitaflow/native-workspace.js` 在宿主 `js/vitaflow.js` 和 `js/app.js` 前加载；保持单实例，不在切 Tab 时重建。
- 原生构建由 `vitaflow/build-native.mjs` 生成 JS/CSS；只读取无快照公开源码，DOM 查询与弹窗限定在原生根，CSS 选择器限定同根。Chart vendor 在真实 window/document 上初始化，业务 facade 不得包住图表库的浏览器上下文。
- UI 事件函数白名单为 `vitaflow/src/native/ui-handlers.json`，业务状态留在闭包；新增交互需同步名单和原生测试。根与 VitaFlow 模板 ID 不得重复，宿主 Tab 选择范围不可包含内部 Tab。
- `OpsVitaFlowNative` 提供导航、摘要、待办操作、主题与私有连接接口；今日与详情共用 `vitaflow_*`，保留辅助同步键和 IndexedDB 格式。首页导航传入北京时间日期，详细页自主选日保留原行为。
- `ops:vitaflow-ready`、`ops:vitaflow-data` 只发布状态元数据，不广播记录或口令。默认浏览器模式不探测 API；主动连接私有服务沿用既有鉴权、revision 和冲突选择，不能静默覆盖本机数据。空 key 不得回退发送旧凭据，过期请求不得改变最新连接状态。
- HTML 导出使用保留的独立源码，导入只刷新当前工作区；构建与测试不读写真实个人 JSON，公开产物不嵌入私人快照。修改 VitaFlow 源码后在其目录运行 `npm run build:html`（同时生成独立和原生版本）及 `npm test`，用 `--check` 核对原生产物。
- 考试 `phase=result_recorded` 表示查分已办结；教资归档保留但不在网页展示，考试主卡仅取六级。私有分数不复制进公开快照。

- 公开站不再提供 VitaFlow 独立版入口；`vitaflow/schedule-system-2.0.html` 仍是 `build-html.mjs` 的产物与私有同步服务入口，只用于本地与私有场景，不出现在总台导航。

### 知识库接入边界

- **单向只读**：`/Users/insistgang/Documents/knowledge` 是唯一写入口，本仓库只读投影，任何回写都视为 bug。今日重点与四勾仍留在浏览器本地或 `daily_checks.json`，不污染知识库日记。
- **真源白名单**：只解析 `01-Daily/今日计划/YYYY-MM-DD.md`、`00-Inbox/硬节点台账.md` 与 `03-Projects/` 的目录及顶层 `.md`。今日计划缺失时回退到最近一份并标记「非今日」；目录可用 `OPS_KNOWLEDGE_DIR` 覆盖，换机器不需要改代码。
- **项目台账只报事实**：只取名称、相对路径、真实改动时间、文件数与文档首段摘要，不推断进度、完成度或状态。台账列出全部项目（不再截断为前 12 项）；`AGENTS.md`/`CLAUDE.md`/`README.md`/`03-Projects.md` 等说明与索引文件不算项目，项目目录与同名笔记文件重复时只保留目录。同一分钟内大批文件同时变更视为同步工具批量刷新，不参与「最近活动」排序；只有批量时间戳的项目排在末尾。`03-Projects` 缺失或为空时写 warning 并置 `degraded`，不构造条目。渲染由 `js/knowledge-projects.js` 负责，挂在项目雷达 Tab 内，无数据时整块隐藏。
- **财务月度复盘投影**：`parse_finance` 只读 `06-Growth/Finance/YYYY-MM-*-review.md` 的最新月份，抽取「本月概况」与「支出结构」两张表的原始金额与口径，不重算、不四舍五入、不补缺失项；金额无法解析时写 warning 而不猜。渲染由 `js/knowledge-finance.js` 负责，挂在财务 Tab 上方，与真实账本互不替代——账本仍需在财务页主动读取，两块同时存在时以账本为准。
- **日记精力投影**：`parse_energy` 只读 `01-Daily/YYYY-MM/YYYY-MM-DD.md` 的「## 状态」段，取最近 7 天的精力／情绪／专注评分与本人写下的推断依据；睡眠／运动不在该段内，按全文首个同名字段兜底，找不到就不写。评分与依据原样呈现，不重算、不补分、不合并进 VitaFlow 四账户。渲染由 `js/knowledge-energy.js` 负责，挂在日程与精力 Tab 上方。
- **精力公开投影**：本人 2026-11-07 明确选择 C 档，日记精力连推断依据一起公开。`sanitize_public.build_public_energy` 只保留日期、分数、依据与睡眠/运动，丢弃本地文件路径，文本统一过 `scrub_text`；产物为 `data/public/energy.json` 与 `energy.js`。页面优先读私有快照，缺失时回退公开文件；公开站在 http(s) 下改用 `fetch('data/public/energy.json?t=…', {cache:'no-store'})` 取最新，因为 `energy.js` 用固定 `?v=` 加载会被浏览器长期缓存、每日同步改内容不改 URL；`file://` 或离线时保留内联数据。**公开意味着日记片段会进入 git 历史与公网，改动前必须确认是本人意愿。**
- **失败不造假**：解析不到写 `warnings` 或 `available: false` 并给出原因，不构造占位行；知识库不存在不得拖垮硬件探针。
- **口径以台账为准**：硬节点按「到期日 ≠ 决策日」计算提醒日，决策日仍在未来的节点不算逾期；处置列已写明闭环的不计入逾期。
- **隐私**：`data/knowledge.json` 与 `data/private/` 已 git-ignore，`sanitize_public.py` 在中整块剔除 `knowledge` 段。公开站拿不到私有快照，页面自动隐藏该区块。

### 静态资源缓存版本

`index.html` 中每个 js/css 都带 `?v=x.y.z` 查询串。**修改任何前端文件后必须同步提升对应版本号**，否则浏览器继续用旧缓存，改动上线了但看不到效果——历史上已因此误判「修复没生效」。数据类文件（`data/*.js`）由运行时 `fetch(...?t=)` 兜底，可不改。

### 网站风格

- `ops_style` 保存 classic/paper/forest/mono，`ops_theme` 独立保存明暗；风格层使用 `html[data-ops-style]` 和 `--ops-*` 令牌，不改业务数据。
- 风格切换器是 `index.html` 头部右侧、紧邻主题按钮的四个按钮（`[data-ops-style-option]`），不再是内容区下拉框。窄屏（<640px）显示单字、宽屏显示双字；当前项通过 `aria-pressed` 与 `.is-active` 双重标记。`#site-style-status` 保留 `role=status` 但视觉隐藏（`sr-only`），只做无障碍播报。
- 修改样式时同时验证四套明暗与 320px／390px，三个原生工作区共用令牌与宿主页面滚动。头部在 320px 下已无同步胶囊（<640px 隐藏），改动头部布局时不要把它加回来。

### 体重与财务接入边界

- 体重挂载 `#weight-native`，节点 ID 加 `weight-` 前缀；保留原 Store 与 `weight-tracker:universal:v1` 格式。应用源码已归档到 `weight-tracker/src/index.html`，`build-native.mjs` 从该路径读取，公开站不再提供体重独立页。禁止为整合清空、迁移或覆盖个人记录；同源旧 iframe 的记录直接沿用。
- 财务挂载 `#finance-native`，节点 ID 加 `finance-` 前缀，事件只通过命名空间暴露，不得覆盖 VitaFlow 的全局 UI 函数。源财务项目保持独立维护，本项目只包含中和私人内容后的界面与计算逻辑。
- 财务 `src/template.html` 是无账本默认值的四区界面，`src/dashboard.js` 保留原计算和渲染，`src/runtime.js` 负责鉴权读取、校验、内存状态与隔离接口，`src/styles.css` 限定根与风格令牌。`build-native.mjs` 生成可直接托管的 JS/CSS；`tests/fixtures.mjs` 只服务隔离测试，构建不得读取它。
- 财务数据来自 `https://finance.insistgang.top/data/financial_data.json`。**自 2026-11-07 23:31 起 Basic Auth 已按本人要求关闭，该 JSON 公开可读**；本站仍只在页面内存中保留账本，不嵌入构建、仓库、公开快照或 localStorage，也不保存任何密码。风险、影响范围与恢复方式见 [财务访问说明](docs/finance-access.md)。
- 默认不探测账本。若接口重新要求认证（401/403），清除可见值并如实提示，不索取密码；普通刷新失败须明确标识上次成功数据；未核实/未记录不能换算成零。今日摘要只读工作区 API，事件不广播账本、记录或凭据。
- 服务器 CORS 仍只允许 `https://insistgang.top` 跨源读取 `/data/financial_data.json`；预检只返回 204 无数据，禁止放开通配来源。匿名读取当前返回 200，属本人明确选择的公开状态；恢复登录与验证步骤见 [财务访问说明](docs/finance-access.md)。

---

## 4. CLI 命令行套件交互规范 (`ops`)

CLI 必须用标准 Python 3 实现，使用内置库，严禁强依赖任何第三方 pip 包。

* `ops status`：终端彩色打印三端算力、求职状态、项目提交、今日四勾。
* `ops sync [--push]`：探针检测网络、扫描本地项目，原子写入 `status.json`；`--push` 触发 GitOps（文件锁防并发、脏工作区保护、commit 失败即中止，失败返回非零退出码）。
* `ops career <list|add|update>`：维护求职企业与推进状态（`add`/`update` 必须携带公司名，`update` 必须携带 `--status`）。
* `ops check <起了|动了|写了|关了>`：快速打卡今日四勾（跨天自动归档旧记录并重置）。
* `ops memory`：终端展示个人记忆与秩序基线。
* `ops serve`：本地启动极速静态 Web 预览（仅监听 `127.0.0.1`，不暴露局域网）。
* `ops schedule <install|status|uninstall>`：管理 macOS 原生 `launchd` 早晚自动调度服务（`status` 如实展示上次退出码与错误日志）。

---

## 5. 异常处理与自愈原则
* **Windows 或 Jetson 离线**：探针超时（1.5s-2s）立即判定为离线/局域网待命，页面和 CLI 优雅降级，不可抛出未捕获异常。
* **网络中断**：Git push 失败时静默记录 Warning 日志，本地文件照常更新，下次网络恢复自动同步。
* **路径容错**：本地项目目录若不存在或未初始化 Git，优雅显示“本地路径待关联”，不影响其余模块运行。
* **探针诚实**：ping 可达但延迟解析失败时如实返回空值（页面显示"在线"而非虚构延迟），严禁编造探测数值。
* **XSS 防护**：CLI 与第三方仓库 commit message 等一切外部数据进入 `innerHTML` 前必须经过 `esc()` 转义，新增渲染字段时不得例外。

## 6. 本地验证入口

- 统一构建：`node build.mjs` 生成全部原生产物，`node build.mjs --check` 校验与源码一致。提交前必须让 `--check` 通过，不要只单独跑某个模块的构建——漏跑一个就会出现「源码改了、产物没变」的静默漂移。
- Ops-Hub：`python3 -m unittest discover -s tests -p 'test_*.py'`。
- 缓存版本：`tests/test_asset_versions.cjs` 会拦截「前端文件已改动但 `index.html` 未提升 `?v=`」的情况。
- 前端与体重模块：`node --test tests/*.cjs weight-tracker/tests/*.cjs`；时间边界测试可在 `TZ=UTC` 下运行，确认仍按北京时间分日。
- 语法：`node --check js/app.js`、`node --check js/today.js`、`node --check js/vitaflow.js`、`node --check js/vitaflow-today.js`、`node --check js/site-style.js`、`node --check js/life-today.js`。
- 体重原生：`node weight-tracker/build-native.mjs`；一致性 `node weight-tracker/build-native.mjs --check`，回归已包含在上述体重 Node 测试中。
- 财务原生：`node finance/build-native.mjs`、`node finance/test-native-workspace.mjs`、`node finance/build-native.mjs --check`；源码修改后重建并验证，不能读取真实账本作为公开测试 fixture。
- VitaFlow：在 `vitaflow/` 执行 `npm test`。跨模块修改时按影响范围运行，不能用打开预览代替交互验证。
