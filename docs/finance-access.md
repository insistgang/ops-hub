# 财务工作区访问

财务工作区沿用原财务站 `https://finance.insistgang.top` 的数据；Ops-Hub 只移植展示界面，不生成或托管账本。

## 当前状态（2026-11-07 23:31 起）

**Basic Auth 已关闭，账本公开可读。** 这是本人明确决定，不是配置事故。

- 公开地址：`https://finance.insistgang.top/data/financial_data.json`
- 匿名访问返回 200，内容包含周期概况、账户与应收、流水汇总与复盘指标（2026-11-10 实测 80465 字节）
- 仓库内不保存该 JSON；`data/private/` 与 `data/knowledge.json` 仍 git-ignore
- 总台仍只在页面内存中保留账本，不写 localStorage、IndexedDB 或公开快照
- 2026-11-10 复核：服务器上两行确为 `# public access:` 前缀注释；匿名 GET `/data/financial_data.json` 返回 200（2026-11-10 实测 80465 字节，随日记同步持续增长）；`/etc/nginx/.htpasswd_finance` 凭据文件仍在，可随时恢复

### 公开的代价（已确认接受）

任何知道该地址的人都能直接下载账本，包括总资产、可用现金、账户分布、应收对象与每日支出。搜索引擎爬虫也可能收录。**不要**再往该 JSON 里写入银行卡号、身份证号、密码或任何凭据类信息。

## 账本写入与自动读取

- **默认自动读取**：按本人 2026-11-10 的要求，总台打开即读取账本，不再需要手动点击「读取 / 刷新财务记录」。按钮保留为手动重试入口。读取失败如实提示，账本仍只在页面内存中保留。
- **日记同步**：`scripts/finance_sync.py` 从知识库日记读「当日个人实付支出合计」写入账本。只加不改，重复运行不会产生重复记录；日记缺失的日期不补零。更新后的账本通过服务器 release 目录发布（`/var/www/.finance-releases/`，`/var/www/finance/data/financial_data.json` 是指向当前 release 的符号链接）。

## 服务器边界

有效配置是 Nginx 的 `sites-available/finance.insistgang.top`（由同名 `sites-enabled` 链接启用）。`auth_basic` 两行以 `# public access:` 前缀注释保留（2026-11-07 23:31 关闭鉴权时改写），便于恢复。下方恢复命令按这个实际前缀编写；若日后改写注释前缀，必须同步改命令，否则 `sed` 会静默匹配不到、恢复步骤看似执行实则无效。

仅精确路径 `/data/financial_data.json` 开启 CORS：来源为 `https://insistgang.top` 时返回相同的 Allow-Origin、Allow-Credentials: true 和 Vary: Origin；不接受通配来源。GET/HEAD 当前无需认证即可读取；OPTIONS 仅返回 204 无数据预检，允许 GET、HEAD 与 Authorization 请求头。响应使用 `Cache-Control: private, no-store, max-age=0`。

## 恢复登录保护

```bash
ssh aliyun
sudo cp /etc/nginx/sites-available/finance.insistgang.top /root/finance.nginx.bak.$(date +%s)
# 注意：匹配前缀必须与服务器实际注释一致（当前为 `# public access:`）。
# 同一个模式同时覆盖两行，因为 `_user_file` 后缀会被原样保留。
# 该命令在服务器（GNU sed 4.8）实测通过，补丁后 `nginx -t` 通过。
# 提醒：`sed -i` 的两种写法不通用——服务器是 GNU sed 可用 `sed -i 's|...|...|'`，本机 macOS 是 BSD sed 需写成 `sed -i '' 's|...|...|'`。
sudo sed -i 's|^    # public access: auth_basic|    auth_basic|' \
  /etc/nginx/sites-available/finance.insistgang.top
sudo nginx -t && sudo systemctl reload nginx
curl -s -o /dev/null -w '%{http_code}\n' https://finance.insistgang.top/data/financial_data.json   # 期望 401
```

恢复后需同步把本文档、`AGENTS.md` 与财务工作区文案改回「需要登录」。

另注意：总台财务工作区当前默认自动读取该接口，恢复鉴权后自动读取会失败，页面会如实提示「读取失败，尚无可展示的财务记录」（见 `finance/src/runtime.js`）。届时需另行决定是改回手动读取，还是为总台配置凭据；不要在公开仓库里存凭据。

## 维护与回滚

修改配置前在服务器仅 root 可读目录保留原文件并记录账本完整性校验；不输出密码或哈希内容。执行 `nginx -t` 成功后才重载，失败恢复备份，其他域名配置不变。
