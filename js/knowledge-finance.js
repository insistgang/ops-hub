/* 知识库月度财务复盘投影。
 *
 * 数据来源：window.__OPS_KNOWLEDGE__.finance（由 scripts/knowledge_source.py 的
 * parse_finance 从 06-Growth/Finance/YYYY-MM-*-review.md 抽取）。
 * 边界：
 *   - 单向只读，不写回知识库，也不代替真实账本。
 *   - 公开站拿不到私有快照，整块隐藏。
 *   - 金额与口径原样呈现，不重算、不四舍五入、不推断缺失项。
 */
(() => {
  'use strict';

  const box = document.getElementById('knowledge-finance');
  if (!box) return;

  const data = window.__OPS_KNOWLEDGE__;
  const finance = data && data.available === true ? data.finance : null;
  const rows = finance && Array.isArray(finance.summary) ? finance.summary : [];
  if (!rows.length) {
    box.hidden = true;
    return;
  }

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

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
      const amount = el('span', 'shrink-0 text-sm font-mono tabular-nums text-white', row.amount_raw || '—');
      item.appendChild(amount);
      list.appendChild(item);
    }
  }

  const expenses = finance && Array.isArray(finance.expenses) ? finance.expenses : [];
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
})();
