# 原生工作区、六级倒计时与网站风格

## 用户要求与本轮边界

- 教资不再出现在总台展示，考试摘要以六级倒计时为主；保留私有归档事实，不删除原记录。
- 增加几套网站风格，可随时切换，兼容原明暗主题与本机保存设置。
- VitaFlow 当前是嵌入页面，用户明确指出没有完整融入。目标是共用总台导航和文档布局、消除内嵌窗口与双重滚动，并让「今日」直接展示同一份待办与精力记录。本人已明确选择「全部模块都融入同一套界面」。
- 当前目录继续开发，保持原 JSON、口令、localStorage 和历史记录，不做数据重置或历史清理。沿用已经授权的原站提交发布流程。
- 继续原生 HTML/JS 与现有依赖；不引入新框架，不为样式或演示造业务数据。

## Task 1：独立风格层（Luna）

**所有权**：新建 `css/site-styles.css`、`js/site-style.js`、`tests/test_site_style.cjs`。不改 index.html、js/app.js、custom.css、VitaFlow 源码、数据或文档。Coordinator 接入 HTML 与脚本。

**确定的设计**：

- `classic`：保留经典极客风，兼容已有默认状态。
- `paper`：纸感阅读，温白／暖灰、蓝灰强调色，标题采用本机衬线字体，边界较轻、投影克制。
- `forest`：森林秩序，浅鼠尾草／深松绿、中性色文本，柔和圆角与低光泽。
- `mono`：极简黑白，较小圆角、清晰分隔线、紧凑标题，无渐变和模糊效果。
- 每套风格均适配 `html.dark` 和亮色，不改变布局功能；默认仍是 classic。

**接口**：

- 样式属性：`html[data-ops-style="classic|paper|forest|mono"]`，保存键 `ops_style`。
- HTML 提供 `select#site-style`（四个上述 value）和 `#site-style-status` 反馈节点。
- 脚本提供 `window.OpsAppearance = {init, setStyle, getStyle}`，自动在 DOM 就绪时初始化，避免重复监听。
- 只读写风格键，不改 `ops_theme`；变更时发出 `ops:style-changed`，detail 为 `{style}`。
- CSS 统一暴露 `--ops-page`、`--ops-surface`、`--ops-surface-muted`、`--ops-text`、`--ops-muted`、`--ops-border`、`--ops-accent`、`--ops-radius`、`--ops-shadow`，供原生 VitaFlow 共用。
- Coordinator 新原生挂载根为 `#vitaflow-native`；风格层可对它的上述变量及通用标题/面板做一致覆盖，但不得更改业务结构。避免影响 weight-tracker iframe。

**验收与验证**：

- [x] 先写并运行失败测试，再实现选择、刷新恢复、无效值回退、存储失败提示及其它标签页更新。
- [x] 风格改变同时影响页面背景、卡片、标题、边界或圆角，形成真实差异；四套明暗均有可读对比。
- [x] 不新加网络字体或依赖，不改业务记录、不要求用户重选明暗主题。
- [x] `node --test tests/test_site_style.cjs`、`node --check js/site-style.js`、相关 diff 检查通过。

## Task 2：原生整合可行性核查（Sol，只读）

**问题**：列出把完整 VitaFlow 放入总台同一文档时，ID、函数、DOM 查询、内联事件、样式、导入导出和同步入口的具体冲突；核对现有模块是否可保持存储键与原功能。不给最终架构决定，不写文件。

**已知证据**：静态模板跨项目 ID 与函数名交集为空；模板约 186 个事件属性、完整应用约 315 个函数。DOM 查询和弹窗 body 挂载必须隔离，不能直接无约束拼接。宿主 tab-btn/tab-content 选择器要与内部页面分开。

## Task 3：六级主展示与页面接入（Coordinator）

- [x] 测试后移除教资的首页／项目雷达展示；保留归档数据。
- [x] 六级按已登记 2026-12-12 和北京时间计算日数，处理缺失、无效、当天、已过日期，页面无快照时不虚构倒计时。
- [x] 接入风格选择器和全部模块原生工作区，今日共享记录，原先重点和偏好保留。

## Task 4：原生构建与运行适配（Sol，按已确定接口执行）

**所有权**：`vitaflow/build-native.mjs`、`vitaflow/src/native/runtime.js`、`vitaflow/src/native/ui-handlers.json`、`vitaflow/test-native-workspace.mjs`、生成的 `vitaflow/native-workspace.js` 与 `vitaflow/native-workspace.css`。不改现有源码模块、root app/index/controller、package.json、数据和文档；Coordinator 负责接入和总验收。

**确定路线**：复用现有无快照 `buildHtml({existingHtml:''})`，从生成 HTML 抽取 body、Chart.js、字体样式及应用脚本。生成单实例原生挂载，不使用 iframe、eval、Function 构造器或新依赖。

- 原生挂载根 `#vitaflow-native`；所有应用 CSS 选择器限定该根，处理 :root/html/body、ops-hub-embed 本根样式、逗号／:is 与媒体查询。Font Awesome 字体可作为独有 vendor 样式，动画名称避免污染宿主。
- JS 在闭包中运行，document facade 的 query/getById 只访问挂载根，body 指向该根，createElement 和生命周期监听委托真实 document。一次实例化，不在切 Tab 时重建 Storage hook 或应用状态。
- window facade 保持真实窗口的图表字段与必需方法；VitaFlow 代码中的 location.search 明确注入 browser／私有模式，location.href 指向保留的独立 HTML，location.reload 改为工作区 refresh，不重载总台。现有独立 HTML 保留兼容。
- 仅导出核查所得的 166 个 UI 函数到 window，状态变量留在闭包；导出前检查宿主已有函数冲突。原生内联 handler 的裸 event 保持浏览器原行为。外部7处按ID查询因构建时跨根无重复可保留。
- 公共源码输入不读取 my-schedule.json 或真实内嵌块；生成物不含真实数据，保持 vitaflow_*、私有同步辅助键、IndexedDB 名称兼容。导入、私有连接继续沿用已有冲突保护，不静默替换记录。

**运行接口**：`window.OpsVitaFlowNative`：

- `isReady()` → boolean。
- `activate(view, day?)` → 原生切区并刷新图表尺寸；只接受 `energyOverview/dailyPlan/energyTrends/creativeSpace/physical/emotional/focus/meaning`。首页传入北京时间日期，刷新日程选日与评分日期；工作区内部导航不强制改日。
- `setTheme('dark'|'light')` → 挂载根 data-ops-theme 属性。
- `getSummary(day)` → `{accounts:[{key,label,score}],todos:[{id,text,completed,account}],completed,total,storage,conflict,error}`，四个类别恒在、缺失分数为 null，仅展示已有记录，保留原id类型；读取失败给error标记，不改原记录。
- `toggleTodo(id)` → 复用原函数并发送数据更新事件，供今日直接完成同一条待办。
- `connect(url,key)` → Promise `{connected,conflict}`；显式私有API为URL origin + `/api/data`，复用原鉴权/并发逻辑，保存设置仍由Coordinator的宿主controller负责。连接失败保留本机可用数据，不宣称已连接。
- `useBrowser()` → 停止旧同步定时器与上传，切回浏览器模式，不清空记录或冲突凭据。
- `refresh()` → 从既有存储重读并刷新工作区。导入后也调用此接口。
- 全局事件 `ops:vitaflow-ready`、`ops:vitaflow-data`，只需传 `{storage}` 或键名，不广播私人记录／口令。UI函数操作后通知；跨标签变化可由宿主调用 refresh。

**构建接口**：`node build-native.mjs` 生成上述两个文件，`--check` 仅比对，不重写；模块可导出构建／CSS限定函数供测试。使用现有标准库，不动真实数据。

**验证**：先新增失败测试再实现；测试 CSS 不泄漏、无 iframe／私人快照、DOM限定与生命周期单实例、166 UI函数完整导出、browser模式／独立源码URL注入，以及生成物一致性和JS语法。完整浏览器行为由Coordinator执行。

## 最终验收

- [x] 原有待办／精力记录不丢失，相关回归与模块测试通过。
- [x] 浏览器验证原生工作区无 VitaFlow iframe、父子 tab 不互相隐藏、主要模块操作可用、今日共享数据、四风格明暗与窄屏。
- [ ] 公开构建无私人快照，更新文档后提交并发布原站，核验线上版本。

## 进度

本地原生候选完成，待发布：本人已明确选择全部模块。Luna交付风格层，Sol交付原生构建与运行适配，Coordinator完成六级主展示、根导航、首页共享数据和整体验收。17项Python与86项Node、VitaFlow全套通过；真实Chrome逐项核验12个模块入口、动态编辑、图表、数据工具、隔离服务、四风格明暗与窄屏。图表库最初因facade上下文与窗口字段写入出现错误，已先复现再修复，反复切换实例数保持稳定。原始私有JSON SHA-256不变，未重置浏览器或私有原记录；所有样例仅在隔离测试浏览器／服务内。
