/* Public VitaFlow reads stay in memory and never touch a visitor's editable records. */
(() => {
  'use strict';

  const root = document.getElementById('public-vita');
  const status = document.getElementById('public-vita-status');
  const accounts = document.getElementById('public-vita-accounts');
  const todos = document.getElementById('public-vita-todos');
  const notes = document.getElementById('public-vita-notes');
  const refreshButton = document.getElementById('public-vita-refresh');
  if (!root || !status || !accounts || !todos || !notes || root.dataset.publicVitaBound) return;
  root.dataset.publicVitaBound = 'true';

  const endpoint = 'https://finance.insistgang.top/api/public';
  const accountTypes = [['physical', '体能'], ['emotional', '情感'], ['focus', '思维'], ['meaning', '意志']];
  const noteTypes = [
    ['vitaflow_writing', '写作', 'title', [['正文', 'content']]],
    ['vitaflow_lazyy', '想法', 'title', [['正文', 'content']]],
    ['vitaflow_ideas', '灵感', 'title', [['正文', 'content']]],
    ['vitaflow_learning_notes', '学习笔记', 'title', [['正文', 'content']]],
    ['vitaflow_deepseek_docs', '创作笔记', 'title', [['正文', 'content']]],
    ['vitaflow_literature_docs', '文学笔记', 'title', [['正文', 'content']]],
    ['vitaflow_reading_notes', '读书笔记', 'bookTitle', [['章节', 'chapter'], ['摘要', 'summary'], ['感想', 'thoughts'], ['摘录', 'quotes'], ['行动', 'action']]],
    ['vitaflow_film_notes', '观影笔记', 'filmTitle', [['导演视角', 'directorView'], ['技术', 'technical'], ['主题', 'theme'], ['象征', 'symbolism'], ['感想', 'reflection']]],
    ['vitaflow_novel_outlines', '小说大纲', 'title', [['构思', 'concept'], ['主角', 'protagonist'], ['对手', 'antagonist'], ['配角', 'supporting'], ['结构', 'structure'], ['情节', 'plotPoints'], ['主题', 'theme'], ['备注', 'notes']]],
  ];
  const maximumNotes = 200;
  let snapshot = null;
  let inFlight = null;
  let lastAttempt = 0;
  let failed = false;

  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function decode(data, key, fallback) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) return fallback;
    if (typeof data[key] !== 'string') throw new Error('Invalid public record');
    return JSON.parse(data[key]);
  }
  function validDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  function normalize(payload) {
    if (!object(payload) || !object(payload.data)) throw new Error('Invalid public snapshot');
    const rawAccounts = decode(payload.data, 'vitaflow_accounts', {});
    if (!object(rawAccounts)) throw new Error('Invalid public accounts');
    const accountRows = accountTypes.map(([key, label]) => {
      const entry = rawAccounts[key];
      if (entry !== undefined && !object(entry)) throw new Error('Invalid public account');
      const score = entry?.score ?? null;
      if (score !== null && (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100)) throw new Error('Invalid public score');
      return { label, score };
    });
    const rawTodos = decode(payload.data, 'vitaflow_todos', []);
    if (!Array.isArray(rawTodos)) throw new Error('Invalid public todos');
    const todoRows = rawTodos.map(item => {
      if (!object(item) || typeof item.text !== 'string' || !validDay(item.date)) throw new Error('Invalid public todo');
      return { text: item.text, date: item.date, completed: typeof item.completed === 'boolean' ? item.completed : null };
    });
    const noteRows = [];
    for (const [key, label, titleField, fields] of noteTypes) {
      const list = decode(payload.data, key, []);
      if (!Array.isArray(list)) throw new Error('Invalid public notes');
      for (const item of list) {
        if (!object(item)) throw new Error('Invalid public note');
        const title = typeof item[titleField] === 'string' ? item[titleField] : '';
        const sections = fields.filter(([, field]) => typeof item[field] === 'string' && item[field].trim())
          .map(([name, field]) => ({ label: name, text: item[field] }));
        noteRows.push({ label, title, sections });
      }
    }
    return {
      accounts: accountRows, todos: todoRows, notes: noteRows,
      updatedAt: typeof payload.updatedAt === 'string' && Number.isFinite(Date.parse(payload.updatedAt)) ? payload.updatedAt : null,
    };
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function currentDay() {
    if (typeof calendarDay === 'function') return calendarDay();
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }
  function render() {
    if (!snapshot) return;
    accounts.replaceChildren();
    for (const row of snapshot.accounts) accounts.appendChild(element('span', 'vita-summary-account', row.label + ' ' + (row.score === null ? '—' : row.score)));
    todos.replaceChildren();
    const today = currentDay();
    const todayTodos = snapshot.todos.filter(item => item.date === today);
    for (const item of todayTodos) {
      const row = element('li');
      const label = item.completed === true ? '已完成' : item.completed === false ? '未完成' : '状态未记录';
      row.appendChild(element('span', 'today-muted', label));
      row.appendChild(element('span', item.completed === true ? 'focus-text done' : 'focus-text', item.text));
      todos.appendChild(row);
    }
    if (!todayTodos.length) todos.appendChild(element('li', 'today-muted', today + ' 没有公开的日程待办。'));
    notes.replaceChildren();
    for (const item of snapshot.notes.slice(0, maximumNotes)) {
      const detail = element('details', 'public-vita-note');
      detail.appendChild(element('summary', '', item.label + ' · ' + (item.title || '未填写标题')));
      if (!item.sections.length) detail.appendChild(element('p', 'today-muted', '未填写正文。'));
      for (const section of item.sections) {
        detail.appendChild(element('h4', '', section.label));
        const content = element('p', 'public-vita-note-content', section.text);
        content.style.whiteSpace = 'pre-wrap';
        content.style.overflowWrap = 'anywhere';
        detail.appendChild(content);
      }
      notes.appendChild(detail);
    }
    if (!snapshot.notes.length) notes.appendChild(element('p', 'today-muted', '没有公开的笔记。'));
    if (failed) {
      status.textContent = '读取失败，仍展示上次成功记录；这些内容可能已过期。';
      return;
    }
    const hasRecords = snapshot.accounts.some(row => row.score !== null) || snapshot.todos.length || snapshot.notes.length;
    const age = snapshot.updatedAt ? Date.now() - Date.parse(snapshot.updatedAt) : null;
    let text = hasRecords ? '公开只读 · 日程、精力和笔记由服务器提供。' : '公开只读 · 服务器尚无可展示的记录。';
    if (snapshot.updatedAt) text += ' 更新于 ' + new Date(snapshot.updatedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) + '。';
    else text += ' 服务器更新时间未提供。';
    if (age !== null && age > 24 * 60 * 60 * 1000) text += ' 快照已超过 24 小时，请核对更新状态。';
    if (snapshot.notes.length > maximumNotes) text += ' 页面显示前 ' + maximumNotes + ' 条笔记，共 ' + snapshot.notes.length + ' 条。';
    status.textContent = text;
  }
  function refresh() {
    if (inFlight) return inFlight;
    lastAttempt = Date.now();
    status.textContent = snapshot ? '正在刷新公开记录，仍展示上次成功内容。' : '正在读取公开记录。';
    if (refreshButton) refreshButton.disabled = true;
    inFlight = Promise.resolve().then(() => fetch(endpoint, { cache: 'no-store', credentials: 'omit' }))
      .then(response => {
        if (!response.ok) throw new Error('Public read failed');
        return response.json();
      })
      .then(payload => { snapshot = normalize(payload); failed = false; render(); })
      .catch(() => {
        failed = true;
        if (snapshot) render();
        else status.textContent = '公开记录读取失败，尚无可展示的数据。';
      })
      .finally(() => { inFlight = null; if (refreshButton) refreshButton.disabled = false; });
    return inFlight;
  }

  refreshButton?.addEventListener('click', refresh);
  window.addEventListener('ops:day-changed', render);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      render();
      if (Date.now() - lastAttempt >= 30 * 1000) void refresh();
    }
  });
  setInterval(() => { if (!document.hidden) void refresh(); }, 60 * 1000);
  window.OpsVitaFlowPublic = { refresh };
  void refresh();
})();
