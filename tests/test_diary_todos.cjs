const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../js/diary-todos.js'), 'utf8');

class Element {
  constructor(tag = 'div') { this.tag = tag; this.children = []; this.listeners = {}; this.textContent = ''; this.attrs = {}; this.disabled = false; }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
  addEventListener(type, fn) { this.listeners[type] = fn; }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  click() { return this.listeners.click?.(); }
}

function setup({ snapshot = null, api = null, today = '2026-11-08', protocol = 'file:', fetchImpl = null } = {}) {
  const nodes = {
    'diary-todos-date': new Element(),
    'diary-todos-list': new Element('ul'),
    'diary-todos-message': new Element('p'),
  };
  const events = {};
  const document = {
    getElementById: id => nodes[id] || null,
    createElement: tag => new Element(tag),
  };
  const window = {
    __OPS_DIARY_TODOS__: snapshot,
    OpsVitaFlowNative: api,
    addEventListener: (name, fn) => { events[name] = fn; },
  };
  vm.runInNewContext(script, {
    window, document, location: { protocol }, calendarDay: () => today,
    Date, fetch: fetchImpl || (() => Promise.reject(new Error('offline'))),
  });
  return { nodes, window, events, setToday(value) { today = value; }, flatten(node) { return node.textContent + node.children.map(child => this.flatten(child)).join(' '); } };
}

const sample = { date: '2026-11-08', items: [
  { id: 'id-1', title: '今日阅读', completed: false, source_date: '2026-11-08' },
  { id: 'id-2', title: '已完成整理', completed: true, source_date: '2026-11-08' },
] };

test('renders only the matching date, keeps completed source state read-only, imports only on click', () => {
  const imports = [];
  const todos = [];
  const app = setup({ snapshot: sample, api: {
    isReady: () => true,
    getSummary: () => ({ todos }),
    importDiaryTodo: item => { imports.push(item); todos.push({ id: item.id, text: item.title }); return { added: true }; },
  } });
  assert.equal(app.nodes['diary-todos-list'].children.length, 2);
  assert.match(app.flatten(app.nodes['diary-todos-list']), /日记已完成/);
  assert.equal(imports.length, 0, 'items must not import automatically');
  const button = app.nodes['diary-todos-list'].children[0].children[2];
  button.click();
  assert.deepEqual(imports.map(item => [item.id, item.title, item.date]), [['id-1', '今日阅读', '2026-11-08']]);
  assert.match(app.nodes['diary-todos-message'].textContent, /完成状态由 VitaFlow 单独记录/);
  assert.equal(app.nodes['diary-todos-list'].children[0].children[2].textContent, '已导入');
  assert.equal(app.nodes['diary-todos-list'].children[1].children.length, 2, 'completed source items have no import button');
});

test('text is rendered safely and duplicate results get explicit feedback', () => {
  const maliciousTitle = '<img src=x onerror=alert(1)>';
  const app = setup({ snapshot: { date: '2026-11-08', items: [{ id: 'id-x', title: maliciousTitle, completed: false, source_date: '2026-11-08' }] },
    api: { isReady: () => true, importDiaryTodo: () => ({ added: false }) } });
  assert.equal(app.nodes['diary-todos-list'].children[0].children[0].textContent, maliciousTitle);
  assert.equal(app.nodes['diary-todos-list'].children[0].children[0].children.length, 0);
  app.nodes['diary-todos-list'].children[0].children[2].click();
  assert.match(app.nodes['diary-todos-message'].textContent, /没有重复添加/);
  app.events['ops:vitaflow-data']();
  assert.match(app.nodes['diary-todos-message'].textContent, /没有重复添加/, 'VitaFlow refresh must not erase duplicate feedback');
});

test('imported state comes from current VitaFlow todos and clears after deletion', () => {
  const id = 'diary-0123456789abcdef01234567';
  const todos = [{ id, text: '今天要做' }];
  const api = { isReady: () => true, getSummary: () => ({ todos }), importDiaryTodo: () => ({ added: false }) };
  const app = setup({ snapshot: { date: '2026-11-08', items: [{ id, title: '今天要做', completed: false, source_date: '2026-11-08' }] }, api });
  let button = app.nodes['diary-todos-list'].children[0].children[2];
  assert.equal(button.textContent, '已导入');
  assert.equal(button.disabled, true);
  todos.length = 0;
  app.events['ops:vitaflow-data']();
  button = app.nodes['diary-todos-list'].children[0].children[2];
  assert.equal(button.textContent, '导入 VitaFlow');
  assert.equal(button.disabled, false);
});

test('successful import feedback survives immediate VitaFlow notifications and rerender', () => {
  const todos = [];
  let app;
  const api = {
    isReady: () => true,
    getSummary: () => ({ todos }),
    importDiaryTodo: item => {
      todos.push({ id: item.id, text: item.title });
      app.events['ops:vitaflow-data']();
      return { added: true };
    },
  };
  app = setup({ snapshot: sample, api });
  app.nodes['diary-todos-list'].children[0].children[2].click();
  assert.match(app.nodes['diary-todos-message'].textContent, /已导入 VitaFlow/);
  app.events['ops:vitaflow-data']();
  assert.match(app.nodes['diary-todos-message'].textContent, /已导入 VitaFlow/);
});

test('stale date is not displayed as today and day changes recheck the snapshot', () => {
  const app = setup({ snapshot: { date: '2026-11-07', items: [{ id: 'id-old', title: '昨日安排', completed: false, source_date: '2026-11-07' }] } });
  assert.equal(app.nodes['diary-todos-list'].children.length, 0);
  assert.match(app.nodes['diary-todos-message'].textContent, /不会显示为今天/);
  app.events['ops:day-changed']();
  assert.equal(app.nodes['diary-todos-list'].children.length, 0);
});

test('unavailable snapshot and not-ready VitaFlow give honest states', () => {
  const empty = setup();
  assert.match(empty.nodes['diary-todos-message'].textContent, /没有可显示/);
  const loading = setup({ snapshot: sample, api: { isReady: () => false } });
  assert.equal(loading.nodes['diary-todos-list'].children[0].children[2].disabled, true);
  assert.match(loading.nodes['diary-todos-message'].textContent, /正在准备/);
  loading.window.OpsVitaFlowNative = { isReady: () => true, importDiaryTodo: () => { throw new Error('nope'); } };
  loading.events['ops:vitaflow-ready']();
  loading.nodes['diary-todos-list'].children[0].children[2].click();
  assert.match(loading.nodes['diary-todos-message'].textContent, /导入失败/);
});

test('fetch refreshes a newer public snapshot without discarding a valid inline fallback on failure', async () => {
  let resolveFetch;
  const app = setup({ snapshot: { date: '2026-11-07', items: [] }, protocol: 'https:',
    fetchImpl: () => new Promise(resolve => { resolveFetch = resolve; }) });
  resolveFetch({ ok: true, json: async () => sample });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(app.nodes['diary-todos-list'].children.length, 2);
});
