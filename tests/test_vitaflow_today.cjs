const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup({ ready = true, failSave = false } = {}) {
  const document = { readyState: 'complete', hidden: false, events: {}, addEventListener(type, fn) { this.events[type] = fn; } };
  class Element {
    constructor() { this.children = []; this.dataset = {}; this.attrs = {}; this.listeners = {}; this.textContent = ''; }
    replaceChildren() { this.children = []; }
    append(...children) { this.children.push(...children); }
    setAttribute(key, value) { this.attrs[key] = value; }
    addEventListener(type, fn) { this.listeners[type] = fn; }
    focus() { document.activeElement = this; }
    click() { this.focus(); this.listeners.click?.(); }
  }
  const ids = Object.fromEntries(['accounts','todos','count','empty','feedback'].map(name => ['vita-today-' + name, new Element()]));
  document.getElementById = id => ids[id];
  document.createElement = () => new Element();
  const events = {};
  const calls = [];
  const summary = { accounts: [{ key: 'physical', label: '体能', score: 0 }, { key: 'focus', label: '思维', score: null }], todos: [{ id: 101, text: '<img src=x onerror=alert(1)>', completed: false, account: 'physical' }], storage: 'browser' };
  let day = '2026-11-07';
  const window = {
    addEventListener: (type, fn) => { events[type] = fn; },
    OpsVitaFlow: { open: view => calls.push(['open', view]) },
    OpsVitaFlowNative: {
      isReady: () => ready,
      getSummary: date => { calls.push(['read', date]); return summary; },
      toggleTodo(id) { if (failSave) throw new Error('blocked'); calls.push(['toggle', id]); summary.todos.find(row => row.id === id).completed = !summary.todos.find(row => row.id === id).completed; },
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/vitaflow-today.js'), 'utf8'), { window, document, calendarDay: () => day });
  return { ids, summary, calls, document, emit: type => events[type]?.({}), nextDay: () => { day = '2026-11-08'; events['ops:day-changed']?.({}); } };
}

test('home reads real VitaFlow records, preserves zero, and renders task text without HTML injection', () => {
  const app = setup();
  assert.match(app.ids['vita-today-accounts'].children[0].textContent, /0/);
  assert.match(app.ids['vita-today-accounts'].children[1].textContent, /—/);
  assert.equal(app.ids['vita-today-todos'].children[0].children[1].textContent, '<img src=x onerror=alert(1)>');
  assert.equal(app.ids['vita-today-count'].textContent, '已完成 0 / 1');
});

test('home completes the same typed task id and restores focus after rendering', () => {
  const app = setup();
  app.ids['vita-today-todos'].children[0].children[0].click();
  assert.deepEqual(app.calls.find(([type]) => type === 'toggle'), ['toggle', 101]);
  assert.equal(app.summary.todos[0].completed, true);
  assert.equal(app.ids['vita-today-count'].textContent, '已完成 1 / 1');
  assert.equal(app.document.activeElement, app.ids['vita-today-todos'].children[0].children[0]);
});

test('the account shortcuts open the native account view and never copy records', () => {
  const app = setup();
  const before = JSON.stringify(app.summary);
  app.ids['vita-today-accounts'].children[0].click();
  assert.deepEqual(app.calls.at(-1), ['open', 'physical']);
  assert.equal(JSON.stringify(app.summary), before);
});

test('focus moves to the next visible task when completing an item outside the five-row preview', () => {
  const app = setup();
  app.summary.todos = Array.from({ length: 6 }, (_, index) => ({ id: index + 1, text: '隔离任务 ' + index, completed: false }));
  app.emit('ops:vitaflow-data');
  app.ids['vita-today-todos'].children[0].children[0].click();
  assert.equal(app.document.activeElement, app.ids['vita-today-todos'].children[0].children[0]);
});

test('data and day changes reread the shared source on the Shanghai day', () => {
  const app = setup();
  app.summary.todos[0].completed = true;
  app.emit('ops:vitaflow-data');
  assert.equal(app.ids['vita-today-count'].textContent, '已完成 1 / 1');
  app.nextDay();
  assert.deepEqual(app.calls.at(-1), ['read', '2026-11-08']);
});

test('an unavailable engine does not invent a count and save failures stay visible', () => {
  const waiting = setup({ ready: false });
  assert.equal(waiting.ids['vita-today-count'].textContent, '正在读取');
  assert.equal(waiting.calls.length, 0);
  const blocked = setup({ failSave: true });
  blocked.ids['vita-today-todos'].children[0].children[0].click();
  assert.match(blocked.ids['vita-today-feedback'].textContent, /保存失败/);
  assert.equal(blocked.summary.todos[0].completed, false);
});
