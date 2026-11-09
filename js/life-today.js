/* Read the same native records as the detailed workspaces. Never persist financial data. */
(() => {
  'use strict';
  const put = (id, text) => { const node = document.getElementById('today-' + id); if (node) node.textContent = text; };
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const kg = value => finite(value) ? value.toFixed(1) + ' kg' : '—';
  const money = value => finite(value) ? '¥' + value.toLocaleString('zh-CN', {minimumFractionDigits:2,maximumFractionDigits:2}) : '—';

  function renderWeight() {
    let summary;
    try { summary = window.OpsWeightNative?.isReady() ? window.OpsWeightNative.getSummary() : null; } catch (_) { summary = {error:true}; }
    if ((!summary || !summary.latest || summary.error) && window.__OPS_WEIGHT__?.records?.length) {
      const w = window.__OPS_WEIGHT__;
      const u = w.users?.[0] || w.user;
      const recs = w.records || [];
      const latest = recs[recs.length - 1];
      const first = recs[0];
      summary = {
        latest: latest ? { date: latest.date, weight: latest.weight } : null,
        goal: u?.goal ?? null,
        change: first && latest ? Math.round((latest.weight - first.weight) * 10) / 10 : null,
        count: recs.length,
        user: u ? { name: u.name, id: u.id } : null,
        error: null
      };
    }
    put('weight-value', summary?.error ? '—' : kg(summary?.latest?.weight));
    put('weight-goal', summary?.error ? '目标未读取' : '目标 ' + kg(summary?.goal));
    if (summary?.error) {
      put('weight-status', '本机记录暂时不可用');
      put('weight-detail', '原记录已保留，请进入体重页查看提示。');
    } else if (summary?.latest) {
      put('weight-status', '本机 · ' + summary.latest.date);
      const change = finite(summary.change) ? `${summary.change > 0 ? '+' : ''}${summary.change.toFixed(1)} kg` : '—';
      put('weight-detail', `${summary.user?.name || '当前使用者'} · ${summary.count} 条记录 · 较首次 ${change}`);
    } else {
      put('weight-status', summary ? '还没有体重记录' : '正在准备体重记录');
      put('weight-detail', '与体重页共用本机记录，可直接记下今天的体重。');
    }
  }

  function renderFinance() {
    let summary;
    try { summary = window.OpsFinanceNative?.isReady() ? window.OpsFinanceNative.getSummary() : null; } catch (_) { summary = {status:'error'}; }
    const state = summary?.status || 'idle';
    const visible = state === 'ready' || state === 'error';
    put('finance-expense', visible ? money(summary?.expenseTotal) : '—');
    put('finance-cash', visible ? money(summary?.availableCash) : '—');
    const labels = {idle:'尚未读取私人账本',loading:'正在读取受保护账本',ready:'已读取 · 仅本页保留',locked:'账本要求认证',error:'账本读取未成功'};
    put('finance-status', labels[state] || labels.idle);
    put('finance-detail', state === 'ready' ? `数据日期：${summary.asOf || '以财务页标注为准'}。刷新页面后需要重新读取。`
      : state === 'error' ? '如有数值，为上次成功读取的记录；进入财务页重试。'
      : '进入财务页主动读取；账本不会存入总台或浏览器存储。');
  }

  function boot() {
    for (const type of ['ops:weight-ready','ops:weight-data']) window.addEventListener(type, renderWeight);
    for (const type of ['ops:finance-ready','ops:finance-data']) window.addEventListener(type, renderFinance);
    document.getElementById('weight-refresh')?.addEventListener('click', () => { window.OpsWeightNative?.refresh(); renderWeight(); });
    document.querySelectorAll('[data-weight-view]').forEach(button => button.addEventListener('click', () => {
      document.querySelector('[data-ops-tab][data-tab="tab-weight"]')?.click();
      window.OpsWeightNative?.activate(button.dataset.weightView);
    }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderWeight(); renderFinance(); } });
    renderWeight(); renderFinance();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
