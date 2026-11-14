(function (realWindow, realDocument) {
  if (realWindow.OpsFinanceNative) return;
  const root = realDocument.getElementById('finance-native');
  if (!root) return;
  const html = '__FINANCE_HTML__';
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
  /* FINANCE_DASHBOARD */
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
    for (const key of ['accounts', 'receivables', 'healthScores', 'actionItems', 'historicalComparison', 'incomeDetails', 'nonIncomeFlows']) next[key] = rows(raw[key]);
    for (const flow of next.nonIncomeFlows) {
      if (!validDay(flow.dateISO) || typeof flow.amount !== 'number' || !Number.isFinite(flow.amount) || flow.amount < 0 || typeof flow.name !== 'string' || !flow.name.trim() || (flow.note !== undefined && typeof flow.note !== 'string')) throw new Error('Invalid non-income flow');
    }
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
        dataState.error = '接口需要登录授权，请打开财务站。本页不接收密码，已清除此前展示。';
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
  root.addEventListener('toggle', event => {
    if (event.target.tagName === 'DETAILS' && event.target.open && financialData) scheduleChartPaint();
  }, true);
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
  // 本人 2026-11-10 要求：账本自动读取，不再要求手动点击「读取 / 刷新财务记录」。
  // 读取失败仍如实提示，不索取口令，账本只在页面内存中保留，不写任何本地存储。
  void financeRefresh();
})(window, document);
