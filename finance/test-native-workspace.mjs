import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { buildNative } from './build-native.mjs';
import { syntheticFinanceData } from './tests/fixtures.mjs';

const built = buildNative();
const publicSource = fs.readFileSync(new URL('src/dashboard.js', import.meta.url), 'utf8');
assert.ok(!/(?:本人|授权|垫款|银行|支付宝|微信)/.test(publicSource), 'static personal policy and institutions must not return');
assert.ok(!/\d+\s*月[^\n]*(?:学费|资助)/.test(publicSource), 'fixed private year narratives must not return');
new vm.Script(built.js);
assert.ok(!/<iframe\b|<script\b/i.test(built.html));
for (const match of built.html.matchAll(/\bid="([^"]+)"/g)) assert.ok(match[1].startsWith('finance-'));
assert.ok(!/\b(?:localStorage|sessionStorage)\b|new\s+Function|\beval\s*\(/.test(built.js));
assert.ok(!/tailwind\.config|cdn\.tailwindcss/.test(built.js));
assert.ok(!built.js.includes('Synthetic account'), 'isolated fixtures are not shipped as default data');

const model = {};
vm.createContext(model);
vm.runInContext(built.model, model);
const data = syntheticFinanceData();
const before = JSON.stringify(data);
const month = model.derivePeriod(data, { mode: 'month', anchor: data.asOf });
assert.equal(month.summary.expenseTotal, 25);
assert.equal(month.summary.incomeTotal, 100);
assert.equal(month.transactions.byDay[0].total, 0);
assert.equal(month.transactions.byDay[2].total, null);
assert.equal(month.transactions.byDay.at(-1).total, null);
const year = model.derivePeriod(data, { mode: 'year', anchor: data.asOf });
assert.equal(year.summary.incomeTotal, 180);
assert.equal(year.trend[0].income, null);
assert.equal(year.missingMonths.length, 10);
assert.equal(JSON.stringify(data), before);
const unknown = syntheticFinanceData();
unknown.incomeRecordStatus = 'unrecorded';
unknown.monthlySummaries[1].income = null;
unknown.monthlySummaries[1].incomeRecordStatus = 'unrecorded';
assert.equal(model.derivePeriod(unknown, { mode: 'month', anchor: unknown.asOf }).summary.incomeTotal, null);
unknown.monthlySummaries[1].income = 0;
assert.equal(model.derivePeriod(unknown, { mode: 'month', anchor: unknown.asOf }).summary.incomeTotal, null, 'an explicitly unrecorded income is not a confirmed zero');
const explicitZero = syntheticFinanceData(); explicitZero.monthlySummaries[1].income = 0; explicitZero.incomeDetails[0].amount = 0;
assert.equal(model.derivePeriod(explicitZero, { mode: 'month', anchor: explicitZero.asOf }).summary.incomeTotal, 0);
assert.equal(model.periodRange('week', '2027-01-01').start, '2026-12-28');
assert.equal(model.periodRange('month', '2028-02-20').end, '2028-02-29');
const crossMonth = syntheticFinanceData();
crossMonth.periodDatasets.february = { period: '2026-02', asOf: '2026-02-28', incomeRecordStatus: 'recorded', incomeDetails: [{ date: '2026-02-28', amount: 80, source: 'Synthetic earlier income', kind: 'salary' }], transactions: { items: [{ date: '2026-02-28', amount: 20, kind: 'routine', category: 'Synthetic earlier category' }], byDay: [{ day: 28, recordStatus: 'recorded', total: 20, routine: 20, capital: 0 }] } };
const crossWeek = model.derivePeriod(crossMonth, { mode: 'week', anchor: '2026-03-01' });
assert.equal(crossWeek.summary.expenseTotal, 20);
assert.equal(crossWeek.summary.incomeTotal, 80);
assert.equal(crossWeek.transactions.byDay[0].total, null);
assert.equal(crossWeek.transactions.byDay.at(-1).total, 0);
assert.equal(vm.runInContext("ASSET_LAYERS.every(layer => ['可用现金','待核现金','未分类资产','存款','投资资产','应收款'].includes(layer.name))", model), true, 'static asset labels must be generic');
assert.equal(vm.runInContext("ASSET_LAYERS.every(layer => !/(?:授权|银行|垫款|支付宝|微信)/.test(layer.desc))", model), true, 'asset descriptions cannot retain account institutions or personal policy');
model.fixture = data;
vm.runInContext('financialData = fixture', model);
const layers = model.assetLayerData();
assert.equal(layers.find(row => row.key === 'cash').amount, 0);
assert.equal(layers.find(row => row.key === 'pendingCash').amount, null);
const incomeFields = new Map();
model.document = { getElementById(id) { if (!incomeFields.has(id)) incomeFields.set(id, { innerHTML: '', innerText: '' }); return incomeFields.get(id); } };
model.zeroIncome = { incomeBreakdown: [{ source: 'Synthetic zero', amount: 0 }], summary: { incomeTotal: 0 } };
vm.runInContext('derived = zeroIncome; renderIncomeBreakdown()', model);
assert.ok(![...incomeFields.values()].some(element => /NaN|Infinity/.test(element.innerHTML)), 'zero income must not divide by zero');
model.zeroAssets = { summary: { availableCash: 0, pendingCashTotal: 0, unknownTotal: 0, depositTotal: 0, fundTotal: 0, receivablesTotal: 0 } };
vm.runInContext('financialData = zeroAssets; renderAssetLayers()', model);
assert.match(incomeFields.get('finance-asset-layer-badge').textContent, /0/);
assert.ok(!/1(?:\.00)?/.test(incomeFields.get('finance-asset-layer-badge').textContent), 'a zero total must not become the denominator fallback balance');
model.zeroAssets = { summary: {} };
vm.runInContext('financialData = zeroAssets; renderAssetLayers()', model);
assert.match(incomeFields.get('finance-asset-layer-badge').textContent, /未登记/);

function mount(host = {}) {
  const fields = new Map(), panels = [], tabs = [], periods = [], values = [], dynamic = [], charts = [];
  const frames = [], events = [], requests = [], scripts = [], chartInstances = [], windowEvents = {};
  let hashChanges = 0, scrolls = 0;
  class Element {
    constructor(id = '', attrs = '') {
      this.id = id; this.children = []; this.style = {}; this.listeners = {}; this.dataset = {}; this.attrs = {}; this.value = ''; this.hidden = /\shidden(?:\s|>|$)/.test(attrs); this.disabled = false;
      const classes = new Set(); this.classList = { add: (...v) => v.forEach(x => classes.add(x)), remove: (...v) => v.forEach(x => classes.delete(x)), toggle: (x, force) => force ? classes.add(x) : classes.delete(x), contains: x => classes.has(x) };
      for (const match of attrs.matchAll(/(data-[\w-]+)="([^"]*)"/g)) this.dataset[match[1].slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = match[2];
    }
    set innerHTML(value) { this.markup = value; this.children = []; }
    get innerHTML() { return this.markup || ''; }
    set innerText(value) { this.textContent = String(value); }
    get innerText() { return this.textContent || ''; }
    setAttribute(name, value) { this.attrs[name] = String(value); }
    getAttribute(name) { return this.attrs[name] ?? null; }
    addEventListener(type, listener) { this.listeners[type] = listener; }
    appendChild(element) { this.children.push(element); return element; }
    remove() {}
    focus() {}
    closest(selector) { return selector === '[data-finance-tab]' && this.dataset.financeTab ? this : null; }
    scrollIntoView() { scrolls++; }
    get offsetParent() { return root.hidden || (this.panel && panels.find(panel => panel.dataset.financePanel === this.panel)?.hidden) ? null : root; }
  }
  const root = new Element('finance-native'); root.hidden = true;
  for (const match of built.html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)) {
    const element = new Element(match[1], match[0]); fields.set(element.id, element);
    if ('financePanel' in element.dataset) panels.push(element);
    if ('financeTab' in element.dataset) tabs.push(element);
    if ('financePeriod' in element.dataset) periods.push(element);
    if (/data-finance-value(?:\s|>)/.test(match[0])) values.push(element);
    if (/data-finance-dynamic(?:\s|>)/.test(match[0])) dynamic.push(element);
    if (/class="[^"]*finance-chart/.test(match[0])) charts.push(element);
  }
  for (const panel of built.html.matchAll(/<section[^>]+data-finance-panel="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)) for (const id of panel[2].matchAll(/\bid="([^"]+)"/g)) fields.get(id[1]).panel = panel[1];
  root.querySelector = selector => selector.startsWith('#') ? fields.get(selector.slice(1)) || null : null;
  root.querySelectorAll = selector => ({ '[data-finance-panel]': panels, '[data-finance-tab]': tabs, '[data-finance-period]': periods, '[data-finance-value]': values, '[data-finance-dynamic]': dynamic, '.finance-chart': charts }[selector] || []);
  const realDocument = { getElementById: id => id === root.id ? root : null, createElement: () => new Element(), head: { appendChild: element => scripts.push(element) } };
  for (const element of fields.values()) element.ownerDocument = realDocument;
  const context = {
    document: realDocument, URL, Date, Math, AbortController,
    console: { log() {}, warn() {}, error() {} },
    location: { hash: '#host-unchanged' }, history: { replaceState() { hashChanges++; } },
    scrollTo() { scrolls++; }, scrollY: 0, matchMedia: () => ({ matches: false }),
    requestAnimationFrame(callback) { frames.push(callback); return frames.length; },
    setTimeout: () => 1, clearTimeout() {},
    addEventListener(type, callback) { (windowEvents[type] ||= []).push(callback); },
    dispatchEvent(event) { events.push(event); for (const callback of windowEvents[event.type] || []) callback(event); },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    getComputedStyle: () => ({ getPropertyValue: () => '#334455' }),
    fetch: async (url, options) => { requests.push({ url, options }); return context.reply(url, options); },
    reply: async () => ({ ok: false, status: 401, json: async () => ({}) }),
    echarts: { version: '5.4.3', init(element) {
      assert.equal(element.ownerDocument, realDocument, 'ECharts receives real DOM ownership');
      assert.notEqual(element.offsetParent, null, 'hidden charts are not initialized');
      const chart = { element, options: null, disposed: false, paints: 0, setOption(options) { this.options = options; this.paints++; }, resize() {}, clear() { this.options = null; }, dispose() { this.disposed = true; }, getWidth: () => 600 };
      chartInstances.push(chart); return chart;
    } }
  };
  Object.assign(context, host);
  context.window = context;
  vm.createContext(context);
  vm.runInContext(built.js, context);
  return { context, api: context.OpsFinanceNative, root, fields, panels, requests, events, scripts, chartInstances, flush() { for (let i = 0; frames.length && i < 30; i++) frames.shift()(); }, hashChanges: () => hashChanges, scrolls: () => scrolls };
}

const app = mount();
assert.equal(app.api.isReady(), true);
assert.equal(app.api.getSummary().status, 'idle');
assert.equal(app.api.getSummary().availableCash, null);
app.flush();
assert.equal(app.requests.length, 0, 'mount and resize must not read raw data');
assert.equal(app.scripts.length, 0, 'idle workspaces do not load chart libraries');
assert.equal('switchTab' in app.context, false);
assert.equal(app.api.activate('not-a-view'), false);
app.fields.get('finance-tab-bar').listeners.click({ target: app.fields.get('finance-tab-assets') });
assert.equal(app.fields.get('finance-panel-assets').hidden, false, 'actual delegated clicks must match the new native tab selector');
app.fields.get('finance-tab-bar').listeners.click({ target: app.fields.get('finance-tab-overview') });
const singleton = app.api;
vm.runInContext(built.js, app.context);
assert.equal(app.context.OpsFinanceNative, singleton);
const hostSwitch = () => 'host'; const hostNamespace = mount({ switchTab: hostSwitch });
assert.equal(hostNamespace.context.switchTab, hostSwitch);
app.context.reply = async () => ({ ok: true, status: 200, json: async () => syntheticFinanceData() });
await app.api.refresh();
assert.equal(app.requests[0].url, 'https://finance.insistgang.top/data/financial_data.json');
assert.equal(app.requests[0].options.credentials, 'include');
assert.equal(app.api.getSummary().status, 'ready');
assert.equal(app.api.getSummary().expenseTotal, 25);
assert.equal(app.api.getSummary().availableCash, 0);
assert.match(app.fields.get('finance-asset-snapshot-note').textContent, /用户自报/);
assert.ok(!app.fields.get('finance-hero-headline').textContent.includes('暂估总资产'), 'unmarked valuations must not all be called provisional');
app.api.selectPeriod('year');
assert.ok(!/\d+\s*月.*(?:学费|资助)/.test(app.fields.get('finance-trend-note').textContent), 'year guidance must not contain a private historical narrative');
app.api.selectPeriod('month', '2026-03-01');
app.flush();
assert.equal(app.chartInstances.length, 0);
app.root.hidden = false;
for (const view of ['overview', 'assets', 'spend', 'review']) { assert.equal(app.api.activate(view), true); app.flush(); }
assert.equal(app.hashChanges(), 0);
assert.equal(app.scrolls(), 0);
assert.ok(app.fields.get('finance-accounts-grid').children.length);
assert.ok(app.fields.get('finance-action-list').children.length);
assert.ok(app.chartInstances.length > 0);
app.api.activate('overview'); app.flush();
const priorPaints = app.chartInstances.reduce((sum, chart) => sum + chart.paints, 0);
const priorRequests = app.requests.length;
app.api.setTheme('light'); app.context.dispatchEvent({ type: 'ops:style-changed', detail: { style: 'paper' } }); app.flush();
assert.equal(app.root.getAttribute('data-ops-theme'), 'light');
assert.ok(app.chartInstances.reduce((sum, chart) => sum + chart.paints, 0) > priorPaints);
assert.equal(app.requests.length, priorRequests, 'appearance changes do not reread the ledger');
const readyAmount = app.api.getSummary().expenseTotal;
app.context.reply = async () => { throw new TypeError('synthetic offline'); };
await app.api.refresh();
assert.equal(app.api.getSummary().status, 'error');
assert.equal(app.api.getSummary().expenseTotal, readyAmount);
assert.ok(app.api.getSummary().error);
assert.match(app.fields.get('finance-header-badge-text').textContent, /上次|失败/);
for (const status of [401, 403]) {
  if (status === 403) { app.context.reply = async () => ({ ok: true, status: 200, json: async () => syntheticFinanceData() }); await app.api.refresh(); app.flush(); }
  app.context.reply = async () => ({ ok: false, status, json: async () => ({}) });
  await app.api.refresh();
  assert.equal(app.api.getSummary().status, 'locked');
  assert.equal(app.api.getSummary().availableCash, null);
  assert.equal(app.api.getSummary().expenseTotal, null);
  for (const id of ['finance-accounts-grid', 'finance-receivables-grid', 'finance-income-detail-list', 'finance-txn-list', 'finance-action-list', 'finance-health-score-list']) assert.equal(app.fields.get(id).innerHTML, '');
  assert.ok(app.chartInstances.every(chart => chart.disposed));
  for (const view of ['overview', 'assets', 'spend', 'review']) app.api.activate(view);
  app.flush();
  assert.equal(app.fields.get('finance-kpi-cash').textContent, '—');
}
for (const event of app.events) {
  if (event.type.startsWith('ops:finance-')) assert.deepEqual(Object.keys(event.detail), ['status']);
}
const first = [], racing = mount();
racing.context.reply = () => new Promise(resolve => first.push(resolve));
const old = racing.api.refresh(), newer = racing.api.refresh();
first[1]({ ok: true, status: 200, json: async () => syntheticFinanceData() });
await newer;
first[0]({ ok: false, status: 401, json: async () => ({}) });
await old;
assert.equal(racing.api.getSummary().status, 'ready', 'late authentication failures cannot clear a newer success');
assert.equal(racing.api.getSummary().expenseTotal, 25);
const second = [], lockedRace = mount();
lockedRace.context.reply = () => new Promise(resolve => second.push(resolve));
const lateSuccess = lockedRace.api.refresh(), latestLock = lockedRace.api.refresh();
second[1]({ ok: false, status: 403, json: async () => ({}) }); await latestLock;
second[0]({ ok: true, status: 200, json: async () => syntheticFinanceData() }); await lateSuccess;
assert.equal(lockedRace.api.getSummary().status, 'locked');
assert.equal(lockedRace.api.getSummary().expenseTotal, null);
const empty = mount();
empty.context.reply = async () => ({ ok: true, status: 200, json: async () => ({ period: '2026-03', asOf: '2026-03-10', summary: {} }) });
await empty.api.refresh();
assert.equal(empty.api.getSummary().status, 'ready');
assert.equal(empty.api.getSummary().expenseTotal, null);
assert.equal(empty.api.getSummary().availableCash, null);
empty.context.reply = async () => { throw new TypeError('synthetic offline'); }; await empty.api.refresh();
assert.equal(empty.api.getSummary().status, 'error');
assert.equal(empty.api.getSummary().expenseTotal, null);
const unavailable = mount();
unavailable.context.reply = async () => { throw new TypeError('synthetic offline'); }; await unavailable.api.refresh();
assert.equal(unavailable.api.getSummary().status, 'error');
assert.equal(unavailable.api.getSummary().asOf, null);
unavailable.context.reply = async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('synthetic bad JSON'); } }); await unavailable.api.refresh();
assert.equal(unavailable.api.getSummary().status, 'error');
assert.equal(unavailable.api.getSummary().availableCash, null);
const malicious = mount();
malicious.context.reply = async () => { const fixture = syntheticFinanceData(); fixture.accounts[0].name = '<img src=x onerror=syntheticAttack()>'; fixture.accounts[0].color = 'red;position:fixed'; return { ok: true, status: 200, json: async () => fixture }; };
await malicious.api.refresh();
assert.ok(malicious.fields.get('finance-accounts-grid').children[0].innerHTML.includes('&lt;img'));
assert.ok(!malicious.fields.get('finance-accounts-grid').children[0].innerHTML.includes('style="background-color: red;'));
const valuation = mount();
valuation.context.reply = async () => { const fixture = syntheticFinanceData(); fixture.assetValuationStatus = 'estimated_rollforward'; fixture.summary.valuationProvisional = true; return { ok: true, status: 200, json: async () => fixture }; };
await valuation.api.refresh();
assert.match(valuation.fields.get('finance-asset-snapshot-note').textContent, /历史顺延暂估/);
assert.match(valuation.fields.get('finance-hero-headline').textContent, /暂估总资产/);
valuation.context.reply = async () => { const fixture = syntheticFinanceData(); delete fixture.assetValuationStatus; return { ok: true, status: 200, json: async () => fixture }; };
await valuation.api.refresh();
assert.match(valuation.fields.get('finance-asset-snapshot-note').textContent, /账户快照/);
assert.ok(!valuation.fields.get('finance-hero-headline').textContent.includes('暂估总资产'));

for (const [file, expected] of [['native-workspace.js', built.js], ['native-workspace.css', built.css]]) assert.ok(fs.readFileSync(new URL(file, import.meta.url), 'utf8') === expected, `${file} must match its clean source build`);

console.log('finance native derivation and public build tests passed');
