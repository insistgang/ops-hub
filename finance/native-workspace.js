(function (realWindow, realDocument) {
  if (realWindow.OpsFinanceNative) return;
  const root = realDocument.getElementById('finance-native');
  if (!root) return;
  const html = "<header class=\"finance-heading\">\n  <div><h2 id=\"finance-app-heading\">财务工作区</h2><p>查看已有记录的收支、资产与复盘。未登记的数据保持未知。</p></div>\n  <div class=\"finance-actions\"><button id=\"finance-refresh\" type=\"button\">读取 / 刷新财务记录</button><a href=\"https://finance.insistgang.top/\" target=\"_blank\" rel=\"noopener noreferrer\">打开财务站 ↗</a></div>\n</header>\n<p id=\"finance-access-note\">账本已开放只读：本页直接读取，无需登录，也不保存任何账本内容。若接口要求认证（保护被重新开启），本页不会索取密码。</p>\n<div id=\"finance-header-badge\" role=\"status\" aria-live=\"polite\"><span id=\"finance-header-badge-text\" data-finance-value>尚未读取财务记录</span></div>\n<nav id=\"finance-tab-bar\" class=\"finance-tabs\" aria-label=\"财务分区\" role=\"tablist\">\n  <button id=\"finance-tab-overview\" type=\"button\" role=\"tab\" data-finance-tab=\"overview\" aria-controls=\"finance-panel-overview\" aria-selected=\"true\">收支概览</button>\n  <button id=\"finance-tab-assets\" type=\"button\" role=\"tab\" data-finance-tab=\"assets\" aria-controls=\"finance-panel-assets\" aria-selected=\"false\">资产与应收</button>\n  <button id=\"finance-tab-spend\" type=\"button\" role=\"tab\" data-finance-tab=\"spend\" aria-controls=\"finance-panel-spend\" aria-selected=\"false\">逐笔收支 <span id=\"finance-tab-badge-spend\" data-finance-value hidden></span></button>\n  <button id=\"finance-tab-review\" type=\"button\" role=\"tab\" data-finance-tab=\"review\" aria-controls=\"finance-panel-review\" aria-selected=\"false\">复盘与行动</button>\n</nav>\n<div class=\"finance-period finance-card\">\n  <h3 id=\"finance-period-title\" data-finance-value>选择已记录的期间</h3>\n  <div class=\"finance-period-controls\">\n    <button id=\"finance-period-week\" type=\"button\" data-finance-period=\"week\" aria-pressed=\"false\">周</button><button id=\"finance-period-month\" type=\"button\" data-finance-period=\"month\" aria-pressed=\"true\">月</button><button id=\"finance-period-year\" type=\"button\" data-finance-period=\"year\" aria-pressed=\"false\">年</button>\n    <button id=\"finance-period-prev\" type=\"button\" aria-label=\"上一期间\">←</button><label class=\"finance-sr-only\" for=\"finance-period-select\">已记录期间</label><select id=\"finance-period-select\"></select><button id=\"finance-period-next\" type=\"button\" aria-label=\"下一期间\">→</button>\n  </div>\n  <p id=\"finance-period-status\" role=\"status\" aria-live=\"polite\" data-finance-value>尚未读取</p><p id=\"finance-period-coverage\" data-finance-value>日期缺口不会自动补零。</p><p id=\"finance-period-availability\" data-finance-value></p><p id=\"finance-period-sources\" data-finance-value></p>\n</div>\n<div id=\"finance-chart-error\" class=\"finance-notice\" hidden><span id=\"finance-chart-error-text\"></span><button id=\"finance-chart-retry\" type=\"button\">重试图表</button></div>\n<section id=\"finance-panel-overview\" data-finance-panel=\"overview\" role=\"tabpanel\" aria-labelledby=\"finance-tab-overview\">\n  <div class=\"finance-grid finance-kpis\">\n    <article class=\"finance-card\"><h3>已记录收入</h3><strong id=\"finance-kpi-income\" data-finance-value>—</strong><p id=\"finance-kpi-income-sub\" data-finance-value></p></article>\n    <article class=\"finance-card\"><h3>已记录开支</h3><strong id=\"finance-kpi-expense\" data-finance-value>—</strong><p id=\"finance-detail-routine\" data-finance-value></p></article>\n    <article class=\"finance-card\"><h3>期间结余</h3><strong id=\"finance-kpi-period-net\" data-finance-value>—</strong><span id=\"finance-kpi-savings\" data-finance-value></span></article>\n    <article class=\"finance-card\"><h3>结余率</h3><strong id=\"finance-kpi-period-rate\" data-finance-value>—</strong><p>收入未登记时不计算比例。</p></article>\n    <article class=\"finance-card\"><h3>日常逐笔日均</h3><strong id=\"finance-kpi-daily\" data-finance-value>—</strong><p id=\"finance-kpi-daily-note\" data-finance-value></p></article>\n  </div>\n  <div class=\"finance-grid\">\n    <article id=\"finance-income-composition\" class=\"finance-card\"><h3>收入组成 <span id=\"finance-income-total-badge\" data-finance-value></span></h3><div id=\"finance-income-pie-chart\" class=\"finance-chart\"></div><div id=\"finance-income-bar\" class=\"finance-bar\" data-finance-dynamic></div><div id=\"finance-income-legend\" data-finance-dynamic></div></article>\n    <article id=\"finance-expense-composition\" class=\"finance-card\"><h3>开支组成 <span id=\"finance-period-tag\" data-finance-value></span></h3><p id=\"finance-composition-status\" data-finance-value></p><span id=\"finance-expense-count-tag\" data-finance-value></span><div id=\"finance-expense-pie-chart\" class=\"finance-chart\"></div><div id=\"finance-expense-list\" data-finance-dynamic></div></article>\n  </div>\n  <article id=\"finance-period-trend-section\" class=\"finance-card\"><h3 id=\"finance-trend-title\" data-finance-value>期间趋势</h3><p id=\"finance-trend-note\" data-finance-value></p><div id=\"finance-trend-bar-chart\" class=\"finance-chart finance-chart-wide\"></div></article>\n  <div class=\"finance-grid\"><article class=\"finance-card\"><h3>结余观察</h3><strong id=\"finance-savings-rate-val\" data-finance-value>—</strong><div class=\"finance-bar\"><div id=\"finance-savings-rate-bar\"></div></div><p id=\"finance-savings-rate-note\" data-finance-value></p></article><article class=\"finance-card\"><h3>一次性支出占比</h3><strong id=\"finance-onetime-val\" data-finance-value>—</strong><div class=\"finance-bar\"><div id=\"finance-onetime-bar\"></div></div><p id=\"finance-onetime-note\" data-finance-value></p></article></div>\n</section>\n<section id=\"finance-panel-assets\" data-finance-panel=\"assets\" role=\"tabpanel\" aria-labelledby=\"finance-tab-assets\" hidden>\n  <article id=\"finance-snapshot-summary\" class=\"finance-card\"><h3 id=\"finance-hero-headline\" data-finance-value>尚未读取资产记录</h3><p id=\"finance-hero-desc\" data-finance-value></p><p id=\"finance-asset-snapshot-note\" data-finance-value></p></article>\n  <div class=\"finance-grid finance-kpis\"><article class=\"finance-card\"><h3>总资产</h3><strong id=\"finance-kpi-total-assets\" data-finance-value>—</strong><p id=\"finance-kpi-assets-note\" data-finance-value></p><p id=\"finance-kpi-receivables-note\" data-finance-value></p></article><article class=\"finance-card\"><h3>即时可用现金</h3><strong id=\"finance-kpi-cash\" data-finance-value>—</strong></article><article class=\"finance-card\"><h3>净资产口径</h3><strong id=\"finance-kpi-net-assets\" data-finance-value>—</strong></article><article class=\"finance-card\"><h3>续航参考</h3><strong id=\"finance-kpi-runway\" data-finance-value>—</strong></article></div>\n  <article class=\"finance-card\"><h3>资产分层 <span id=\"finance-asset-layer-badge\" data-finance-value></span></h3><div class=\"finance-grid\"><div id=\"finance-asset-donut-chart\" class=\"finance-chart\"></div><div id=\"finance-asset-layer-list\" data-finance-dynamic></div></div></article>\n  <article class=\"finance-card\"><h3>账户记录 <span id=\"finance-assets-badge\" data-finance-value></span></h3><p id=\"finance-accounts-title\" data-finance-value></p><div id=\"finance-accounts-grid\" class=\"finance-grid\" data-finance-dynamic></div></article>\n  <article class=\"finance-card\"><h3>应收记录 <span id=\"finance-receivables-count\" data-finance-value></span></h3><strong id=\"finance-receivables-total\" data-finance-value>—</strong><div id=\"finance-receivables-grid\" class=\"finance-grid\" data-finance-dynamic></div></article>\n</section>\n<section id=\"finance-panel-spend\" data-finance-panel=\"spend\" role=\"tabpanel\" aria-labelledby=\"finance-tab-spend\" hidden>\n  <p id=\"finance-detail-range-note\" data-finance-value></p><article id=\"finance-income-details-section\" class=\"finance-card\"><h3>收入明细 <span id=\"finance-income-detail-tag\" data-finance-value></span></h3><div id=\"finance-income-detail-list\" data-finance-dynamic></div><p id=\"finance-income-detail-footnote\" data-finance-value></p></article>\n  <article id=\"finance-txn-section\" class=\"finance-card\"><h3>逐笔开支 <span id=\"finance-txn-coverage-badge\" data-finance-value></span></h3><p id=\"finance-txn-subtitle\" data-finance-value></p><div id=\"finance-txn-daily-chart\" class=\"finance-chart finance-chart-wide\"></div><div id=\"finance-txn-stat-cards\" class=\"finance-grid\" data-finance-dynamic></div><div id=\"finance-txn-filters\" class=\"finance-filters\" data-finance-dynamic></div><div id=\"finance-txn-list\" data-finance-dynamic></div><p id=\"finance-txn-footnote\" data-finance-value></p></article>\n</section>\n<section id=\"finance-panel-review\" data-finance-panel=\"review\" role=\"tabpanel\" aria-labelledby=\"finance-tab-review\" hidden>\n  <p id=\"finance-review-snapshot-note\" data-finance-value></p><article class=\"finance-card\"><h3>历史对照</h3><div id=\"finance-legacy-history\" data-finance-dynamic></div></article><article class=\"finance-card\"><h3>诊断记录 <span id=\"finance-health-avg-badge\" data-finance-value></span></h3><div id=\"finance-health-score-list\" class=\"finance-grid\" data-finance-dynamic></div></article><article class=\"finance-card\"><h3>行动项</h3><div id=\"finance-action-list\" class=\"finance-grid\" data-finance-dynamic></div></article>\n  <article class=\"finance-card\"><h3>口径与边界</h3><dl><dt>续航参考</dt><dd id=\"finance-philosophy-runway\" data-finance-value>—</dd><dt>可用现金</dt><dd id=\"finance-philosophy-cash\" data-finance-value>—</dd><dt>应收款</dt><dd id=\"finance-philosophy-receivables\" data-finance-value>—</dd><dt>资产日期</dt><dd id=\"finance-philosophy-date\" data-finance-value>—</dd></dl><p id=\"finance-liabilities-note\" data-finance-value></p></article>\n</section>\n";
  root.innerHTML = html;
  const document = {
    getElementById(id) { return String(id).startsWith('finance-') ? root.querySelector('#' + id) : null; },
    querySelectorAll: selector => root.querySelectorAll(selector),
    createElement: (...args) => realDocument.createElement(...args),
    head: realDocument.head
  };
  const window = realWindow;
  const requestAnimationFrame = callback => realWindow.requestAnimationFrame ? realWindow.requestAnimationFrame(callback) : setTimeout(callback, 0);
  const lucide = { createIcons: (...args) => realWindow.lucide?.createIcons(...args) };
  // Reused financial derivation and rendering; no upstream HTML defaults or ledger are included.
let financialData = null;
    const dataState = { lastSuccess: null, error: null, loading: false };
    let loadVersion = 0;
    const periodState = { mode: 'month', anchor: null };
    let derived = null;

    const iso = d => d.toISOString().slice(0, 10);
    const dayDate = value => new Date(value + 'T00:00:00Z');
    const addDays = (value, count) => { const d = dayDate(value); d.setUTCDate(d.getUTCDate() + count); return iso(d); };
    const roundMoney = n => Math.round((n + Number.EPSILON) * 100) / 100;
    const sumMoney = rows => roundMoney(rows.reduce((n, r) => n + Number(r.amount), 0));
    function periodRange(mode, anchor) {
      if (mode === 'week') {
        const start = addDays(anchor, -((dayDate(anchor).getUTCDay() + 6) % 7));
        return { start, end: addDays(start, 6) };
      }
      const start = mode === 'year' ? anchor.slice(0, 4) + '-01-01' : anchor.slice(0, 7) + '-01';
      const d = dayDate(start);
      if (mode === 'year') d.setUTCFullYear(d.getUTCFullYear() + 1);
      else d.setUTCMonth(d.getUTCMonth() + 1);
      return { start, end: addDays(iso(d), -1) };
    }
    function monthlyRows(data) {

      return data.monthlySummaries || [{ period: data.period, through: data.asOf,
        income: data.summary.incomeTotal, expense: data.summary.expenseTotal,
        coverage: 'partial', detailAvailable: true, source: '本月复盘', note: '旧版数据仅覆盖本月' }];
    }
    function detailDatasets(data) {
      return [...Object.values(data.periodDatasets || {}), data];
    }
    function availablePeriods(data, mode) {
      const anchor = data.asOf || data.period + '-01';
      if (mode === 'month') return monthlyRows(data).map(m => m.period + '-01').sort();
      if (mode === 'year') return [...new Set(monthlyRows(data).map(m => m.period.slice(0, 4) + '-01-01'))].sort();
      const values = new Set();
      detailDatasets(data).forEach(dataset => {
        const end = periodRange('week', dataset.asOf).start;
        for (let d = periodRange('week', dataset.period + '-01').start; d <= end; d = addDays(d, 7)) values.add(d);
      });
      return [...values].sort();
    }
    function groupAmounts(items, key) {
      const groups = new Map();
      items.forEach(item => {
        const name = item[key] || '未分类';
        const row = groups.get(name) || { category: name, source: name, amount: 0, count: 0, color: item.color, desc: '所选期间逐笔汇总' };
        row.amount = roundMoney(row.amount + Number(item.amount)); row.count++;
        groups.set(name, row);
      });
      return [...groups.values()].sort((a, b) => b.amount - a.amount);
    }
    function derivePeriod(data, state) {
      const mode = state.mode;
      const anchor = state.anchor || data.asOf;
      const range = periodRange(mode, anchor);
      const contains = value => value >= range.start && value <= range.end;
      const months = monthlyRows(data).filter(m => contains(m.period + '-01'));
      const datasets = detailDatasets(data);
      const incomeDetails = datasets.flatMap(dataset => (dataset.incomeDetails || []).map(item => ({ ...item,
        date: /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : dataset.period + '-' + String(item.date).split('-').pop().padStart(2, '0')
      }))).filter(item => contains(item.date));
      const items = datasets.flatMap(dataset => dataset.transactions?.items || []).filter(item => contains(item.date));
      const detailTotal = sumMoney(items);
      const detailIncome = sumMoney(incomeDetails);
      const hasExpense = mode === 'week' ? items.length > 0 || datasets.some(dataset => dailyRows(dataset.transactions || {}).some(row =>
        contains(dataset.period + '-' + String(row.day).padStart(2, '0')) && row.recordStatus === 'confirmed_zero')) : months.length > 0;
      const hasIncome = mode === 'week' ? incomeDetails.length > 0 || datasets.some(dataset =>
        dataset.incomeRecordStatus !== 'unrecorded' && (dataset.incomeDetails || []).length > 0 && range.start <= dataset.asOf && range.end >= dataset.period + '-01') : months.length > 0;
      const periodIncomeUnknown = mode !== 'week' && months.some(m => m.incomeRecordStatus === 'unrecorded' || m.income === null || m.income === undefined);
      const periodExpenseUnknown = mode !== 'week' && months.some(m => m.expense === null || m.expense === undefined);
      const incomeTotal = hasIncome && !periodIncomeUnknown ? (mode === 'week' ? detailIncome : roundMoney(months.reduce((n, m) => n + m.income, 0))) : null;
      const expenseTotal = hasExpense && !periodExpenseUnknown ? (mode === 'week' ? detailTotal : roundMoney(months.reduce((n, m) => n + m.expense, 0))) : null;
      const netSavings = incomeTotal === null || expenseTotal === null ? null : roundMoney(incomeTotal - expenseTotal);
      const missingMonths = mode === 'year' ? Array.from({ length: 12 }, (_, i) => range.start.slice(0, 4) + '-' + String(i + 1).padStart(2, '0')).filter(m => !months.some(row => row.period === m)) : [];
      const sourceDays = new Map(datasets.flatMap(dataset => dailyRows(dataset.transactions || {}).map(d => [dataset.period + '-' + String(d.day).padStart(2, '0'), d])));
      const days = [];
      for (let d = range.start; d <= range.end; d = addDays(d, 1)) {
        const source = sourceDays.get(d);
        const known = source && ['recorded', 'confirmed_zero', 'pending_review'].includes(source.recordStatus);
        days.push({ ...(source || {}), day: d, date: d, recordStatus: source ? source.recordStatus : 'missing',
          routine: known ? source.routine : null, capital: known ? source.capital : null, total: known ? source.total : null });
      }
      const byCategory = groupAmounts(items, 'category');
      const unitemized = expenseTotal === null ? null : roundMoney(expenseTotal - detailTotal);
      const expenseStructure = byCategory.map(row => ({ ...row }));
      if (unitemized > 0) expenseStructure.push({ category: '仅汇总·未逐笔拆分', amount: unitemized, color: '#94a3b8', desc: '历史复盘或本月尚未逐笔拆分的已记录金额，不虚构分类' });
      const incomeBreakdown = groupAmounts(incomeDetails, 'source');
      const incomeRemainder = incomeTotal === null ? null : roundMoney(incomeTotal - detailIncome);
      if (incomeRemainder > 0) incomeBreakdown.push({ source: '仅汇总·未逐笔拆分', amount: incomeRemainder });
      const detailRanges = datasets.map(dataset => ({
        start: range.start > dataset.period + '-01' ? range.start : dataset.period + '-01',
        end: range.end < dataset.asOf ? range.end : dataset.asOf
      })).filter(r => r.start <= r.end).sort((a, b) => a.start.localeCompare(b.start));
      const detailRange = detailRanges.length ? detailRanges.map(r => `${r.start} 至 ${r.end}`).join('；') : '无逐笔覆盖';
      const label = mode === 'year' ? range.start.slice(0, 4) + ' 年' : mode === 'month' ? range.start.slice(0, 7) : `${range.start} 至 ${range.end}`;
      const routineTotal = sumMoney(items.filter(i => i.kind === 'routine'));
      const oneTimeTotal = sumMoney(items.filter(i => i.kind === 'capital'));
      const family = sumMoney(incomeDetails.filter(i => i.kind === '家庭支持'));
      const detailOnly = unitemized === 0 && mode !== 'year';
      const knownDays = days.filter(d => d.total !== null).length;
      const gaps = days.filter(d => d.total === null).map(d => d.date);
      const incomeUnknown = months.some(m => m.incomeRecordStatus === 'unrecorded');
      const incomeNote = incomeUnknown ? ' 存在未登记收入的月份，收入与结余不作零值推断。' : '';
      const notes = incomeNote + (mode === 'week'
        ? `逐笔覆盖 ${detailRange}；${gaps.length ? `缺口 ${gaps.join('、')}，未按 0 处理。` : '本周日期均有记录状态。'}待核记录仍非确认零消费。`
        : `汇总覆盖 ${months.map(m => `${m.period}（截至 ${m.through}）`).join('、') || '无'}；${missingMonths.length ? `无汇总月份 ${missingMonths.join('、')}，未按 0 处理；` : ''}逐笔覆盖 ${detailRange}。`);
      const trend = mode === 'year' ? Array.from({ length: 12 }, (_, i) => {
        const key = range.start.slice(0, 4) + '-' + String(i + 1).padStart(2, '0');
        const m = months.find(r => r.period === key);
        return { month: key, income: m && m.incomeRecordStatus !== 'unrecorded' ? m.income ?? null : null, expense: m?.expense ?? null,
          savings: m && m.incomeRecordStatus !== 'unrecorded' ? roundMoney(m.income - m.expense) : null };
      }) : days.map(d => {
        const income = incomeDetails.filter(i => i.date === d.date);
        const inDetailRange = datasets.some(dataset => dataset.incomeRecordStatus !== 'unrecorded'
          && (dataset.incomeDetails || []).length > 0 && d.date >= dataset.period + '-01' && d.date <= dataset.asOf);
        const value = inDetailRange ? sumMoney(income) : null;
        return { month: d.date.slice(5), income: value, expense: d.total,
          savings: value === null || d.total === null ? null : roundMoney(value - d.total) };
      });
      const count = items.length;
      const recordedDays = new Set(items.map(i => i.date)).size;
      const incomeKinds = groupAmounts(incomeDetails, 'kind');
      if (incomeRemainder > 0) incomeKinds.push({ source: '仅汇总·未逐笔拆分', amount: incomeRemainder });
      return { mode, anchor, range, label, months, missingMonths, notes,
        status: !hasExpense && !hasIncome ? 'empty' : 'partial',
        detailRange, detailTotal, detailIncome, unitemized, incomeRemainder, knownDays,
        summary: { incomeTotal, expenseTotal, netSavings,
          savingsRate: incomeTotal && !incomeUnknown ? roundMoney(netSavings / incomeTotal * 100) : null,
          routineTotal, oneTimeTotal, oneTimeRatio: detailTotal ? roundMoney(oneTimeTotal / detailTotal * 100) : null,
          dailyAverageRoutine: detailOnly && knownDays ? roundMoney(routineTotal / knownDays) : null,
          netSavingsExcludeFamily: detailOnly && incomeRemainder === 0 && netSavings !== null ? roundMoney(netSavings - family) : null },
        incomeDetails, incomeBreakdown, incomeKinds, expenseStructure, trend,
        transactions: { items, count, total: detailTotal, byCategory, byDay: days, maxDay: days.length,
          recordedDays, coverage: 'partial', coverageRatio: expenseTotal ? roundMoney(detailTotal / expenseTotal * 100) : 0,
          avgPerItem: count ? roundMoney(detailTotal / count) : 0,
          avgPerRecordedDay: recordedDays ? roundMoney(detailTotal / recordedDays) : 0,
          maxItem: count ? items.reduce((a, b) => a.amount >= b.amount ? a : b) : null,
          note: `${notes} 逐笔支出 ${detailTotal.toFixed(2)} 元；未逐笔拆分 ${unitemized === null ? '未知' : unitemized.toFixed(2)} 元。` }
      };
    }
    function selectPeriod(mode, anchor = periodState.anchor) {
      if (!financialData || !['week', 'month', 'year'].includes(mode)) return;
      const choices = availablePeriods(financialData, mode);
      const target = periodRange(mode, anchor || financialData.asOf).start;
      periodState.mode = mode;
      periodState.anchor = choices.includes(target) ? target : choices[choices.length - 1];
      renderDashboard();
    }
    function movePeriod(offset) {
      const choices = availablePeriods(financialData, periodState.mode);
      const index = choices.indexOf(periodRange(periodState.mode, periodState.anchor).start);
      if (choices[index + offset]) selectPeriod(periodState.mode, choices[index + offset]);
    }
    function renderPeriodControls() {
      const d = derived;
      const choices = availablePeriods(financialData, periodState.mode);
      const key = periodRange(periodState.mode, periodState.anchor).start;
      document.getElementById("finance-period-select").innerHTML = choices.map(anchor => {
        const r = periodRange(periodState.mode, anchor);
        const label = periodState.mode === 'week' ? `${r.start} — ${r.end}` : periodState.mode === 'month' ? anchor.slice(0, 7) : anchor.slice(0, 4);
        return `<option value="${escapeHTML(anchor)}"${anchor === key ? ' selected' : ''}>${escapeHTML(label)}</option>`;
      }).join('');
      ['week', 'month', 'year'].forEach(mode => document.getElementById("finance-period-" + mode).setAttribute('aria-pressed', String(mode === periodState.mode)));
      document.getElementById("finance-period-prev").disabled = choices.indexOf(key) <= 0;
      document.getElementById("finance-period-next").disabled = choices.indexOf(key) >= choices.length - 1;
      document.getElementById("finance-period-title").textContent = `${d.label} · 已记录收支`;
      document.getElementById("finance-period-status").textContent = d.status === 'empty' ? '暂无可用记录' : '部分覆盖 · 非完整账单';
      document.getElementById("finance-period-coverage").textContent = d.notes;
      document.getElementById("finance-period-sources").textContent = d.months.map(m => `${m.source}：${m.note}`).join('；') || '来源：本月收入明细与消费流水；收入按实际到账日期归属。';
      document.getElementById("finance-period-availability").textContent = `可选范围：周为 ${detailDatasets(financialData).map(m => m.period).join('、')} 相交周；月 ${monthlyRows(financialData).map(m => m.period).join('、')}；年仅含已有汇总的年份。切换不联网。`;
    }



    const TABS = ['overview', 'assets', 'spend', 'review'];
    const TAB_BASE = 'tab-btn flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-3 text-[13px] sm:text-sm font-medium border-b-2 transition whitespace-nowrap';
    let currentTab = 'overview';

    function switchTab(name) {
  if (!TABS.includes(name)) return false;
  currentTab = name;
  document.querySelectorAll('[data-finance-panel]').forEach(panel => { panel.hidden = panel.dataset.financePanel !== name; panel.classList.toggle('hidden', panel.hidden); });
  document.querySelectorAll('[data-finance-tab]').forEach(button => { const selected = button.dataset.financeTab === name; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; button.classList.toggle('active', selected); });
  scheduleChartPaint();
  return true;
}

    document.getElementById("finance-tab-bar").addEventListener('click', e => {
      const btn = e.target.closest('[data-finance-tab]');
      if (btn) switchTab(btn.dataset.financeTab);
    });










    async function loadRemoteData() { return financeRefresh(); }



    const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));

    const safeColor = value => /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(String(value)) ? value : '#94a3b8';
    const percent = value => Math.max(0, Math.min(100, Number(value) || 0));
    const knownAmount = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
    const yuan = v => knownAmount(v) ? '¥ ' + Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : '未核实';
    const nearYuan = v => knownAmount(v) ? '¥' + Number(v).toLocaleString('zh-CN', { maximumFractionDigits: 0 }) : '未核实';
    const wan = v => knownAmount(v) ? (Number(v) / 10000).toFixed(2) : '未核实';
    const signed = v => knownAmount(v) ? (v >= 0 ? '+¥' : '-¥') + Math.abs(Number(v)).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : '未登记';

    function renderDashboard() {
      if (!financialData) return;
      if (!periodState.anchor) periodState.anchor = financialData.asOf;
      derived = derivePeriod(financialData, periodState);
      renderPeriodControls();
      if (txnFilter !== '全部' && !derived.transactions.byCategory.some(c => c.category === txnFilter)) txnFilter = '全部';
      const s = financialData.summary;
      const p = derived.summary;


      document.getElementById("finance-kpi-total-assets").innerText = yuan(s.totalAssets);
      document.getElementById("finance-kpi-cash").innerText = yuan(s.availableCash);
      document.getElementById("finance-kpi-income").innerText = yuan(p.incomeTotal);
      document.getElementById("finance-kpi-expense").textContent = yuan(p.expenseTotal);
      document.getElementById("finance-kpi-period-net").textContent = knownAmount(p.netSavings) ? signed(p.netSavings) : '暂无数据';
      document.getElementById("finance-kpi-period-rate").textContent = knownAmount(p.savingsRate) ? `${p.savingsRate}%` : '不适用';
      document.getElementById("finance-kpi-daily").textContent = knownAmount(p.dailyAverageRoutine) ? `${yuan(p.dailyAverageRoutine)} / 有状态日` : '仅逐笔子集，不摊日均';
      const assetDate = financialData.assetAsOf || financialData.assetSnapshotDate || financialData.asOf;
      const assetBasis = financialData.assetValuationStatus === 'user_reported' ? '用户自报' : financialData.assetValuationStatus === 'estimated_rollforward' ? '历史顺延暂估' : '账户快照';
      const assetLabel = `${assetDate} ${assetBasis}（基准 ${financialData.assetSnapshotDate || financialData.asOf}）`;
      document.getElementById("finance-asset-snapshot-note").textContent = `${assetLabel} · 不随收支期间变化；${financialData.assetValuationNote || '之后收付未回填余额'}`;
      document.getElementById("finance-review-snapshot-note").textContent = derived.label + ' · 收支按已记录覆盖范围计算；资产采用 ' + assetLabel;
      document.getElementById("finance-trend-title").textContent = `${derived.label} · ${derived.mode === 'year' ? '月度已记录收支' : '逐日已记录收支'}`;
      document.getElementById("finance-trend-note").textContent = derived.mode === 'year' ? '仅汇总已有月份；缺失月份留空，来源与截至日期见覆盖说明。' : '展示已登记日期；缺失日期与未登记收支保留为空。';

      document.getElementById("finance-kpi-assets-note").innerText = `已登记可用现金 ${wan(s.availableCash)} 万`;
      document.getElementById("finance-kpi-receivables-note").innerText = `应收款 ${wan(s.receivablesTotal)} 万`;
      document.getElementById("finance-kpi-runway").innerText = (knownAmount(s.runwayMonths) ? `${s.runwayMonths} 个月` : '未登记');

      document.getElementById("finance-hero-headline").textContent =
        `即时可用现金 ${yuan(s.availableCash)}；${s.valuationProvisional === true ? '暂估总资产' : '总资产'} ${yuan(s.totalAssets)}`;
      document.getElementById("finance-hero-desc").textContent = s.subhead || '';
      const debtConfirmed = ['confirmed_none', 'confirmed_total'].includes(s.liabilitiesStatus)
        && typeof s.liabilities === 'number' && Number.isFinite(s.liabilities) && s.liabilities >= 0
        && (s.liabilitiesStatus !== 'confirmed_none' || s.liabilities === 0)
        && /^\d{4}-\d{2}-\d{2}$/.test(s.liabilitiesConfirmedAt || '');
      const netConfirmed = debtConfirmed && typeof s.totalAssets === 'number' && Number.isFinite(s.totalAssets)
        && typeof s.totalNetAssets === 'number' && Number.isFinite(s.totalNetAssets)
        && Math.abs(s.totalAssets - s.liabilities - s.totalNetAssets) < 0.01;
      document.getElementById("finance-liabilities-note").textContent = debtConfirmed
        ? `负债 ${yuan(s.liabilities)}（记录 ${s.liabilitiesConfirmedAt} 确认）` : '负债未核实';
      document.getElementById("finance-kpi-net-assets").textContent = netConfirmed
        ? `账面净资产 ${yuan(s.totalNetAssets)} · ${assetBasis}` : '净资产未核实（负债或资产缺口）';

      document.getElementById("finance-kpi-income-sub").innerText = `逐笔 ${yuan(derived.detailIncome)} · 仅汇总 ${yuan(derived.incomeRemainder)}`;
      document.getElementById("finance-kpi-savings").innerText = knownAmount(p.netSavings) ? signed(p.netSavings) : '暂无数据';
      document.getElementById("finance-kpi-daily-note").textContent = `日常逐笔 ${yuan(p.routineTotal)}；不与缺失日期或历史汇总混摊。`;
      document.getElementById("finance-savings-rate-val").innerText = knownAmount(p.savingsRate) ? `${p.savingsRate}%` : '不适用';
      document.getElementById("finance-savings-rate-bar").style.width = `${percent(p.savingsRate)}%`;
      document.getElementById("finance-savings-rate-note").innerText = knownAmount(p.netSavingsExcludeFamily)
        ? `已记录结余剔除家庭支持 ${signed(p.netSavingsExcludeFamily)}；非完整账单结论` : '收入或分类覆盖不完整，不推算剔除家庭支持后的完整结余';
      document.getElementById("finance-onetime-val").innerText = knownAmount(p.oneTimeRatio) ? `${p.oneTimeRatio}%` : '不适用';
      document.getElementById("finance-onetime-bar").style.width = `${percent(p.oneTimeRatio)}%`;
      document.getElementById("finance-onetime-note").innerText = `仅逐笔子集：一次性 ${yuan(p.oneTimeTotal)} / 逐笔支出 ${yuan(derived.detailTotal)}；未拆分汇总不猜类型`;


      updateHeaderBadge();


      renderIncomeBreakdown();
      renderIncomeDetails();


      renderAssetLayers();


      document.getElementById("finance-accounts-title").innerText = assetLabel;
      const accTotal = sumMoney(financialData.accounts);
      document.getElementById("finance-assets-badge").innerText = !financialData.accounts.length ? '暂无账户记录'
        : financialData.accounts.every(account => knownAmount(account.amount)) ? `账户合计: ${yuan(accTotal)}（未与总资产校准）` : '账户含未登记金额，暂不合计';

      const accGrid = document.getElementById("finance-accounts-grid");
      accGrid.innerHTML = '';
      financialData.accounts.forEach(acc => {
        const card = document.createElement('div');
        card.className = 'border border-slate-100 bg-slate-50/70 hover:bg-white hover:shadow-md transition p-4 rounded-xl flex flex-col justify-between';
        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full" style="background-color: ${safeColor(acc.color)}"></span>
                ${escapeHTML(acc.name)}
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-600 font-medium">${escapeHTML(acc.category)}</span>
            </div>
            <div class="text-lg font-bold text-slate-900 mono mt-2">
              ${yuan(acc.amount)}
              ${acc.original ? `<span class="text-xs font-normal text-slate-400 block sm:inline">(${escapeHTML(acc.original)})</span>` : ''}
            </div>
          </div>
          <p class="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-200/60">${escapeHTML(acc.asOf || financialData.assetSnapshotDate || '日期未知')} · ${acc.valuationStatus === 'user_reported' ? '用户自报' : acc.valuationStatus === 'estimated_rollforward' ? '历史顺延暂估' : '账户快照'}<br>${escapeHTML(acc.note || acc.desc)}${acc.valuationNote ? `<br>${escapeHTML(acc.valuationNote)}` : ''}</p>
        `;
        accGrid.appendChild(card);
      });


      document.getElementById("finance-receivables-total").innerText = `合计 ${yuan(s.receivablesTotal)}`;
      document.getElementById("finance-receivables-count").innerText = `${financialData.receivables.length} 笔待回收款项`;

      const recGrid = document.getElementById("finance-receivables-grid");
      recGrid.innerHTML = '';
      financialData.receivables.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'bg-amber-50/40 border border-amber-100 p-4 rounded-xl flex flex-col justify-between';
        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-slate-900">${escapeHTML(rec.title)}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">${escapeHTML(rec.status)}</span>
            </div>
            <div class="text-xl font-bold text-amber-600 mono mt-1">
              ${yuan(rec.amount)}
            </div>
          </div>
          <p class="text-[11px] text-slate-500 mt-2">${escapeHTML(rec.desc)}</p>
        `;
        recGrid.appendChild(card);
      });


      document.getElementById("finance-period-tag").innerText = derived.label;
      document.getElementById("finance-expense-count-tag").innerText = `${derived.expenseStructure.length} 个分类 · 含未拆分汇总`;
      document.getElementById("finance-composition-status").textContent = derived.expenseStructure.length ? '分类包含已记录汇总；缺失交易未补零。' : '所选期间无可用支出分类；无图形不代表零消费。';

      const expList = document.getElementById("finance-expense-list");
      expList.innerHTML = '';
      derived.expenseStructure.forEach(item => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0';
        div.innerHTML = `
          <div class="flex items-center gap-2 shrink-0">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${safeColor(item.color)}"></span>
            <span class="text-slate-700 font-medium text-xs">${escapeHTML(item.category)}</span>
          </div>
          <span class="text-slate-400 text-[11px] flex-1 truncate hidden sm:block text-right">${escapeHTML(item.desc)}</span>
          <span class="font-bold text-slate-900 mono text-xs shrink-0">¥${Number(item.amount).toFixed(2)}</span>
        `;
        expList.appendChild(div);
      });

      document.getElementById("finance-legacy-history").innerHTML = (financialData.historicalComparison || []).map(row =>
        `<p>${escapeHTML(row.month)} · 原比较收入 ${yuan(row.income)} · 非学费支出 ${yuan(row.expense)} · 原比较差额 ${signed(row.savings)}</p>`).join('');

      const avg = financialData.healthScores.length ? Math.round(financialData.healthScores.reduce((a, b) => a + b.score, 0) / financialData.healthScores.length) : null;
      document.getElementById("finance-health-avg-badge").innerText = avg === null ? '暂无诊断记录' : `综合 ${avg} 分 · ${financialData.healthScores.length} 个维度`;

      const healthList = document.getElementById("finance-health-score-list");
      healthList.innerHTML = '';
      financialData.healthScores.forEach(h => {
        const div = document.createElement('div');
        div.className = 'bg-slate-50 p-3 rounded-xl space-y-1.5';
        const colorClass = h.score >= 85 ? 'text-emerald-600' : (h.score >= 70 ? 'text-indigo-600' : 'text-amber-600');
        div.innerHTML = `
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-slate-800">${escapeHTML(h.dimension)}</span>
            <span class="font-bold mono ${colorClass}">${escapeHTML(h.score)}分 · ${escapeHTML(h.status)}</span>
          </div>
          <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div class="${h.score >= 85 ? 'bg-emerald-500' : (h.score >= 70 ? 'bg-indigo-500' : 'bg-amber-500')} h-full rounded-full" style="width: ${percent(h.score)}%"></div>
          </div>
          <p class="text-[11px] text-slate-500">${escapeHTML(h.detail)}</p>
        `;
        healthList.appendChild(div);
      });


      const actList = document.getElementById("finance-action-list");
      actList.innerHTML = '';
      financialData.actionItems.forEach(act => {
        const div = document.createElement('div');
        const badgeColor = act.priority === '高' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200';
        div.className = 'border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex flex-col justify-between';
        div.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <h5 class="text-xs font-bold text-slate-900">${escapeHTML(act.title)}</h5>
              <span class="text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badgeColor}">${escapeHTML(act.priority)}优先级</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">${escapeHTML(act.content)}</p>
          </div>
        `;
        actList.appendChild(div);
      });


      document.getElementById("finance-philosophy-runway").innerText = (knownAmount(s.runwayMonths) ? `${s.runwayMonths} 个月` : '未登记');
      document.getElementById("finance-philosophy-cash").innerText = `${wan(s.availableCash)} 万元`;
      document.getElementById("finance-philosophy-receivables").innerText = `${wan(s.receivablesTotal)} 万元`;
      document.getElementById("finance-philosophy-date").innerText = assetLabel;


      renderTransactions();


      scheduleChartPaint();

      if (window.lucide) lucide.createIcons();
    }



    function updateHeaderBadge() {
      const el = document.getElementById("finance-header-badge-text");
      if (!el) return;
      const status = document.getElementById("finance-period-status");
      if (status) {
        status.textContent = dataState.loading ? '正在加载数据…' + (dataState.lastSuccess ? ' · 仍展示上次成功数据' : '')
          : dataState.error ? dataState.error + (dataState.lastSuccess ? ' · 保留上次成功数据' : ' · 暂无可用数据')
          : derived ? (derived.status === 'empty' ? '暂无可用记录' : '部分覆盖 · 非完整账单') : '尚未加载数据';
      }
      if (dataState.error) {
        el.textContent = dataState.error + (dataState.lastSuccess ? ' · 保留上次成功数据' : '');
        return;
      }
      if (dataState.loading) {
        el.textContent = '数据加载中…';
        return;
      }
      if (!dataState.lastSuccess) {
        el.textContent = '尚未加载数据';
        return;
      }
      const s = dataState.lastSuccess.summary;
      const assets = knownAmount(s.totalAssets) ? `${wan(s.totalAssets)} 万` : '未核实';
      el.textContent = `${derived?.label || dataState.lastSuccess.period} · 总资产 ${assets}`;
    }



    function renderIncomeBreakdown() {
      const items = derived.incomeBreakdown;
      const total = items.reduce((a, b) => a + b.amount, 0);
      const palette = ['#10B981', '#0EA5E9', '#22C55E', '#6366F1', '#F59E0B', '#EC4899'];

      document.getElementById("finance-income-total-badge").innerText = `合计 ${yuan(derived.summary.incomeTotal)}`;

      const bar = document.getElementById("finance-income-bar");
      bar.innerHTML = items.map((it, i) => `
        <div class="h-full" style="width:${(total > 0 ? it.amount / total * 100 : 0).toFixed(2)}%;background:${palette[i % palette.length]}" title="${escapeHTML(it.source)} ${yuan(it.amount)}"></div>
      `).join('');

      const legend = document.getElementById("finance-income-legend");
      legend.innerHTML = items.map((it, i) => `
        <div class="flex items-center justify-between gap-3 text-xs">
          <span class="flex items-center gap-2 text-slate-700 min-w-0">
            <span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background:${palette[i % palette.length]}"></span>
            <span class="truncate">${escapeHTML(it.source)}</span>
          </span>
          <span class="mono text-slate-900 font-semibold shrink-0">${yuan(it.amount)}
            <span class="text-slate-400 font-normal">· ${total > 0 ? (it.amount / total * 100).toFixed(1) + '%' : '比例未计算'}</span>
          </span>
        </div>
      `).join('');
    }



    function renderIncomeDetails() {
      const items = derived.incomeDetails;
      const list = document.getElementById("finance-income-detail-list");
      const tag = document.getElementById("finance-income-detail-tag");
      const foot = document.getElementById("finance-income-detail-footnote");
      if (!list) return;
      foot.innerText = `收入明细覆盖 ${derived.detailRange}；逐笔 ${yuan(derived.detailIncome)}；未拆分 ${yuan(derived.incomeRemainder)}。未登记收入不代表零收入。`;
      if (!items.length) {
        tag.innerText = '暂无逐笔明细';
        list.innerHTML = '<div class="text-center py-8 text-slate-500 text-sm">所选期间无可展示的逐笔收入；不将历史汇总伪造成流水。</div>';
        return;
      }
      const total = items.reduce((a, b) => a + Number(b.amount), 0);
      tag.innerText = `${items.length} 笔 · 合计 ${yuan(total)}`;
      list.innerHTML = items.map(it => `
        <div class="flex items-start justify-between gap-2 sm:gap-3 bg-slate-50/80 rounded-lg px-2.5 sm:px-3 py-2">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 min-w-0 flex-wrap">
              <span class="mono text-[11px] text-slate-400 shrink-0">${escapeHTML(it.date)}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 shrink-0">${escapeHTML(it.kind)}</span>
              <span class="text-xs font-medium text-slate-800 truncate">${escapeHTML(it.source)}</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5 truncate">${escapeHTML(it.account)}${it.desc ? ' · ' + escapeHTML(it.desc) : ''}</div>
          </div>
          <span class="mono text-sm font-semibold text-emerald-600 shrink-0 whitespace-nowrap">+${yuan(it.amount)}</span>
        </div>
      `).join('');
    }



    const ASSET_LAYERS = [
  {
    "key": "cash",
    "name": "可用现金",
    "color": "#10B981",
    "desc": "已登记为即时可用的现金。"
  },
  {
    "key": "pendingCash",
    "name": "待核现金",
    "color": "#0EA5E9",
    "desc": "可用性尚待核对的现金类记录。"
  },
  {
    "key": "unknown",
    "name": "未分类资产",
    "color": "#64748B",
    "desc": "分类或估值尚不明确的记录。"
  },
  {
    "key": "deposit",
    "name": "存款",
    "color": "#0D9488",
    "desc": "已登记的存款类资产。"
  },
  {
    "key": "fund",
    "name": "投资资产",
    "color": "#7C3AED",
    "desc": "已登记的投资类资产，估值以记录口径为准。"
  },
  {
    "key": "receivable",
    "name": "应收款",
    "color": "#F59E0B",
    "desc": "尚待收回的款项，不等同即时可用现金。"
  }
];

    function assetLayerData() {
  const s = financialData.summary;
  const fields = { cash:'availableCash', pendingCash:'pendingCashTotal', unknown:'unknownTotal', deposit:'depositTotal', fund:'fundTotal', receivable:'receivablesTotal' };
  return ASSET_LAYERS.map(layer => ({ ...layer, amount: knownAmount(s[fields[layer.key]]) ? Number(s[fields[layer.key]]) : null }));
}

    function renderAssetLayers() {
  const rows = assetLayerData(), known = rows.filter(row => row.amount !== null);
  const total = roundMoney(known.reduce((sum,row) => sum + row.amount, 0));
  document.getElementById('finance-asset-layer-badge').textContent = known.length ? '已知分层合计 ' + yuan(total) + (known.length < rows.length ? ' · 含未登记项' : '') : '资产分层未登记';
  document.getElementById('finance-asset-layer-list').innerHTML = rows.map(row => '<div class="finance-layer"><span>' + escapeHTML(row.name) + '</span><strong>' + yuan(row.amount) + '</strong><p>' + escapeHTML(row.desc) + '</p></div>').join('');
}



    const chartInstances = {};
    const chartPainters = {};

    let chartLibraryLoad = null;
    let chartError = null;

    function setChartError(message) {
      chartError = message;
      document.getElementById("finance-chart-error").hidden = !message;
      document.getElementById("finance-chart-error-text").textContent = message || '';
    }

    function hasCharts() {
      return typeof window.echarts?.init === 'function';
    }

    function scheduleChartPaint() {
      requestAnimationFrame(() => {
        try {
          paintCharts();
        } catch (error) {
          setChartError('图表绘制失败，请重试加载图表。');
          console.error('图表绘制失败', error);
        }
      });
    }

    function retryCharts() {
      if (chartLibraryLoad) return chartLibraryLoad;
      if (hasCharts()) {
        scheduleChartPaint();
        return Promise.resolve();
      }
      setChartError('正在重新加载 ECharts…');
      const button = document.getElementById("finance-chart-retry");
      button.disabled = true;
      chartLibraryLoad = new Promise(resolve => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
        script.async = true;
        let settled = false;
        const finish = loaded => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          script.onload = script.onerror = null;
          script.remove();
          if (loaded && hasCharts()) {
            setChartError(null);
            scheduleChartPaint();
          } else {
            setChartError('ECharts 加载失败，图表不可用；请检查网络后重试加载图表。');
          }
          resolve();
        };
        const timer = setTimeout(() => finish(false), 12000);
        script.onload = () => finish(true);
        script.onerror = () => finish(false);
        document.head.appendChild(script);
      }).finally(() => {
        chartLibraryLoad = null;
        button.disabled = false;
      });
      return chartLibraryLoad;
    }

    document.getElementById("finance-chart-retry").addEventListener('click', retryCharts);

    function chartFor(id) {
      const dom = document.getElementById(id);
      if (!dom) return null;

      if (dom.offsetParent === null) return null;
      if (!hasCharts()) return null;
      if (!chartInstances[id]) chartInstances[id] = window.echarts.init(dom);
      return chartInstances[id];
    }

    function paintCharts() {
      if (!financialData || !derived) return;
      if (!hasCharts()) {
        setChartError('ECharts 加载失败，图表不可用；请检查网络后重试加载图表。');
        return;
      }
      if (!financialData || !derived) return;
      let failed = false;
      let painted = false;
      Object.keys(chartPainters).forEach(id => {
        try {
          const chart = chartFor(id);
          if (!chart) return;
          chartPainters[id](chart);
          chart.resize();
          painted = true;
        } catch (error) {
          failed = true;
          setChartError('图表绘制失败，请重试加载图表。');
          console.error('图表绘制失败', error);
        }
      });
      if (painted && !failed) setChartError(null);
    }

    window.addEventListener('resize', () => {
      updateHeaderBadge();

      if (derived) renderTxnList(derived.transactions);
      scheduleChartPaint();
    });


    window.addEventListener('orientationchange', () => {
      setTimeout(scheduleChartPaint, 260);
    });


    chartPainters["finance-asset-donut-chart"] = chart => {
      const rows = assetLayerData().filter(row => row.amount !== null);
      chart.setOption({
        tooltip: { trigger: 'item', formatter: p => `${escapeHTML(p.name)}<br/>${yuan(p.value)} (${escapeHTML(p.percent)}%)` },
        legend: { show: false },
        series: [{
          type: 'pie',
          radius: ['52%', '78%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: {
            show: true,
            position: 'center',
            formatter: () => rows.length ? `${wan(rows.reduce((a, b) => a + b.amount, 0))}\n已知分层` : '未登记',
            fontSize: 16,
            fontWeight: 'bold',
            color: '#0f172a',
            lineHeight: 20
          },
          emphasis: { label: { show: true, fontSize: 16 } },
          data: rows.map(r => ({ name: r.name, value: r.amount, itemStyle: { color: r.color } }))
        }]
      }, true);
    };


    chartPainters["finance-income-pie-chart"] = chart => {
      const items = derived.incomeKinds;
      const groups = new Map();
      items.forEach(i => {
        const key = i.source || '未分类';
        groups.set(key, (groups.get(key) || 0) + Number(i.amount));
      });
      const palette = { '劳动所得': '#10B981', '劳务所得': '#0EA5E9', '学校发放': '#6366F1', '家庭支持': '#F59E0B' };
      const fallback = ['#10B981', '#0EA5E9', '#6366F1', '#F59E0B', '#EC4899'];
      chart.setOption({
        tooltip: { trigger: 'item', formatter: p => `${escapeHTML(p.name)}: ${yuan(p.value)} (${escapeHTML(p.percent)}%)` },
        series: [{
          name: '收入性质',
          type: 'pie',
          radius: ['45%', '75%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
          data: [...groups.entries()].map(([name, value], i) => ({
            name,
            value,
            itemStyle: { color: safeColor(palette[name] || fallback[i % fallback.length]) }
          }))
        }]
      }, true);
    };


    chartPainters["finance-expense-pie-chart"] = chart => {
      chart.setOption({
        tooltip: { trigger: 'item', formatter: p => `${escapeHTML(p.name)}: ${yuan(p.value)} (${escapeHTML(p.percent)}%)` },
        series: [{
          name: '支出分类',
          type: 'pie',
          radius: ['45%', '75%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
          data: derived.expenseStructure.map(item => ({
            name: item.category,
            value: item.amount,
            itemStyle: { color: safeColor(item.color) }
          }))
        }]
      }, true);
    };


    chartPainters["finance-trend-bar-chart"] = chart => {
      const h = derived.trend;
      const narrow = chart.getWidth() < 520;
      chart.setOption({
        tooltip: {
          trigger: 'axis', axisPointer: { type: 'shadow' },
          formatter: params => `${escapeHTML(params[0]?.axisValue ?? '')}<br/>` + params.map(p =>
            `${escapeHTML(p.seriesName)} ${yuan(p.value)}`).join('<br/>')
        },
        grid: { left: narrow ? 2 : '3%', right: narrow ? 4 : '3%', bottom: narrow ? 0 : '8%', top: narrow ? 10 : '12%', containLabel: true },
        xAxis: {
          type: 'category',
          data: h.map(m => m.month),
          axisLine: { lineStyle: { color: '#cbd5e1' } },
          axisTick: { show: false },
          axisLabel: { color: '#64748b', fontWeight: 'bold', fontSize: narrow ? 10 : 12 }
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          splitNumber: narrow ? 3 : 5,
          splitLine: { lineStyle: { color: '#f1f5f9' } },
          axisLabel: { color: '#94a3b8', fontSize: narrow ? 10 : 12 }
        },
        series: [
          { name: '确认收入', type: 'bar', data: h.map(m => m.income), itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }, barMaxWidth: narrow ? 18 : 32 },
          { name: '已记录支出', type: 'bar', data: h.map(m => m.expense), itemStyle: { color: '#F43F5E', borderRadius: [4, 4, 0, 0] }, barMaxWidth: narrow ? 18 : 32 },
          { name: '结余', type: 'line', data: h.map(m => m.savings), smooth: false, connectNulls: false, itemStyle: { color: '#6366F1' }, lineStyle: { width: narrow ? 2 : 3 }, symbolSize: narrow ? 5 : 7 }
        ]
      }, true);
    };

    function dailyRows(t) {
      return t.byDay ?? t.daily ?? [];
    }

    function recordStatusLabel(status) {
      switch (status) {
        case 'confirmed_zero': return '已确认零消费';
        case 'pending_review': return '待核实';
        case 'recorded': return '已记录';
        case 'missing': return '未记账';
        default: return '记录状态未知';
      }
    }

    function dailyTooltip(params, days) {
      if (!params.length) return '';
      const day = params[0].axisValue;
      const row = days.find(d => String(d.day) === String(day));
      const label = recordStatusLabel(row?.recordStatus);
      const title = `${escapeHTML(day)} 日：${label}`;
      if (!row || row.recordStatus === 'missing') return title;
      const amounts = params.filter(p => knownAmount(p.value));
      const detail = amounts.map(p => `${escapeHTML(p.seriesName)} ¥${Number(p.value).toFixed(2)}`).join('<br/>');
      const total = knownAmount(row.total) ? `<br/><b>已记录合计 ${yuan(row.total)}</b>` : '';
      return title + (detail ? `<br/>${detail}` : '') + total;
    }


    chartPainters["finance-txn-daily-chart"] = chart => {
      const t = derived.transactions;
      if (!t) return;
      const days = dailyRows(t);
      const narrow = chart.getWidth() < 520;
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: params => dailyTooltip(params, days)
        },
        grid: { left: '2%', right: '2%', bottom: '4%', top: '8%', containLabel: true },
        xAxis: {
          type: 'category',
          data: days.map(d => d.day),
          axisLine: { lineStyle: { color: '#cbd5e1' } },
          axisTick: { show: false },
          axisLabel: { color: '#94a3b8', fontSize: narrow ? 9 : 10, interval: narrow ? 4 : (t.maxDay > 20 ? 2 : 0) }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#f1f5f9' } },
          axisLabel: { color: '#94a3b8', fontSize: 10 }
        },
        series: [
          { name: '日常', type: 'bar', stack: 'day', data: days.map(d => d.routine), itemStyle: { color: '#10B981' }, barMaxWidth: narrow ? 9 : 16 },
          { name: '一次性/资本', type: 'bar', stack: 'day', data: days.map(d => d.capital), itemStyle: { color: '#6366F1', borderRadius: [3, 3, 0, 0] }, barMaxWidth: narrow ? 9 : 16 }
        ]
      }, true);
    };



    let txnFilter = '全部';
    let txnExpanded = false;

    function renderTransactions() {
      const t = derived.transactions;
      const sec = document.getElementById("finance-txn-section");
      if (!t || !sec) return;
      document.getElementById("finance-detail-range-note").textContent = `${derived.label} · 逐笔覆盖 ${derived.detailRange}；仅明细筛选不改变上方期间总览。`;


      const tabBadge = document.getElementById("finance-tab-badge-spend");
      if (tabBadge) {
        if (t.count) {
          tabBadge.classList.remove('hidden');
          tabBadge.innerText = t.count;
        } else {
          tabBadge.classList.add('hidden');
        }
      }

      const badge = document.getElementById("finance-txn-coverage-badge");
      if (!t.count) {
        badge.className = 'text-xs px-2.5 py-1 rounded-lg font-mono bg-slate-100 text-slate-500 self-start sm:self-auto';
        badge.textContent = '暂无逐笔流水 · 每日状态见图表提示';
      } else if (t.coverage === 'full') {
        badge.className = 'text-xs px-2.5 py-1 rounded-lg font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto';
        badge.innerText = `完整录入 · ${t.count} 笔`;
      } else {
        badge.className = 'text-xs px-2.5 py-1 rounded-lg font-mono bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-auto';
        badge.innerText = `逐笔 ${t.count} 笔 · 占已记汇总 ${t.coverageRatio}%（非完整率）`;
      }

      document.getElementById("finance-txn-subtitle").innerText = t.count
        ? `${t.recordedDays}/${t.maxDay} 天有记录 · 笔均 ${yuan(t.avgPerItem)} · 有记录日日均 ${yuan(t.avgPerRecordedDay)}`
        : '逐笔记账 · 13 类固定归集';


      const stats = document.getElementById("finance-txn-stat-cards");
      stats.innerHTML = '';
      if (t.count) {
        const cards = [
          { label: '所选期间逐笔合计', value: yuan(t.total), note: `${t.count} 笔 · 占期间已记录汇总 ${t.coverageRatio}%（不是完整率）`, cls: 'text-slate-900' },
          { label: '单笔最大', value: t.maxItem ? yuan(t.maxItem.amount) : '—', note: t.maxItem ? `${t.maxItem.category} · ${t.maxItem.date.slice(5)}` : '', cls: 'text-rose-500' },
          { label: '记账天数', value: `${t.recordedDays} / ${t.maxDay}`, note: `有记录日日均 ${yuan(t.avgPerRecordedDay)}`, cls: 'text-indigo-600' }
        ];
        cards.forEach(c => {
          const div = document.createElement('div');
          div.className = 'bg-slate-50 rounded-xl p-3.5';
          div.innerHTML = `
            <div class="text-[11px] text-slate-500 font-medium">${escapeHTML(c.label)}</div>
            <div class="text-lg font-bold mono ${c.cls} mt-1">${escapeHTML(c.value)}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">${escapeHTML(c.note)}</div>
          `;
          stats.appendChild(div);
        });
      }

      document.getElementById("finance-txn-footnote").innerText = t.note
        ? `口径说明：${t.note}`
        : "所选期间未提供逐笔记录；未登记日期不按零消费处理。";

      renderTxnFilters(t);
      renderTxnList(t);
    }

    function renderTxnFilters(t) {
      const filters = document.getElementById("finance-txn-filters");
      filters.innerHTML = '';
      if (!t.count) return;
      const all = [{ category: '全部', amount: t.total, count: t.count, color: '#0f172a' }].concat(t.byCategory);
      all.forEach(c => {
        const active = txnFilter === c.category;
        const btn = document.createElement('button');
        btn.className = `text-xs px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg border transition flex items-center gap-1.5 ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`;
        btn.innerHTML = `<span class="w-2 h-2 rounded-full" style="background:${active ? '#ffffff' : safeColor(c.color)}"></span>${escapeHTML(c.category)}<span class="mono opacity-70">${nearYuan(c.amount)}</span>`;
        btn.onclick = () => { txnFilter = c.category; renderTxnFilters(derived.transactions); renderTxnList(derived.transactions); };
        filters.appendChild(btn);
      });
    }

    function renderTxnList(t) {
      const wrap = document.getElementById("finance-txn-list");
      wrap.innerHTML = '';
      if (!t.count) {
        wrap.innerHTML = '<p class="text-sm text-slate-500">所选期间没有逐笔记录。缺少记录不代表零支出，请在原财务站维护记录。</p>';
        return;
      }
      const items = txnFilter === '全部' ? t.items : t.items.filter(i => i.category === txnFilter);
      if (!items.length) {
        wrap.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm">「${escapeHTML(txnFilter)}」所选期间暂无记录</div>`;
        return;
      }

      const groups = Object.create(null);
      items.forEach(i => { (groups[i.date] = groups[i.date] || []).push(i); });
      const dayKeys = Object.keys(groups).sort().reverse();
      const narrow = window.matchMedia('(max-width: 639px)').matches;
      const COLLAPSE_DAYS = 7;
      const limit = (narrow && !txnExpanded) ? COLLAPSE_DAYS : dayKeys.length;
      dayKeys.slice(0, limit).forEach(day => {
        const list = groups[day];
        const sum = list.reduce((a, b) => a + Number(b.amount), 0);
        const block = document.createElement('div');
        block.innerHTML = `
          <div class="flex items-center justify-between text-[11px] mb-1.5">
            <span class="font-semibold text-slate-700">${escapeHTML(list[0].date.slice(5))} · 周${escapeHTML(list[0].weekday)}</span>
            <span class="mono text-slate-500">${list.length} 笔 · ¥${sum.toFixed(2)}</span>
          </div>
          <div class="space-y-1.5">
            ${list.map(i => `
              <div class="flex items-start sm:items-center justify-between gap-2 sm:gap-3 bg-slate-50/80 rounded-lg px-2.5 sm:px-3 py-2">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-2 h-2 rounded-full shrink-0" style="background:${safeColor(i.color)}"></span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 shrink-0">${escapeHTML(i.category)}</span>
                    <span class="text-xs text-slate-700 truncate">${escapeHTML(i.note || '—')}</span>
                  </div>
                  ${i.account ? `<div class="sm:hidden text-[10px] text-slate-400 mt-0.5 pl-4 truncate">${escapeHTML(i.account)}</div>` : ''}
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  ${i.account ? `<span class="hidden sm:inline text-[10px] text-slate-400">${escapeHTML(i.account)}</span>` : ''}
                  <span class="text-xs font-bold text-slate-900 mono">¥${Number(i.amount).toFixed(2)}</span>
                </div>
              </div>`).join('')}
          </div>`;
        wrap.appendChild(block);
      });


      if (narrow && dayKeys.length > COLLAPSE_DAYS) {
        const btn = document.createElement('button');
        btn.className = 'w-full py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 active:bg-slate-50';
        btn.innerText = txnExpanded
          ? `收起，只看最近 ${COLLAPSE_DAYS} 天`
          : `展开更早的 ${dayKeys.length - COLLAPSE_DAYS} 天（所选期间共 ${dayKeys.length} 天记账）`;
        btn.onclick = () => {
          txnExpanded = !txnExpanded;
          renderTxnList(derived.transactions);
          if (!txnExpanded) document.getElementById("finance-txn-section").scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        wrap.appendChild(btn);
      }
    }

    function refreshData() {
      loadRemoteData();
    }

  const endpoint = 'https://finance.insistgang.top/data/financial_data.json';
  let status = 'idle';
  let activeRequest = null;
  let theme = 'dark';
  const originalRender = renderDashboard;
  const originalPaint = paintCharts;
  const originalSelect = selectPeriod;
  const originalMove = movePeriod;

  function notify(type = 'ops:finance-data') {
    realWindow.dispatchEvent(new realWindow.CustomEvent(type, { detail: { status } }));
  }
  function summary() {
    return {
      status,
      asOf: financialData?.asOf ?? null,
      expenseTotal: knownAmount(derived?.summary?.expenseTotal) ? Number(derived.summary.expenseTotal) : null,
      availableCash: knownAmount(financialData?.summary?.availableCash) ? Number(financialData.summary.availableCash) : null,
      error: dataState.error || null
    };
  }
  function disposeCharts() {
    for (const [id, chart] of Object.entries(chartInstances)) {
      try { chart.clear?.(); } catch (_) {}
      try { chart.dispose?.(); } catch (_) {}
      delete chartInstances[id];
    }
    root.querySelectorAll('.finance-chart').forEach(element => { element.innerHTML = ''; });
  }
  function clearVisibleData() {
    disposeCharts();
    root.querySelectorAll('[data-finance-dynamic]').forEach(element => { element.innerHTML = ''; });
    root.querySelectorAll('[data-finance-value]').forEach(element => { element.textContent = '—'; });
    document.getElementById('finance-period-select').innerHTML = '';
    document.getElementById('finance-tab-badge-spend').hidden = true;
    for (const id of ['finance-savings-rate-bar', 'finance-onetime-bar']) document.getElementById(id).style.width = '0%';
    setChartError(null);
  }
  function periodControls() {
    const unavailable = !financialData;
    root.querySelectorAll('[data-finance-period]').forEach(button => { button.disabled = unavailable; });
    document.getElementById('finance-period-select').disabled = unavailable;
    if (unavailable) for (const id of ['finance-period-prev', 'finance-period-next']) document.getElementById(id).disabled = true;
  }
  function visible() { return !root.hidden && root.offsetParent !== null; }
  function chartTheme() {
    const tokens = realWindow.getComputedStyle?.(root);
    const text = tokens?.getPropertyValue('--ops-text').trim() || (theme === 'dark' ? '#e4e4e7' : '#27272a');
    const surface = tokens?.getPropertyValue('--ops-surface').trim() || (theme === 'dark' ? '#181923' : '#ffffff');
    for (const [id, chart] of Object.entries(chartInstances)) {
      const element = document.getElementById(id);
      if (!element || element.offsetParent === null) continue;
      const options = { textStyle: { color: text }, tooltip: { backgroundColor: surface, textStyle: { color: text }, confine: true, extraCssText: 'max-width:80vw;white-space:normal;overflow-wrap:anywhere;' } };
      if (id === 'finance-trend-bar-chart' || id === 'finance-txn-daily-chart') {
        options.xAxis = { axisLabel: { color: text } };
        options.yAxis = { axisLabel: { color: text } };
      } else options.series = [{ label: { color: text } }];
      chart.setOption(options);
      chart.resize();
    }
  }
  paintCharts = function () { originalPaint(); chartTheme(); };
  renderDashboard = function () { originalRender(); periodControls(); notify(); };
  selectPeriod = function (...args) { if (!financialData) return false; originalSelect(...args); return true; };
  movePeriod = function (...args) { if (!financialData) return false; originalMove(...args); return true; };
  hasCharts = function () { return typeof realWindow.echarts?.init === 'function' && realWindow.echarts.version === '5.4.3'; };

  function validDay(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value + 'T00:00:00Z')) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
  }
  function amount(value) { return value === null || value === undefined || (typeof value === 'number' && Number.isFinite(value)); }
  function rows(value) { if (value === undefined) return []; if (!Array.isArray(value)) throw new Error('Invalid record array'); return value.map(item => { if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Invalid record'); return { ...item }; }); }
  function validateData(raw, nested = false) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !/^\d{4}-\d{2}$/.test(raw.period || '') || !validDay(raw.asOf)) throw new Error('Invalid period');
    if (!nested && (!raw.summary || typeof raw.summary !== 'object' || Array.isArray(raw.summary))) throw new Error('Invalid summary');
    const next = { ...raw, summary: { ...(raw.summary || {}) } };
    for (const key of ['incomeTotal', 'expenseTotal', 'availableCash', 'totalAssets', 'totalNetAssets', 'liabilities', 'fundTotal', 'depositTotal', 'pendingCashTotal', 'unknownTotal', 'receivablesTotal', 'runwayMonths']) if (!amount(next.summary[key])) throw new Error('Invalid amount');
    for (const key of ['accounts', 'receivables', 'healthScores', 'actionItems', 'historicalComparison', 'incomeDetails']) next[key] = rows(raw[key]);
    for (const row of [...next.accounts, ...next.receivables]) if (!amount(row.amount)) throw new Error('Invalid account amount');
    for (const row of next.healthScores) if (typeof row.score !== 'number' || !Number.isFinite(row.score)) throw new Error('Invalid health score');
    for (const row of next.incomeDetails) {
      if (typeof row.amount !== 'number' || !Number.isFinite(row.amount)) throw new Error('Invalid income amount');
      const date = validDay(row.date) ? row.date : raw.period + '-' + String(row.date).split('-').pop().padStart(2, '0');
      if (!validDay(date)) throw new Error('Invalid income date');
    }
    const transactions = raw.transactions || {};
    if (typeof transactions !== 'object' || Array.isArray(transactions)) throw new Error('Invalid transactions');
    next.transactions = { ...transactions, items: rows(transactions.items) };
    for (const item of next.transactions.items) if (!validDay(item.date) || typeof item.amount !== 'number' || !Number.isFinite(item.amount)) throw new Error('Invalid transaction');
    next.transactions.byDay = rows(transactions.byDay ?? transactions.daily).map(day => {
      if (!Number.isInteger(Number(day.day)) || Number(day.day) < 1 || Number(day.day) > 31 || !['routine', 'capital', 'total'].every(key => amount(day[key]))) throw new Error('Invalid daily record');
      return { ...day, routine: day.routine ?? null, capital: day.capital ?? null, total: day.total ?? null };
    });
    if (raw.monthlySummaries !== undefined) next.monthlySummaries = rows(raw.monthlySummaries).map(month => {
      if (!/^\d{4}-\d{2}$/.test(month.period || '') || !validDay(month.period + '-01') || !amount(month.income) || !amount(month.expense)) throw new Error('Invalid monthly record');
      return month;
    });
    else if (!knownAmount(next.summary.incomeTotal) && !knownAmount(next.summary.expenseTotal)) next.monthlySummaries = [];
    if (!nested) {
      if (raw.periodDatasets !== undefined && (!raw.periodDatasets || typeof raw.periodDatasets !== 'object' || Array.isArray(raw.periodDatasets))) throw new Error('Invalid detail periods');
      next.periodDatasets = Object.fromEntries(Object.entries(raw.periodDatasets || {}).map(([key, dataset]) => [key, validateData(dataset, true)]));
    }
    return next;
  }
  async function financeRefresh() {
    const version = ++loadVersion;
    activeRequest?.abort();
    activeRequest = new realWindow.AbortController();
    status = 'loading'; dataState.loading = true;
    updateHeaderBadge(); notify();
    try {
      const response = await realWindow.fetch(endpoint, { credentials: 'include', cache: 'no-store', signal: activeRequest.signal });
      if (version !== loadVersion) return summary();
      if (response.status === 401 || response.status === 403) {
        financialData = null; derived = null; dataState.lastSuccess = null;
        periodState.anchor = null;
        status = 'locked';
        dataState.error = '接口要求认证（登录保护可能已被重新开启）；本页不接收密码。此前的展示已清除。';
        clearVisibleData(); periodControls();
        return summary();
      }
      if (!response.ok) throw new Error('HTTP request failed');
      const payload = await response.json();
      if (version !== loadVersion) return summary();
      const next = validateData(payload);
      const previous = financialData, previousDerived = derived, previousAnchor = periodState.anchor;
      financialData = next;
      const choices = availablePeriods(next, periodState.mode);
      if (!periodState.anchor || !choices.includes(periodRange(periodState.mode, periodState.anchor).start)) periodState.anchor = choices.at(-1) || next.asOf;
      try { renderDashboard(); }
      catch (error) { financialData = previous; derived = previousDerived; periodState.anchor = previousAnchor; if (previous) renderDashboard(); throw error; }
      dataState.lastSuccess = next;
      dataState.error = null;
      status = 'ready';
      if (visible() && !hasCharts()) void retryCharts();
    } catch (_) {
      if (version !== loadVersion) return summary();
      financialData = dataState.lastSuccess;
      status = 'error';
      dataState.error = financialData ? '读取失败，当前仍展示上次成功记录；这些值可能已过期。' : '读取失败，尚无可展示的财务记录。请直接打开 finance.insistgang.top 查看。';
      if (!financialData) { derived = null; clearVisibleData(); }
      else renderDashboard();
      periodControls();
    } finally {
      if (version === loadVersion) { dataState.loading = false; activeRequest = null; updateHeaderBadge(); notify(); }
    }
    return summary();
  }
  function activate(view = 'overview') {
    if (!TABS.includes(view)) return false;
    switchTab(view);
    if (financialData && visible() && !hasCharts()) void retryCharts();
    return true;
  }
  function setTheme(value) {
    if (!['dark', 'light'].includes(value)) return;
    theme = value; root.setAttribute('data-ops-theme', value);
    if (financialData) scheduleChartPaint();
  }
  document.getElementById('finance-refresh').addEventListener('click', financeRefresh);
  root.querySelectorAll('[data-finance-period]').forEach(button => button.addEventListener('click', () => selectPeriod(button.dataset.financePeriod)));
  document.getElementById('finance-period-select').addEventListener('change', event => selectPeriod(periodState.mode, event.target.value));
  document.getElementById('finance-period-prev').addEventListener('click', () => movePeriod(-1));
  document.getElementById('finance-period-next').addEventListener('click', () => movePeriod(1));
  document.getElementById('finance-tab-bar').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = TABS.indexOf(currentTab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? TABS.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
    activate(TABS[next]); document.getElementById('finance-tab-' + TABS[next]).focus();
  });
  realWindow.addEventListener('ops:style-changed', () => { if (financialData) scheduleChartPaint(); });
  realWindow.OpsFinanceNative = { isReady: () => true, activate, refresh: financeRefresh, getSummary: summary, setTheme, selectPeriod, movePeriod, retryCharts };
  clearVisibleData(); periodControls(); switchTab('overview'); updateHeaderBadge();
  notify('ops:finance-ready');
})(window, document);
