/* 日记精力投影：最近 7 天的精力／情绪／专注评分。
 *
 * 数据来源：window.__OPS_KNOWLEDGE__.energy（scripts/knowledge_source.py 的
 * parse_energy 从 01-Daily/YYYY-MM/YYYY-MM-DD.md 的「## 状态」段抽取）。
 * 边界：
 *   - 分数与推断依据都是你日记里写下的原话，这里只读呈现，不重算、不推分。
 *   - 不写入 VitaFlow 的四账户记录，也不与手动打卡合并。
 *   - 公开站拿不到私有快照，整块隐藏。
 */
(() => {
  'use strict';

  const box = document.getElementById('knowledge-energy');
  if (!box) return;

  const data = window.__OPS_KNOWLEDGE__;
  const energy = data && data.available === true ? data.energy : null;
  const days = energy && Array.isArray(energy.days) ? energy.days.slice() : [];
  if (!days.length) {
    box.hidden = true;
    return;
  }

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  const latest = days[0];
  const metrics = ['精力', '情绪', '专注'];
  const label = document.getElementById('knowledge-energy-label');
  if (label) label.textContent = '日记精力 · 最近 ' + days.length + ' 天';

  const list = document.getElementById('knowledge-energy-rows');
  if (!list) return;
  list.textContent = '';

  const ordered = days.slice().reverse(); // 左旧右新

  for (const name of metrics) {
    const current = latest.metrics ? latest.metrics[name] : null;
    const row = el('div', 'flex items-center gap-3 py-1.5');

    row.appendChild(el('span', 'w-10 shrink-0 text-xs text-zinc-400', name));

    const latestBox = el('span', 'w-16 shrink-0 text-sm font-mono tabular-nums text-white');
    latestBox.textContent = current ? current.score.toFixed(1) : '—';
    if (current && current.basis) latestBox.title = current.basis;
    row.appendChild(latestBox);

    const bars = el('div', 'flex items-end gap-1 h-6 flex-1');
    for (const day of ordered) {
      const metric = day.metrics ? day.metrics[name] : null;
      const bar = el('span', 'flex-1 rounded-sm bg-indigo-500/70');
      const ratio = metric && metric.scale ? Math.max(0.08, Math.min(1, metric.score / metric.scale)) : 0.08;
      bar.style.height = Math.round(ratio * 100) + '%';
      bar.title = day.date + ' ' + (metric ? metric.score + '/' + metric.scale : '无记录') +
        (metric && metric.basis ? '：' + metric.basis : '');
      if (!metric) bar.className = 'flex-1 rounded-sm bg-zinc-700/50';
      bars.appendChild(bar);
    }
    row.appendChild(bars);

    const basis = el('span', 'hidden xl:block shrink-0 max-w-[280px] truncate text-[11px] text-zinc-500',
      current && current.basis ? current.basis : '');
    if (current && current.basis) basis.title = current.basis;
    row.appendChild(basis);

    list.appendChild(row);
  }

  const extraBox = document.getElementById('knowledge-energy-extra');
  if (extraBox) {
    extraBox.textContent = '';
    const extras = latest.extra || {};
    const parts = [];
    if (extras['睡眠']) parts.push('睡眠 ' + extras['睡眠']);
    if (extras['运动']) parts.push('运动 ' + extras['运动']);
    extraBox.textContent = parts.join(' · ');
    extraBox.hidden = !parts.length;
  }

  const source = document.getElementById('knowledge-energy-source');
  if (source) source.textContent = '来源：' + (latest.file || '日记') + '（只读，不计入四账户）';

  box.hidden = false;
})();
