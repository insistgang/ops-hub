# 财务工作区访问

财务工作区沿用现有财务站 `https://finance.insistgang.top` 的数据与登录保护；Ops-Hub 只移植展示界面，不生成或托管账本。

使用时先在原财务站完成浏览器登录，回到线上总台的「财务管理」，主动读取账本。总台使用 `credentials: 'include'` 请求固定的 `/data/financial_data.json`，不会收集、保存或转发用户名密码，也不会把响应写入 localStorage、IndexedDB 或公开资产。刷新总台页面后重新读取。

认证失效显示需要登录并清除可见数据；网络故障明确标注上次成功读取的内容。周期支出、账户快照、流水覆盖日期和未核实状态继续采用原站含义。账本更新仍在原财务项目完成。

## 服务器边界

有效配置是 Nginx 的 `sites-available/finance.insistgang.top`（由同名 `sites-enabled` 链接启用），站点级保持原有 `auth_basic` 与 `/etc/nginx/.htpasswd_finance`。密码文件和账本不随总台发布修改。

仅精确路径 `/data/financial_data.json` 开启 CORS：来源为 `https://insistgang.top` 时返回相同的 Allow-Origin、Allow-Credentials: true 和 Vary: Origin；不接受通配来源。GET/HEAD 继承原站认证，匿名返回 401。OPTIONS 仅返回 204 无数据预检，允许 GET、HEAD 与 Authorization 请求头，不绕过正式读取的认证。响应使用 `Cache-Control: private, no-store, max-age=0`。

本地 file 或 localhost 的来源没有获准读取真实账本；测试使用隔离的合成响应，日常使用线上总台或原财务站。

## 维护与回滚

修改配置前在服务器仅 root 可读目录保留原文件，记录密码文件和账本的完整性校验；不输出密码或哈希内容。执行 `nginx -t` 成功后才重载，失败恢复备份，其他域名配置不变。

2026-11-07 本次备份保存在服务器 root 专用备份目录，完整路径保留于本机忽略的任务证据中。原站已有部署工具支持 `FINANCE_BASIC_AUTH` 做认证验证；其凭据继续由原项目配置管理，总台不修改 CI 或 Secret。

每次维护后检查：匿名首页和数据均为 401；总台来源的数据 401 仍带准确 CORS 头；其他来源不返回 Allow-Origin；预检为空；密码文件和账本内容未变。合法登录后的真实数据读取由持有原站凭据的浏览器完成，未获得凭据时不能声称已验证真实账本登录成功。
