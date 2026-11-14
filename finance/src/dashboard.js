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
      const periodIncomeUnknown = mode !== 'week' && months.some(m => (m.incomeRecordStatus === 'unrecorded' && m.incomeCoverage !== 'partial') || m.income === null || m.income === undefined);
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
      const incomeUnknown = months.some(m => m.incomeRecordStatus === 'unrecorded') || (mode === 'week' && datasets.some(dataset => dataset.incomeRecordStatus === 'unrecorded' && range.start <= dataset.asOf && range.end >= dataset.period + '-01'));
      const incomeNote = incomeUnknown ? ' 收入尚未完整核验，所示为已登记金额；差额仅供记录对照，不计算完整储蓄率。' : '';
      const notes = incomeNote + (mode === 'week'
        ? `逐笔覆盖 ${detailRange}；${gaps.length ? `缺口 ${gaps.join('、')}，未按 0 处理。` : '本周日期均有记录状态。'}待核记录仍非确认零消费。`
        : `汇总覆盖 ${months.map(m => `${m.period}（截至 ${m.through}）`).join('、') || '无'}；${missingMonths.length ? `无汇总月份 ${missingMonths.join('、')}，未按 0 处理；` : ''}逐笔覆盖 ${detailRange}。`);
      const trend = mode === 'year' ? Array.from({ length: 12 }, (_, i) => {
        const key = range.start.slice(0, 4) + '-' + String(i + 1).padStart(2, '0');
        const m = months.find(r => r.period === key);
        return { month: key, income: m && (m.incomeRecordStatus !== 'unrecorded' || m.incomeCoverage === 'partial') ? m.income ?? null : null, expense: m?.expense ?? null,
          savings: m && m.incomeRecordStatus !== 'unrecorded' ? roundMoney(m.income - m.expense) : null };
      }) : days.map(d => {
        const income = incomeDetails.filter(i => i.date === d.date);
        const inDetailRange = datasets.some(dataset => dataset.incomeRecordStatus !== 'unrecorded'
          && (dataset.incomeDetails || []).length > 0 && d.date >= dataset.period + '-01' && d.date <= dataset.asOf);
        const value = income.length || inDetailRange ? sumMoney(income) : null;
        return { month: d.date.slice(5), income: value, expense: d.total,
          savings: incomeUnknown || value === null || d.total === null ? null : roundMoney(value - d.total) };
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
          netSavingsExcludeFamily: detailOnly && incomeRemainder === 0 && netSavings !== null && !incomeUnknown ? roundMoney(netSavings - family) : null },
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

    const FINANCE_THEME = {
      income: '#365ad8', incomeSub: '#7b95c7', incomeService: '#365ad8', family: '#b5c2db',
      expense: '#8d7a91', routine: '#7b95c7', capital: '#a5accb', savings: '#647aa5'
    };
    const FINANCE_COLOR_MAP = {
      '#10b981': '#365ad8', '#059669': '#365ad8', '#22c55e': '#7b95c7',
      '#34d399': '#a5accb', '#0d9488': '#7b95c7', '#14b8a6': '#a5accb'
    };
    const safeColor = value => {
      const raw = String(value);
      return /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(raw)
        ? FINANCE_COLOR_MAP[raw.toLowerCase()] || raw : '#94a3b8';
    };
    const percent = value => Math.max(0, Math.min(100, Number(value) || 0));
    const knownAmount = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
    const yuan = v => knownAmount(v) ? '¥ ' + Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : '未核实';
    const nearYuan = v => knownAmount(v) ? '¥' + Number(v).toLocaleString('zh-CN', { maximumFractionDigits: 0 }) : '未核实';
    const wan = v => knownAmount(v) ? (Number(v) / 10000).toFixed(2) : '未核实';
    const signed = v => knownAmount(v) ? (v >= 0 ? '+¥' : '-¥') + Math.abs(Number(v)).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : '未登记';

    function incomeSourceColor(source = '', index = 0) {
      if (String(source).includes('家庭')) return FINANCE_THEME.family;
      if (/工资|劳动|劳务/.test(String(source))) return FINANCE_THEME.income;
      return [FINANCE_THEME.income, FINANCE_THEME.incomeSub, FINANCE_THEME.capital, '#d2daea'][index % 4];
    }
    function overviewExpenseRows(period = derived) {
      const items = period.transactions.items || [];
      const routine = items.filter(item => item.kind === 'routine');
      const rows = routine.length ? [{ category: '日常生活', amount: sumMoney(routine), color: FINANCE_THEME.income, desc: '日常逐笔合并展示，分类仍保留在明细' }] : [];
      rows.push(...groupAmounts(items.filter(item => item.kind === 'capital'), 'category'));
      if (period.unitemized > 0) rows.push({ category: '仅汇总·未逐笔拆分', amount: period.unitemized, color: '#d2daea', desc: '不推测逐笔分类' });
      return rows.sort((a, b) => b.amount - a.amount);
    }
    function expenseColor(item) {
      const colors = { '日常生活': '#365ad8', '订阅AI': '#7b95c7', '数码': '#a5accb', '学习学业': '#d2daea', '仅汇总·未逐笔拆分': '#d2daea' };
      return colors[item.category] || safeColor(item.color);
    }
    function periodNonIncomeFlows() {
      return (financialData?.nonIncomeFlows || []).filter(flow => flow.dateISO >= derived.range.start && flow.dateISO <= derived.range.end);
    }

    function renderDashboard() {
      if (!financialData) return;
      if (!periodState.anchor) periodState.anchor = financialData.asOf;
      derived = derivePeriod(financialData, periodState);
      renderPeriodControls();
      if (txnFilter !== '全部' && !derived.transactions.byCategory.some(c => c.category === txnFilter)) txnFilter = '全部';
      const s = financialData.summary;
      const p = derived.summary;
      const flows = periodNonIncomeFlows();
      document.getElementById('finance-kpi-recoveries').textContent = flows.length ? yuan(sumMoney(flows)) : '暂无登记';
      const accountTotal = financialData.accounts.length && financialData.accounts.every(account => knownAmount(account.amount)) ? sumMoney(financialData.accounts) : null;
      document.getElementById('finance-overview-account-total').textContent = yuan(accountTotal);
      document.getElementById('finance-overview-receivables-total').textContent = yuan(s.receivablesTotal);
      document.getElementById('finance-overview-recovery-note').textContent = flows.length ? `本期已列 ${flows.length} 笔回款，不计入收入；明细按实际到账日展示。` : '所选期间暂无已列回款，不代表确认没有到账。';

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

      document.getElementById("finance-kpi-assets-note").innerText = `现金分类账面 ${wan(s.availableCash)} 万`;
      document.getElementById("finance-kpi-receivables-note").innerText = `应收款 ${wan(s.receivablesTotal)} 万`;
      document.getElementById("finance-kpi-runway").innerText = (knownAmount(s.runwayMonths) ? `${s.runwayMonths} 个月` : '未登记');

      document.getElementById("finance-hero-headline").textContent =
        `现金分类账面 ${yuan(s.availableCash)}；${s.valuationProvisional === true ? '暂估总资产' : '总资产'} ${yuan(s.totalAssets)}`;
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
      const overviewExpenses = overviewExpenseRows();
      document.getElementById("finance-expense-count-tag").innerText = `${overviewExpenses.length} 个分组`;
      document.getElementById("finance-composition-status").textContent = overviewExpenses.length ? '日常与一次性项目分开展示' : '所选期间无可用支出记录';

      const expList = document.getElementById("finance-expense-list");
      expList.innerHTML = '';
      overviewExpenses.forEach(item => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0';
        div.innerHTML = `
          <div class="flex items-center gap-2 shrink-0">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${expenseColor(item)}"></span>
            <span class="text-slate-700 font-medium text-xs">${escapeHTML(item.category)}</span>
          </div>
          <span class="text-slate-400 text-[11px] flex-1 truncate hidden sm:block text-right">${escapeHTML(item.desc)}</span>
          <span class="font-bold text-slate-900 mono text-xs shrink-0">¥${Number(item.amount).toFixed(2)}<small class="finance-expense-percent">${derived.summary.expenseTotal ? (item.amount / derived.summary.expenseTotal * 100).toFixed(1) : '0.0'}%</small></span>
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
        const colorClass = h.score >= 85 ? 'finance-positive' : (h.score >= 70 ? 'text-indigo-600' : 'text-amber-600');
        div.innerHTML = `
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-slate-800">${escapeHTML(h.dimension)}</span>
            <span class="font-bold mono ${colorClass}">${escapeHTML(h.score)}分 · ${escapeHTML(h.status)}</span>
          </div>
          <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div class="${h.score >= 85 ? 'finance-positive-fill' : (h.score >= 70 ? 'bg-indigo-500' : 'bg-amber-500')} h-full rounded-full" style="width: ${percent(h.score)}%"></div>
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
      const palette = items.map((item, index) => incomeSourceColor(item.source, index));

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
      foot.innerText = `收入明细覆盖 ${derived.detailRange}；逐笔 ${yuan(derived.detailIncome)}；未拆分 ${yuan(derived.incomeRemainder)}。回款另列，不计入收入。`;
      const flows = periodNonIncomeFlows();
      const flowsHTML = flows.length ? `<div class="finance-flow-list"><h4>非收入回款 · ${yuan(sumMoney(flows))}</h4>${flows.map(flow => `<div><span>${escapeHTML(flow.dateISO)} · ${escapeHTML(flow.name)}<small>${escapeHTML(flow.note || '')}</small></span><strong>${yuan(flow.amount)}</strong></div>`).join('')}</div>` : '';
      if (!items.length) {
        tag.innerText = '暂无逐笔明细';
        list.innerHTML = '<div class="text-center py-8 text-slate-500 text-sm">所选期间无可展示的逐笔收入；不将历史汇总伪造成流水。</div>' + flowsHTML;
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
          <span class="mono text-sm font-semibold finance-positive shrink-0 whitespace-nowrap">+${yuan(it.amount)}</span>
        </div>
      `).join('') + flowsHTML;
    }



    const ASSET_LAYERS = [
  {
    "key": "cash",
    "name": "现金类账面",
    "color": "#365ad8",
    "desc": "按现有分类登记；取用条件需要独立核对。"
  },
  {
    "key": "pendingCash",
    "name": "待核现金",
    "color": "#7b95c7",
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
    "color": "#7b95c7",
    "desc": "已登记的存款类资产。"
  },
  {
    "key": "fund",
    "name": "投资资产",
    "color": "#a5accb",
    "desc": "已登记的投资类资产，估值以记录口径为准。"
  },
  {
    "key": "receivable",
    "name": "应收款",
    "color": "#647aa5",
    "desc": "尚待收回的款项，不等同即时可用现金。"
  }
];

    function assetLayerData() {
  const s = financialData.summary;
  const fields = { cash:'availableCash', pendingCash:'pendingCashTotal', unknown:'unknownTotal', deposit:'depositTotal', fund:'fundTotal', receivable:'receivablesTotal' };
  return ASSET_LAYERS.map(layer => ({ ...layer, amount: knownAmount(s[fields[layer.key]]) ? Number(s[fields[layer.key]]) : null }));
}

    function renderAssetLayers() {
  const rows = assetLayerData().filter(row => row.key !== 'receivable'), known = rows.filter(row => row.amount !== null);
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
      const rows = assetLayerData().filter(row => row.key !== 'receivable' && row.amount !== null && row.amount > 0);
      chart.setOption({
        tooltip: { trigger: 'item', formatter: p => `${escapeHTML(p.name)}<br/>${yuan(p.value)} (${escapeHTML(p.percent)}%)` },
        legend: { show: false },
        series: [{
          type: 'pie',
          radius: ['68%', '84%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 0, borderColor: '#fff', borderWidth: 2 },
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
      const items = derived.incomeBreakdown;
      const groups = new Map();
      items.forEach(i => {
        const key = i.source || '未分类';
        groups.set(key, (groups.get(key) || 0) + Number(i.amount));
      });
      chart.setOption({
        tooltip: { trigger: 'item', formatter: p => `${escapeHTML(p.name)}: ${yuan(p.value)} (${escapeHTML(p.percent)}%)` },
        series: [{
          name: '收入来源',
          type: 'pie',
          radius: ['68%', '84%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 0, borderColor: '#fff', borderWidth: 2 },
          label: { show: knownAmount(derived.summary.incomeTotal) && derived.summary.incomeTotal > 0, position: 'center', formatter: () => yuan(derived.summary.incomeTotal) + '\n当期已记', fontSize: 12, color: '#26334c' },
          emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
          data: [...groups.entries()].map(([name, value], i) => ({
            name,
            value,
            itemStyle: { color: incomeSourceColor(name, i) }
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
          radius: ['68%', '84%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 0, borderColor: '#fff', borderWidth: 2 },
          label: { show: knownAmount(derived.summary.expenseTotal) && derived.summary.expenseTotal > 0, position: 'center', formatter: () => yuan(derived.summary.expenseTotal) + '\n已记支出', fontSize: 12, color: '#26334c' },
          emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
          data: overviewExpenseRows().map(item => ({
            name: item.category,
            value: item.amount,
            itemStyle: { color: expenseColor(item) }
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
          { name: '确认收入', type: 'bar', data: h.map(m => m.income), itemStyle: { color: FINANCE_THEME.income, borderRadius: [4, 4, 0, 0] }, barMaxWidth: narrow ? 18 : 32 },
          { name: '已记录支出', type: 'bar', data: h.map(m => m.expense), itemStyle: { color: FINANCE_THEME.expense, borderRadius: [4, 4, 0, 0] }, barMaxWidth: narrow ? 18 : 32 },
          { name: '结余', type: 'line', data: h.map(m => m.savings), smooth: false, connectNulls: false, itemStyle: { color: FINANCE_THEME.savings }, lineStyle: { width: narrow ? 2 : 3 }, symbolSize: narrow ? 5 : 7 }
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
          { name: '日常', type: 'bar', stack: 'day', data: days.map(d => d.routine), itemStyle: { color: FINANCE_THEME.routine }, barMaxWidth: narrow ? 9 : 16 },
          { name: '一次性/资本', type: 'bar', stack: 'day', data: days.map(d => d.capital), itemStyle: { color: FINANCE_THEME.capital, borderRadius: [3, 3, 0, 0] }, barMaxWidth: narrow ? 9 : 16 }
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
        badge.className = 'text-xs px-2.5 py-1 rounded-lg font-mono finance-soft-badge border self-start sm:self-auto';
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
