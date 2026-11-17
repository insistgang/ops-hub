const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const coreSource = fs.readFileSync(path.join(root, 'js/core.js'), 'utf8');
const computeSource = fs.readFileSync(path.join(root, 'js/compute.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const projectsSource = fs.readFileSync(path.join(root, 'js/knowledge-projects.js'), 'utf8');

test('OpsCore.TASK_ROUTES stays in exact keyword parity with Python ops_common.TASK_ROUTES', () => {
  const pySource = fs.readFileSync(path.join(root, 'scripts/ops_common.py'), 'utf8');
  const window = { location: { protocol: 'file:' } };
  const document = { readyState: 'complete', getElementById: () => null, createElement: () => ({}), addEventListener() {} };
  vm.runInNewContext(coreSource, { window, document, Intl, Date });

  for (const rule of window.OpsCore.TASK_ROUTES) {
    for (const kw of rule.keywords) {
      assert.ok(pySource.includes(`"${kw}"`), `Python ops_common.py 缺少关键词 "${kw}"`);
      assert.equal(window.OpsCore.routeTask(`请帮我${kw}`).target, rule.target);
    }
  }
  assert.equal(window.OpsCore.routeTask('随便散步').target, 'general');
  assert.equal(window.OpsCore.routeTask('   '), null);
});

test('refreshPublicKnowledge bypasses static cache on public HTTP(S) and never overwrites private source_root', async () => {
  const listeners = new Map();
  const dispatched = [];
  let fetchCalls = 0;

  // 1) Private snapshot present (has source_root): zero network fetch
  const privWin = {
    __OPS_KNOWLEDGE__: { available: true, source_root: '/Users/demo/knowledge' },
    location: { protocol: 'http:' },
    fetch: async () => { fetchCalls += 1; throw new Error('must not fetch'); },
  };
  vm.runInNewContext(coreSource, {
    window: privWin,
    document: { readyState: 'loading', addEventListener() {}, getElementById: () => null, createElement: () => ({}) },
    Intl, Date,
  });
  await privWin.OpsCore.refreshPublicKnowledge();
  assert.equal(fetchCalls, 0);

  // 2) Public snapshot (no source_root) on HTTPS: fetches fresh JSON & triggers re-render
  const freshPayload = {
    available: true,
    projects: { total: 1, items: [{ name: '刷新后的项目', relative: '03-Projects/新项', updated: '2026-11-18T01:00+08:00', file_count: 3 }] },
  };
  const nodes = {
    'knowledge-projects': { hidden: true, children: [], appendChild(c) { this.children.push(c); } },
    'knowledge-projects-list': { textContent: '', children: [], appendChild(c) { this.children.push(c); } },
    'knowledge-projects-meta': { textContent: '' },
  };
  const pubWin = {
    __OPS_KNOWLEDGE__: { available: true, projects: { total: 0, items: [] } },
    location: { protocol: 'https:' },
    addEventListener(type, fn) { listeners.set(type, [...(listeners.get(type) || []), fn]); },
    dispatchEvent(evt) {
      dispatched.push(evt);
      for (const fn of listeners.get(evt.type) || []) fn(evt);
    },
    fetch: async (url, opts) => {
      fetchCalls += 1;
      assert.match(url, /^data\/public\/knowledge\.json\?t=\d+$/);
      assert.equal(opts.cache, 'no-store');
      return { ok: true, json: async () => freshPayload };
    },
  };
  class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } }
  const doc = {
    readyState: 'loading',
    addEventListener() {},
    getElementById: id => nodes[id] || null,
    createElement: tag => ({ tag, className: '', textContent: '', title: '', children: [], appendChild(c) { this.children.push(c); return c; } }),
  };
  vm.runInNewContext(coreSource, { window: pubWin, document: doc, Intl, Date, CustomEvent });
  vm.runInNewContext(projectsSource, { window: pubWin, document: doc });
  assert.equal(nodes['knowledge-projects'].hidden, true);

  await pubWin.OpsCore.refreshPublicKnowledge();
  assert.equal(fetchCalls, 1);
  assert.equal(dispatched.length, 1);
  assert.equal(nodes['knowledge-projects'].hidden, false);
  assert.equal(nodes['knowledge-projects-list'].children.length, 1);
  assert.equal(nodes['knowledge-projects-meta'].textContent, '共 1 项');
});

test('OpsCompute renders collab_mode safely and resolves local vs sanitized SSH commands', () => {
  const els = {};
  for (const id of [
    'mac-ip-text', 'mac-battery-text', 'mac-load-text',
    'win-ip-text', 'win-latency-badge', 'win-ssh-badge', 'win-smb-badge', 'win-ssh-cmd-text',
    'jetson-ip-text', 'jetson-latency-badge', 'jetson-ssh-badge', 'jetson-ssh-cmd-text',
    'workflows-table-body', 'toast',
  ]) {
    els[id] = {
      innerText: '', innerHTML: '', children: [],
      appendChild(c) { this.children.push(c); },
      classList: { add() {}, remove() {} },
    };
  }
  const window = { location: { protocol: 'file:' } };
  const document = {
    readyState: 'loading',
    addEventListener() {},
    getElementById: id => els[id] || null,
    querySelectorAll: () => [],
    createElement: () => ({ className: '', innerHTML: '' }),
  };
  const ctx = { window, document, Intl, Date, setTimeout: () => 0 };
  vm.runInNewContext(coreSource + '\n' + computeSource, ctx);

  // Sanitized public snapshot
  window.OpsCompute.render({
    topology: { windows: { ip: '100.98.x.x', status: 'Online' }, jetson: { ip: '已隐藏', status: 'LAN Standby' } },
    device_allocation: {
      project_workflows: [{ project: '论文', mac_role: '写作', win_role: '训练', collab_mode: 'Git 同步 <安全>' }],
    },
  });
  assert.match(els['win-ssh-cmd-text'].innerText, /地址已隐藏/);
  assert.equal(els['workflows-table-body'].children.length, 1);
  assert.match(els['workflows-table-body'].children[0].innerHTML, /Git 同步 &lt;安全&gt;/);

  // Local private snapshot with real ssh_cmd
  window.OpsCompute.render({
    topology: { jetson: { ip: '10.0.0.8', ssh_cmd: 'ssh jetson@10.0.0.8', status: 'Online' } },
    device_allocation: {},
  });
  assert.equal(els['jetson-ssh-cmd-text'].innerText, 'ssh jetson@10.0.0.8');
});

test('Career pipeline pins active stages to the top and filters all six stages', () => {
  const cards = [];
  const filterButtons = ['all', 'interview', 'test', 'offer', 'screening', 'applied'].map(f => ({
    attrs: { 'data-filter': f },
    onclick: null,
    classList: { add() {}, remove() {} },
    getAttribute(k) { return this.attrs[k]; },
  }));
  const listEl = {
    _html: '',
    set innerHTML(v) { this._html = v; cards.length = 0; },
    get innerHTML() { return this._html; },
    appendChild(c) { cards.push(c); },
  };
  const status = {
    meta: { last_synced: '2026-11-18 01:00:00' },
    projects_and_exams: [],
    career_summary: {
      stats: { total: 4, offer: 1, screening: 1, applied: 1, interviewing: 1 },
      records: [
        { company: '丙公司', position: '后端', status: '已投递', apply_date: '2026-11-01' },
        { company: '乙公司', position: '算法', status: '已录用', apply_date: '2026-11-10' },
        { company: '甲公司', position: 'Agent', status: '一面面试中', apply_date: '2026-11-15' },
        { company: '丁公司', position: '全栈', status: '初筛', apply_date: '2026-11-12' },
      ],
    },
  };
  const context = {
    window: { __OPS_STATUS__: status, __OPS_MEMORY__: {}, location: { protocol: 'file:', hostname: '' }, dispatchEvent() {} },
    document: {
      readyState: 'loading',
      addEventListener() {},
      getElementById: id => (id === 'career-records-list' ? listEl : null),
      querySelectorAll: sel => (sel === '.career-filter-btn' ? filterButtons : []),
      createElement: () => ({ className: '', innerHTML: '', textContent: '' }),
    },
    console: { log() {}, warn() {}, error() {} },
    Date, Intl, URL, AbortController, setTimeout, clearTimeout,
    CustomEvent: class { constructor(t, o = {}) { this.type = t; this.detail = o.detail; } },
  };
  vm.createContext(context);
  vm.runInContext(appSource, context);

  context.renderCareerPipeline();
  assert.equal(cards.length, 4);
  assert.match(cards[0].innerHTML, /甲公司/); // 面试中置顶第 1
  assert.match(cards[1].innerHTML, /乙公司/); // 已录用第 2
  assert.match(cards[2].innerHTML, /丁公司/); // 初筛第 3
  assert.match(cards[3].innerHTML, /丙公司/); // 已投递第 4

  // Switch to 'test' filter (0 matches -> honest empty state card)
  filterButtons.find(b => b.getAttribute('data-filter') === 'test').onclick();
  assert.equal(cards.length, 1);
  assert.match(cards[0].textContent, /当前筛选条件下暂无记录/);

  // Switch to 'offer' filter (1 match -> 乙公司)
  filterButtons.find(b => b.getAttribute('data-filter') === 'offer').onclick();
  assert.equal(cards.length, 1);
  assert.match(cards[0].innerHTML, /乙公司/);
});
