const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const styleScript = fs.readFileSync(path.join(__dirname, '../js/site-style.js'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '../css/site-styles.css'), 'utf8');
const styleNames = ['classic', 'paper', 'forest', 'mono'];

function createApp({ stored = {}, readyState = 'complete', getError = null, setError = null } = {}) {
  const root = {
    attributes: {},
    className: 'dark',
    setAttribute(name, value) { this.attributes[name] = String(value); },
    getAttribute(name) { return this.attributes[name] ?? null; },
  };
  const select = {
    value: '',
    listeners: {},
    addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); },
    dispatch(type) { for (const callback of this.listeners[type] || []) callback({ target: this, currentTarget: this }); },
  };
  const status = { textContent: '', dataset: {} };
  const elements = new Map([['site-style', select], ['site-style-status', status]]);
  const documentListeners = {};
  const windowListeners = {};
  const events = [];
  const writes = [];
  const storage = { ...stored };
  const localStorage = {
    getItem(key) {
      if (getError) throw getError;
      return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
    },
    setItem(key, value) {
      writes.push([key, String(value)]);
      if (setError) throw setError;
      storage[key] = String(value);
    },
  };
  const document = {
    readyState,
    documentElement: root,
    getElementById: id => elements.get(id) || null,
    addEventListener(type, callback) { (documentListeners[type] ||= []).push(callback); },
  };
  const window = {
    addEventListener(type, callback) { (windowListeners[type] ||= []).push(callback); },
    dispatchEvent(event) {
      events.push(event);
      for (const callback of windowListeners[event.type] || []) callback(event);
    },
  };
  const context = vm.createContext({
    window,
    document,
    localStorage,
    CustomEvent: class {
      constructor(type, options = {}) { this.type = type; this.detail = options.detail; }
    },
  });
  vm.runInContext(styleScript, context, { filename: 'js/site-style.js' });
  context.OpsAppearance = window.OpsAppearance;
  return {
    context, root, select, status, storage, writes, events, windowListeners, documentListeners,
    failGet(error = new Error('storage denied')) { getError = error; },
    failSet(error = new Error('quota exceeded')) { setError = error; },
    fireStorage(key, newValue) {
      for (const callback of windowListeners.storage || []) callback({ key, newValue });
    },
    fireReady() {
      document.readyState = 'complete';
      for (const callback of documentListeners.DOMContentLoaded || []) callback();
    },
  };
}

test('style script initializes after DOM readiness and restores a valid saved style', () => {
  const app = createApp({ stored: { ops_style: 'forest', ops_theme: 'light' }, readyState: 'loading' });
  assert.equal(app.root.getAttribute('data-ops-style'), null, 'loading DOM should wait before binding the selector');
  app.fireReady();

  assert.equal(app.context.OpsAppearance.getStyle(), 'forest');
  assert.equal(app.root.getAttribute('data-ops-style'), 'forest');
  assert.equal(app.select.value, 'forest');
  assert.equal(app.root.className, 'dark', 'style restore must not modify the independent theme');
  assert.equal(app.storage.ops_theme, 'light');
});

test('style changes persist only ops_style, update the selector, and dispatch the public event', () => {
  const app = createApp({ stored: { ops_theme: 'dark' } });
  app.select.value = 'paper';
  app.select.dispatch('change');

  assert.equal(app.root.getAttribute('data-ops-style'), 'paper');
  assert.equal(app.context.OpsAppearance.getStyle(), 'paper');
  assert.equal(app.storage.ops_style, 'paper');
  assert.equal(app.storage.ops_theme, 'dark');
  assert.deepEqual(app.writes, [['ops_style', 'paper']]);
  const event = app.events.slice().reverse().find(item => item.type === 'ops:style-changed');
  assert.equal(event?.detail?.style, 'paper');
  assert.match(app.status.textContent, /纸感阅读/);
});

test('invalid stored and requested styles fall back to classic', () => {
  const app = createApp({ stored: { ops_style: 'unknown' } });
  assert.equal(app.context.OpsAppearance.getStyle(), 'classic');
  assert.equal(app.root.getAttribute('data-ops-style'), 'classic');
  assert.equal(app.select.value, 'classic');
  assert.match(app.status.textContent, /无效|经典/);

  assert.equal(app.context.OpsAppearance.setStyle('neon'), false);
  assert.equal(app.context.OpsAppearance.getStyle(), 'classic');
  assert.equal(app.storage.ops_style, 'unknown', 'invalid input should not replace the stored value');
});

test('storage read errors use classic and remain visible', () => {
  const app = createApp({ getError: new Error('storage denied') });

  assert.equal(app.context.OpsAppearance.getStyle(), 'classic');
  assert.equal(app.root.getAttribute('data-ops-style'), 'classic');
  assert.match(app.status.textContent, /无法读取|读取失败/);
});

test('save failures leave the selected style active and show a visible warning', () => {
  const app = createApp();
  app.failSet();
  const saved = app.context.OpsAppearance.setStyle('mono');

  assert.equal(saved, false);
  assert.equal(app.root.getAttribute('data-ops-style'), 'mono');
  assert.equal(app.select.value, 'mono');
  assert.match(app.status.textContent, /保存失败/);
  assert.equal(app.events.filter(item => item.type === 'ops:style-changed').at(-1)?.detail?.style, 'mono');
});

test('storage events from another tab update the style without writing or reacting to other keys', () => {
  const app = createApp({ stored: { ops_style: 'paper' } });
  const writeCount = app.writes.length;
  app.fireStorage('ops_theme', 'light');
  assert.equal(app.context.OpsAppearance.getStyle(), 'paper');

  app.fireStorage('ops_style', 'forest');
  assert.equal(app.context.OpsAppearance.getStyle(), 'forest');
  assert.equal(app.select.value, 'forest');
  assert.equal(app.writes.length, writeCount, 'remote changes should not be echoed back');
  assert.equal(app.events.filter(item => item.type === 'ops:style-changed').at(-1)?.detail?.style, 'forest');

  app.fireStorage('ops_style', null);
  assert.equal(app.context.OpsAppearance.getStyle(), 'classic', 'clearing saved style should restore default');
});

test('initialization is idempotent', () => {
  const app = createApp();
  app.context.OpsAppearance.init();
  app.context.OpsAppearance.init();
  assert.equal(app.windowListeners.storage.length, 1);
  assert.equal(app.select.listeners.change.length, 1);
});

test('four style presets each define light and dark tokens with visible design differences', () => {
  const requiredTokens = [
    '--ops-page', '--ops-surface', '--ops-surface-muted', '--ops-text', '--ops-muted',
    '--ops-border', '--ops-accent', '--ops-radius', '--ops-shadow',
  ];
  const darkTokens = ['--ops-page', '--ops-surface', '--ops-surface-muted', '--ops-text', '--ops-muted', '--ops-border', '--ops-accent'];
  const lightRules = [];
  const darkRules = [];
  const extractRule = selector => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = styleCss.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`));
    assert.ok(match, `missing token block: ${selector}`);
    return match[1];
  };
  const tokenValue = (body, token) => {
    const matches = [...body.matchAll(new RegExp(`${token}:\\s*([^;]+);`, 'g'))];
    assert.ok(matches.length, `missing ${token} in preset block`);
    return matches.at(-1)[1].trim();
  };
  for (const style of styleNames) {
    const light = extractRule(`html[data-ops-style="${style}"]`);
    const dark = extractRule(`html.dark[data-ops-style="${style}"]`);
    lightRules.push(light);
    darkRules.push(dark);
    for (const token of requiredTokens) assert.ok(light.includes(token), `${style} light mode should expose ${token}`);
    for (const token of darkTokens) assert.ok(dark.includes(token), `${style} dark mode should expose ${token}`);
  }
  const resolvedDarkRules = lightRules.map((light, index) => `${light}\n${darkRules[index]}`);
  for (const rules of [lightRules, resolvedDarkRules]) {
    for (const token of ['--ops-page', '--ops-surface', '--ops-text', '--ops-accent', '--ops-radius', '--ops-shadow', '--ops-font-heading']) {
      assert.equal(new Set(rules.map(body => tokenValue(body, token))).size, 4, `${token} should distinguish all four presets`);
    }
  }
  assert.match(styleCss, /#vitaflow-native/);
  assert.match(styleCss, /#vitaflow-native[^\n]*(h1|h2|h3|\.vf-title)/);
  assert.match(styleCss, /#vitaflow-native[^\n]*(\.vf-panel|\.panel|\.card)/);
  assert.doesNotMatch(styleCss, /@import|fonts\.googleapis\.com|fonts\.gstatic\.com/i, 'style layer must not fetch fonts');
  assert.match(styleCss, /html\[data-ops-style="mono"\] :is\([^)]*\)[\s\S]*?background-image: none;[\s\S]*?backdrop-filter: none;/);
  assert.match(styleCss, /html\[data-ops-style="mono"\] \[class\*="bg-gradient-"\]/);
  assert.match(styleCss, /html\[data-ops-style="mono"\] \[class\*="backdrop-blur-"\]/);
});
