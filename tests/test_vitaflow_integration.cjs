const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('the complete app mounts in the host document and the home page exposes its shared records', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.ok(!html.includes('id="vitaflow-frame"'), 'VitaFlow must not use an iframe');
  assert.ok(html.includes('id="vitaflow-native"'));
  assert.ok(html.includes('id="vita-today-accounts"'));
  assert.ok(html.includes('id="vita-today-todos"'));
  assert.ok(html.includes('vitaflow/native-workspace.js'));
  for (const value of ['classic', 'paper', 'forest', 'ocean']) {
    assert.ok(html.includes('data-ops-style-option="' + value + '"'), '缺少风格按钮：' + value);
  }
});

function setup(saved = {}, { failWrites = false, ready = true, connected = true, conflict = false } = {}) {
  class Element {
    constructor() { this.value = ''; this.textContent = ''; this.disabled = false; this.dataset = {}; this.listeners = {}; this.attrs = {}; this.classes = new Set(); this.classList = { contains: key => this.classes.has(key) }; }
    addEventListener(type, fn) { this.listeners[type] = fn; }
    getAttribute(key) { return this.attrs[key]; }
    click() { return this.listeners.click?.(); }
  }
  const ids = Object.fromEntries(['url','key','connect','status','builtin','open','source','native'].map(id => [`vitaflow-${id}`, new Element()]));
  ids['vitaflow-url'].value = 'http://127.0.0.1:8787/schedule-system-2.0.html';
  const navigation = new Element(); navigation.attrs['data-vf-view'] = 'dailyPlan';
  const tab = new Element(); tab.classes.add('active');
  const calls = [];
  let mode = 'browser';
  const native = {
    isReady: () => ready,
    setTheme: value => calls.push(['theme', value]),
    activate: (value, day) => calls.push(day ? ['activate', value, day] : ['activate', value]),
    getSummary: () => ({ storage: mode, conflict }),
    async connect(url, key) { calls.push(['connect', url, key]); mode = connected ? 'server' : 'browser'; return { connected, conflict }; },
    useBrowser() { calls.push(['browser']); mode = 'browser'; },
  };
  const events = {};
  const storage = new Map(Object.entries(saved));
  const window = { OpsVitaFlowNative: native, addEventListener: (type, fn) => { events[type] = fn; } };
  const context = {
    window, URL, calendarDay: () => '2026-11-07',
    localStorage: { getItem: key => storage.get(key) ?? null, setItem(key, value) { if (failWrites) throw new Error('blocked'); storage.set(key, value); } },
    document: { getElementById: id => ids[id], querySelector: () => tab, querySelectorAll: selector => selector === '[data-vf-view]' ? [navigation] : [], documentElement: { classList: { contains: () => true } } },
    setTimeout: () => 1, clearTimeout() {},
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/vitaflow.js'), 'utf8'), context);
  context.initVitaFlow();
  return { ids, native, context, storage, calls, navigation, emit: (type, detail = {}) => events[type]?.({ detail }), resolveConflict: () => { conflict = false; events['ops:vitaflow-data']?.({ detail: {} }); } };
}

test('the host uses the native workspace and keeps browser mode explicit', () => {
  const app = setup();
  assert.match(app.ids['vitaflow-source'].textContent, /浏览器/);
  assert.match(app.ids['vitaflow-status'].textContent, /就绪/);
  assert.equal(app.navigation.disabled, false);
  app.navigation.click();
  assert.deepEqual(app.calls.at(-1), ['activate', 'dailyPlan']);
  assert.ok(app.calls.some(([type]) => type === 'theme'));
});

test('home shortcuts carry the current Shanghai day into the native workspace', () => {
  const app = setup();
  app.context.window.OpsVitaFlow.open('dailyPlan');
  assert.deepEqual(app.calls.at(-1), ['activate', 'dailyPlan', '2026-11-07']);
});

test('saved private settings connect through the native API and remain available after switching to browser mode', async () => {
  const app = setup({ ops_vitaflow_url: 'http://127.0.0.1:8787/schedule-system-2.0.html?key=synthetic' });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(app.ids['vitaflow-key'].value, 'synthetic');
  assert.ok(app.calls.some(([type]) => type === 'connect'));
  assert.match(app.ids['vitaflow-source'].textContent, /服务/);
  await app.ids['vitaflow-builtin'].click();
  assert.ok(app.calls.some(([type]) => type === 'browser'));
  assert.ok(app.storage.has('ops_vitaflow_url'));
});

test('invalid saved and entered protocols never reach the native connector', async () => {
  const app = setup({ ops_vitaflow_url: 'javascript:alert(1)' });
  app.ids['vitaflow-url'].value = 'javascript:alert(1)';
  await app.ids['vitaflow-connect'].click();
  assert.equal(app.calls.filter(([type]) => type === 'connect').length, 0);
  assert.match(app.ids['vitaflow-status'].textContent, /http/);
});

test('storage failures remain visible after the native workspace announces readiness', async () => {
  const app = setup({}, { failWrites: true });
  await app.ids['vitaflow-connect'].click();
  app.emit('ops:vitaflow-ready');
  assert.match(app.ids['vitaflow-status'].textContent, /未保存|保存失败/);
});

test('failed private connection preserves an honest local data source', async () => {
  const app = setup({}, { connected: false });
  await app.ids['vitaflow-connect'].click();
  assert.match(app.ids['vitaflow-status'].textContent, /未连接|连接失败/);
  assert.match(app.ids['vitaflow-source'].textContent, /浏览器/);
});

test('an unresolved private conflict is not presented as adopted server data and clears after resolution', async () => {
  const app = setup({}, { conflict: true });
  await app.ids['vitaflow-connect'].click();
  assert.match(app.ids['vitaflow-source'].textContent, /待核对/);
  app.resolveConflict();
  assert.doesNotMatch(app.ids['vitaflow-status'].textContent, /差异|选择/);
  assert.match(app.ids['vitaflow-source'].textContent, /服务/);
});

test('reinitializing the host does not bind or connect the native workspace twice', async () => {
  const app = setup({ ops_vitaflow_url: 'http://127.0.0.1:8787/schedule-system-2.0.html?key=synthetic' });
  app.context.initVitaFlow();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(app.calls.filter(([type]) => type === 'connect').length, 1);
});

test('an older private response cannot replace the newest connection status', async () => {
  const app = setup();
  const pending = [];
  app.native.connect = () => new Promise(resolve => pending.push(resolve));
  app.native.getSummary = () => ({ storage: 'server', conflict: false });
  const first = app.ids['vitaflow-connect'].click();
  const second = app.ids['vitaflow-connect'].click();
  pending[1]({ connected: true, conflict: false });
  await second;
  const latest = app.ids['vitaflow-status'].textContent;
  pending[0]({ connected: false, conflict: false });
  await first;
  assert.equal(app.ids['vitaflow-status'].textContent, latest);
});

test('switching to browser mode ignores a pending private response', async () => {
  const app = setup();
  let resolve;
  app.native.connect = () => new Promise(done => { resolve = done; });
  const waiting = app.ids['vitaflow-connect'].click();
  app.ids['vitaflow-builtin'].click();
  const latest = app.ids['vitaflow-status'].textContent;
  resolve({ connected: true, conflict: false });
  await waiting;
  assert.equal(app.ids['vitaflow-status'].textContent, latest);
});
