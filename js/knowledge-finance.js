/* 知识库月度财务复盘投影。
 *
 * 数据来源：window.__OPS_KNOWLEDGE__.finance（本机优先读 data/private/knowledge.js，
 * 公开站回退 data/public/knowledge.{js,json}）。
 * 边界：单向只读，不替代真实实时账本；金额与口径原样展示，不重算、不推断。
 */
(() => {
  'use strict';

  const box = document.getElementById('knowledge-finance');
  if (!box) return;

  const el = window.OpsCore?.el || ((tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  });

  function render(data) {
    const finance = data && data.available === true ? data.finance : null;
    const rows = finance && Array.isArray(finance.summary) ? finance.summary : [];
    if (!rows.length) {
      box.hidden = true;
      return;
    }

    const head = document.getElementById('knowledge-finance-head');
    if (head) head.textContent = '知识库月度财务 · ' + (finance.month || '');

    const asOf = document.getElementById('knowledge-finance-asof');
    if (asOf) {
      asOf.textContent = finance.as_of || '';
      asOf.hidden = !finance.as_of;
    }

    const list = document.getElementById('knowledge-finance-rows');
    if (list) {
      list.textContent = '';
      for (const row of rows) {
        const item = el('div', 'flex items-start justify-between gap-3 py-1.5 border-b border-zinc-800/60 last:border-0');
        const left = el('div', 'min-w-0');
        left.appendChild(el('span', 'text-xs text-zinc-300', row.label || '—'));
        if (row.note) {
          const note = el('p', 'text-[11px] text-zinc-500 leading-snug mt-0.5 break-words', row.note);
          note.title = row.note;
          left.appendChild(note);
        }
        item.appendChild(left);
        item.appendChild(el('span', 'shrink-0 text-sm font-mono tabular-nums text-white', row.amount_raw || '—'));
        list.appendChild(item);
      }
    }

    const expenses = Array.isArray(finance.expenses) ? finance.expenses : [];
    const expenseBox = document.getElementById('knowledge-finance-expenses');
    if (expenseBox) {
      expenseBox.textContent = '';
      if (!expenses.length) {
        expenseBox.hidden = true;
      } else {
        expenseBox.hidden = false;
        for (const row of expenses) {
          const tag = el('span', 'text-[11px] px-2 py-0.5 rounded-md bg-zinc-800/70 text-zinc-300');
          tag.textContent = (row.label || '—') + ' ' + (row.amount_raw || '');
          tag.title = row.note || '';
          expenseBox.appendChild(tag);
        }
      }
    }

    const source = document.getElementById('knowledge-finance-source');
    if (source) source.textContent = '来源：' + (finance.file || '知识库财务复盘');

    box.hidden = false;
  }

  render(window.__OPS_KNOWLEDGE__);
  window.addEventListener?.('ops:knowledge-updated', event => {
    render(event?.detail || window.__OPS_KNOWLEDGE__);
  });
})();
