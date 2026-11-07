const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const appSource = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
const keys = ['起了', '动了', '写了', '关了'];

class Element {
  constructor(id = '') {
    this.id = id;
    this.attributes = {};
    this.dataset = {};
    this.children = [];
    this._innerHTML = '';
    this.textContent = '';
    this.innerText = '';
  }

  set innerHTML(value) {
    this._innerHTML = value;
    this.children = [];
  }

  get innerHTML() { return this._innerHTML; }
  appendChild(child) { this.children.push(child); }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
}

function createApp({ now = '2026-11-06T16:30:00Z', entries = {}, status = null, rules = null } = {}) {
  let currentTime = Date.parse(now);
  class ControlledDate extends Date {
    constructor(...args) { super(...(args.length ? args : [currentTime])); }
    static now() { return currentTime; }
  }

  const stored = new Map(Object.entries(entries));
  const writes = [];
  const listeners = new Map();
  const events = [];
  let getError = null;
  let setError = null;
  const localStorage = {
    getItem(key) {
      if (getError) throw getError;
      return stored.has(key) ? stored.get(key) : null;
    },
    setItem(key, value) {
      writes.push({ key, value });
      if (setError) throw setError;
      stored.set(key, String(value));
    }
  };
  const ids = [
    'daily-checks-date', 'daily-checks-feedback', 'daily-checks-container',
    'scenes-container', 'principles-container', 'live-clock', 'sync-age-text',
    'data-load-notice'
  ];
  const elements = new Map(ids.map(id => [id, new Element(id)]));
  const window = {
    __OPS_STATUS__: status,
    __OPS_MEMORY__: rules,
    addEventListener(type, handler) {
      const handlers = listeners.get(type) || [];
      handlers.push(handler);
      listeners.set(type, handlers);
    },
    dispatchEvent(event) {
      events.push(event);
      for (const handler of listeners.get(event.type) || []) handler(event);
    }
  };
  const intervals = [];
  const context = {
    window,
    document: {
      readyState: 'loading',
      addEventListener() {},
      getElementById: id => elements.get(id) || null,
      querySelectorAll: () => [],
      createElement: () => new Element()
    },
    localStorage,
    Date: ControlledDate,
    Intl,
    URL,
    AbortController,
    setTimeout,
    clearTimeout,
    setInterval: callback => { intervals.push(callback); return intervals.length; },
    console: { log() {}, warn() {}, error() {} },
    CustomEvent: class {
      constructor(type, options = {}) { this.type = type; this.detail = options.detail; }
    }
  };
  context.document.createElement = () => {
    const element = new Element();
    element.focus = () => { context.document.activeElement = element; };
    return element;
  };
  vm.createContext(context);
  vm.runInContext(appSource, context, { filename: 'js/app.js' });

  return {
    context,
    elements,
    events,
    intervals,
    writes,
    stored,
    render: () => context.renderMemoryHub(),
    buttons: () => elements.get('daily-checks-container').children,
    setNow: value => { currentTime = Date.parse(value); },
    setGetError: error => { getError = error; },
    setSetError: error => { setError = error; },
    emit: event => window.dispatchEvent(event)
  };
}

const todayKey = 'ops_checks_2026-11-07';

test('四勾使用北京时间，且没有状态快照时仍可打卡', () => {
  const app = createApp();
  app.context.renderAll();

  assert.equal(app.elements.get('daily-checks-date').innerText, '2026-11-07');
  assert.equal(app.buttons().length, 4);
  app.buttons()[0].onclick();
  assert.deepEqual(JSON.parse(app.stored.get(todayKey)), {
    '起了': true, '动了': false, '写了': false, '关了': false
  });
  assert.equal(app.buttons()[0].attributes['aria-pressed'], 'true');
});

test('损坏 JSON、数组和非布尔记录不会被写入覆盖', () => {
  const invalid = ['{broken', '[]', '{"起了":"true"}', 'false'];
  for (const raw of invalid) {
    const app = createApp({ entries: { [todayKey]: raw } });
    app.render();
    const original = app.stored.get(todayKey);
    app.buttons()[0].onclick();

    assert.equal(app.stored.get(todayKey), original, `保留损坏记录 ${raw}`);
    assert.equal(app.writes.length, 0, `不写回损坏记录 ${raw}`);
    assert.equal(app.buttons()[0].attributes['aria-pressed'], 'false');
    assert.match(app.elements.get('daily-checks-feedback').textContent, /无法读取|损坏|格式无效/);
  }
});

test('旧的部分记录补齐默认值，未知键被过滤，只保存四个布尔键', () => {
  const app = createApp({ entries: { [todayKey]: '{"起了":true,"写了":false,"other":true}' } });
  app.render();

  assert.deepEqual(app.buttons().map(button => button.attributes['aria-pressed']), ['true', 'false', 'false', 'false']);
  app.buttons()[1].onclick();
  assert.deepEqual(JSON.parse(app.stored.get(todayKey)), {
    '起了': true, '动了': true, '写了': false, '关了': false
  });
});

test('写入失败时保留原存储和已显示勾选，并提示用户', () => {
  const original = '{"起了":false,"动了":true}';
  const app = createApp({ entries: { [todayKey]: original } });
  app.render();
  app.setSetError(new Error('quota exceeded'));
  app.buttons()[0].onclick();

  assert.equal(app.stored.get(todayKey), original);
  assert.equal(app.buttons()[0].attributes['aria-pressed'], 'false');
  assert.equal(app.buttons()[1].attributes['aria-pressed'], 'true');
  assert.match(app.elements.get('daily-checks-feedback').textContent, /保存失败/);
});

test('成功保存后清除失败提示并更新已保存状态', () => {
  const app = createApp();
  app.render();
  app.elements.get('daily-checks-feedback').textContent = '旧错误';
  app.buttons()[0].onclick();

  assert.equal(app.elements.get('daily-checks-feedback').textContent, '');
  assert.equal(app.buttons()[0].attributes['aria-pressed'], 'true');
});

test('昨日按钮跨日点击不会写入昨日记录', () => {
  const app = createApp({ now: '2026-11-06T15:59:59Z' });
  app.render();
  const yesterdayButton = app.buttons()[0];
  app.setNow('2026-11-06T16:00:00Z');
  yesterdayButton.onclick();

  assert.equal(app.stored.has('ops_checks_2026-11-06'), false);
  assert.equal(app.stored.has('ops_checks_2026-11-07'), false);
  assert.equal(app.elements.get('daily-checks-date').innerText, '2026-11-07');
  assert.match(app.elements.get('daily-checks-feedback').textContent, /日期已变化/);
});

test('另一标签页更改同日记录后，旧按钮刷新并要求核对重试', () => {
  const app = createApp({ entries: { [todayKey]: '{"起了":false}' } });
  app.render();
  const staleButton = app.buttons()[0];
  app.stored.set(todayKey, '{"动了":true}');
  staleButton.onclick();

  assert.equal(app.stored.get(todayKey), '{"动了":true}');
  assert.equal(app.buttons()[0].attributes['aria-pressed'], 'false');
  assert.equal(app.buttons()[1].attributes['aria-pressed'], 'true');
  assert.match(app.elements.get('daily-checks-feedback').textContent, /其他标签页|请核对后重试/);
});

test('相关 storage 事件刷新四勾，其他存储事件不重绘', () => {
  const app = createApp();
  app.render();
  const initialButton = app.buttons()[0];
  app.stored.set(todayKey, '{"动了":true}');
  app.emit({ type: 'storage', key: todayKey, newValue: '{"动了":true}' });

  assert.notEqual(app.buttons()[0], initialButton);
  assert.equal(app.buttons()[1].attributes['aria-pressed'], 'true');
  const refreshedButton = app.buttons()[0];
  app.emit({ type: 'storage', key: 'ops_theme', newValue: 'light' });
  assert.equal(app.buttons()[0], refreshedButton);
});

test('当日快照只采纳已知布尔键', () => {
  const status = {
    daily_checks: {
      date: '2026-11-07',
      checks: { '起了': true, '动了': 'true', '写了': false, extra: true }
    }
  };
  const app = createApp({ status });
  app.render();

  assert.deepEqual(app.buttons().map(button => button.attributes['aria-pressed']), ['true', 'false', 'false', 'false']);
});

test('localStorage 读取失败时不尝试写入并显示提示', () => {
  const app = createApp();
  app.setGetError(new Error('storage blocked'));
  app.render();
  app.buttons()[0].onclick();

  assert.equal(app.writes.length, 0);
  assert.equal(app.buttons()[0].attributes['aria-pressed'], 'false');
  assert.match(app.elements.get('daily-checks-feedback').textContent, /存储|读取失败/);
});

test('午夜时钟发出北京时间日期事件并重绘当天四勾', () => {
  const app = createApp({ now: '2026-11-06T15:59:59Z' });
  app.context.startLiveClock();
  assert.equal(app.intervals.length, 1);
  app.setNow('2026-11-06T16:00:00Z');
  app.intervals[0]();

  const dayChange = app.events.find(event => event.type === 'ops:day-changed');
  assert.equal(dayChange?.detail?.day, '2026-11-07');
  assert.equal(app.elements.get('daily-checks-date').innerText, '2026-11-07');
});

test('其他标签页修复损坏记录后清除过期读取错误', () => {
  const app = createApp({ entries: { [todayKey]: '{broken' } });
  app.render();
  app.stored.set(todayKey, '{"起了":true}');
  app.emit({ type: 'storage', key: todayKey });
  assert.equal(app.buttons()[0].attributes['aria-pressed'], 'true');
  assert.equal(app.elements.get('daily-checks-feedback').textContent, '');
});

test('跨日后不保留昨日的存储错误提示', () => {
  const app = createApp({ now: '2026-11-06T15:59:59Z', entries: { 'ops_checks_2026-11-06': '{broken' } });
  app.render();
  app.setNow('2026-11-06T16:00:00Z');
  app.emit({ type: 'ops:day-changed', detail: { day: '2026-11-07' } });
  assert.equal(app.elements.get('daily-checks-feedback').textContent, '');
});

test('四勾重绘后保留键盘焦点', () => {
  const app = createApp();
  app.render();
  app.buttons()[0].focus();
  app.buttons()[0].onclick();
  assert.equal(app.context.document.activeElement, app.buttons()[0]);
});
