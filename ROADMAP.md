# Ops-Hub 演进与维护记录

## 近期里程碑

- **2026-11-26 20:20 · 定时同步链路 DNS 失败修复（代理不可用时的自愈）**：
  - **症状**：09:00/21:00 定时任务连续失败，`launchctl list` 显示 `com.insistgang.opshub` 上次退出码 1；日志中 1/5--4/5 各步均报 `nodename nor servname provided, or not known`（`socket.gaierror` → `urllib.error.URLError`），线上核验 37 项全部失败，财务账本快照长期停在 `as_of 2026-11-24`。
  - **根因**：本机 Clash Verge 以 **TUN 模式**接管流量（`utun5` 持有 `198.18.0.0/15`，`verge-mihomo` 以 root 运行），`finance.insistgang.top` / `ops.insistgang.top` 解析出的均为 **Fake-IP**（`198.18.0.134` / `198.18.0.133`），必须经 mihomo 转发才能真正到达。定时任务触发时若 mihomo 处于短暂不可用状态，直连 Fake-IP 即全部失败。已核实 DNS 解析本身在 shell 与 launchd 两种环境下均正常，故非解析配置问题，而是**代理瞬时不可用未被容错**。
  - **修复**：`scripts/ops_common.py` 新增统一出站入口 `fetch_bytes` / `fetch_text` / `fetch_json` / `fetch_with_status`——先按有界预算直连重试（`HTTP_RETRY_DELAYS = (0, 2, 5, 10)`，总等待 ≤ 17 秒），仍失败再逐个回退本地代理候选（`http://127.0.0.1:7897` 等，仅接受 http/https scheme），全部失败才抛最后一个异常以保留原始错误语义。`finance_publish.py`、`publish_aliyun.py`、`deploy_vita_sync.py` 三处 `urlopen` 统一改用该入口；账本取数额外增加**回退阿里云实体文件**（`ssh aliyun cat $LIVE_LINK`），避免一次网络抖动让整轮账本同步白跑。
  - **验证**：新增 `tests/test_http_resilience.py` 7 项回归（直连重试后成功、直连耗尽回退代理、全失败抛最后异常、`fetch_with_status` 保留状态码、JSON 解析、代理 scheme 过滤、重试预算有界）；165 项 Python 测试 + 173 项前端测试 + 4 项财务/桥接测试全部通过。故障注入实测：屏蔽直连后经代理兜底仍取到 `period=2026-11 / expenseTotal=3170.5`，直连可用时同样正常。实跑 `sync_all.py` 全链路成功，**线上核验 37/37 通过、服务一致性核对全部一致**，财务快照同步至 `as_of 2026-11-26`（已记录支出 3,170.50 元、确认收入 7,805.00 元、本月结余 4,634.50 元），与 Finance 看板一致。
  - **边界**：本次只增强客户端容错，**未改发布配置、鉴权、nginx 路由或脱敏映射**；`knowledge_source.py` 与 `tests/test_knowledge_projects.py` 的工作区改动非本次所为，未纳入提交。

- 2026-11-22 19:57，财务目录合并后更新 `docs/finance-access.md` 的看板源码位置为 `finance/app/`；知识库软链接与总台只读接入路径未变，本次未修改或发布总台程序。

- **2026-11-22 09:22 · 知识库目录重构后的知识库投影断链修复**：
  - **症状**：知识库于 11-22 凌晨重构（项目台账 `03-Projects` → `04-Resources/Archive/项目管理`，财务复盘 `06-Growth/Finance` → `03-Growth/Finance`）后，`scripts/knowledge_source.py` 仍指向旧路径，`data/knowledge.json` 的 `projects`/`finance` 变为 `null`；加上 `fcbe76c` 将 `warnings` 从公开产物剔除，公开站「知识库项目台账」与「月度财务复盘」静默消失。
  - **修复**：`knowledge_source.py` 新增归档结构解析（`项目索引/*.md` 条目 + `03-Projects.md` 的「当前主线」表格），旧结构 `03-Projects/` 与 `06-Growth/Finance/` 保留回退；归档结构无条目时自动回退旧结构；索引条目摘要改取首条要点；财务目录按 `03-Growth` → `06-Growth` 顺序探测。
  - **验证**：`projects` 恢复 12 条（8 条当前主线 + 4 条项目索引）、`finance` 恢复 2026-11 月度复盘，`warnings` 为空，公开产物无本地绝对路径泄露；新增 10 项回归测试（归档结构解析、结构优先级、旧结构回退、缺失总览告警、财务目录迁移）。
  - **发布**：修复提交 `cfb7e0b` 已推送 `origin/main`；`ops sync --all` 全链路成功，阿里云 `9074115` 已发布并通过线上核验 37/37，GitHub Pages 镜像与阿里云主站 `data/public/knowledge.json` 均恢复 `projects: 12 / finance: 2026-11`；账本 asOf 2026-11-21，无新数据无需发布。

## 最新线上验证

- 2026-11-22 09:52 · 阿里云主站 `https://ops.insistgang.top/data/public/knowledge.json`：`generated_at=2026-11-22T09:51:21+08:00`，`projects=12`（`04-Resources/Archive/项目管理`）、`finance=2026-11`、`warnings=[]`，线上核验 37/37 通过。
- 2026-11-22 09:52 · GitHub Pages 镜像 `https://insistgang.top/ops-hub/data/public/knowledge.json`：`generated_at=2026-11-22T09:51:21+08:00`，`projects=12`、`finance=2026-11`，与阿里云主站一致。
- 2026-11-22 09:52 · 财务账本 `https://finance.insistgang.top/data/financial_data.json`：`asOf=2026-11-21`，11 月流水已逐日去重，无需发布。

- **2026-11-18 · v2.0 全栈瘦身与模块化重构**：
  - **清理冗余与体积暴降**：清理 `.tmp/`（17 MB 历史调试残留）、`docs/superpowers/` 一次性计划、`PRD_REVIEW.md`、退役的 `weight_challenge` 死代码及 VitaFlow 12 个旧独立启动/迁移脚本与冗余 `.ttf` 字体；`vitaflow/build-html.mjs` 剥离 FA4/FA5 重复兼容段与 TTF 内联，`vitaflow/native-workspace.css` 从 **3.2 MB 降至 484 KB（-85%）**，`schedule-system-2.0.html` 从 **3.8 MB 降至 1.1 MB（-71%）**；VitaFlow 18 项测试统一收拢至 `vitaflow/tests/`。
  - **前后端同源模块化重构**：新增前端公共底座 `js/core.js` 与算力模块 `js/compute.js`，`js/app.js` 瘦身约 30% 并移除 `index.html` 内联事件；新增后端公共底座 `scripts/ops_common.py` 与 `scripts/cli_commands.py`，`ops` 入口收敛为纯声明式路由，前后端任务分流关键词由单测强制同源对齐。
  - **缺陷修复与运维自洁**：修复 `sanitize_public.py` 循环缩进误删 `collab_mode` 导致公开站协同流转表缺列的问题；为公开站知识库投影补齐 `fetch('data/public/knowledge.json?t=...', {cache:'no-store'})` 实时刷新；补齐求职看板六档筛选与活跃阶段自动置顶；修正页面过时文案；为 `publish_aliyun.py` 与 `finance_publish.py` 增加服务器 `/root` 备份与 `.finance-releases` 自动滚动淘汰。
- **2026-11-17 · Career-Copilot 单向数据流对齐**：明确 `collector.py::load_career_records()` 单向读取 `../Career-Copilot/data/applications.json` 的真源边界与本机托管策略，详见 [接入说明](docs/career-copilot-integration.md)。
- **2026-11-15 · 双语 README 与真实公开站截图**：重写中英双语入口 `README.md` / `README_EN.md`，补充今日工作台、三端算力与项目雷达三张公开站实测截图。
- **2026-11-10 · 公开脱敏投影扩展与阿里云双站同步**：按本人授权新增个人体重、知识库（今日计划/WIP/硬节点/项目台账/月度财务摘要）公开脱敏投影；接入 `publish_aliyun.py`、`finance_publish.py` 与 `sync_all.py` 四步定时发布管线，财务页支持页面内存态自动读取。
- **2026-11-08 · VitaFlow 云同步定型与日记待办投影**：退役旧本地 `my-schedule.json`，确立阿里云 `ops-vita-sync` + 本机回环桥接架构（见 [云同步说明](docs/aliyun-vita-sync.md)）；新增日记待办公开投影与按需单向导入。
- **2026-11-07 · 三大生活模块原生整合与四套视觉风格**：VitaFlow、体重、财务全部改为同文档单实例原生工作区（移除 iframe），统一接入 `build.mjs` 与 `?v=` 缓存版本守卫；新增经典/纸感/森林/海蓝四套风格与今日首页「重点 + 昨日未完成带入」。

## 最新全量验证基线

- 2026-11-22 09:22 · `node build.mjs --check`：VitaFlow 独立版、VitaFlow 原生、体重原生、财务原生四步构建与源码 100% 一致。
- 2026-11-22 09:22 · Python 测试套件：`122` 项单测全部通过（新增 10 项覆盖知识库归档结构解析与财务目录迁移）。
- 2026-11-22 09:22 · Node 与原生工作区测试：`173` 项前端/体重单测（含静态缓存版本守卫与前后端分流关键词同源校验）+ 财务原生套件 + 本机桥接安全套件 + VitaFlow `npm test` 全套通过。
- 2026-11-21 21:00 · `node build.mjs --check`：VitaFlow 独立版、VitaFlow 原生、体重原生、财务原生四步构建与源码 100% 一致。
- 2026-11-21 21:00 · Python 测试套件：`112` 项单测全部通过（覆盖探针、知识库解析、日记待办/精力/体重/状态脱敏阻断、财务同步与公共分流底座）。
- 2026-11-21 21:00 · Node 与原生工作区测试：`173` 项前端/体重单测（含静态缓存版本守卫与前后端分流关键词同源校验）+ 财务原生套件 + 本机桥接安全套件 + VitaFlow `npm test` 全套通过。
