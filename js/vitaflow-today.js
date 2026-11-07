/* Read the same VitaFlow records shown in the native workspace. */
function initVitaFlowToday() {
  const accounts = document.getElementById('vita-today-accounts');
  const todos = document.getElementById('vita-today-todos');
  const count = document.getElementById('vita-today-count');
  const empty = document.getElementById('vita-today-empty');
  const feedback = document.getElementById('vita-today-feedback');
  if (!accounts || !todos || !count || !empty || !feedback || count.dataset.bound) return;
  count.dataset.bound = 'true';

  function render(focusId) {
    const api = window.OpsVitaFlowNative;
    if (!api?.isReady()) {
      count.textContent = '正在读取';
      return;
    }
    let summary;
    try {
      summary = api.getSummary(calendarDay());
      if (!summary || summary.error) throw new Error('unavailable');
    } catch (_) {
      feedback.textContent = '日程记录读取失败，请保留原数据并检查工作区。';
      feedback.dataset.kind = 'read';
      return;
    }
    if (feedback.dataset.kind === 'read') { feedback.textContent = ''; feedback.dataset.kind = ''; }
    accounts.replaceChildren();
    (summary.accounts || []).forEach(account => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'vita-summary-account';
      button.textContent = account.label + ' ' + (account.score == null ? '—' : account.score);
      button.setAttribute('aria-label', '记录与回看' + account.label);
      button.addEventListener('click', () => window.OpsVitaFlow?.open(account.key));
      accounts.append(button);
    });
    const records = Array.isArray(summary.todos) ? summary.todos : [];
    const completed = records.filter(row => row.completed === true).length;
    count.textContent = '已完成 ' + completed + ' / ' + records.length;
    empty.hidden = records.length > 0 && records.length <= 5;
    empty.textContent = records.length > 5 ? '还有 ' + (records.length - 5) + ' 条记录，可在日程页查看。' : '今天还没有日程，安排一件想推进的事。';
    todos.replaceChildren();
    let focused = null;
    let firstToggle = null;
    [...records].sort((a, b) => Number(!!a.completed) - Number(!!b.completed)).slice(0, 5).forEach(todo => {
      const li = document.createElement('li');
      const toggle = document.createElement('button');
      if (!firstToggle) firstToggle = toggle;
      toggle.type = 'button';
      toggle.className = 'focus-toggle';
      toggle.textContent = todo.completed ? '✓' : '○';
      toggle.setAttribute('aria-pressed', String(!!todo.completed));
      toggle.setAttribute('aria-label', (todo.completed ? '标为未完成：' : '标为完成：') + todo.text);
      toggle.addEventListener('click', () => {
        try {
          api.toggleTodo(todo.id);
          feedback.textContent = '';
          feedback.dataset.kind = '';
        } catch (_) {
          feedback.textContent = '保存失败，请检查浏览器存储后重试。';
          feedback.dataset.kind = 'write';
        }
        render(todo.id);
      });
      const text = document.createElement('span');
      text.className = todo.completed ? 'focus-text done' : 'focus-text';
      text.textContent = todo.text;
      li.append(toggle, text);
      todos.append(li);
      if (todo.id === focusId) focused = toggle;
    });
    if (focusId !== undefined) (focused || firstToggle)?.focus();
  }
  ['ops:vitaflow-ready', 'ops:vitaflow-data', 'ops:day-changed'].forEach(type => window.addEventListener(type, () => render()));
  window.addEventListener('storage', event => {
    if (event.key === null || event.key?.startsWith('vitaflow_')) render();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  render();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initVitaFlowToday, { once: true });
else initVitaFlowToday();
