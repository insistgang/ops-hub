# 🚀 Ops-Hub · 个人数字化运营工作总台

> **“让流程和环境帮我做决定，不靠意志力硬撑。一个地方，一种模式。”**  
> 三端算力分工 · 求职大盘 · 多线项目雷达 · 考期冲刺 · 极简生活秩序

---

## 📖 项目定位

**Ops-Hub** 是一个开源的个人数字化运维工作总台，将个人的**三端算力调度**（MacBook Air + Windows 4070S + Jetson 边缘硬件）、**求职投递跟踪**（Career-Copilot）、**多线项目推进**、**资格备考**及**生活秩序打卡**完全串联。

### 🌟 核心架构三大铁律
1. 🚫 **零 Mock 假数据原则**：100% 读取真实工程、真实投递记录与网络探针，数据公开可溯源。
2. ⚡ **零构建单页直出 (Zero-Build Vanilla)**：纯净 HTML5 + Tailwind CSS + Lucide Icons，无构建心智负担，GitHub Pages 秒级生效。
3. 🏛️ **设备专属分工与场景秩序**：
   - **MacBook Air (Apple M5, 16G)**：移动生产力中枢，带去**图书馆专注完成**（论文写作/求职/知识库/轻开发）。
   - **Windows 4070S (i5-12600KF, 32G, 12G独显)**：常驻算力后端（CUDA训练、批量构建、远程执行与冷备仓库），Tailscale Mesh 直连。
   - **NVIDIA Jetson 边缘端 (Yahboom, Tegra aarch64)**：端侧 AI 感知节点（视觉模型部署/ROS调试，局域网 `10.8.20.74` 直连）。

---

## 🎯 核心功能看板

| 模块板块 | 对应功能与真源 |
|:---|:---|
| 🖥️ **设备分工与算力总台** | 包含交互式任务分流决策器、Mac vs Windows 专属任务/红线矩阵、真实项目流转协同表。 |
| 🎯 **求职投递管道** | 对接 `~/Career-Copilot`，追踪施耐德、为恒智能、振石控股、芯圣电子等企业的推进阶段与定制简历。 |
| 🚀 **多线项目雷达** | 自动提取本地 Git Commit：姐夫电商系统 (`Desktop/jiefu`)、Andy小智机器人 (`Desktop/andy`)、毕业小论文 (`Desktop/lunwen`)。 |
| ⏳ **考期冲刺预警** | **教师资格证 (教资笔试)** 2026-09-12 冲刺倒计时（高危预警）+ **英语六级 (CET-6)** 12月冲刺。 |
| ⚖️ **减重决战直通** | 直通秋季 38 天决战大盘（刘钢/张庭磊/卢轩）：[https://insistgang.top/weight-tracker/](https://insistgang.top/weight-tracker/) |
| 🧠 **个人记忆与秩序** | 沉淀每日四勾（起了/动了/写了/关了）、场景分工契约、WIP=1 防散铁律及实验室补剂规则。 |

---

## 🛠️ CLI 命令行套件 (`ops`)

系统已配置为全局命令，在任意终端目录下均可直接调用：

```bash
# 1. 查看全局工作总台摘要（双机/三端状态、求职统计、考期倒计时、今日四勾）
ops status

# 2. 任务智能分流查询（不知道眼下事情该丢给哪台机器时敲）
ops dispatch                        # 打印三端分工完整全景矩阵与项目流转表
ops dispatch "写毕业小论文"           # 秒级指引：👉 立即留在 Mac 去图书馆专注写！
ops dispatch "跑 YOLOv11 训练"      # 秒级指引：👉 立即派发给 Windows 4070S！

# 3. 执行全量硬件探测并更新数据快照（支持 --push 自动推送到 GitHub）
ops sync --push

# 4. 管理求职投递
ops career list                                      # 查看全部投递企业与状态
ops career update "施耐德电气" --status "一面"          # 快速推进求职状态
ops career add "字节跳动" --pos "大模型工程师"           # 新增投递企业

# 5. 今日四勾秩序打卡
ops check 动了
ops check 写了

# 6. 打印底层秩序与契约清单
ops memory

# 7. 本地启动静态 Web 仪表盘预览
ops serve --port 3000

# 8. 管理 macOS 原生 launchd 早晚自动同步服务 (09:00 与 21:00)
ops schedule install
ops schedule status
```

---

## 📄 License

MIT © 2026 [Leo (insistgang)](https://github.com/insistgang)
