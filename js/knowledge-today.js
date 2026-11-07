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
    setText('knowledge-direction', plan.direction || '');
    if (byId('knowledge-direction') && !plan.direction) byId('knowledge-direction').hidden = true;
    setText('knowledge-capacity', plan.capacity ? '当日容量：' + plan.capacity : '');
    if (byId('knowledge-capacity') && !plan.capacity) byId('knowledge-capacity').hidden = true;

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

  function renderNodes() {
    const list = byId('hard-nodes-list');
    const empty = byId('hard-nodes-empty');
    if (!list) return;

    const active = (nodes && Array.isArray(nodes.active)) ? nodes.active.slice() : [];
    const overdue = (nodes && Array.isArray(nodes.overdue)) ? nodes.overdue.slice() : [];
    const rows = overdue.concat(active);

    setText('hard-nodes-count', rows.length ? rows.length + ' 条' : '');

    list.textContent = '';
    if (!rows.length) {
      list.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    list.hidden = false;

    for (const row of rows) {
      const level = row.kind === 'ledger' ? 'overdue' : severity(row.days_left);
      const li = element('li', 'knowledge-node knowledge-node--' + level);

      li.appendChild(element('span', 'knowledge-days',
        row.kind === 'ledger' ? '已逾期' : (daysLabel(row.days_left) || '—')));

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
