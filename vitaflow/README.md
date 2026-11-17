# VitaFlow 维拓流 · 四账户精力管家

Ops-Hub「日程与精力」原生工作区与同步服务源码，零 npm 依赖（纯 Node 内置模块 + 本地离线静态资源）。

## 目录结构

```text
vitaflow/
├── src/
│   ├── schedule-template.html  # 工作区模板
│   ├── styles.css              # 原生工作区与独立版共用样式
│   ├── app.js                  # 主应用壳
│   ├── modules/*.js            # 日历待办、健康工具、创作空间、同步等模块
│   └── native/                 # Ops-Hub 单实例 DOM/上下文适配与 UI 白名单
├── vendor/                     # 离线内置 Chart.js 4.4.0 与 Font Awesome 6 WOFF2
├── build-html.mjs              # 生成无私人快照的独立单文件 schedule-system-2.0.html
├── build-native.mjs            # 生成挂载 #vitaflow-native 的 native-workspace.{js,css}
├── local-sync-server.mjs       # 同步服务端（支持口令鉴权、revision 并发保护、公开只读子集）
├── strip-embedded-data.mjs     # 剥离 HTML 内嵌私人快照过滤器
└── tests/                      # 单元与安全回归测试套件
```

## 构建与验证

在仓库根目录执行 `node build.mjs`（或在本目录执行 `npm run build:html`）可同步生成 `schedule-system-2.0.html` 与 `native-workspace.{js,css}`。修改前端产物后需同步提升根目录 `index.html` 中对应 `?v=` 版本号。

```bash
npm run build:html   # 同时更新独立版 HTML 与 Ops-Hub 原生工作区产物
npm test             # 运行 tests/ 下全部回归测试并校验原生产物一致性
```

## 数据与隐私边界

- **现行云端真源**：日常通过 Ops-Hub 原生工作区与阿里云 `ops-vita-sync` 服务（或本机回环桥接 `scripts/vitaflow-local-bridge.mjs`）同步，详见 `../docs/aliyun-vita-sync.md`。
- **旧本地副本退役**：旧版 `my-schedule.json` 已于 2026-11-08 退役删除，不得从旧副本或历史导出反向覆盖云端。
- **公开安全防线**：默认构建主动剥离任何内嵌快照，`sync-token.txt` 与本地数据始终由 `.gitignore` 排除。可选执行 `npm run setup` 安装 Git clean filter 作为额外防线。
