const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(saved = {}, failWrites = false, href = 'https://example.test/ops-hub/index.html', UrlConstructor = URL) {
  class Element {
    constructor() { this.value = ''; this.textContent = ''; this.disabled = false; this.listeners = {}; this.attrs = {}; this.classes = new Set(['hidden']); this.classList = { remove: x => this.classes.delete(x), add: x => this.classes.add(x) }; }
    addEventListener(type, fn) { this.listeners[type] = fn; }
    setAttribute(key, value) { this.attrs[key] = value; }
    getAttribute(key) { return this.attrs[key]; }
    click() { this.listeners.click?.(); }
  }
  const ids = Object.fromEntries(['vitaflow-url','vitaflow-key','vitaflow-connect','vitaflow-frame','vitaflow-frame-wrap','vitaflow-status','vitaflow-builtin','vitaflow-open','vitaflow-source'].map(id => [id, new Element()]));
  ids['vitaflow-url'].value = 'http://127.0.0.1:8787/schedule-system-2.0.html';
  const messages = [];
  ids['vitaflow-frame'].contentWindow = { postMessage: (data, origin) => messages.push({ data, origin }) };
  const navigation = new Element();
  navigation.attrs['data-vf-view'] = 'dailyPlan';
  const listeners = {};
  const storage = new Map(Object.entries(saved));
  const window = { location: { href }, addEventListener: (type, fn) => { listeners[type] = fn; } };
  const context = {
    window, URL: UrlConstructor, setTimeout: () => 1, clearTimeout() {},
    localStorage: { getItem: key => storage.get(key) ?? null, setItem(key, value) { if (failWrites) throw new Error('blocked'); storage.set(key, value); } },
    document: { getElementById: id => ids[id], querySelectorAll: () => [navigation], documentElement: { classList: { contains: () => true } } }
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/vitaflow.js'), 'utf8'), context);
  context.initVitaFlow();
  return { ids, storage, messages, navigation, window, emit: event => listeners.message(event) };
}

test('VitaFlow opens the complete same-origin workspace without a service or saved settings', () => {
  const app = setup();
  assert.equal(app.ids['vitaflow-frame'].src, 'https://example.test/ops-hub/vitaflow/schedule-system-2.0.html?embed=ops-hub&mode=browser');
  assert.equal(app.ids['vitaflow-frame-wrap'].classes.has('hidden'), false);
  assert.match(app.ids['vitaflow-source'].textContent, /当前浏览器/);
  assert.equal(app.ids['vitaflow-open'].href, app.ids['vitaflow-frame'].src);
  assert.equal(app.navigation.disabled, true);
});

test('existing private connection settings remain usable and can switch back to the builtin workspace', () => {
  const app = setup({ ops_vitaflow_url: 'http://127.0.0.1:8787/schedule-system-2.0.html?key=synthetic-key' });
  assert.equal(app.ids['vitaflow-key'].value, 'synthetic-key');
  assert.equal(new URL(app.ids['vitaflow-frame'].src).port, '8787');
  assert.match(app.ids['vitaflow-source'].textContent, /私有服务/);
  app.ids['vitaflow-builtin'].click();
  assert.equal(new URL(app.ids['vitaflow-frame'].src).hostname, 'example.test');
  assert.ok(app.storage.has('ops_vitaflow_url'), 'switching mode must retain the private address');
});

test('untrusted saved protocols are ignored and new invalid addresses do not replace the workspace', () => {
  const app = setup({ ops_vitaflow_url: 'javascript:alert(1)' });
  const original = app.ids['vitaflow-frame'].src;
  app.ids['vitaflow-url'].value = 'javascript:alert(1)';
  app.ids['vitaflow-connect'].click();
  assert.equal(app.ids['vitaflow-frame'].src, original);
  assert.match(app.ids['vitaflow-status'].textContent, /http/);
});

test('only the displayed iframe can announce readiness and receive workspace navigation', () => {
  const app = setup();
  const frame = app.ids['vitaflow-frame'];
  app.emit({ source: {}, origin: 'https://example.test', data: { type: 'ops:vitaflow:ready' } });
  assert.equal(app.navigation.disabled, true);
  app.emit({ source: frame.contentWindow, origin: 'https://wrong.test', data: { type: 'ops:vitaflow:ready' } });
  assert.equal(app.navigation.disabled, true);
  app.emit({ source: frame.contentWindow, origin: 'https://example.test', data: { type: 'ops:vitaflow:ready' } });
  assert.equal(app.navigation.disabled, false);
  app.navigation.click();
  const message = app.messages.at(-1);
  assert.equal(message.data.view, 'dailyPlan');
  assert.equal(message.origin, 'https://example.test');
});

test('failed saving of private settings is visible while the explicit connection remains available', () => {
  const app = setup({}, true);
  app.ids['vitaflow-key'].value = 'synthetic-key';
  app.ids['vitaflow-connect'].click();
  assert.equal(new URL(app.ids['vitaflow-frame'].src).searchParams.get('key'), 'synthetic-key');
  assert.match(app.ids['vitaflow-status'].textContent, /未保存/);
  app.emit({ source: app.ids['vitaflow-frame'].contentWindow, origin: 'http://127.0.0.1:8787', data: { type: 'ops:vitaflow:ready' } });
  assert.match(app.ids['vitaflow-status'].textContent, /未保存/);
});

test('direct file pages use the opaque message origin even when the browser URL origin is file://', () => {
  class BrowserUrl extends URL { get origin() { return this.protocol === 'file:' ? 'file://' : super.origin; } }
  const app = setup({}, false, 'file:///project/index.html', BrowserUrl);
  app.emit({ source: app.ids['vitaflow-frame'].contentWindow, origin: 'null', data: { type: 'ops:vitaflow:ready' } });
  assert.equal(app.navigation.disabled, false);
  assert.equal(app.messages.at(-1).origin, '*');
});
