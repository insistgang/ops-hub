const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../js/vitaflow-public.js'), 'utf8');

class Element {
  constructor(tag = 'div') { this.tag = tag; this.children = []; this.textContent = ''; this.dataset = {}; this.attrs = {}; this.listeners = {}; this.style = {}; this.disabled = false; }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  addEventListener(type, fn) { this.listeners[type] = fn; }
  click() { return this.listeners.click?.(); }
}

function setup({ reply = { data: {} }, fetchImpl, today = '2026-11-08' } = {}) {
  const ids = Object.fromEntries(['public-vita', 'public-vita-status', 'public-vita-accounts', 'public-vita-todos', 'public-vita-notes', 'public-vita-refresh'].map(id => [id, new Element()]));
  const events = {}, documentEvents = {}, requests = [], intervals = [];
  const document = { hidden: false, getElementById: id => ids[id] || null, createElement: tag => new Element(tag), addEventListener(type, fn) { documentEvents[type] = fn; } };
  let fail = false;
  const window = { addEventListener(type, fn) { events[type] = fn; } };
  const context = { window, document, Date, calendarDay: () => today,
    fetch: (url, options) => { requests.push([url, options]); return fetchImpl ? fetchImpl(url, options) : fail ? Promise.reject(new Error('offline')) : Promise.resolve({ ok: true, json: async () => reply }); },
    setInterval(fn, delay) { intervals.push([fn, delay]); return intervals.length; },
  };
  Object.defineProperty(context, 'localStorage', { get() { throw new Error('Public reader must not access visitor storage'); } });
  vm.runInNewContext(script, context);
  return { ids, requests, intervals, events, documentEvents, document, window, setReply(value) { reply = value; }, fail() { fail = true; }, nextDay(value) { today = value; events['ops:day-changed']?.(); } };
}

const flush = () => new Promise(resolve => setImmediate(resolve));
const flatten = node => [node.textContent, ...node.children.map(flatten)].join(' ');
const payload = () => ({ revision: 'synthetic-revision', updatedAt: '2026-11-08T00:00:00Z', data: {
  vitaflow_accounts: JSON.stringify({ physical: { score: 0 }, emotional: { score: 75 }, focus: { score: null }, meaning: { score: 91 } }),
  vitaflow_todos: JSON.stringify([{ id: 1, text: '<img src=x onerror=alert(1)>', date: '2026-11-08', completed: true }, { id: 2, text: '昨日事项', date: '2026-11-07', completed: false }]),
  vitaflow_writing: JSON.stringify([{ title: '<script>title</script>', content: '<img src=x onerror=alert(1)>', updated: '2026-11-08T00:00:00Z' }]),
  vitaflow_unknown: JSON.stringify([{ title: '不得显示', content: 'hidden' }]),
} });

test('public reader safely renders accounts, today tasks and notes without visitor storage access', async () => {
  const source = payload();
  const before = JSON.stringify(source);
  const app = setup({ reply: source });
  await flush();
  assert.equal(JSON.stringify(source), before, 'source payload must remain unchanged');
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0][0], 'https://finance.insistgang.top/api/public');
  assert.equal(app.requests[0][1].credentials, 'omit');
  assert.equal(app.requests[0][1].cache, 'no-store');
  assert.match(flatten(app.ids['public-vita-accounts']), /体能.*0/);
  assert.match(flatten(app.ids['public-vita-accounts']), /思维.*—/);
  assert.equal(app.ids['public-vita-todos'].children.length, 1);
  assert.match(flatten(app.ids['public-vita-todos']), /已完成.*<img src=x onerror=alert\(1\)>/);
  assert.doesNotMatch(flatten(app.ids['public-vita-todos']), /昨日事项/);
  assert.match(flatten(app.ids['public-vita-notes']), /<script>title<\/script>/);
  assert.doesNotMatch(flatten(app.ids['public-vita-notes']), /不得显示/);
  assert.match(app.ids['public-vita-status'].textContent, /公开只读/);
});

test('empty remote data produces honest empty states and no fake account scores', async () => {
  const app = setup();
  await flush();
  assert.match(app.ids['public-vita-status'].textContent, /尚无/);
  assert.match(flatten(app.ids['public-vita-accounts']), /—/);
  assert.match(flatten(app.ids['public-vita-todos']), /没有/);
  assert.match(flatten(app.ids['public-vita-notes']), /没有/);
});

test('malformed selected JSON is rejected and a previous successful snapshot remains visibly stale', async () => {
  const app = setup({ reply: payload() });
  await flush();
  const previous = flatten(app.ids['public-vita-todos']);
  app.setReply({ data: { vitaflow_todos: '{broken' } });
  await app.ids['public-vita-refresh'].click();
  assert.equal(flatten(app.ids['public-vita-todos']), previous);
  assert.match(app.ids['public-vita-status'].textContent, /读取失败.*上次.*可能已过期/);
});

test('network failure before the first read is shown without fabricating content', async () => {
  const app = setup({ fetchImpl: async () => { throw new Error('offline'); } });
  await flush();
  assert.match(app.ids['public-vita-status'].textContent, /读取失败.*尚无/);
  assert.equal(app.ids['public-vita-accounts'].children.length, 0);
});

test('in-flight reads are coalesced and manual refresh replaces the displayed data', async () => {
  let resolve;
  const app = setup({ fetchImpl: () => new Promise(done => { resolve = done; }) });
  app.ids['public-vita-refresh'].click();
  app.documentEvents.visibilitychange();
  app.intervals[0][0]();
  await Promise.resolve();
  assert.equal(app.requests.length, 1);
  resolve({ ok: true, json: async () => payload() });
  await flush();
  let resolveSecond;
  app.window.OpsVitaFlowPublic.refresh();
  await Promise.resolve();
  resolveSecond = resolve;
  resolveSecond({ ok: true, json: async () => ({ data: { vitaflow_todos: JSON.stringify([{ id: 3, text: '更新后的事项', date: '2026-11-08', completed: false }]) } }) });
  await flush();
  assert.match(flatten(app.ids['public-vita-todos']), /更新后的事项/);
  assert.doesNotMatch(flatten(app.ids['public-vita-todos']), /<img/);
});

test('day changes filter the retained snapshot and hidden pages do not poll', async () => {
  const app = setup({ reply: payload() });
  await flush();
  app.nextDay('2026-11-09');
  assert.doesNotMatch(flatten(app.ids['public-vita-todos']), /<img/);
  const reads = app.requests.length;
  app.document.hidden = true;
  app.intervals[0][0]();
  assert.equal(app.requests.length, reads);
});
