/* Public, read-only diary projection with an explicit import action into VitaFlow. */
(() => {
  'use strict';

  const dateNode = document.getElementById('diary-todos-date');
  const list = document.getElementById('diary-todos-list');
  const message = document.getElementById('diary-todos-message');
  if (!dateNode || !list || !message) return;

  let feedback = '';
  let snapshot = normalize(window.__OPS_DIARY_TODOS__);

  function normalize(value) {
    if (!value || typeof value !== 'object' || typeof value.date !== 'string' || !Array.isArray(value.items)) return null;
    const items = value.items.filter(item => item && typeof item.id === 'string' &&
      typeof item.title === 'string' && item.title.trim() && typeof item.source_date === 'string')
      .map(item => ({ id: item.id, title: item.title, completed: item.completed === true, source_date: item.source_date }));
    return { date: value.date, items };
  }

  function textElement(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    return node;
  }

  function importedItems(api, day) {
    try {
      if (!api?.isReady?.() || typeof api.getSummary !== 'function') return new Set();
      const summary = api.getSummary(day);
      return new Set((Array.isArray(summary?.todos) ? summary.todos : []).map(todo => String(todo.id)));
    } catch (_) {
      return new Set();
    }
  }

  function render({ clearFeedback = false } = {}) {
    if (clearFeedback) feedback = '';
    const today = calendarDay();
    list.replaceChildren();
    dateNode.textContent = snapshot ? '日记日期 ' + snapshot.date : '暂无日记计划';

    if (!snapshot) {
      message.textContent = feedback || '没有可显示的日记待办。';
      return;
    }
    if (snapshot.date !== today) {
      message.textContent = feedback || '最新日记待办日期为 ' + snapshot.date + '，不会显示为今天的事项。';
      return;
    }
    if (!snapshot.items.length) {
      message.textContent = feedback || '今天的日记计划里没有可导入的待办。';
      return;
    }

    const api = window.OpsVitaFlowNative;
    const canImport = !!api?.isReady?.() && typeof api.importDiaryTodo === 'function';
    const previouslyImported = importedItems(api, today);
    if (!feedback) message.textContent = canImport
      ? '来自日记的只读待办。导入后在 VitaFlow 单独勾选完成。'
      : '日记待办可查看；VitaFlow 正在准备导入功能。';

    for (const item of snapshot.items) {
      const row = document.createElement('li');
      const title = textElement('span', 'diary-todo-title', item.title);
      row.appendChild(title);

      const status = textElement('span', 'diary-todo-source-status', item.completed ? '日记已完成' : '日记未完成');
      row.appendChild(status);

      if (!item.completed) {
        const isImported = previouslyImported.has(item.id);
        const button = textElement('button', 'diary-todo-import', isImported ? '已导入' : '导入 VitaFlow');
        button.type = 'button';
        button.disabled = isImported || !canImport;
        button.setAttribute('aria-label', (isImported ? '已导入：' : '导入 VitaFlow：') + item.title);
        button.addEventListener('click', () => {
          const currentApi = window.OpsVitaFlowNative;
          if (!currentApi?.isReady?.() || typeof currentApi.importDiaryTodo !== 'function') {
            feedback = 'VitaFlow 尚未就绪，请稍后重试。';
            render({ clearFeedback: false });
            return;
          }
          button.disabled = true;
          try {
            const result = currentApi.importDiaryTodo({ id: item.id, title: item.title, date: today });
            if (result && typeof result.then === 'function') {
              result.then(handleResult).catch(() => {
                button.disabled = false;
                feedback = '导入失败；日记内容没有更改。';
                message.textContent = feedback;
              });
            } else handleResult(result);
          } catch (_) {
            button.disabled = false;
            feedback = '导入失败；日记内容没有更改。';
            message.textContent = feedback;
          }

          function handleResult(result) {
            if (result?.added === true) {
              feedback = '已导入 VitaFlow；完成状态由 VitaFlow 单独记录。';
              message.textContent = feedback;
              render();
            } else {
              button.disabled = false;
              feedback = '这条待办已存在于 VitaFlow；没有重复添加。';
              message.textContent = feedback;
            }
          }
        });
        row.appendChild(button);
      }
      list.appendChild(row);
    }
  }

  window.addEventListener('ops:day-changed', () => render({ clearFeedback: true }));
  window.addEventListener('ops:vitaflow-ready', render);
  window.addEventListener('ops:vitaflow-data', render);
  render();

  if (location.protocol === 'http:' || location.protocol === 'https:') {
    fetch('data/public/diary-todos.json?t=' + Date.now(), { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(fresh => {
        const normalized = normalize(fresh);
        if (normalized) {
          snapshot = normalized;
          render();
        } else if (!snapshot) {
          message.textContent = '暂时无法读取公开的日记待办。';
        }
      })
      .catch(() => {
        if (!snapshot) message.textContent = '暂时无法读取公开的日记待办。';
      });
  }
})();
