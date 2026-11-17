/**
 * js/core.js: Ops-Hub 前端零依赖公共底座。
 *
 * 统一提供北京时间日界计算、XSS 安全转义、轻量 DOM 构造、求职阶段排序、
 * 与后端 scripts/ops_common.py 同源的三端任务分流表，以及公开知识库快照的去缓存刷新。
 */
(() => {
  'use strict';

  function calendarDay(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const pick = type => parts.find(part => part.type === type).value;
    return `${pick('year')}-${pick('month')}-${pick('day')}`;
  }

  function dateOrdinal(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return null;
    const [, year, month, day] = match.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
      ? date.getTime() / 86400000
      : null;
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch]));
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  const byId = id => document.getElementById(id);
  const setText = (id, text) => {
    const node = byId(id);
    if (node) node.textContent = text;
  };

  function careerStageRank(status) {
    const label = String(status || '');
    const low = label.toLowerCase();
    if (label.includes('面')) return 0;
    if (label.includes('笔试')) return 1;
    if (low.includes('offer') || label.includes('录用')) return 2;
    if (label.includes('初筛')) return 3;
    if (label.includes('投递')) return 4;
    return 5;
  }

  const TASK_ROUTES = [
    {
      target: 'mac',
      icon: 'laptop',
      toneClass: 'text-emerald-300',
      iconClass: 'text-indigo-400',
      keywords: ['论文', '写作', '日记', '求职', '简历', '复盘', '思考', 'typst', '前端'],
      headline: '👉 立即留在 MacBook Air (M5) 执行！',
      advice: '场景指引：抱上 Mac 前往图书馆专注完成，断网/静音深潜，严禁多开与发散。',
    },
    {
      target: 'windows',
      icon: 'server',
      toneClass: 'text-sky-300',
      iconClass: 'text-sky-400',
      keywords: ['cuda', '训练', 'yolo', '冷备', '备份', '下载', '游戏', '渲染', '构建', '依赖'],
      headline: '👉 立即派发给 Windows 4070S 性能主机 执行！',
      advice: 'CUDA 训练 / 批量构建 / 冷备仓库',
    },
    {
      target: 'jetson',
      icon: 'bot',
      toneClass: 'text-emerald-300',
      iconClass: 'text-emerald-400',
      keywords: ['jetson', '边缘', '机器人', 'ros', '视觉', '传感器', '亚博'],
      headline: '👉 立即派发给 Jetson 边缘计算硬件 执行！',
      advice: '端侧视觉与机器人感知部署（局域网直连）',
    },
  ];

  function routeTask(query) {
    const normalized = String(query || '').trim().toLowerCase();
    if (!normalized) return null;
    for (const rule of TASK_ROUTES) {
      if (rule.keywords.some(keyword => normalized.includes(keyword))) {
        return rule;
      }
    }
    return {
      target: 'general',
      headline: '💡 通用分流口诀：',
      advice: '思考/文字/求职留在 Mac（去图书馆），重跑/构建/冷备丢给 Win 4070S，端侧感知丢给 Jetson。',
    };
  }

  /**
   * 公开站去缓存刷新知识库投影：
   * 本机私有投影含有 source_root，绝不发起公开拉取覆盖本机真源；
   * 公开站（无 source_root 且走 http/https）拉取 data/public/knowledge.json?t= 绕过 ?v= 静态缓存。
   */
  function refreshPublicKnowledge() {
    const current = window.__OPS_KNOWLEDGE__;
    if (current && typeof current === 'object' && current.source_root) {
      return Promise.resolve(current);
    }
    const protocol = window.location?.protocol;
    if (protocol !== 'http:' && protocol !== 'https:') {
      return Promise.resolve(current || null);
    }
    if (typeof window.fetch !== 'function') {
      return Promise.resolve(current || null);
    }
    return window.fetch('data/public/knowledge.json?t=' + Date.now(), { cache: 'no-store' })
      .then(response => (response.ok ? response.json() : null))
      .then(fresh => {
        if (fresh && typeof fresh === 'object' && fresh.available === true) {
          window.__OPS_KNOWLEDGE__ = fresh;
          window.dispatchEvent?.(new CustomEvent('ops:knowledge-updated', { detail: fresh }));
          return fresh;
        }
        return current || null;
      })
      .catch(() => current || null);
  }

  window.OpsCore = {
    calendarDay,
    dateOrdinal,
    esc,
    el,
    byId,
    setText,
    careerStageRank,
    TASK_ROUTES,
    routeTask,
    refreshPublicKnowledge,
  };

  if (typeof window.calendarDay !== 'function') window.calendarDay = calendarDay;
  if (typeof window.dateOrdinal !== 'function') window.dateOrdinal = dateOrdinal;
  if (typeof window.esc !== 'function') window.esc = esc;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { void refreshPublicKnowledge(); }, { once: true });
  } else {
    void refreshPublicKnowledge();
  }
})();
