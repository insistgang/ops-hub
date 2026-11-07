import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { buildNative, scopeCss } from './build-native.mjs';

const scoped = scopeCss(':root {--x:red} body {margin:0} .a, :is(.b,.c) {color:red} @media (max-width:600px) {body.ops-hub-embed .a {display:block}} @keyframes fadeIn {from {opacity:0} to {opacity:1}} .a {animation:fadeIn 1s}');
assert.match(scoped, /#vitaflow-native\s*\{/);
assert.match(scoped, /#vitaflow-native \.a,\s*#vitaflow-native :is\(\.b,\.c\)/);
assert.match(scoped, /@media[^{}]+\{\s*#vitaflow-native\.ops-hub-embed \.a/);
assert.match(scoped, /@keyframes vf-native-fadeIn/);
assert.doesNotMatch(scoped, /(?:^|})\s*(?:body|:root|\.a)\s*\{/);
const animation = scopeCss('@keyframes spin {to {transform:rotate(1turn)}} .spin {animation:spin 1s;animation-name:spin}');
assert.ok(animation.includes('#vitaflow-native .spin {'), 'animation renaming must not rename an HTML class');
assert.ok(animation.includes('animation:vf-native-spin 1s'));

const built = buildNative();
assert.throws(() => buildNative({ hostHtml: '<div id="mainPage"></div>' }), /duplicate host ID/);
assert.ok(built.js.includes('OpsVitaFlowNative'));
assert.ok(built.js.includes('function openNovelOutlineEditor'));
assert.ok(built.js.includes('function renderIdeaVault'));
assert.doesNotMatch(built.body, /<iframe\b|<script\b/i);
assert.ok(!/^\s*window\.EMBEDDED_DATA\s*=/m.test(built.js), 'no snapshot assignment may be generated');
assert.doesNotMatch(built.js, /\beval\s*\(|\bnew\s+Function\s*\(/);
new vm.Script(built.js, { filename: 'native-workspace.js' });
const names = JSON.parse(fs.readFileSync('src/native/ui-handlers.json', 'utf8'));
assert.equal(names.length, 166);
assert.equal(new Set(names).size, 166);
for (const name of ['openWritingDoc', 'openLazyyDoc', 'openAdsDoc', 'openIdeasDoc', 'saveLearningNote']) assert.ok(names.includes(name));

function fixture(initial = {}, host = {}, script = built.js, canvasContexts = false) {
  class Storage {
    constructor() { this.values = new Map(Object.entries(initial)); }
    get length() { return this.values.size; }
    key(index) { return [...this.values.keys()][index] ?? null; }
    getItem(key) { return this.values.get(key) ?? null; }
    setItem(key, value) { this.values.set(key, String(value)); }
    removeItem(key) { this.values.delete(key); }
    clear() { this.values.clear(); }
  }
  class Element {
    constructor(id = '') {
      this.id = id; this.children = []; this.style = {}; this.dataset = {}; this.value = ''; this.textContent = ''; this.attributes = {}; this.listeners = {};
      const classes = new Set();
      this.classList = { add: (...items) => items.forEach(x => classes.add(x)), remove: (...items) => items.forEach(x => classes.delete(x)), contains: x => classes.has(x), toggle: (x, force) => force ? classes.add(x) : classes.delete(x) };
    }
    set innerHTML(value) { this.html = value; this.children = []; }
    get innerHTML() { return this.html || ''; }
    appendChild(node) { this.children.push(node); return node; }
    removeChild(node) { this.children = this.children.filter(x => x !== node); }
    setAttribute(key, value) { this.attributes[key] = value; }
    getAttribute(key) { return this.attributes[key] ?? null; }
    querySelectorAll() { return []; }
    querySelector() { return null; }
    getContext() { return canvasContexts ? { canvas: this } : null; }
    scrollIntoView() {}
    click() { this.onclick?.({ target: this }); }
    addEventListener(type, fn) { this.listeners[type] = fn; }
  }
  const root = new Element('vitaflow-native');
  const allowed = new Set([...built.body.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  const elements = new Map([...allowed].map(id => [id, new Element(id)]));
  const lookups = [];
  root.querySelector = selector => {
    lookups.push(selector);
    if (!selector.startsWith('#')) return null;
    const id = selector.slice(1);
    const find = node => node.id === id ? node : node.children.map(find).find(Boolean);
    return elements.get(id) || find(root) || null;
  };
  const events = [], timers = new Map(), network = [], created = [];
  let nextTimer = 0, bodyAppends = 0, browserWindow;
  const context = {
    console: { log() {}, warn() {}, error() {} }, Storage, localStorage: new Storage(), URL, URLSearchParams, AbortController,
    Blob, Date, Math, Promise,
    location: { href: 'https://example.test/ops-hub/index.html', search: '', protocol: 'https:' },
    document: { getElementById: id => id === root.id ? root : null, readyState: 'complete', createElement: type => { const element = new Element(); element.type = type; created.push(element); return element; }, addEventListener() {}, currentScript: { src: 'https://example.test/ops-hub/vitaflow/native-workspace.js' }, body: { appendChild() { bodyAppends++; } } },
    setTimeout(fn) { timers.set(++nextTimer, fn); return nextTimer; },
    clearTimeout(id) { timers.delete(id); },
    setInterval(fn) { timers.set(++nextTimer, fn); return nextTimer; },
    clearInterval(id) { timers.delete(id); },
    addEventListener() {}, dispatchEvent: event => { events.push(event); },
    Event: class { constructor(type) { this.type = type; } },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    matchMedia: () => ({ matches: true }),
    getComputedStyle() {
      if (this !== browserWindow) throw new TypeError('Illegal invocation');
      return {};
    },
    fetch: async (url, options) => { network.push({ url: String(url), options }); return context.reply(url, options); },
    reply: async () => ({ ok: false, status: 401, json: async () => ({}) }),
    alert() {}, confirm: () => true,
    CSS: { escape: value => String(value) }
  };
  Object.assign(context, host);
  context.window = context;
  context.self = context;
  vm.createContext(context);
  browserWindow = vm.runInContext('window', context);
  vm.runInContext(script, context);
  return { context, root, elements, events, timers, network, lookups, created, bodyAppends: () => bodyAppends, api: context.OpsVitaFlowNative };
}

const day = '2026-11-07';
assert.throws(() => fixture({}, { addTodo() {} }), /conflicts with the host: addTodo/);
const originalTodos = JSON.stringify([{ id: 'original-id', text: 'synthetic task', date: day, completed: false, account: 'focus' }]);
const live = fixture({ vitaflow_todos: originalTodos, vitaflow_accounts: JSON.stringify({ physical: { score: 0, history: [] }, emotional: { score: null, history: [] }, focus: { score: null, history: [] }, meaning: { score: null, history: [] } }), ops_focus_2026: 'untouched' });
for (let i = 0; i < 8 && !live.api?.isReady(); i++) await Promise.resolve();
assert.equal(live.api.isReady(), true);
assert.equal(live.network.length, 0, 'browser mode must never probe a private API');
assert.equal(live.bodyAppends(), 0, 'popups and diagnostics must remain in the native root');
for (const name of names) assert.equal(typeof live.context[name], 'function', name);
assert.equal('accountsData' in live.context, false, 'application state stays lexical');
const summary = live.api.getSummary(day);
assert.equal(summary.accounts.length, 4);
assert.equal(summary.accounts[0].score, 0);
assert.ok(summary.accounts.slice(1).every(account => account.score === null));
assert.equal(summary.error, '');
assert.equal(summary.todos[0].id, 'original-id');
assert.equal(summary.total, 1);
live.api.toggleTodo('original-id');
assert.equal(JSON.parse(live.context.localStorage.getItem('vitaflow_todos'))[0].completed, true);
assert.equal(live.context.localStorage.getItem('ops_focus_2026'), 'untouched');
assert.equal(live.api.getSummary(day).completed, 1);
assert.ok(live.events.some(event => event.type === 'ops:vitaflow-data'));
for (const event of live.events.filter(event => event.type.startsWith('ops:vitaflow-'))) assert.deepEqual(Object.keys(event.detail), ['storage']);
live.api.setTheme('dark');
assert.equal(live.root.getAttribute('data-ops-theme'), 'dark');
assert.equal(live.api.activate('not-a-view'), false);
const singleton = live.api;
vm.runInContext(built.js, live.context);
assert.equal(live.context.OpsVitaFlowNative, singleton);

const failed = await live.api.connect('http://127.0.0.1:8787/schedule-system-2.0.html', 'synthetic-token');
assert.equal(failed.connected, false);
assert.equal(JSON.parse(live.context.localStorage.getItem('vitaflow_todos'))[0].completed, true);
assert.match(live.network.at(-1).url, /^http:\/\/127\.0\.0\.1:8787\/api\/data\?/);
assert.equal(live.network.at(-1).options.headers['x-vitaflow-token'], 'synthetic-token');
live.context.reply = async () => ({ ok: true, status: 200, json: async () => ({ data: { vitaflow_todos: '[]' }, revision: 'synthetic-revision', features: { patch: true } }) });
const connected = await live.api.connect('http://127.0.0.1:8787/', 'synthetic-token');
assert.equal(connected.connected, true);
assert.equal(connected.conflict, true, 'connecting must preserve pending browser edits and ask to resolve conflict');
assert.equal(live.api.getSummary(day).conflict, true, 'the host must distinguish a pending conflict from adopted server data');
assert.equal(JSON.parse(live.context.localStorage.getItem('vitaflow_todos'))[0].id, 'original-id');
live.context.reply = async (url, options) => ({ ok: true, status: 200, json: async () => ({ data: JSON.parse(options.body).data, revision: 'resolved-revision', features: { patch: true } }) });
const beforeResolution = live.events.filter(event => event.type === 'ops:vitaflow-data').length;
const diagnostic = live.root.children.find(node => node.id === 'localSyncDiagnostic');
await diagnostic.children.at(-1).children[0].listeners.click();
assert.equal(live.api.getSummary(day).conflict, false);
assert.ok(live.events.filter(event => event.type === 'ops:vitaflow-data').length > beforeResolution, 'resolving a conflict must refresh host status even when business records stay identical');
const pending = live.context.localStorage.getItem('__vitaflow_sync_pending');
live.api.useBrowser();
assert.equal(live.api.getSummary(day).storage, 'browser');
assert.equal(live.context.localStorage.getItem('__vitaflow_sync_pending'), pending);
assert.equal(live.context.localStorage.getItem('__vitaflow_sync_key'), 'synthetic-token');
live.context.reply = async () => ({ ok: false, status: 401, json: async () => ({}) });
const noKeyConnection = await live.api.connect('http://127.0.0.1:8791/?key=unrelated-url-key', '');
assert.equal(noKeyConnection.connected, false);
assert.equal(live.network.at(-1).options.headers['x-vitaflow-token'], undefined, 'an explicit empty key must not disclose the old service token to another origin');
assert.equal(live.context.localStorage.getItem('__vitaflow_sync_key'), 'synthetic-token');
assert.equal(live.api.getSummary(day).todos[0].id, 'original-id');
live.api.useBrowser();

const corrupted = fixture({ vitaflow_accounts: '{broken', vitaflow_todos: originalTodos });
for (let i = 0; i < 8 && !corrupted.api.isReady(); i++) await Promise.resolve();
assert.ok(corrupted.api.getSummary(day).error, 'unreadable records must not be represented as ordinary empty records');
assert.equal(corrupted.api.getSummary(day).accounts.length, 4);
assert.equal(corrupted.context.localStorage.getItem('vitaflow_accounts'), '{broken');

const race = fixture({ vitaflow_todos: originalTodos });
for (let i = 0; i < 8 && !race.api.isReady(); i++) await Promise.resolve();
let resolveOld;
race.context.reply = url => String(url).includes(':8788/')
  ? new Promise(resolve => { resolveOld = resolve; })
  : Promise.resolve({ ok: true, status: 200, json: async () => ({ data: { vitaflow_todos: '[]' }, revision: 'new-server', features: { patch: true } }) });
const oldConnection = race.api.connect('http://127.0.0.1:8788/', 'old-synthetic');
for (let i = 0; i < 5 && !resolveOld; i++) await Promise.resolve();
const newerConnection = await race.api.connect('http://127.0.0.1:8789/', 'new-synthetic');
assert.equal(newerConnection.connected, true);
resolveOld({ ok: false, status: 401, json: async () => ({}) });
assert.equal((await oldConnection).connected, false);
assert.equal(race.api.getSummary(day).storage, 'server', 'an obsolete connection response must not disable the newer connection');
race.api.useBrowser();

const cancelling = fixture({ vitaflow_todos: originalTodos });
for (let i = 0; i < 8 && !cancelling.api.isReady(); i++) await Promise.resolve();
let finishBody;
cancelling.context.reply = async () => ({ ok: true, status: 200, json: () => new Promise(resolve => { finishBody = resolve; }) });
const cancelledConnection = cancelling.api.connect('http://127.0.0.1:8790/', 'synthetic');
for (let i = 0; i < 8 && !finishBody; i++) await Promise.resolve();
cancelling.api.useBrowser();
assert.equal(cancelling.network.at(-1).options.signal.aborted, true);
finishBody({ data: { vitaflow_todos: '[]' }, revision: 'obsolete' });
assert.equal((await cancelledConnection).connected, false);
assert.equal(cancelling.api.getSummary(day).todos[0].id, 'original-id');

live.context.reply = async () => ({ ok: true, status: 200, text: async () => '<html><head><script>/* __EMBEDDED_DATA_PLACEHOLDER__ */</script></head><body>synthetic standalone</body></html>' });
await live.context.exportHtmlWithData();
assert.equal(live.network.at(-1).url, 'https://example.test/ops-hub/vitaflow/schedule-system-2.0.html', 'HTML export must use the standalone app instead of Ops-Hub source');
live.context.importFromJsonFile();
const input = live.created.at(-1);
await input.onchange({ target: { files: [{ text: async () => JSON.stringify({ vitaflow_todos: originalTodos }) }] } });
const refreshAfterImport = [...live.timers.values()].at(-1);
refreshAfterImport();
assert.equal(live.api.getSummary(day).todos[0].completed, false);
assert.equal(live.context.localStorage.getItem('ops_focus_2026'), 'untouched');

// Native browser APIs check their Window receiver. This small chart fixture
// exercises the vendor's lexical environment instead of accepting null canvases.
const vendorPattern = /\(function\(\) \{\nvar module = undefined;\nvar exports = undefined;\nvar define = undefined;\n[\s\S]*?\n\}\)\(\);/;
assert.ok(vendorPattern.test(built.js));
const brandedVendor = `globalThis.Chart = class {
  static instances = {};
  static sequence = 0;
  static getChart(canvas) { return Object.values(this.instances).find(chart => chart.canvas === canvas); }
  constructor(context) {
    window.getComputedStyle(document.body);
    if (globalThis.Chart.getChart(context.canvas)) throw new Error('Canvas is already in use');
    this.canvas = context.canvas;
    this.id = globalThis.Chart.sequence++;
    globalThis.Chart.instances[this.id] = this;
  }
  destroy() { delete globalThis.Chart.instances[this.id]; }
  resize() { window.getComputedStyle(document.body); }
};`;
const chartProbe = fixture({}, {}, built.js.replace(vendorPattern, brandedVendor), true);
for (let i = 0; i < 8 && !chartProbe.api.isReady(); i++) await Promise.resolve();
assert.ok(chartProbe.context.physicalTrend, 'chart fields must persist on the real window');
assert.equal(chartProbe.context.physicalTrend.canvas, chartProbe.elements.get('physicalTrendChart'));
assert.ok(Object.getOwnPropertyDescriptor(chartProbe.context, 'physicalTrend'));
const trendCanvases = new Set(['physicalTrendChart', 'emotionalTrendChart', 'focusTrendChart', 'meaningTrendChart'].map(id => chartProbe.elements.get(id)));
assert.equal(Object.values(chartProbe.context.Chart.instances).filter(chart => trendCanvases.has(chart.canvas)).length, 4);
const activeChartCount = Object.keys(chartProbe.context.Chart.instances).length;
assert.equal(chartProbe.api.activate('dailyPlan'), true);
assert.equal(chartProbe.api.activate('energyTrends'), true);
assert.equal(Object.keys(chartProbe.context.Chart.instances).length, activeChartCount, 're-entering must destroy old chart instances before using their canvases');
assert.doesNotThrow(() => chartProbe.context.physicalTrend.resize(), 'vendor callbacks must retain the real Window receiver');
chartProbe.api.activate('dailyPlan', '2026-11-08');
assert.equal(chartProbe.elements.get('currentMonth').textContent, '2026年11月');
assert.equal(chartProbe.elements.get('physicalDateInput').value, '2026-11-08', 'home date must replace the stale form day');

for (const [file, expected] of [['native-workspace.js', built.js], ['native-workspace.css', built.css]]) {
  assert.ok(fs.readFileSync(file, 'utf8') === expected, `${file} must match its clean source build`);
}

console.log('native workspace build, isolation, storage and connection tests passed');
