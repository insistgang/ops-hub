/* 知识库只读投影渲染。
 *
 * 数据来源：data/private/knowledge.js（由 scripts/collector.py 调用
 * scripts/knowledge_source.py 生成，data/private/ 已 git-ignore）。
 * 设计边界：
 *   - 单向只读：本文件只读快照，绝不回写知识库。
 *   - 缺文件即隐藏：公开站拿不到私有快照，整块不渲染，不影响其他模块。
 */
(() => {
  'use strict';

  const card = document.getElementById('knowledge-card');
  if (!card) return;

  const data = window.__OPS_KNOWLEDGE__;
  const available = data && data.available === true &&
    (data.today_plan || data.hard_nodes);
  if (!available) {
    card.hidden = true;
    // 没有知识库投影时左栏只剩一张卡，双列栅格会留出大片空白；
    // 交给 CSS 改单列（见 custom.css 的 .today-grid.no-knowledge）。
    document.querySelector('.today-grid')?.classList.add('no-knowledge');
    return;
  }

  const byId = id => document.getElementById(id);
  const setText = (id, text) => { const node = byId(id); if (node) node.textContent = text; };
  const plan = data.today_plan || null;
  const nodes = data.hard_nodes || null;

  function daysLabel(days) {
    if (typeof days !== 'number' || !Number.isFinite(days)) return '';
    if (days < 0) return '逾期 ' + Math.abs(days) + ' 天';
    if (days === 0) return '今天';
    return days + ' 天后';
  }

  function severity(days) {
    if (typeof days !== 'number' || !Number.isFinite(days)) return 'normal';
    if (days < 0) return 'overdue';
    if (days <= 2) return 'urgent';
    if (days <= 14) return 'soon';
    return 'normal';
  }

  // 卡片里只留概要，全文放 title；CSS line-clamp 会被 .today-muted 覆盖，不依赖它
  function brief(text, max) {
    const value = (text || '').trim();
    if (!value) return '';
    return value.length <= max ? value : value.slice(0, max).trimEnd() + '…';
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function renderPlan() {
    const list = byId('knowledge-items');
    const empty = byId('knowledge-empty');
    if (!plan) {
      if (list) list.hidden = true;
      if (empty) { empty.hidden = false; empty.textContent = '没有读到今日计划。'; }
      return;
    }

    setText('knowledge-date', plan.date + (plan.is_today ? ' 今日' : ' 最近一份'));

    // 这两个节点在 HTML 里默认 hidden，必须显式解除，否则永远不显示
    const direction = byId('knowledge-direction');
    if (direction) {
      direction.textContent = brief(plan.direction, 150);
      direction.title = plan.direction || '';
      direction.hidden = !plan.direction;
    }
    const capacity = byId('knowledge-capacity');
    if (capacity) {
      capacity.textContent = plan.capacity ? '当日容量：' + brief(plan.capacity, 110) : '';
      capacity.title = plan.capacity || '';
      capacity.hidden = !plan.capacity;
    }

    if (!list) return;
    list.textContent = '';
    const items = Array.isArray(plan.items) ? plan.items : [];

    if (!items.length) {
      list.hidden = true;
      if (empty) { empty.hidden = false; empty.textContent = '今日计划里没有解析到必做项，请核对模板格式。'; }
      return;
    }

    if (empty) empty.hidden = true;
    list.hidden = false;

    for (const item of items) {
      const li = element('li', 'knowledge-item');

      const head = element('div', 'knowledge-item-head');
      if (item.tag) head.appendChild(element('span', 'knowledge-tag', item.tag));
      head.appendChild(element('strong', 'knowledge-item-title', item.title || '（无标题）'));
      li.appendChild(head);

      const meta = [];
      if (item.assignee) meta.push(item.assignee);
      if (item.estimate) meta.push('预计 ' + item.estimate);
      if (meta.length) li.appendChild(element('p', 'knowledge-meta', meta.join(' · ')));

      if (item.done_standard) {
        li.appendChild(element('p', 'knowledge-std', '完成标准：' + item.done_standard));
      }
      list.appendChild(li);
    }
  }

  function renderWip() {
    const box = byId('knowledge-wip');
    const list = byId('knowledge-wip-list');
    if (!box || !list) return;
    const items = (data.wip && Array.isArray(data.wip.items)) ? data.wip.items : [];
    if (!items.length) { box.hidden = true; return; }

    list.textContent = '';
    for (const item of items) {
      const li = element('li', 'knowledge-wip-item');
      li.appendChild(element('span', 'knowledge-wip-pos', item.position || '—'));
      const title = element('span', 'knowledge-wip-title', item.title || '（无标题）');
      if (item.action) title.title = item.action;
      li.appendChild(title);
      if (item.assignee) li.appendChild(element('span', 'knowledge-wip-meta', item.assignee));
      list.appendChild(li);
    }
    box.hidden = false;
  }

  function renderNodes() {
    const list = byId('hard-nodes-list');
    const empty = byId('hard-nodes-empty');
    if (!list) return;

    const active = (nodes && Array.isArray(nodes.active)) ? nodes.active.slice() : [];
    const overdue = (nodes && Array.isArray(nodes.overdue)) ? nodes.overdue.slice() : [];
    const rows = overdue.concat(active);

    setText('hard-nodes-count', rows.length ? rows.length + ' 条' : '0 条');

    const card = byId('hard-nodes-card');
    if (card) card.hidden = rows.length === 0;

    list.textContent = '';
    if (!rows.length) {
      list.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    list.hidden = false;

    for (const row of rows) {
      const pending = row.needs_confirm === true;
      const level = row.kind === 'ledger' ? 'overdue'
        : (row.date_precision === 'month' ? 'normal' : (pending ? 'pending' : severity(row.days_left)));
      const li = element('li', 'knowledge-node knowledge-node--' + level);

      const monthOnly = row.date_precision === 'month';
      const label = row.kind === 'ledger'
        ? '已逾期'
        : monthOnly ? '日期未定'
        : (pending ? `待确认 · ${Math.abs(row.days_left || 0)} 天` : (daysLabel(row.days_left) || '—'));
      li.appendChild(element('span', 'knowledge-days', label));

      const body = element('div', 'knowledge-node-body');
      body.appendChild(element('span', 'knowledge-node-title', row.title || '（无事项）'));
      const detail = [row.date, row.type].filter(Boolean).join(' · ');
      if (detail) body.appendChild(element('span', 'knowledge-node-date', detail));
      li.appendChild(body);

      if (row.impact) li.title = row.impact;
      list.appendChild(li);
    }
  }

  function renderWarnings() {
    const target = byId('knowledge-warning');
    if (!target) return;
    const warnings = Array.isArray(data.warnings) ? data.warnings.slice() : [];
    if (data.error) warnings.unshift(data.error);
    if (!warnings.length) { target.hidden = true; return; }
    target.hidden = false;
    target.textContent = warnings.join('；');
  }

  function boot() {
    renderWip();
    renderPlan();
    renderNodes();
    renderWarnings();
    card.hidden = false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
