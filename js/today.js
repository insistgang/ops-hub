/* A private, browser-local daily focus list. */
(() => {
  const form = document.getElementById('focus-form');
  const input = document.getElementById('focus-input');
  const list = document.getElementById('focus-list');
  const empty = document.getElementById('focus-empty');
  const count = document.getElementById('focus-count');
  const feedback = document.getElementById('focus-feedback');
  const date = document.getElementById('today-date');
  const progress = document.getElementById('focus-progress');
  const previousList = document.getElementById('carryover-list');
  const previousEmpty = document.getElementById('carryover-empty');
  const previousDate = document.getElementById('carryover-date');
  const previousFeedback = document.getElementById('carryover-feedback');
  if (!form || !input || !list || !empty || !count || !feedback || !date) return;

  const today = () => calendarDay();
  let day = today();
  let items = [];
  let lastRaw = null;
  let storageAvailable = true;
  let previous = { raw: null, items: [] };
  const yesterday = () => new Date((dateOrdinal(day) - 1) * 86400000).toISOString().slice(0, 10);
  function snapshot(key) {
    const raw = localStorage.getItem(key);
    const value = raw === null ? [] : JSON.parse(raw);
    if (!Array.isArray(value) || value.length > 3 || value.some(item =>
      !item || typeof item.text !== 'string' || !item.text.trim() || item.text.length > 120 ||
      (item.done !== undefined && typeof item.done !== 'boolean')
    )) throw new Error('Invalid focus record');
    return { raw, items: value.map(item => ({ text: item.text, done: item.done === true })) };
  }
  function read() {
    try {
      const saved = snapshot(`ops_focus_${day}`);
      items = saved.items;
      lastRaw = saved.raw;
      storageAvailable = true;
      feedback.textContent = '';
    } catch (_) {
      storageAvailable = false;
      feedback.textContent = '重点读取失败，存储不可用或记录格式有误；原记录已保留。';
    }
  }
  function save(next) {
    if (!storageAvailable) return false;
    let saved;
    try { saved = snapshot(`ops_focus_${day}`); } catch (_) {
      storageAvailable = false;
      feedback.textContent = '重点读取失败，存储不可用或记录格式有误；原记录已保留。';
      render();
      return false;
    }
    if (saved.raw !== lastRaw) {
      items = saved.items;
      lastRaw = saved.raw;
      feedback.textContent = '重点已在其他页面更新，请核对后再操作。';
      render();
      return false;
    }
    try {
      const raw = JSON.stringify(next);
      localStorage.setItem(`ops_focus_${day}`, raw);
      items = next;
      lastRaw = raw;
      feedback.textContent = '';
      return true;
    } catch (_) {
      feedback.textContent = '保存失败，原记录未改变；请检查浏览器存储设置后重试。';
      return false;
    }
  }
  function rollover() {
    const now = today();
    if (now !== day) { day = now; items = []; lastRaw = null; read(); readPrevious(); return true; }
    return false;
  }
  function readPrevious() {
    if (!previousFeedback) return;
    try {
      previous = snapshot(`ops_focus_${yesterday()}`);
      previousFeedback.textContent = '';
    } catch (_) {
      previous = { raw: null, items: [] };
      previousFeedback.textContent = '昨日重点读取失败，存储不可用或记录格式有误；原记录已保留。';
    }
  }
  function renderPrevious(controls) {
    if (!previousList || !previousEmpty || !previousDate || !previousFeedback) return;
    previousDate.textContent = yesterday();
    previousList.replaceChildren();
    const unfinished = previous.items.filter(item => !item.done);
    previousEmpty.hidden = unfinished.length > 0 || !!previousFeedback.textContent;
    unfinished.forEach((item, index) => {
      const li = document.createElement('li');
      const text = document.createElement('span');
      text.className = 'focus-text';
      text.textContent = item.text;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'focus-carry';
      const exists = items.some(entry => entry.text.trim() === item.text.trim());
      button.textContent = exists ? '已在今天' : '安排到今天';
      button.disabled = exists || items.length >= 3 || !storageAvailable;
      button.setAttribute('aria-label', `${button.textContent}：${item.text}`);
      button.setAttribute('data-focus-control', `previous:${index}`);
      controls.set(`previous:${index}`, button);
      const shownDay = day;
      const shownRaw = previous.raw;
      button.addEventListener('click', () => {
        if (rollover() || shownDay !== day) { render(); return; }
        try {
          const current = snapshot(`ops_focus_${yesterday()}`);
          if (current.raw !== shownRaw) {
            previous = current;
            previousFeedback.textContent = '昨日记录已更新，请核对后再操作。';
            render();
            return;
          }
        } catch (_) { readPrevious(); render(); return; }
        if (items.length >= 3 || items.some(entry => entry.text.trim() === item.text.trim())) return;
        if (save([...items, { text: item.text, done: false }])) previousFeedback.textContent = '已安排到今天，昨日记录保持原样。';
        render();
      });
      li.append(text, button);
      previousList.append(li);
    });
  }
  function render() {
    rollover();
    const focusKey = document.activeElement?.getAttribute('data-focus-control');
    const controls = new Map();
    date.textContent = day;
    list.replaceChildren();
    count.textContent = `${items.length} / 3`;
    if (progress) progress.textContent = `已完成 ${items.filter(item => item.done).length} / ${items.length}`;
    empty.hidden = items.length > 0;
    empty.textContent = storageAvailable ? '还没有安排。写下一件最值得推进的事。' : '记录暂时无法读取，请保留原数据并检查浏览器存储设置。';
    input.disabled = !storageAvailable || items.length >= 3;
    form.querySelector('button').disabled = input.disabled;
    const shownDay = day;
    const shownRaw = lastRaw;
    items.forEach((item, index) => {
      const li = document.createElement('li');
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'focus-toggle';
      toggle.setAttribute('aria-pressed', String(!!item.done));
      toggle.setAttribute('aria-label', `${item.done ? '标为未完成' : '标为完成'}：${item.text}`);
      toggle.setAttribute('data-focus-control', `toggle:${index}`);
      controls.set(`toggle:${index}`, toggle);
      toggle.textContent = item.done ? '✓' : '○';
      toggle.addEventListener('click', () => {
        if (rollover() || shownDay !== day || shownRaw !== lastRaw || !items[index]) { render(); return; }
        save(items.map((entry, i) => i === index ? { ...entry, done: !entry.done } : entry));
        render();
      });
      const text = document.createElement('span');
      text.className = item.done ? 'focus-text done' : 'focus-text';
      text.textContent = item.text;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'focus-remove';
      remove.textContent = '移除';
      remove.setAttribute('aria-label', `移除：${item.text}`);
      remove.setAttribute('data-focus-control', `remove:${index}`);
      controls.set(`remove:${index}`, remove);
      remove.addEventListener('click', () => {
        if (rollover() || shownDay !== day || shownRaw !== lastRaw || !items[index]) { render(); return; }
        save(items.filter((_, i) => i !== index));
        render();
      });
      li.append(toggle, text, remove);
      list.append(li);
    });
    renderPrevious(controls);
    if (focusKey) {
      let target = controls.get(focusKey);
      if (!target || target.disabled) target = input.disabled ? controls.get(`toggle:${items.length - 1}`) : input;
      target?.focus();
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    rollover();
    const text = input.value.trim();
    if (!text || text.length > 120 || items.length >= 3) { render(); return; }
    if (save([...items, {text, done: false}])) input.value = '';
    render();
  });
  document.querySelectorAll('[data-open-tab]').forEach(button => button.addEventListener('click', () => {
    const target = button.getAttribute('data-open-tab');
    const tab = Array.from(document.querySelectorAll('.tab-btn')).find(el => el.getAttribute('data-tab') === target);
    if (tab) tab.click();
  }));
  function refresh() { rollover(); read(); readPrevious(); render(); }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  window.addEventListener('ops:day-changed', refresh);
  window.addEventListener('storage', event => {
    if (event.key === null || event.key === `ops_focus_${day}` || event.key === `ops_focus_${yesterday()}`) refresh();
  });
  read();
  readPrevious();
  render();
})();
