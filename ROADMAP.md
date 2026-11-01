# Ops-Hub 维护记录

## 当前状态

- 2026-11-02 03:25：原独立 `weight-tracker` 本地目录已移入废纸篓，远端仓库已删除；通用体重模块继续在 `weight-tracker/` 维护，Supabase 云端服务未改动。

- 2026-11-02 03:20：新增「体重管理」Tab，接入通用 `weight-tracker/` 本地版，支持多使用者、目标体重、趋势、历史记录和本机小组，不使用原三人 Supabase。

- 2026-11-02 03:08：VitaFlow 项目整体迁入 `vitaflow/`；原独立远端 `insistgang/vitaflow` 已删除，原 Git 元数据移入废纸篓，本地日程与口令原样保留且未提交。

- 2026-11-02 03:01：新增 VitaFlow 本地接入 Tab，在总台内嵌 VitaFlow 单页应用；地址与口令仅存浏览器，数据真源仍为 `my-schedule.json`，公开页面不含私人日程。

- 2026-10-29 22:41：校准个人规则为同时最多 3 件活跃事项、单时段聚焦一件；起床和停止时间以当月计划为准，结束旧补剂自动提醒。JSON 与 file 模式 JS 镜像同步更新。
- 求职、设备及项目数据保持各自来源；本次未采集或推送运行快照。

## 验证

- 2026-11-02 03:25：删除前通用版文件与测试复核通过；远端 `insistgang/weight-tracker` 查询确认不存在，原本地路径已清空。

- 2026-11-02 03:20：通用体重模块 17 项测试通过；Chrome 实测 Tab 可见，创建使用者并保存 70.5kg 记录成功，目标体重与本机 localStorage 均正确；公开仓库未写入测试体重数据。

- 2026-11-02 03:08：VitaFlow 全套 npm 测试、Ops-Hub 9 项 unittest 与 JS 语法检查通过；新路径下 VitaFlow 页面、同步 API 与 Ops-Hub 均返回 200；远端 vitaflow 已确认不存在。

- 2026-11-02 03:01：`node --check js/app.js` 通过；Chrome 实测 VitaFlow Tab 与 iframe 均可见，地址指向本机 8787 服务，VitaFlow 页面返回 200；公开仓库未写入访问口令。

- 数据镜像一致性、CLI 当前 WIP 与到期提醒检查通过；既有 7 项 unittest 全部通过，JS 语法检查通过。
