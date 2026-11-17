# Career-Copilot 项目与 Ops-Hub 接入

> 核对日期：2026-11-17。本文记录项目职责、已验证的数据流与托管边界，不包含个人联系方式、简历正文或单条求职备注。

## 项目概况

Career-Copilot 是本机使用的求职工作流工具，连接个人经历主库、岗位需求、简历编译、求职跟踪与邮件处理。活动仓库位于 `../Career-Copilot/`，Git 远端为 [insistgang/Career-Copilot](https://github.com/insistgang/Career-Copilot)。

- **经历真源**：`data/master_profile/profile.yaml`、15 张项目卡片和主张—证据账本。
- **简历链路**：`apply.py` / `src/engine.py` 读取经历主库，使用 Typst 编译 PDF。
- **需求匹配边界**：当前 Python 引擎按 JD 词项重合度排序项目，最多选择 4 张卡片；它本身不调用大模型做语义匹配或改写。经历酥化和文案改写主要由 `/asu` 等 Agent 技能完成。
- **看板与邮件**：`dashboard.py` 启动本机求职看板；`src/mail163.py` 和 `src/mcp_mail163.py` 支持 163 邮件读取，发信由外部 `agently-mail` 命令承担。

## Ops-Hub 求职数据流

Ops-Hub 已实现从 Career-Copilot 到求职看板的单向投影：

1. `scripts/collector.py::load_career_records()` 优先读取 `../Career-Copilot/data/applications.json`。
2. 采集器将记录缩减到看板所需字段，并映射阶段；备注、薪资和简历文件名不会进入 Ops-Hub 投影。
3. `data/career_records.json` 是本机生成的记录快照；采集结果继续进入 `data/status.json`，再由 `scripts/sanitize_public.py` 生成公开快照 `data/public/status.json`。
4. 若相邻 Career-Copilot 数据源不可用，采集器回退读取 Ops-Hub 的本地 `data/career_records.json`。

**方向与字段口径**：Career-Copilot 是当前有数据时的上游真源，Ops-Hub 不会把状态写回 Career-Copilot。因而直接在 Ops-Hub 本地修改生成的投递记录，下一次采集可能被上游覆盖。另一个现有限制是 Ops-Hub 的 `apply_date` 取自 Career-Copilot 的 `last_updated` 日期，代表最近更新时间，不保证是最初投递日。

截至 2026-11-17 21:00 的本机核对，源台账和 Ops-Hub 生成记录各有 47 条，逐条映射字段一致。该数字是当时的快照，不代表之后仍保持相同数量。

## 看板与公开边界

- **本机入口**：在 Career-Copilot 仓库运行 `python3 dashboard.py`，看板位于 `http://127.0.0.1:8765/dashboard.html`。服务仅监听回环地址，API 使用会话令牌。
- **GitHub 仓库**：远端存在，但 README 标注仓库为私有。
- **GitHub Pages**：Career-Copilot 看板当前没有可用的公开页面。旧地址 `https://insistgang.github.io/Career-Copilot/` 在 2026-11-17 检查时跳转到项目自定义路径并返回 404。
- **不部署约定**：看板源文件包含个人联系方式和简历入口，也依赖本机 `/api/*` 服务；静态 Pages 无法提供这些 API。用户已决定不公开该看板，后续不得开启该项目的公开 Pages 或把本地求职数据复制进公开材料。

Ops-Hub 自身仍按本项目既有脱敏规则发布求职概览；此处记录 Career-Copilot 的本机托管选择，不改变 Ops-Hub 的部署状态。
