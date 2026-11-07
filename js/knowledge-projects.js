/* 知识库项目台账只读投影。
 *
 * 数据来源：window.__OPS_KNOWLEDGE__.projects（由 scripts/knowledge_source.py
 * 的 parse_projects 生成，经 collector.py 写入 data/private/knowledge.js）。
 * 设计边界：
 *   - 单向只读：本文件只读快照，绝不回写知识库。
 *   - 缺数据即隐藏：公开站拿不到私有快照，整块不渲染，不留空壳。
 *   - 不推断进度：只展示文件名、改动时间、文件数与摘要，不编造状态或百分比。
 */
(() => {
  'use strict';

  const box = document.getElementById('knowledge-projects');
  if (!box) return;

  const data = window.__OPS_KNOWLEDGE__;
  const section = data && data.available === true ? data.projects : null;
  const items = section && Array.isArray(section.items) ? section.items : [];

  if (!items.length) {
    box.hidden = true;
    return;
  }

  const list = document.getElementById('knowledge-projects-list');
  const meta = document.getElementById('knowledge-projects-meta');
  if (!list) return;

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  const dayOf = item => (item.date_hint || (item.updated || '').slice(0, 10) || '日期未知');

  list.textContent = '';
  for (const item of items) {
    const card = element('div', 'glass-panel p-4 rounded-xl flex flex-col gap-2');

    const head = element('div', 'flex items-start justify-between gap-2');
    const title = element('span', 'text-sm font-semibold text-white break-words', item.name || '（未命名）');
    title.title = item.relative ? item.relative : (item.name || '');
    head.appendChild(title);
    head.appendChild(element('span', 'shrink-0 text-[11px] px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300', '知识库'));
    card.appendChild(head);

    const facts = [];
    if (item.relative) facts.push(item.relative);
    facts.push(dayOf(item));
    if (typeof item.file_count === 'number') facts.push(item.file_count + ' 个文件');
    if (item.updated_source === 'synced') facts.push('时间戳疑似批量刷新');
    card.appendChild(element('p', 'text-[11px] text-zinc-500', facts.join(' · ')));

    if (item.summary) {
      const summary = element('p', 'text-xs text-zinc-400 leading-relaxed break-words', item.summary);
      summary.title = item.summary;
      card.appendChild(summary);
    }

    list.appendChild(card);
  }

  box.hidden = false;
  if (meta) {
    const total = typeof section.total === 'number' ? section.total : items.length;
    meta.textContent = section.truncated
      ? `共 ${total} 项，按最近活动展示 ${items.length} 项`
      : `共 ${total} 项`;
  }
})();
