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

test('backup and restore controls sit below the four-account overview and keep their handlers', () => {
  const template = fs.readFileSync(path.join(__dirname, '../vitaflow/src/schedule-template.html'), 'utf8');
  const energyPosition = template.indexOf('id="energyOverview"');
  const backupPosition = template.indexOf('class="data-tools"');
  assert.ok(energyPosition >= 0 && backupPosition > energyPosition, '备份与恢复应放在四账户精力之后');
  assert.match(template, /<summary>\s*<span>备份与恢复\s*<span class="summary-hint">导入、导出与保存<\/span><\/span>\s*<span id="saveStatus"/);
  for (const id of ['exportHtmlBtn', 'saveFileBtn', 'exportJsonBtn', 'saveJsonBtn', 'autoSaveToggle']) {
    assert.ok(template.includes(`id="${id}"`), `备份控件 ID 不得改变：${id}`);
  }
  for (const handler of ['exportHtmlWithData', 'saveToOriginalFile', 'exportJsonFile', 'saveToJsonFile', 'importFromHtmlFile', 'importFromJsonFile', 'toggleAutoSave']) {
    assert.ok(template.includes(`onclick="${handler}(`), `备份处理函数不得移除：${handler}`);
  }
});

function setup(saved = {}, { failWrites = false, ready = true, connected = true, conflict = false, fetchImpl, permission = 'granted', hidden = false, online = true } = {}) {
  class Element {
    constructor() { this.value = ''; this.textContent = ''; this.disabled = false; this.dataset = {}; this.listeners = {}; this.attrs = {}; this.classes = new Set(); this.classList = { contains: key => this.classes.has(key) }; }
    addEventListener(type, fn) { this.listeners[type] = fn; }
    getAttribute(key) { return this.attrs[key]; }
    click() { return this.listeners.click?.(); }
  }
  const ids = Object.fromEntries(['url','key','connect','status','builtin','open','source','native','enable-bridge'].map(id => [`vitaflow-${id}`, new Element()]));
  ids['vitaflow-url'].value = 'https://finance.insistgang.top/';
  const navigation = new Element(); navigation.attrs['data-vf-view'] = 'dailyPlan';
  const tab = new Element(); tab.classes.add('active');
  const calls = [];
  let mode = 'browser';
  const native = {
    isReady: () => ready,
    setTheme: value => calls.push(['theme', value]),
    activate: (value, day) => calls.push(day ? ['activate', value, day] : ['activate', value]),
    getSummary: () => ({ storage: mode, conflict: mode === 'server' && conflict }),
    async connect(url, key) { calls.push(['connect', url, key]); mode = connected ? 'server' : 'browser'; return { connected, conflict }; },
    useBrowser() { calls.push(['browser']); mode = 'browser'; },
  };
  const events = {};
  const documentEvents = {};
  const storage = new Map(Object.entries(saved));
  const window = { OpsVitaFlowNative: native, addEventListener: (type, fn) => { events[type] = fn; } };
  const probeCalls = [];
  const timers = new Map();
  let nextTimer = 0;
  let now = 0;
  const permissionListeners = new Map();
  const permissionStatus = { state: permission,
    addEventListener: (name, fn) => permissionListeners.set(name, fn),
    removeEventListener: name => permissionListeners.delete(name),
  };
  window.navigator = { onLine: online };
  if (permission !== null) window.navigator.permissions = { query: async () => {
    if (permissionStatus.state === 'unsupported') throw new Error('unsupported permission');
    return permissionStatus;
  } };
  if (fetchImpl) {
    window.fetch = (...args) => { probeCalls.push(args); return fetchImpl(...args); };
    window.AbortController = AbortController;
  }
  const context = {
    window, URL, Date: class extends Date { static now() { return now; } }, calendarDay: () => '2026-11-07',
    localStorage: { getItem: key => storage.get(key) ?? null, setItem(key, value) { if (failWrites) throw new Error('blocked'); storage.set(key, value); } },
    document: { hidden, addEventListener: (type, fn) => { documentEvents[type] = fn; }, getElementById: id => ids[id], querySelector: () => tab, querySelectorAll: selector => selector === '[data-vf-view]' ? [navigation] : [], documentElement: { classList: { contains: () => true } } },
    setTimeout(fn, delay = 0) { const id = ++nextTimer; timers.set(id, { fn, at: now + delay }); return id; }, clearTimeout(id) { timers.delete(id); },
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/vitaflow.js'), 'utf8'), context);
  context.initVitaFlow();
  return { ids, native, context, storage, calls, navigation, probeCalls,
    setReady(value) { ready = value; },
    setStorageMode(value) { mode = value; },
    setPermission(value, announce = true) { permissionStatus.state = value; if (announce) permissionListeners.get('change')?.(); },
    setVisible(value) { context.document.hidden = !value; documentEvents.visibilitychange?.(); },
    setOnline(value) { window.navigator.onLine = value; events[value ? 'online' : 'offline']?.(); },
    advance(ms) { now += ms; for (const [id, timer] of [...timers]) if (timer.at <= now && timers.delete(id)) timer.fn(); },
    timerDelays() { return [...timers.values()].map(timer => timer.at - now); },
    runTimers() { const pending = [...timers]; for (const [id, timer] of pending) if (timers.delete(id)) { now = Math.max(now, timer.at); timer.fn(); } },
    emit: (type, detail = {}) => events[type]?.({ detail }), resolveConflict: () => { conflict = false; events['ops:vitaflow-data']?.({ detail: {} }); } };
}

const bridgePayload = () => ({ data: { vitaflow_todos: '[]' }, revision: 'synthetic-bridge-revision', features: { patch: true, revision: true } });
const bridgeResponse = payload => ({ ok: true, json: async () => payload });
const flushBridge = () => new Promise(resolve => setImmediate(resolve));

test('a ready owner bridge connects automatically without a credential or replacing saved preferences', async () => {
  const app = setup({}, { fetchImpl: async () => bridgeResponse(bridgePayload()) });
  await flushBridge();
  assert.equal(app.probeCalls.length, 1);
  assert.equal(app.probeCalls[0][0], 'http://127.0.0.1:18789/api/data');
  const options = app.probeCalls[0][1];
  assert.equal(options.method, 'GET');
  assert.equal(options.credentials, 'omit');
  assert.equal(options.redirect, 'error');
  assert.equal(options.targetAddressSpace, 'loopback');
  assert.equal(options.headers, undefined, 'owner bridge probes must never send a saved credential');
  assert.deepEqual(app.calls.find(([type]) => type === 'connect'), ['connect', 'http://127.0.0.1:18789/', '']);
  assert.deepEqual(Object.fromEntries(app.storage), { ops_vitaflow_bridge_initialized: '1' }, 'only a successful bridge activation marker is stored');
});

test('unavailable or malformed owner bridge keeps browser records without connecting', async () => {
  for (const fetchImpl of [
    async () => { throw new Error('blocked by local network permission'); },
    async () => ({ ok: false, json: async () => bridgePayload() }),
    async () => ({ ok: true, json: async () => { throw new Error('invalid JSON'); } }),
    async () => bridgeResponse({ data: [], revision: 'wrong' }),
    async () => bridgeResponse({ data: { vitaflow_todos: [] }, revision: 'wrong' }),
    async () => bridgeResponse({ data: { private_token: 'never accepted' }, revision: 'wrong' }),
    async () => bridgeResponse({ data: {}, revision: '' }),
  ]) {
    const app = setup({}, { fetchImpl });
    await flushBridge();
    assert.equal(app.calls.filter(([type]) => type === 'connect').length, 0);
    assert.equal(app.storage.size, 0);
    assert.match(app.ids['vitaflow-source'].textContent, /浏览器/);
    assert.match(app.ids['vitaflow-status'].textContent, /就绪/);
  }
});

test('first trusted bridge activation migrates legacy or builtin settings without changing their credentials', async () => {
  for (const saved of [
    { ops_vitaflow_url: 'http://127.0.0.1:8787/?key=synthetic' },
    { ops_vitaflow_connection: JSON.stringify({ url: 'https://private.example/', key: 'synthetic' }) },
    { ops_vitaflow_connection: '{broken' },
    { ops_vitaflow_mode: 'builtin' },
    { ops_vitaflow_mode: 'private' },
  ]) {
    const app = setup(saved, { fetchImpl: async () => bridgeResponse(bridgePayload()) });
    await flushBridge();
    assert.equal(app.probeCalls.length, 1);
    assert.deepEqual(app.calls.find(([type]) => type === 'connect'), ['connect', 'http://127.0.0.1:18789/', '']);
    assert.deepEqual(Object.fromEntries(app.storage), { ...saved, ops_vitaflow_bridge_initialized: '1' });
  }
});

test('explicit bridge opt-out suppresses automatic activation and retains normal saved connection behavior', async () => {
  for (const saved of [
    { ops_vitaflow_bridge_optout: '1', ops_vitaflow_mode: 'builtin' },
    { ops_vitaflow_bridge_initialized: '1', ops_vitaflow_bridge_optout: '1', ops_vitaflow_url: 'https://private.example/?key=synthetic' },
  ]) {
    const app = setup(saved, { fetchImpl: async () => bridgeResponse(bridgePayload()) });
    await flushBridge();
    assert.equal(app.probeCalls.length, 0);
    assert.deepEqual(Object.fromEntries(app.storage), saved);
    if (saved.ops_vitaflow_url) assert.deepEqual(app.calls.find(([type]) => type === 'connect'), ['connect', 'https://private.example/', 'synthetic']);
  }
});

test('an absent bridge leaves first migration unmarked and preserves legacy fallback', async () => {
  const saved = { ops_vitaflow_url: 'http://127.0.0.1:8787/?key=synthetic' };
  const app = setup(saved, { fetchImpl: async () => { throw new Error('unavailable'); } });
  await flushBridge();
  assert.deepEqual(Object.fromEntries(app.storage), saved);
  assert.deepEqual(app.calls.find(([type]) => type === 'connect'), ['connect', 'http://127.0.0.1:8787/', 'synthetic']);

  const migrated = setup({ ...saved, ops_vitaflow_bridge_initialized: '1' }, { fetchImpl: async () => { throw new Error('unavailable'); } });
  await flushBridge();
  assert.equal(migrated.calls.filter(([type]) => type === 'connect').length, 0, 'a migrated device must not fall back to an older writer');
  assert.match(migrated.ids['vitaflow-source'].textContent, /浏览器/);
});

test('failed native bridge activation is never marked as migrated', async () => {
  const app = setup({ ops_vitaflow_mode: 'builtin' }, { connected: false, fetchImpl: async () => bridgeResponse(bridgePayload()) });
  await flushBridge();
  assert.equal(app.storage.has('ops_vitaflow_bridge_initialized'), false);
  assert.match(app.ids['vitaflow-source'].textContent, /浏览器/);
});

test('owner bridge waits for native readiness and probes only once', async () => {
  const app = setup({}, { ready: false, fetchImpl: async () => bridgeResponse(bridgePayload()) });
  assert.equal(app.probeCalls.length, 0);
  app.setReady(true);
  app.emit('ops:vitaflow-ready');
  app.emit('ops:vitaflow-ready');
  await flushBridge();
  assert.equal(app.probeCalls.length, 1);
  assert.equal(app.calls.filter(([type]) => type === 'connect').length, 1);
});

test('switching to builtin or making a manual connection cancels a pending bridge probe', async () => {
  for (const manual of [false, true]) {
    let resolveProbe;
    const app = setup({}, { fetchImpl: () => new Promise(resolve => { resolveProbe = resolve; }) });
    await flushBridge();
    if (manual) {
      app.ids['vitaflow-url'].value = 'https://private.example/';
      app.ids['vitaflow-key'].value = 'synthetic';
      await app.ids['vitaflow-connect'].click();
    } else app.ids['vitaflow-builtin'].click();
    resolveProbe(bridgeResponse(bridgePayload()));
    await flushBridge();
    const connections = app.calls.filter(([type]) => type === 'connect');
    assert.equal(connections.length, manual ? 1 : 0);
    if (manual) assert.equal(connections[0][1], 'https://private.example/');
    assert.equal(app.probeCalls[0][1].signal.aborted, true);
    assert.equal(app.storage.get('ops_vitaflow_bridge_optout'), '1');
    assert.equal(app.storage.has('ops_vitaflow_bridge_initialized'), false);
  }
});

test('editing connection fields cancels in-flight automatic setup without saving a preference', async () => {
  let resolveProbe;
  const app = setup({}, { fetchImpl: () => new Promise(resolve => { resolveProbe = resolve; }) });
  await flushBridge();
  app.ids['vitaflow-url'].listeners.input();
  resolveProbe(bridgeResponse(bridgePayload()));
  await flushBridge();
  assert.equal(app.probeCalls[0][1].signal.aborted, true);
  assert.equal(app.calls.filter(([type]) => type === 'connect').length, 0);
  assert.equal(app.storage.size, 0);
});

test('an owner bridge connection preserves the native pending-conflict state', async () => {
  const app = setup({}, { conflict: true, fetchImpl: async () => bridgeResponse(bridgePayload()) });
  await flushBridge();
  assert.match(app.ids['vitaflow-source'].textContent, /待核对/);
  assert.match(app.ids['vitaflow-status'].textContent, /差异|选择/);
  assert.match(app.ids['vitaflow-source'].textContent + app.ids['vitaflow-status'].textContent, /后台|公开/);
  assert.doesNotMatch(app.ids['vitaflow-source'].textContent + app.ids['vitaflow-status'].textContent, /私有同步服务/);
  assert.deepEqual(Object.fromEntries(app.storage), { ops_vitaflow_bridge_initialized: '1' }, 'pending conflict is an activated connection, not a reason to retry legacy writers');
});

test('builtin selection after migration remains opted out on subsequent loads', async () => {
  const app = setup({}, { fetchImpl: async () => bridgeResponse(bridgePayload()) });
  await flushBridge();
  app.ids['vitaflow-builtin'].click();
  assert.equal(app.storage.get('ops_vitaflow_bridge_optout'), '1');
  const restored = setup(Object.fromEntries(app.storage), { fetchImpl: async () => bridgeResponse(bridgePayload()) });
  await flushBridge();
  assert.equal(restored.probeCalls.length, 0);
  assert.equal(restored.calls.filter(([type]) => type === 'connect').length, 0);
});

test('an owner bridge probe times out without auto-connecting or changing storage', async () => {
  const app = setup({}, { fetchImpl: (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('timeout')));
  }) });
  await flushBridge();
  app.runTimers();
  await flushBridge();
  assert.equal(app.probeCalls[0][1].signal.aborted, true);
  assert.equal(app.calls.filter(([type]) => type === 'connect').length, 0);
  assert.equal(app.storage.size, 0);
});

test('ordinary public visitors never issue a loopback request without granted permission', async () => {
  for (const permission of ['prompt', 'denied', 'unsupported', null]) {
    const app = setup({}, { permission, fetchImpl: async () => bridgeResponse(bridgePayload()) });
    await flushBridge();
    assert.equal(app.probeCalls.length, 0);
    assert.equal(app.calls.filter(([type]) => type === 'connect').length, 0);
    assert.equal(app.ids['vitaflow-enable-bridge'].hidden, false);
    assert.equal(app.storage.size, 0);
    app.advance(600000);
    await flushBridge();
    assert.equal(app.probeCalls.length, 0, 'timers cannot prompt ordinary visitors for loopback access');
  }
});

test('an owner click starts the first loopback request synchronously and enables granted automatic sync', async () => {
  let app;
  app = setup({}, { permission: 'prompt', fetchImpl: async () => {
    app.setPermission('granted', false);
    return bridgeResponse(bridgePayload());
  } });
  await flushBridge();
  const clicking = app.ids['vitaflow-enable-bridge'].click();
  assert.equal(app.probeCalls.length, 1, 'the first request must stay in the owner click gesture');
  assert.equal(app.probeCalls[0][1].targetAddressSpace, 'loopback');
  await clicking;
  await flushBridge();
  assert.equal(app.storage.get('ops_vitaflow_bridge_initialized'), '1');
  assert.equal(app.ids['vitaflow-enable-bridge'].hidden, true);
  assert.match(app.ids['vitaflow-status'].textContent, /后台同步/);
  assert.match(app.ids['vitaflow-status'].textContent, /公开只读/);
});

test('denied loopback permission provides an action without issuing a request', async () => {
  const app = setup({}, { permission: 'denied', fetchImpl: async () => bridgeResponse(bridgePayload()) });
  await flushBridge();
  await app.ids['vitaflow-enable-bridge'].click();
  assert.equal(app.probeCalls.length, 0);
  assert.match(app.ids['vitaflow-status'].textContent, /网站设置|权限/);
});

test('granted bridge startup retries with bounded backoff and recovers without a reload', async () => {
  let attempts = 0;
  const app = setup({}, { fetchImpl: async () => {
    if (++attempts < 3) throw new Error('service starting');
    return bridgeResponse(bridgePayload());
  } });
  await flushBridge();
  assert.equal(attempts, 1);
  assert.ok(app.timerDelays().includes(30000));
  app.advance(29999);
  await flushBridge();
  assert.equal(attempts, 1);
  app.advance(1);
  await flushBridge();
  assert.equal(attempts, 2);
  assert.ok(app.timerDelays().includes(60000));
  app.advance(60000);
  await flushBridge();
  assert.equal(attempts, 3);
  assert.equal(app.calls.filter(([type]) => type === 'connect').length, 1);
  assert.equal(app.storage.get('ops_vitaflow_bridge_initialized'), '1');
});

test('granted retries pause while hidden or offline and stop after a builtin choice', async () => {
  const app = setup({}, { fetchImpl: async () => { throw new Error('offline bridge'); } });
  await flushBridge();
  app.setVisible(false);
  app.advance(120000);
  await flushBridge();
  assert.equal(app.probeCalls.length, 1);
  app.setVisible(true);
  app.setOnline(false);
  app.advance(120000);
  await flushBridge();
  assert.equal(app.probeCalls.length, 1);
  app.setOnline(true);
  app.advance(30000);
  await flushBridge();
  assert.equal(app.probeCalls.length, 2);
  app.ids['vitaflow-builtin'].click();
  app.advance(600000);
  app.setOnline(true);
  app.setVisible(true);
  await flushBridge();
  assert.equal(app.probeCalls.length, 2);
});

test('lost automatic connection can retry but active server sync and conflicts are never interrupted', async () => {
  const app = setup({}, { fetchImpl: async () => bridgeResponse(bridgePayload()) });
  await flushBridge();
  app.emit('ops:vitaflow-data');
  app.advance(60000);
  await flushBridge();
  assert.equal(app.probeCalls.length, 1, 'the native active sync already polls and must not be reconnected');
  app.setStorageMode('browser');
  app.emit('ops:vitaflow-data');
  app.advance(30000);
  await flushBridge();
  assert.equal(app.probeCalls.length, 2);

  app.native.getSummary = () => ({ storage: 'browser', conflict: true });
  app.emit('ops:vitaflow-data');
  app.advance(600000);
  app.setOnline(true);
  await flushBridge();
  assert.equal(app.probeCalls.length, 2, 'automatic retry must not reset a pending conflict');
});

test('permission changes and network events never overlap an in-flight bridge probe', async () => {
  let resolveProbe;
  const app = setup({}, { fetchImpl: () => new Promise(resolve => { resolveProbe = resolve; }) });
  await flushBridge();
  app.setPermission('granted');
  app.setOnline(true);
  app.setVisible(true);
  app.advance(30000);
  await flushBridge();
  assert.equal(app.probeCalls.length, 1);
  resolveProbe(bridgeResponse(bridgePayload()));
  await flushBridge();
  app.ids['vitaflow-builtin'].click();
  app.advance(600000);
  await flushBridge();
  assert.equal(app.probeCalls.length, 1);
});

test('revoking local-network permission aborts a pending probe and prevents automatic connection', async () => {
  let resolveProbe;
  const app = setup({}, { fetchImpl: () => new Promise(resolve => { resolveProbe = resolve; }) });
  await flushBridge();
  app.setPermission('denied');
  assert.equal(app.probeCalls[0][1].signal.aborted, true);
  resolveProbe(bridgeResponse(bridgePayload()));
  await flushBridge();
  app.advance(600000);
  await flushBridge();
  assert.equal(app.probeCalls.length, 1);
  assert.equal(app.calls.filter(([type]) => type === 'connect').length, 0);
  assert.equal(app.storage.size, 0);
});

test('the host uses the native workspace and keeps browser mode explicit', () => {
  const app = setup();
  assert.equal(app.ids['vitaflow-url'].value, 'https://finance.insistgang.top/');
  assert.equal(app.calls.filter(([type]) => type === 'connect').length, 0, '新的云端默认地址不能触发自动连接');
  assert.equal(app.storage.size, 0, '首次打开不能自动保存或上传连接设置');
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
  assert.deepEqual(app.calls.find(([type]) => type === 'connect'), ['connect', 'http://127.0.0.1:8787/schedule-system-2.0.html', 'synthetic']);
  assert.equal(app.ids['vitaflow-url'].value, 'http://127.0.0.1:8787/schedule-system-2.0.html');
  assert.equal(app.storage.get('ops_vitaflow_url'), 'http://127.0.0.1:8787/schedule-system-2.0.html?key=synthetic', '旧设置不得被静默迁移');
  assert.match(app.ids['vitaflow-source'].textContent, /服务/);
  await app.ids['vitaflow-builtin'].click();
  assert.ok(app.calls.some(([type]) => type === 'browser'));
  assert.ok(app.storage.has('ops_vitaflow_url'));
});

test('new cloud connections store the URL and key atomically without passing URL credentials to native', async () => {
  const app = setup();
  app.ids['vitaflow-url'].value = 'https://finance.insistgang.top/?key=ignored-query-secret&embed=1#private-fragment';
  app.ids['vitaflow-key'].value = 'synthetic-cloud-token';
  await app.ids['vitaflow-connect'].click();
  assert.deepEqual(app.calls.find(([type]) => type === 'connect'), ['connect', 'https://finance.insistgang.top/', 'synthetic-cloud-token']);
  const settings = JSON.parse(app.storage.get('ops_vitaflow_connection'));
  assert.deepEqual(settings, { url: 'https://finance.insistgang.top/', key: 'synthetic-cloud-token' });
  assert.equal(app.storage.has('ops_vitaflow_url'), false);
  assert.equal(app.ids['vitaflow-url'].value, 'https://finance.insistgang.top/');
  assert.doesNotMatch(app.ids['vitaflow-source'].textContent + app.ids['vitaflow-status'].textContent, /synthetic-cloud-token|ignored-query-secret/);
  assert.match(app.ids['vitaflow-status'].textContent, /私有同步服务/);

  const restored = setup({ ops_vitaflow_connection: JSON.stringify(settings), ops_vitaflow_mode: 'private' });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(restored.calls.find(([type]) => type === 'connect'), ['connect', 'https://finance.insistgang.top/', 'synthetic-cloud-token']);
  assert.equal(restored.ids['vitaflow-key'].value, 'synthetic-cloud-token');
});

test('a blank cloud key never reuses saved credentials or calls the connector', async () => {
  const app = setup({ ops_vitaflow_connection: JSON.stringify({ url: 'https://finance.insistgang.top/', key: 'synthetic-saved' }), ops_vitaflow_mode: 'builtin' });
  app.ids['vitaflow-key'].value = '';
  await app.ids['vitaflow-connect'].click();
  assert.equal(app.calls.filter(([type]) => type === 'connect').length, 0);
  assert.match(app.ids['vitaflow-status'].textContent, /填写.*口令/);
});

test('an invalid new connection setting does not fall back to an older credential', async () => {
  const app = setup({ ops_vitaflow_connection: '{broken', ops_vitaflow_url: 'http://127.0.0.1:8787/?key=old-secret' });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(app.calls.filter(([type]) => type === 'connect').length, 0);
  assert.equal(app.ids['vitaflow-key'].value, '');
  assert.equal(app.storage.get('ops_vitaflow_connection'), '{broken');
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
  app.ids['vitaflow-key'].value = 'synthetic';
  await app.ids['vitaflow-connect'].click();
  app.emit('ops:vitaflow-ready');
  assert.match(app.ids['vitaflow-status'].textContent, /未保存|保存失败/);
});

test('failed private connection preserves an honest local data source', async () => {
  const app = setup({}, { connected: false });
  app.ids['vitaflow-key'].value = 'synthetic';
  await app.ids['vitaflow-connect'].click();
  assert.match(app.ids['vitaflow-status'].textContent, /未连接|连接失败/);
  assert.match(app.ids['vitaflow-source'].textContent, /浏览器/);
});

test('an unresolved private conflict is not presented as adopted server data and clears after resolution', async () => {
  const app = setup({}, { conflict: true });
  app.ids['vitaflow-key'].value = 'synthetic';
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
  app.ids['vitaflow-key'].value = 'synthetic';
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
  app.ids['vitaflow-key'].value = 'synthetic';
  let resolve;
  app.native.connect = () => new Promise(done => { resolve = done; });
  const waiting = app.ids['vitaflow-connect'].click();
  app.ids['vitaflow-builtin'].click();
  const latest = app.ids['vitaflow-status'].textContent;
  resolve({ connected: true, conflict: false });
  await waiting;
  assert.equal(app.ids['vitaflow-status'].textContent, latest);
});
