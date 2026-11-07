'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');
const { createStore, STORAGE_KEY } = require('../js/store.js');

async function buildNative() {
  return (await import('../build-native.mjs')).buildNative();
}

class MemoryStorage {
  constructor(values = {}) { this.values = new Map(Object.entries(values)); this.failWrite = false; }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) {
    if (this.failWrite) throw new Error('quota exceeded');
    this.values.set(key, String(value));
  }
}

class Element {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.value = '';
    this.name = '';
    this.type = '';
    this.disabled = false;
    this.hidden = false;
    this.open = false;
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this.listeners = {};
    this.children = [];
    this.parentElement = null;
    this._textContent = '';
    this._innerHTML = '';
    const classes = new Set();
    this.classList = {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
      toggle: (name, force) => {
        const shouldAdd = force === undefined ? !classes.has(name) : force;
        if (shouldAdd) classes.add(name); else classes.delete(name);
        return shouldAdd;
      },
    };
  }
  set textContent(value) { this._textContent = String(value ?? ''); this.children = []; }
  get textContent() { return this._textContent + this.children.map(child => child.textContent).join(''); }
  set innerHTML(value) { this._innerHTML = String(value ?? ''); this.children = []; }
  get innerHTML() { return this._innerHTML; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  dispatch(type, extra = {}) {
    const event = { target: this, currentTarget: this, preventDefault() { this.defaultPrevented = true; }, ...extra };
    for (const callback of this.listeners[type] || []) callback(event);
    return event;
  }
  appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
  append(...children) { children.forEach(child => this.appendChild(child)); }
  replaceChildren(...children) { this.children = []; children.forEach(child => this.appendChild(child)); }
  focus() { this.focused = true; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  reset() { this.resetCount = (this.resetCount || 0) + 1; }
  scrollIntoView(options) { this.scrollOptions = options || {}; this.scrolled = true; }
  closest(selector) {
    let node = this;
    while (node) {
      if (selector === 'dialog' && node.tagName === 'DIALOG') return node;
      node = node.parentElement;
    }
    return null;
  }
}

function parseAttributes(text) {
  const attrs = {};
  for (const match of text.matchAll(/([\w:-]+)(?:="([^"]*)"|'([^']*)')?/g)) {
    attrs[match[1]] = match[2] ?? match[3] ?? '';
  }
  return attrs;
}

function createNativePage(bundle, storage) {
  const root = new Element('section', 'weight-native');
  const elements = new Map();
  const placeholder = new Element('p', 'weight-placeholder');
  placeholder.textContent = '工作区加载中';
  root.appendChild(placeholder);
  Object.defineProperty(root, 'innerHTML', {
    get() { return this._innerHTML || ''; },
    set(markup) {
      this._innerHTML = String(markup ?? '');
      this.children.forEach(child => { child.parentElement = null; });
      this.children = [];
      elements.clear();
      for (const match of this._innerHTML.matchAll(/<([a-z][\w:-]*)\b([^>]*?)\bid="([^"]+)"([^>]*)>/gi)) {
        const [, tagName, before, id, after] = match;
        const element = new Element(tagName, id);
        const attrs = parseAttributes(`${before} ${after}`);
        for (const [name, value] of Object.entries(attrs)) {
          if (name === 'id') continue;
          element.setAttribute(name, value);
          if (name === 'value') element.value = value;
          if (name === 'type') element.type = value;
          if (name === 'name') element.name = value;
          if (name === 'class') element.className = value;
          if (name === 'hidden') element.hidden = true;
        }
        elements.set(id, element);
      }
      const recordForm = elements.get('weight-record-form');
      if (recordForm) recordForm.reset = () => {
        ['weight-record-id', 'weight-record-weight', 'weight-record-note'].forEach(id => { if (elements.has(id)) elements.get(id).value = ''; });
      };
    }
  });
  function descendants() { return [...elements.values()]; }
  root.querySelector = selector => {
    const id = selector.match(/^#([\w-]+)$/)?.[1];
    return id ? elements.get(id) || null : null;
  };
  root.querySelectorAll = selector => {
    const list = descendants();
    if (selector.includes('[data-close-dialog]')) return list.filter(element => element.getAttribute('data-close-dialog') !== null);
    if (selector.includes('form button')) return list.filter(element => element.tagName === 'BUTTON');
    const ids = [...selector.matchAll(/#([\w-]+)/g)].map(match => match[1]);
    return ids.map(id => elements.get(id)).filter(Boolean);
  };
  const svgCalls = [];
  const events = [];
  const windowListeners = {};
  const document = {
    readyState: 'complete',
    documentElement: new Element('html'),
    createElement(tagName) { return new Element(tagName); },
    createElementNS(namespace, tagName) {
      if (this !== document) throw new TypeError('createElementNS must use the real Document receiver');
      svgCalls.push({ namespace, tagName });
      const element = new Element(tagName);
      element.namespaceURI = namespace;
      return element;
    },
    createTextNode(text) { const node = new Element('#text'); node.textContent = text; return node; },
    getElementById(id) { return id === 'weight-native' ? root : elements.get(id) || null; },
    querySelectorAll: selector => root.querySelectorAll(selector),
  };
  const window = {
    document,
    localStorage: storage,
    confirm: () => true,
    addEventListener(type, callback) { (windowListeners[type] ||= []).push(callback); },
    dispatchEvent(event) {
      events.push(event);
      for (const callback of windowListeners[event.type] || []) callback(event);
    },
  };
  const context = vm.createContext({ window, document, localStorage: storage, CustomEvent: class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } } });
  vm.runInContext(bundle.js, context, { filename: 'weight-native.js' });
  return { context, root, elements, storage, window, events, svgCalls, placeholder };
}

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

test('native build is a root fragment with prefixed IDs and references, no nested page shell', async () => {
  const output = await buildNative();
  assert.doesNotMatch(output.html, /<iframe\b|<main\b|class="app-shell"|class="sidebar"|class="topbar"|class="page-footer"|class="main-content"|id="weight-native"/);
  const ids = [...output.html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'native IDs should be unique');
  assert.ok(ids.every(id => id.startsWith('weight-')), 'all module IDs should be prefixed');
  const idSet = new Set(ids);
  for (const match of output.html.matchAll(/\b(?:for|aria-labelledby|aria-describedby|aria-controls|aria-owns|aria-activedescendant|aria-details|aria-errormessage)="([^"]+)"/g)) {
    for (const id of match[1].split(/\s+/)) assert.ok(idSet.has(id), `missing ID reference ${id}`);
  }
  for (const match of output.html.matchAll(/\bhref="#([^"]+)"/g)) assert.ok(idSet.has(match[1]), `missing href target ${match[1]}`);
  assert.match(output.js, /weight-tracker:universal:v1/);
  assert.match(output.js, /createElementNS[\s\S]*\.bind\(realDocument\)/);
  assert.match(output.html, /id="weight-record-clear"[^>]*>清空输入/);
  assert.doesNotMatch(require('node:fs').readFileSync(require('node:path').join(__dirname, '../src/index.html'), 'utf8'), /id="record-clear"/);
  assert.match(output.css, /#weight-native/);
  assert.match(output.css, /--ops-page/);
  assert.match(output.css, /#weight-native #weight-chart-container polyline \{ stroke: var\(--ops-accent/);
  assert.match(output.css, /#weight-native #weight-chart-container circle \{ fill: var\(--ops-accent/);
  assert.match(output.css, /#weight-native :is\(input, select, textarea\) \{ color: var\(--ops-text/);
  assert.match(output.css, /#weight-native \.button-primary \{[^}]*color: var\(--ops-accent-contrast/);
  assert.doesNotMatch(output.css, /(?:^|\n)\s*(?:html|body|:root)\s*\{/m);
});

test('re-evaluating the entire generated bundle keeps one app instance and one set of handlers', async () => {
  const output = await buildNative();
  const app = createNativePage(output, new MemoryStorage());
  const api = app.window.OpsWeightNative;
  const fragment = app.root.innerHTML;
  const listenerCount = () => [...app.elements.values()].reduce((sum, element) => sum + Object.values(element.listeners).reduce((n, list) => n + list.length, 0), 0);
  const before = listenerCount();
  vm.runInContext(output.js, app.context, { filename: 'weight-native-duplicate.js' });
  assert.equal(app.window.OpsWeightNative, api);
  assert.equal(app.root.innerHTML, fragment, 'the native fragment should mount only once');
  assert.equal(listenerCount(), before, 'running the generated bundle twice must not duplicate listeners');

  app.elements.get('weight-profile-name').value = '单次提交';
  app.elements.get('weight-profile-form').dispatch('submit');
  app.elements.get('weight-record-date').value = today();
  app.elements.get('weight-record-weight').value = '76.4';
  app.elements.get('weight-record-form').dispatch('submit');
  assert.equal(api.getSummary().count, 1, 'the submit handler must run once after duplicate bundle evaluation');
  assert.equal(api.getSummary().error, null);
});

test('native API reads existing users, goals, records and groups without rewriting storage', async () => {
  const output = await buildNative();
  const storage = new MemoryStorage();
  const seed = createStore(storage);
  const user = seed.createUser({ name: '本机甲', goal: 70 });
  seed.addRecord({ date: '2026-11-05', weight: 75.5, note: 'older' });
  seed.addRecord({ date: today(), weight: 72.2, note: 'latest' });
  seed.createGroup('本机小组');
  const original = storage.getItem(STORAGE_KEY);
  const app = createNativePage(output, storage);

  assert.equal(app.root.dataset.weightNativeMounted, 'true');
  assert.equal(app.placeholder.parentElement, null, 'mount should replace the empty-host placeholder');
  assert.equal(app.window.OpsWeightNative.isReady(), true);
  assert.deepEqual(JSON.parse(JSON.stringify(app.window.OpsWeightNative.getSummary())), {
    latest: { date: today(), weight: 72.2 }, goal: 70, change: -3.3, count: 2,
    user: { name: '本机甲', id: user.id }, error: null,
  });
  assert.equal(storage.getItem(STORAGE_KEY), original, 'mounting should not rewrite existing data');
  assert.ok(app.svgCalls.length > 0, 'the trend chart should be created with real SVG document APIs');
  assert.ok(app.events.some(event => event.type === 'ops:weight-ready'));
  const dataEvent = app.events.find(event => event.type === 'ops:weight-data');
  assert.ok(dataEvent);
  assert.doesNotMatch(JSON.stringify(dataEvent.detail), /本机甲|72\.2|2026-11-05|2026-11-06/);

  assert.equal(app.window.OpsWeightNative.activate('history'), true);
  assert.equal(app.elements.get('weight-history').scrolled, true);
  const bindingCount = [...app.elements.values()].reduce((sum, element) => sum + Object.values(element.listeners).reduce((n, list) => n + list.length, 0), 0);
  app.window.OpsWeightNative.activate('groups');
  app.window.OpsWeightNative.activate('overview');
  assert.equal([...app.elements.values()].reduce((sum, element) => sum + Object.values(element.listeners).reduce((n, list) => n + list.length, 0), 0), bindingCount, 'activation should not bind handlers again');
  assert.equal(app.elements.get('weight-group-list').textContent.includes('本机小组'), true);
});

test('native UI preserves profile, goal, record editing and group operations', async () => {
  const output = await buildNative();
  const app = createNativePage(output, new MemoryStorage());
  const $ = id => app.elements.get(`weight-${id}`);

  $('profile-name').value = '新使用者';
  $('profile-goal').value = '68';
  $('profile-form').dispatch('submit');
  assert.equal(app.window.OpsWeightNative.getSummary().user.name, '新使用者');
  assert.equal(app.window.OpsWeightNative.getSummary().goal, 68);

  $('record-date').value = today();
  $('record-weight').value = '80';
  $('record-note').value = '首次记录';
  $('record-form').dispatch('submit');
  assert.equal(app.window.OpsWeightNative.getSummary().latest.weight, 80);
  const edit = $('record-list').children[0].children[1].children[0];
  edit.onclick();
  $('record-weight').value = '79.4';
  $('record-note').value = '修正记录';
  $('record-form').dispatch('submit');
  assert.equal(app.window.OpsWeightNative.getSummary().latest.weight, 79.4);
  assert.equal($('record-list').textContent.includes('修正记录'), true);

  $('profile-edit').dispatch('click');
  $('profile-name').value = '更新后的使用者';
  $('profile-goal').value = '67';
  $('profile-form').dispatch('submit');
  assert.equal(app.window.OpsWeightNative.getSummary().user.name, '更新后的使用者');
  assert.equal(app.window.OpsWeightNative.getSummary().goal, 67);
  const firstUserId = app.window.OpsWeightNative.getSummary().user.id;

  $('profile-add').dispatch('click');
  $('profile-name').value = '第二位使用者';
  $('profile-goal').value = '';
  $('profile-form').dispatch('submit');
  assert.equal(app.window.OpsWeightNative.getSummary().count, 0);
  $('profile-select').value = firstUserId;
  $('profile-select').dispatch('change');
  assert.equal(app.window.OpsWeightNative.getSummary().user.id, firstUserId);
  assert.equal(app.window.OpsWeightNative.getSummary().latest.weight, 79.4, 'switching back should retain the edited user record');

  $('group-name').value = '新的小组';
  $('group-form').dispatch('submit');
  assert.equal($('group-list').textContent.includes('新的小组'), true);
  assert.equal(app.window.OpsWeightNative.getSummary().count, 1);
});

test('malformed storage remains unchanged and is reported through the native summary', async () => {
  const output = await buildNative();
  const storage = new MemoryStorage({ [STORAGE_KEY]: '{broken' });
  const app = createNativePage(output, storage);
  assert.equal(app.window.OpsWeightNative.isReady(), true);
  assert.equal(app.window.OpsWeightNative.getSummary().error != null, true);
  assert.equal(storage.getItem(STORAGE_KEY), '{broken');
  assert.match(app.elements.get('weight-notice').textContent, /格式异常/);
});

test('a stale native instance cannot overwrite another tab and refresh recovers it', async () => {
  const output = await buildNative();
  const storage = new MemoryStorage();
  const first = createNativePage(output, storage);
  const stale = createNativePage(output, storage);
  const original = storage.getItem(STORAGE_KEY);

  first.elements.get('weight-profile-name').value = '先保存';
  first.elements.get('weight-profile-form').dispatch('submit');
  const afterFirstWrite = storage.getItem(STORAGE_KEY);
  stale.elements.get('weight-profile-name').value = '过期标签';
  stale.elements.get('weight-profile-form').dispatch('submit');
  assert.equal(storage.getItem(STORAGE_KEY), afterFirstWrite);
  assert.notEqual(storage.getItem(STORAGE_KEY), original);
  assert.match(stale.elements.get('weight-notice').textContent, /其他页面|刷新页面/);
  assert.match(stale.window.OpsWeightNative.getSummary().error, /另一个页面更新/);

  const refreshed = stale.window.OpsWeightNative.refresh();
  assert.equal(refreshed.user.name, '先保存');
  assert.equal(refreshed.error, null);
});

test('refresh does not switch users under an unsaved draft and the native clear action unlocks it', async () => {
  const output = await buildNative();
  const storage = new MemoryStorage();
  const first = createNativePage(output, storage);
  const stale = createNativePage(output, storage);
  first.elements.get('weight-profile-name').value = '另一个标签的使用者';
  first.elements.get('weight-profile-form').dispatch('submit');
  stale.elements.get('weight-record-weight').value = '81.2';
  stale.elements.get('weight-record-note').value = '尚未保存的输入';

  const blocked = stale.window.OpsWeightNative.refresh();
  assert.equal(blocked.user, null, 'refresh must not switch the stale form to the other active user');
  assert.equal(blocked.error != null, true);
  assert.equal(stale.elements.get('weight-record-weight').value, '81.2');
  assert.match(stale.elements.get('weight-notice').textContent, /清空输入/);

  stale.elements.get('weight-record-clear').dispatch('click');
  assert.equal(stale.elements.get('weight-record-weight').value, '');
  const refreshed = stale.window.OpsWeightNative.refresh();
  assert.equal(refreshed.user.name, '另一个标签的使用者');
  assert.equal(refreshed.error, null);
});
