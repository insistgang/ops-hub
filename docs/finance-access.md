# 财务工作区访问

财务工作区沿用原财务站 `https://finance.insistgang.top` 的数据；Ops-Hub 只移植展示界面，不生成或托管账本。

## 当前状态（2026-11-14 实测）

**财务站需要登录。** 2026-11-14 匿名访问首页与数据路径均返回 HTTP 401；Ops-Hub 代码仓库保持公开，不代表私人财务账本公开。以前 11/07--11/10 的匿名 200 是历史状态，不能用来判断现在。

- 数据地址：`https://finance.insistgang.top/data/financial_data.json`
- 账本不进入 Ops-Hub 仓库、公开产物或浏览器持久化存储；不得写入银行卡号、身份证号、密码等凭据。
- 总台未经登录读取遇到 401/403 时应如实显示需要授权，不索取或保存密码。
- 不擅自关闭认证、开放数据，或修改网站及服务器配置；任何对外发布另设确认点。

## 账本写入与自动读取

- **默认自动读取**：按本人 2026-11-10 的要求，总台打开即读取账本，不再需要手动点击「读取 / 刷新财务记录」。按钮保留为手动重试入口。读取失败如实提示，账本仍只在页面内存中保留。
- **日记同步**：`scripts/finance_sync.py` 从知识库日记读取已明确的个人实付合计；不自动把未核实转账当成应收，不猜付款账户。当日未结束时保留待核状态。发布必须另经主人确认，并保留服务器备份。

## 服务器边界

匿名 401 表示当前保护生效，但不能据此推断登录后 CORS 或各端凭据状态。Nginx 与 CORS 应以服务器实际配置和经过授权的验证为准；不要为了让总台读取而关闭认证或开放通配来源。

## 历史恢复方法（归档，不要直接执行）

当前登录保护已开启。以下仅保留 2026-11-07 的历史命令，当前配置前缀未核实，未经主人确认不得重跑或改动服务器。

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

当前文档与项目规则均已标注「需要登录」；未来如需更改权限，须先经主人独立确认并核对实际配置。

总台财务工作区默认尝试读取该接口；未经授权时会收到 401/403，页面应如实提示。不要在公开仓库或浏览器持久化存储中放置凭据。

## 维护与回滚

修改配置前在服务器仅 root 可读目录保留原文件并记录账本完整性校验；不输出密码或哈希内容。执行 `nginx -t` 成功后才重载，失败恢复备份，其他域名配置不变。
