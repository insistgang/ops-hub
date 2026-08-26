# 🚀 Ops-Hub · 个人数字化运营工作总台

> **“让流程和环境帮我做决定，不靠意志力硬撑。一个地方，一种模式。”**  
> 算力调度 · 求职大盘 · 多线项目雷达 · 考期冲刺 · 极简生活秩序

---

## 📖 项目定位

**Ops-Hub** 是一个开源的个人数字化运维工作总台，将个人的**双机算力调度**（MacBook Air + Windows 4070S）、**求职投递跟踪**（Career-Copilot）、**多线项目推进**、**资格备考**及**生活秩序打卡**完全串联。

### 🌟 核心架构三大铁律
1. 🚫 **零 Mock 假数据原则**：100% 读取真实工程、真实投递记录与网络探针，数据公开可溯源。
2. ⚡ **零构建单页直出 (Zero-Build Vanilla)**：纯净 HTML5 + Tailwind CSS + Lucide Icons，无构建心智负担，GitHub Pages 秒级生效。
3. 🏛️ **双机分工与场景秩序**：
   - **MacBook Air (Apple M5, 16G)**：移动生产力中枢，带去**图书馆专注完成**（思考/写作/求职）。
   - **Windows 4070S (i5-12600KF, 32G, 12G独显)**：常驻算力后端（CUDA训练/Ollama/冷备），Tailscale Mesh 直连（延迟实测 ~5-20ms）。

---

## 🎯 核心功能看板

| 模块板块 | 对应功能与真源 |
|:---|:---|
| 🎯 **求职投递管道** | 对接 `~/Career-Copilot`，追踪施耐德、为恒智能、振石控股、芯圣电子等企业的推进阶段与定制简历。 |
| 🚀 **多线项目雷达** | 自动提取本地 Git Commit：姐夫电商系统 (`Desktop/jiefu`)、Andy小智机器人 (`Desktop/andy`)、毕业小论文 (`Desktop/lunwen`)。 |
| ⏳ **考期冲刺预警** | **教师资格证 (教资笔试)** 2026-09-12 冲刺倒计时（高危预警）+ **英语六级 (CET-6)** 12月冲刺。 |
| ⚖️ **减重决战直通** | 直通秋季 38 天决战大盘（刘钢/张庭磊/卢轩）：[https://insistgang.top/weight-tracker/](https://insistgang.top/weight-tracker/) |
| 🧠 **个人记忆与秩序** | 沉淀每日四勾（起了/动了/写了/关了）、场景分工契约、WIP=1 防散铁律及实验室补剂规则。 |
| 🖥️ **双机拓扑与算力** | 动态 Level 2 探针、实时网络往返延迟、一键 SSH 登录、Ollama 端点调用。 |

---

## 🛠️ CLI 命令行套件 (`ops`)

系统已配置为全局命令，在任意终端目录下均可直接调用：

```bash
# 查看全局工作总台摘要（双机状态、求职统计、考期倒计时、今日四勾）
ops status

# 执行全量硬件探测并更新数据快照（支持 --push 自动推送到 GitHub）
ops sync --push

# 管理求职投递
ops career list                                      # 查看全部投递企业与状态
ops career update "施耐德电气" --status "一面"          # 快速推进求职状态
ops career add "字节跳动" --pos "大模型工程师"           # 新增投递企业

# 今日四勾秩序打卡
ops check 起了
ops check 写了

# 打印底层秩序与契约清单
ops memory

# 本地启动静态 Web 仪表盘预览
ops serve --port 3000

# 管理 macOS 原生 launchd 早晚自动同步服务 (09:00 与 21:00)
ops schedule install
ops schedule status
```

---

## 🌐 目录结构

```text
Desktop/ops-hub/
├── index.html                 # 现代化纯净单页工作总台
├── ops                        # 全局 CLI 命令入口 (Python 3 内置库实现)
├── css/custom.css             # 暗黑玻璃拟态样式
├── js/app.js                  # 前端动态渲染与交互逻辑
├── data/                      # 真实数据真源 (公开透明)
│   ├── status.json            # 探针生成的运行时快照
│   ├── career_records.json    # 真实求职企业与投递记录
│   ├── projects.json          # 多线项目与考试配置
│   ├── daily_checks.json      # 今日四勾打卡数据
│   └── memory_rules.json      # 个人记忆与秩序原则沉淀
├── scripts/
│   ├── probe.py               # Level 2 双机与硬件网络探针
│   └── collector.py           # 数据汇聚与 GitOps 自动提交核心
└── docs/
    ├── PRD.md                 # 10 轮访谈沉淀的需求规格书
    └── PRD_REVIEW.md          # 3 遍完整审阅报告
```

---

## 📄 License

MIT © 2026 [Leo (insistgang)](https://github.com/insistgang)
