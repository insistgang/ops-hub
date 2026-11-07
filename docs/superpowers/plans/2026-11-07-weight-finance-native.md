# 体重与财务原生工作区

用户已选择所有模块共用总台界面；本轮将体重与现有财务站一起融入，财务沿用原站数据源，先核实并保留访问保护。

## 范围与接口

- 总台保留一个 document、一套外层导航和页面滚动；体重与财务没有 iframe。外层按钮和面板使用明确的宿主标记，不能匹配内部 Tab。
- 体重继续使用 `weight-tracker:universal:v1` 和既有 Store，不迁移、重置或改写用户记录；保留使用者、目标、历史编辑、小组及独立版。原生节点 ID 全部加 `weight-` 前缀，CSS 限定 `#weight-native`。
- 财务前端移植现有四个分区及原有计算、日期和未核实状态，不复制账本、账户名、金额、私人备注或服务器凭据。原生 ID 全部加 `finance-` 前缀，CSS 限定 `#finance-native`，事件和状态只通过命名空间暴露。
- 财务只在用户主动读取时请求 `https://finance.insistgang.top/data/financial_data.json`，使用浏览器已有登录状态；不保存密码、账本或余额到公开资源及浏览器存储。默认和失败状态明确显示未读取/需要登录，缺失收入不得算作零收入。
- API：`OpsWeightNative` 提供 `isReady()`、`activate(view)`、`refresh()`、`getSummary()`，并发出无记录内容的 `ops:weight-ready` / `ops:weight-data`。摘要包含当前使用者、最近记录、目标、差值和记录数；读取错误另有明确标志。
- API：`OpsFinanceNative` 提供 `isReady()`、`activate(view)`、`refresh()`（显式读取）、`getSummary()`、`setTheme(theme)`；摘要状态为 idle/loading/ready/locked/error，成功后可含日期与原数据的开支/可用现金，事件 `ops:finance-ready` / `ops:finance-data` 不包含账本或凭据。内部切换不改宿主 hash，不暴露全局 switchTab。
- 今日显示体重摘要和记录入口，财务显示读取状态及进入入口；财务金额只在本页显式读取成功后显示。风格和明暗共用 `--ops-*`，320px/390px 不横向溢出。

## Task 1：体重原生化（Luna，独立）

背景入口：`weight-tracker/index.html`、`js/app.js`、`js/store.js`、`css/style.css`；复用 `vitaflow/build-native.mjs` 的 CSS 限定方法可行。

只负责 `weight-tracker/` 内新建原生构建、运行时、生成 JS/CSS 和相关测试。保留独立版与 Store 公共接口，不改根入口、根样式或文档。不读取真实 localStorage 或私人文件。与其他协作者同时工作，不回退他人变更，不再委派。

验收：全部功能挂到同 document；DOM、标签引用及 CSS 没有跨模块冲突；同键原记录可读，保存失败/损坏/跨页并发不覆盖数据；SVG 真实浏览器可画；重复 activate 不重复绑定。先给关键逻辑失败用例，再实现，运行原 Store 与原生回归和构建一致性检查。

## Task 2：财务原生前端（GPT-6.1 Sol，独立）

只读来源：`../financial-dashboard/src/index.html` 与原测试逻辑。只负责总台中新 `finance/` 的安全源码、生成物和测试；不改来源项目、根入口、根样式、服务器或 CI。真实 JSON、sources、config 不进入本项目；测试只用明确隔离的合成数据。

先审查并中和静态 HTML/JS 的私人文本和金额，再保留原四区（overview/assets/spend/review）与金融计算语义。用已有宿主 Tailwind/Lucide，不加载第二套全局配置。ECharts 5.4.3 如需加载须在真实 window/document 初始化，默认不为隐藏图表创建实例。遵循上述接口与显式读取边界。认证失败清空可见财务值，普通网络失败允许明确标注上次成功值，不能把未知变成零。

验收：无原站身份/余额残留、无默认数据请求、无密码或账本持久化；401/403、离线、乱序响应、无数据/零值、各周期切换保持含义；内部导航不干扰 VitaFlow。独立回归测试包含合成合法数据、错误与请求边界，运行语法及生成物校验。与其他协作者同时工作，不回退他人变更，不再委派。

## Task 3：保护、宿主、验收与发布（Coordinator）

1. 只读核对线上 Nginx 有效配置。已确认财务域名的 Basic Auth 两行被注释、原密码文件仍在，匿名账本 GET 为 200。
2. 按用户选择恢复现有 Basic Auth，不改密码文件。仅财务 JSON 的精确 location 允许 `https://insistgang.top` 携凭据 CORS；OPTIONS 只返回无数据预检，GET/HEAD 保持认证与 no-store。先备份原配置、`nginx -t` 成功后重载，失败恢复；其他域名保持不变。
3. 改根入口和 Tab 选择范围，挂载两工作区、今日摘要和风格令牌；保留全部原日程功能。
4. 验证合成数据的成功/失败/保留路径、实际浏览器所有分区/图表/弹窗、四套明暗和窄屏；线上确认匿名 HTML/JSON 为 401，精确来源 CORS 成功，其他来源不获授权，原凭据文件哈希不变（不输出内容）。
5. 更新 AGENTS、README、ROADMAP，核对公开暂存内容和真实数据未改，按已授权更新流程提交并发布现有 Ops-Hub，核对线上字节与主要入口。

## 当前状态

Task 1、Task 2 已实现，Task 3 的保护恢复、宿主整合和全部本地浏览器验收已完成，待发布。17 项 Python、97 项 Node、财务原生回归和 VitaFlow 全套检查通过；真实浏览器已验证旧体重记录、草稿并发、财务四区/五图/周期/失效清空、八套明暗与窄屏、file 模式。最后复核整包重复执行不重复绑定，随后提交只新增一条；样式过渡结束后主按钮、SVG 与输入颜色均匹配共享令牌。全部测试写入只发生在隔离浏览器与合成响应。

真实用户登录凭据不由总台接收或保管。本轮确认匿名保护与精确来源 CORS，使用合成响应验证已登录后的界面流程；未持有凭据，不能声称已验证真实账户登录。原站凭据保持不变，用户通过原站登录后主动读取。
