const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/today.js'), 'utf8');
const appSource = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

function setup(storage = new Map(), initialTime = '2026-11-06T08:00:00Z') {
  let now = initialTime;
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return new Date(now).getTime(); }
  }
  class Element {
    constructor() { this.listeners = {}; this.children = []; this.attrs = {}; this.value = ''; this.textContent = ''; this.disabled = false; this.hidden = false; }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    setAttribute(name, value) { this.attrs[name] = value; }
    getAttribute(name) { return this.attrs[name]; }
    focus() { document.activeElement = this; }
    append(...items) { this.children.push(...items); }
    replaceChildren() { this.children = []; }
    querySelector() { return this.button; }
    click() { this.focus(); this.listeners.click?.({}); }
  }
  const ids = Object.fromEntries(['focus-form','focus-input','focus-list','focus-empty','focus-count','focus-feedback','focus-progress','today-date','carryover-list','carryover-empty','carryover-date','carryover-feedback'].map(k => [k, new Element()]));
  ids['focus-form'].button = new Element();
  const documentEvents = {};
  const windowEvents = {};
  const document = { readyState: 'loading', getElementById: id => ids[id], createElement: () => new Element(), querySelectorAll: () => [], addEventListener(name, fn) { documentEvents[name] = fn; }, hidden: false };
  const window = { addEventListener(name, fn) { windowEvents[name] = fn; } };
  const localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  vm.runInNewContext(appSource + '\n' + source, { document, window, localStorage, Date: Clock, Intl });
  const add = value => { ids['focus-input'].value = value; ids['focus-form'].listeners.submit({ preventDefault() {} }); };
  return { ids, add, storage, document,
    setTime(value) { now = value; },
    storageEvent(key) { windowEvents.storage?.({ key, storageArea: localStorage }); },
    dayChanged() { windowEvents['ops:day-changed']?.({}); },
    visible() { documentEvents.visibilitychange?.({}); }
  };
}

test('daily focus persists safely and respects the three-item limit', () => {
  const app = setup();
  app.add('<img src=x onerror=alert(1)>');
  app.add('第二件'); app.add('第三件'); app.add('第四件');
  assert.equal(app.ids['focus-count'].textContent, '3 / 3');
  assert.equal(app.ids['focus-input'].disabled, true);
  assert.equal(app.ids['focus-list'].children[0].children[1].textContent, '<img src=x onerror=alert(1)>');
  app.ids['focus-list'].children[0].children[0].click();
  const reopened = setup(app.storage);
  assert.equal(reopened.ids['focus-list'].children[0].children[0].attrs['aria-pressed'], 'true');
  reopened.ids['focus-list'].children[0].children[2].click();
  assert.equal(reopened.ids['focus-count'].textContent, '2 / 3');
});

test('storage write failure is visible to the user', () => {
  const storage = new Map();
  storage.set = () => { throw new Error('blocked'); };
  const app = setup(storage);
  app.add('一件事');
  assert.match(app.ids['focus-feedback'].textContent, /保存失败/);
  assert.equal(app.ids['focus-list'].children.length, 0);
  assert.equal(app.ids['focus-input'].value, '一件事');
});

test('failed completion leaves the saved and displayed item unfinished', () => {
  const app = setup();
  app.add('继续写作');
  app.storage.set = () => { throw new Error('blocked'); };
  app.ids['focus-list'].children[0].children[0].click();
  assert.equal(app.ids['focus-list'].children[0].children[0].attrs['aria-pressed'], 'false');
  assert.equal(JSON.parse(app.storage.get('ops_focus_2026-11-06'))[0].done, false);
  assert.match(app.ids['focus-feedback'].textContent, /保存失败/);
});

test('damaged stored focus is preserved instead of overwritten', () => {
  for (const raw of ['{broken', '{}', '[{"text":"事项","done":"false"}]']) {
    const storage = new Map([['ops_focus_2026-11-06', raw]]);
    const app = setup(storage);
    app.add('新事项');
    assert.equal(storage.get('ops_focus_2026-11-06'), raw);
    assert.match(app.ids['focus-feedback'].textContent, /读取失败|格式/);
    assert.equal(app.ids['focus-input'].disabled, true);
  }
});

test('a stale tab cannot toggle a different item or overwrite another tab', () => {
  const app = setup();
  app.add('旧事项');
  const updated = JSON.stringify([{ text: '另一页面的新事项', done: false }]);
  app.storage.set('ops_focus_2026-11-06', updated);
  app.ids['focus-list'].children[0].children[0].click();
  assert.equal(app.storage.get('ops_focus_2026-11-06'), updated);
  assert.equal(app.ids['focus-list'].children[0].children[1].textContent, '另一页面的新事项');
  assert.match(app.ids['focus-feedback'].textContent, /其他页面/);
});

test('yesterday shows only unfinished focus and carries it over on request without changing the source', () => {
  const original = JSON.stringify([{ text: '<昨天的重点>', done: false }, { text: '已完成', done: true }]);
  const storage = new Map([['ops_focus_2026-11-05', original]]);
  const app = setup(storage);
  assert.equal(app.ids['focus-list'].children.length, 0);
  assert.equal(app.ids['carryover-date'].textContent, '2026-11-05');
  assert.equal(app.ids['carryover-list'].children.length, 1);
  assert.equal(app.ids['carryover-list'].children[0].children[0].textContent, '<昨天的重点>');
  app.ids['carryover-list'].children[0].children[1].click();
  assert.equal(app.ids['focus-list'].children[0].children[1].textContent, '<昨天的重点>');
  assert.equal(storage.get('ops_focus_2026-11-05'), original);
  assert.equal(app.ids['carryover-list'].children[0].children[1].disabled, true);
});

test('carryover shares the three-item limit and does not duplicate a focus already present today', () => {
  const storage = new Map([['ops_focus_2026-11-05', JSON.stringify([{ text: '共同事项', done: false }])]]);
  const app = setup(storage);
  app.add('共同事项');
  app.ids['carryover-list'].children[0].children[1].click();
  assert.equal(app.ids['focus-list'].children.length, 1);
  app.add('第二件'); app.add('第三件');
  assert.equal(app.ids['carryover-list'].children[0].children[1].disabled, true);
  app.ids['carryover-list'].children[0].children[1].click();
  assert.equal(app.ids['focus-list'].children.length, 3);
});

test('an open page rolls over on Shanghai midnight and cannot change yesterday through an old button', () => {
  const app = setup(new Map(), '2026-11-06T15:59:59Z');
  app.add('夜间事项');
  const oldButton = app.ids['focus-list'].children[0].children[0];
  const yesterday = app.storage.get('ops_focus_2026-11-06');
  app.setTime('2026-11-06T16:00:00Z');
  app.dayChanged();
  assert.equal(app.ids['today-date'].textContent, '2026-11-07');
  assert.equal(app.ids['focus-list'].children.length, 0);
  assert.equal(app.ids['carryover-list'].children.length, 1);
  oldButton.click();
  assert.equal(app.storage.get('ops_focus_2026-11-06'), yesterday);
  assert.equal(app.storage.has('ops_focus_2026-11-07'), false);
});

test('storage updates refresh the current and previous day without dropping an input draft', () => {
  const app = setup();
  app.ids['focus-input'].value = '正在输入';
  app.storage.set('ops_focus_2026-11-06', JSON.stringify([{ text: '其他页面添加', done: false }]));
  app.storageEvent('ops_focus_2026-11-06');
  assert.equal(app.ids['focus-list'].children[0].children[1].textContent, '其他页面添加');
  assert.equal(app.ids['focus-input'].value, '正在输入');
  app.storage.set('ops_focus_2026-11-05', JSON.stringify([{ text: '昨日记录', done: false }]));
  app.storageEvent('ops_focus_2026-11-05');
  assert.equal(app.ids['carryover-list'].children[0].children[0].textContent, '昨日记录');
});

test('a changed yesterday record is refreshed before it can be carried over', () => {
  const storage = new Map([['ops_focus_2026-11-05', JSON.stringify([{ text: '已在别处完成', done: false }])]]);
  const app = setup(storage);
  storage.set('ops_focus_2026-11-05', JSON.stringify([{ text: '已在别处完成', done: true }]));
  app.ids['carryover-list'].children[0].children[1].click();
  assert.equal(app.ids['focus-list'].children.length, 0);
  assert.equal(app.ids['carryover-list'].children.length, 0);
  assert.match(app.ids['carryover-feedback'].textContent, /更新/);
});

test('a damaged previous day is reported while today remains usable', () => {
  const storage = new Map([['ops_focus_2026-11-05', '{damaged']]);
  const app = setup(storage);
  assert.match(app.ids['carryover-feedback'].textContent, /读取失败|格式/);
  app.add('今日仍可使用');
  assert.equal(app.ids['focus-list'].children.length, 1);
  assert.equal(storage.get('ops_focus_2026-11-05'), '{damaged');
});

test('completed focus has a separate progress label and yesterday handles month boundaries', () => {
  const app = setup(new Map(), '2026-10-31T16:00:00Z');
  assert.equal(app.ids['today-date'].textContent, '2026-11-01');
  assert.equal(app.ids['carryover-date'].textContent, '2026-10-31');
  app.add('一件事');
  assert.equal(app.ids['focus-progress'].textContent, '已完成 0 / 1');
  app.ids['focus-list'].children[0].children[0].click();
  assert.equal(app.ids['focus-progress'].textContent, '已完成 1 / 1');
});

test('focus stays on the rebuilt control and returns to the input after the last removal', () => {
  const app = setup();
  app.add('键盘事项');
  app.ids['focus-list'].children[0].children[0].click();
  assert.equal(app.document.activeElement, app.ids['focus-list'].children[0].children[0]);
  app.ids['focus-list'].children[0].children[2].click();
  assert.equal(app.document.activeElement, app.ids['focus-input']);
});
