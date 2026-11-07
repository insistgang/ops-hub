const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

// Execute the production script without booting a browser or contacting a server.
// All records, responses and DOM fields below are synthetic test fixtures.
const appSource = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

function statusFixture(lastSynced = '2026-11-07 08:00:00') {
  return { meta: { last_synced: lastSynced }, projects_and_exams: [] };
}

function rulesFixture(title = 'Synthetic public rules') {
  return { title, four_checks_definition: [], scene_contracts: [], focus_principles: [] };
}

function response(data, ok = true) {
  return { ok, json: async () => data };
}

function createApp({ status = null, rules = rulesFixture(), hostname = 'example.test', protocol = 'https:', now = null } = {}) {
  const ids = [
    'sync-age-text', 'data-load-notice', 'metric-career-total', 'metric-career-sub',
    'metric-exam-days', 'metric-exam-unit', 'metric-exam-sub', 'metric-compute-lat',
    'metric-compute-sub', 'win-status-text', 'jetson-status-text', 'career-records-list',
    'projects-radar-list', 'win-status-pill', 'win-status-dot', 'jetson-status-pill', 'jetson-status-dot'
  ];
  const elements = new Map(ids.map(id => [id, {
    innerText: 'initial placeholder', textContent: '', innerHTML: '', title: '', dataset: {},
    appendChild() {}
  }]));
  const events = [];
  const errors = [];
  const window = {
    __OPS_STATUS__: status,
    __OPS_MEMORY__: rules,
    location: { hostname, protocol },
    dispatchEvent: event => events.push(event)
  };
  const context = {
    window,
    document: {
      readyState: 'loading',
      addEventListener() {},
      getElementById: id => elements.get(id) || null,
      querySelectorAll: () => [],
      createElement: () => ({ innerHTML: '', className: '' })
    },
    console: { log() {}, warn() {}, error: error => errors.push(error) },
    Date: now ? class extends Date { constructor(...args) { super(...(args.length ? args : [now])); } } : Date,
    Intl, URL, AbortController, setTimeout, clearTimeout,
    CustomEvent: class {
      constructor(type, options) { this.type = type; this.detail = options.detail; }
    },
    fetch: async () => { throw new Error('Synthetic offline response'); }
  };
  vm.createContext(context);
  vm.runInContext(appSource, context, { filename: 'js/app.js' });
  return {
    context, elements, events, errors,
    read: expression => vm.runInContext(expression, context)
  };
}

test('snapshot age interprets collector timestamps on the Shanghai clock', () => {
  const app = createApp({ status: statusFixture('2026-11-06 21:00:08') });
  const info = app.context.getSnapshotInfo(new Date('2026-11-06T13:00:38Z'));
  assert.equal(info.ageSeconds, 30);
  assert.equal(info.state, 'snapshot');
  assert.match(info.label, /快照/);
});

test('device status updates keep header pills hidden at narrow widths', () => {
  for (const status of ['Online', 'Offline']) {
    const app = createApp({ status: { ...statusFixture(), topology: { windows: { status }, jetson: { status } } } });
    app.context.renderHeader();
    assert.match(app.elements.get('win-status-pill').className, /\bhidden md:flex\b/);
    assert.match(app.elements.get('jetson-status-pill').className, /\bhidden lg:flex\b/);
  }
});

test('teacher exam is absent from the dashboard while its archived source remains intact', () => {
  const exam = { id: 'e-jiaoxi', type: 'exam', phase: 'result_recorded', target_date: '2026-09-12', next_action: '查分已办结，后续按需安排，不做日常追踪' };
  const original = JSON.stringify(exam);
  const app = createApp({ status: { ...statusFixture(), projects_and_exams: [exam] } });
  const cards = [];
  app.elements.get('projects-radar-list').appendChild = card => cards.push(card);
  assert.equal(app.context.getExamState(exam).days_left, null);
  app.context.renderHeroMetrics();
  app.context.renderProjectsRadar();
  assert.equal(app.elements.get('metric-exam-days').innerText, '待核对');
  assert.equal(app.elements.get('metric-exam-unit').innerText, '六级考期未确认');
  assert.equal(cards.length, 0);
  assert.equal(JSON.stringify(exam), original);
});

test('hero countdown follows CET-6 and labels upcoming, current, elapsed and invalid dates honestly', () => {
  for (const [target, label, unit] of [
    ['2026-12-12', '35', '天后考试'],
    ['2026-11-07', '今天', '六级考试'],
    ['2026-11-06', '已结束', '登记考期已过'],
    ['2026-02-31', '待核对', '六级考期未确认'],
  ]) {
    const app = createApp({ now: '2026-11-07T00:00:00Z', status: { ...statusFixture(), projects_and_exams: [
      { id: 'e-jiaoxi', type: 'exam', phase: 'result_recorded', target_date: '2026-09-12' },
      { id: 'e-cet6', type: 'exam', target_date: target },
    ] } });
    app.context.renderHeroMetrics();
    assert.equal(String(app.elements.get('metric-exam-days').innerText), label, target);
    assert.equal(app.elements.get('metric-exam-unit').innerText, unit, target);
    assert.doesNotMatch(app.elements.get('metric-exam-sub').innerText, /教资/);
  }
});

test('host navigation does not bind or hide native internal tabs even when they have data-tab', () => {
  const app = createApp();
  let internalListeners = 0;
  let activate = 0;
  let outerClick;
  const classes = () => { const values = new Set(); return { add: (...keys) => keys.forEach(key => values.add(key)), remove: (...keys) => keys.forEach(key => values.delete(key)), contains: key => values.has(key) }; };
  const outer = { classList: classes(), getAttribute: () => 'tab-vitaflow', addEventListener: (_, fn) => { outerClick = fn; } };
  const internal = { classList: classes(), getAttribute: () => 'overview', addEventListener: () => { internalListeners += 1; } };
  const outerContent = { classList: classes() };
  const internalContent = { classList: classes() };
  app.context.document.querySelectorAll = selector => selector === '[data-ops-tab][data-tab]' ? [outer]
    : selector.includes('tab-btn') ? [outer, internal]
    : selector === '[data-ops-workspace]' ? [outerContent] : [outerContent, internalContent];
  app.context.document.getElementById = id => id === 'tab-vitaflow' ? outerContent : null;
  app.context.window.OpsVitaFlow = { activate: () => { activate += 1; } };
  app.context.initTabs();
  assert.equal(internalListeners, 0);
  outerClick();
  assert.equal(internalContent.classList.contains('hidden'), false);
  assert.equal(outerContent.classList.contains('hidden'), false);
  assert.equal(activate, 1);
});

test('invalid, missing and future timestamps cannot be reported as fresh', () => {
  for (const invalid of ['invalid', '2026-02-31 08:00:00', 12345]) {
    const app = createApp({ status: statusFixture(invalid) });
    assert.equal(app.context.getSnapshotInfo().state, 'invalid');
    app.context.updateSyncAge();
    assert.equal(app.elements.get('sync-age-text').innerText, '快照时间无效');
  }
  const missing = createApp({ status: { meta: {}, projects_and_exams: [] } });
  assert.equal(missing.context.getSnapshotInfo().state, 'unknown');
  const future = createApp({ status: statusFixture('2026-11-08T08:00:00+08:00') });
  assert.equal(future.context.getSnapshotInfo(new Date('2026-11-07T00:00:00Z')).state, 'future');
});

test('snapshots become stale after 24 hours and keep their original age', () => {
  const app = createApp({ status: statusFixture('2026-11-06T08:00:00+08:00') });
  assert.equal(app.context.getSnapshotInfo(new Date('2026-11-06T23:59:59Z')).state, 'snapshot');
  const info = app.context.getSnapshotInfo(new Date('2026-11-07T00:00:00Z'));
  assert.equal(info.state, 'stale');
  assert.equal(info.ageSeconds, 86400);
  assert.match(info.label, /需同步/);
});

test('exam countdown rolls over at Shanghai midnight without mutating its source', () => {
  const app = createApp();
  const exam = { target_date: '2026-12-12', days_left: 36, next_action: '考前 36 天 · 听力练习' };
  const before = app.context.getExamState(exam, new Date('2026-11-06T15:59:59Z'));
  const after = app.context.getExamState(exam, new Date('2026-11-06T16:00:00Z'));
  assert.equal(before.days_left, 36);
  assert.equal(after.days_left, 35);
  assert.equal(after.next_action, '考前 35 天 · 听力练习');
  assert.equal(exam.days_left, 36);
  assert.equal(exam.next_action, '考前 36 天 · 听力练习');
});

test('exam day, elapsed dates and invalid dates have honest labels', () => {
  const app = createApp();
  const exam = { target_date: '2026-12-12', next_action: '复习' };
  const today = app.context.getExamState(exam, new Date('2026-12-12T00:00:00Z'));
  assert.equal(today.days_left, 0);
  assert.match(today.next_action, /^今日考试/);
  const past = app.context.getExamState(exam, new Date('2026-12-13T00:00:00Z'));
  assert.equal(past.days_left, -1);
  assert.match(past.next_action, /日期已过/);
  assert.equal(app.context.getExamState({ ...exam, target_date: '2026-02-31' }).days_left, null);
  const waiting = app.context.getExamState({ ...exam, phase: 'awaiting_result', next_action: '等待记录' });
  assert.equal(waiting.days_left, null);
  assert.equal(waiting.next_action, '等待记录');
});

test('hosted pages request public status only and reuse their embedded public rules', async () => {
  const rules = rulesFixture();
  const app = createApp({ rules });
  const calls = [];
  const snapshot = statusFixture();
  app.context.fetch = async (url, options) => {
    calls.push({ url: url.split('?')[0], options });
    return response(snapshot);
  };
  await app.context.loadData();
  assert.deepEqual(calls.map(call => call.url), ['data/public/status.json']);
  assert.equal(calls[0].options.cache, 'no-store');
  assert.ok(calls[0].options.signal instanceof AbortSignal);
  assert.equal(app.read('globalStatus'), snapshot);
  assert.equal(app.read('memoryRules'), rules);
  assert.equal(app.read('snapshotSource'), 'public');
  assert.equal(app.read('snapshotLoadError'), '');
  assert.equal(app.errors.length, 0);
});

test('missing embedded public rules report a real error without probing private paths', async () => {
  const app = createApp({ rules: null });
  const calls = [];
  app.context.fetch = async url => { calls.push(url.split('?')[0]); return response(statusFixture()); };
  await app.context.loadData();
  assert.deepEqual(calls, ['data/public/status.json']);
  assert.match(app.read('snapshotLoadError'), /秩序规则读取失败/);
});

test('loopback previews prefer local status and private rules', async () => {
  const app = createApp({ hostname: '127.0.0.1' });
  const snapshot = statusFixture();
  const privateRules = rulesFixture('Synthetic private rules');
  const calls = [];
  app.context.fetch = async url => {
    const pathname = url.split('?')[0];
    calls.push(pathname);
    return response(pathname === 'data/memory_rules.json' ? privateRules : snapshot);
  };
  await app.context.loadData();
  assert.deepEqual(calls.sort(), ['data/memory_rules.json', 'data/status.json']);
  assert.equal(app.read('snapshotSource'), 'local');
  assert.equal(app.read('memoryRules'), privateRules);
  assert.equal(app.read('snapshotLoadError'), '');
});

test('local missing or malformed status falls back to the public snapshot and embedded rules', async () => {
  for (const localResult of [response(null, false), response({ incomplete: true })]) {
    const rules = rulesFixture();
    const app = createApp({ hostname: 'localhost', rules });
    const snapshot = statusFixture();
    const calls = [];
    app.context.fetch = async url => {
      const pathname = url.split('?')[0];
      calls.push(pathname);
      if (pathname === 'data/status.json') return localResult;
      if (pathname === 'data/public/status.json') return response(snapshot);
      return response(null, false);
    };
    await app.context.loadData();
    assert.equal(app.read('globalStatus'), snapshot);
    assert.equal(app.read('snapshotSource'), 'public');
    assert.equal(app.read('memoryRules'), rules);
    assert.equal(app.read('snapshotLoadError'), '');
    assert.ok(calls.includes('data/status.json'));
    assert.ok(calls.includes('data/public/status.json'));
    assert.ok(!calls.includes('data/public/memory_rules.json'));
  }
});

test('HTTP, invalid JSON and network failures preserve the last good status', async () => {
  const failures = [
    async () => response(null, false),
    async () => ({ ok: true, json: async () => { throw new SyntaxError('Synthetic invalid JSON'); } }),
    async () => { throw new Error('Synthetic network failure'); }
  ];
  for (const fetch of failures) {
    const snapshot = statusFixture();
    const app = createApp({ status: snapshot });
    app.context.fetch = fetch;
    await app.context.loadData();
    assert.equal(app.read('globalStatus'), snapshot);
    assert.match(app.read('snapshotLoadError'), /保留上次可用数据/);
    assert.match(app.elements.get('data-load-notice').textContent, /读取失败/);
  }
});

test('failed rereads keep previously loaded private rules instead of replacing them with public rules', async () => {
  const app = createApp({ hostname: '127.0.0.1' });
  const privateRules = rulesFixture('Synthetic private rules');
  app.context.fetch = async url => response(url.includes('memory_rules') ? privateRules : statusFixture());
  await app.context.loadData();
  app.context.fetch = async url => url.includes('memory_rules') ? response(null, false) : response(statusFixture());
  await app.context.loadData();
  assert.equal(app.read('memoryRules'), privateRules);
  assert.match(app.read('snapshotLoadError'), /沿用上次载入的规则/);
  assert.equal(app.errors.length, 0);
});

test('file mode uses embedded snapshots without any network request', async () => {
  const snapshot = statusFixture();
  const app = createApp({ status: snapshot, protocol: 'file:' });
  let calls = 0;
  app.context.fetch = async () => { calls += 1; throw new Error('Unexpected request'); };
  await app.context.loadData();
  assert.equal(calls, 0);
  assert.equal(app.read('globalStatus'), snapshot);
  assert.match(app.read('snapshotLoadError'), /文件模式/);
});

test('no available status clears static exam and device claims and emits an empty update', async () => {
  const app = createApp({ rules: null });
  await app.context.loadData();
  assert.equal(app.elements.get('sync-age-text').innerText, '暂无数据');
  assert.equal(app.elements.get('metric-exam-days').innerText, '—');
  assert.equal(app.elements.get('metric-exam-unit').innerText, '考期未载入');
  assert.equal(app.elements.get('metric-career-sub').innerText, '暂无投递快照');
  assert.equal(app.elements.get('win-status-text').innerText, 'Win 4070S: 尚未探测');
  assert.match(app.elements.get('data-load-notice').textContent, /暂无可用数据/);
  assert.match(app.elements.get('projects-radar-list').innerText, /暂无可用项目快照/);
  const update = app.events.find(event => event.type === 'ops:data-updated');
  assert.ok(update);
  assert.equal(update.detail.status, null);
});
