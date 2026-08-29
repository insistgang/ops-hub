# AGENTS.md — Ops-Hub 智能体与开发者协作契约

> **项目名称**：Ops-Hub（个人数字化运营工作总台）  
> **代码仓库**：`Desktop/ops-hub`  
> **真源设计**：详见 `docs/PRD.md` 与 `docs/PRD_REVIEW.md`  
> **所有在本项目中工作的 AI 智能体与协作者均须严格遵循本契约。**

---

## 1. 核心定位与架构原则

### 1.1 项目使命
Ops-Hub 是承载个人的三端算力调度（Mac + Windows 4070S + Jetson 边缘硬件）、多线项目推进、求职进度跟踪、备考冲刺及生活打卡的**个人数字化运营工作总台**。它开源公开在 GitHub 上，既是日常工作流的控制塔，也是高标准的工程 Showcase。

### 1.2 不可动摇的三大铁律
1. 🚫 **零 Mock 假数据铁律 (Zero-Mock Axiom)**：
   - 严禁制造任何捏造的假数据。所有展示的数据必须 100% 真实、有据可循。
   - 数据源必须来自本地真实路径 (`~/Career-Copilot`、`~/Desktop/jiefu` 等)、线上系统 (`https://insistgang.top/weight-tracker/`) 及真实硬件探针（Win 4070S / Jetson 边缘）。
2. ⚡ **零构建纯净单页架构 (Zero-Build Vanilla Stack)**：
   - 页面采用 `HTML5 + Tailwind CSS (CDN) + Lucide Icons (锁版本)`。
   - 根目录下直接放置 `index.html`，无需复杂的 Node 构建或打包步骤。克隆即用、双击即看、GitHub Pages 秒级上线。
3. 🏛️ **三端算力分工与场景秩序**：
   - **MacBook Air (M5)**：移动生产力中枢，负责思考、写作、投递跟踪、总台控制。原则：**带去图书馆专注完成**。
   - **Windows 4070S**：常驻算力后端，负责 CUDA 训练、批量构建、远程执行与冷备仓库（Tailscale `100.98.218.25`）。
   - **Jetson 边缘硬件 (Yahboom)**：端侧 AI 感知节点，负责机器人/视觉感知模型部署（局域网 `10.8.20.74`，`ssh jetson@10.8.20.74`）。

---

## 2. 目录架构与职责划分

```text
Desktop/ops-hub/
├── index.html                 # 现代化纯净版单页工作总台（Tab 切换式，三端拓扑）
├── css/
│   └── custom.css             # 玻璃拟态样式 + 日间/夜间双主题覆盖层（暗色为默认）
├── js/
│   └── app.js                 # 核心前端逻辑（Tab 切换、数据加载、指标计算、交互；所有 innerHTML 注入必须过 esc() 转义）
├── data/                      # 真实数据真源目录（全部随 Git 提交公开）
│   ├── status.json            # 探针自动汇总的运行时状态快照（三端延迟、时间戳、统计）
│   ├── status.js              # status.json 的 JS 镜像（file:/// 零 CORS 预加载）
│   ├── career_records.json    # 真实求职企业与投递状态（施耐德、为恒、振石等）
│   ├── projects.json          # 真实项目配置（姐夫、Andy、小论文、教资、六级）
│   ├── daily_checks.json      # 今日四勾打卡状态与历史归档（跨天自动归档重置）
│   ├── memory_rules.json      # 个人记忆、场景分工与专注秩序原则沉淀
│   ├── memory_rules.js        # memory_rules.json 的 JS 镜像
│   └── device_allocation.json # 三端设备任务分工与项目流转矩阵
├── ops                        # 可执行全局 CLI 入口（Python 3 编写，无第三方库依赖）
├── scripts/
│   ├── probe.py               # 三端网络与硬件服务 Level 2 探针脚本 (Mac+Win+Jetson)
│   ├── collector.py           # 全量数据汇总、原子写入、跨天归档与 GitOps 自动提交推送核心
│   └── com.insistgang.opshub.plist # macOS 原生 launchd 定时同步服务描述文件
├── tests/                     # 回归测试
├── LICENSE                    # MIT
└── docs/
    ├── PRD.md                 # 经过需求访谈确立的 PRD 需求规格书
    └── PRD_REVIEW.md          # 3 遍深度审阅报告
```

---

## 3. 页面模块与 Tab 规范

总台 UI 采用 **现代极客风 + 日间/夜间双主题**（暗色为默认，头部按钮切换，选择持久化在 localStorage `ops_theme`；亮色通过 `custom.css` 的 `html:not(.dark)` 覆盖层实现，新增 Tailwind 色阶时必须同步补覆盖规则），分为四大专属 Tab：
1. **Tab 1: 🎯 求职投递全景看板 (Career Pipeline)**
   - 过滤标签：全部、面试中、笔试中、初筛、已投递、Offer。
   - 字段：公司名称、岗位、投递日期、状态 Badge、简历指引、跟进备注。
   - 默认排序：推进中（面试/笔试）自动高亮置顶。
2. **Tab 2: 🚀 多线项目推进雷达 (Project Radar)**
   - 姐夫项目 (`~/Desktop/jiefu`)：Chrome 插件 V3 + 利润核算。
   - Andy 项目 (`~/Desktop/andy`)：小智伴侣机器人 (`xiaozhi-esp32` + `py-xiaozhi`)。
   - 毕业小论文 (`~/Desktop/lunwen`)：违建 YOLOv11 主线 + E-PAS Sensors 改投。
   - 自动提取本地 Git 最新提交时间与 Commit 信息，展示 Next Action。
   - 考试倒计时：教资（2026-09-12，17 天高危冲刺）+ 六级（2026-12）。
3. **Tab 3: 🧠 个人记忆与秩序中枢 (Personal Memory & Order Hub)**
   - 每日四勾：起了、动了、写了、关了（Web 点击打卡持久化在浏览器 localStorage、按日期隔离；CLI 写入 `daily_checks.json`，仍是跨设备真源）。
   - 场景契约：图书馆（思考/写作/Mac）vs 实验室（算力/充电/4070S/Jetson）vs 宿舍（关机恢复）。
   - 认知原则：WIP=1 防散、新想法入 `00-Inbox/`、补剂仅在实验室服用。
4. **Tab 4: 🖥️ 三端算力与拓扑 (Compute & Topology)**
   - Mac M5 (`100.86.36.75`)、Win 4070S (`100.98.218.25`) 与 Jetson 边缘 (`10.8.20.74`) 实时网络延迟卡片。
   - 一键复制 SSH 登录命令（Win 与 Jetson 均支持）。
   - Windows SSH (`22`) 与 SMB (`445`) 实时服务状态。
   - 外部直达：`https://insistgang.top/weight-tracker/`。

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
