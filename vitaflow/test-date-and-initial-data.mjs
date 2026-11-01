import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { buildHtml } from './build-html.mjs';

process.env.TZ = 'Asia/Taipei';

class FixedDate extends Date {
  constructor(...args) {
    if (args.length === 0) {
      super(2026, 6, 1, 0, 30, 0, 0);
      return;
    }
    super(...args);
  }

  static now() {
    return new Date(2026, 6, 1, 0, 30, 0, 0).getTime();
  }
}

const html = buildHtml();
const appStart = html.indexOf('// 用户输入插入 innerHTML 前必须经过转义');
const appEnd = html.indexOf('        function renderCalendar()', appStart);

assert.notEqual(appStart, -1, 'app script start should exist');
assert.notEqual(appEnd, -1, 'calendar function should exist');

const dateContext = vm.createContext({ Date: FixedDate, console });
vm.runInContext(html.slice(appStart, appEnd), dateContext);

assert.equal(
  vm.runInContext('formatLocalDate(new Date(2026, 6, 1))', dateContext),
  '2026-07-01',
  'local calendar dates must not shift to the previous UTC day'
);
assert.equal(vm.runInContext('selectedDate', dateContext), '2026-07-01', 'selected date should follow the local day');
assert.equal(vm.runInContext('currentYear', dateContext), 2026, 'calendar year should follow the local clock');
assert.equal(vm.runInContext('currentMonth', dateContext), 6, 'calendar month should follow the local clock');

class FakeStorage {
  constructor(initial) {
    this.store = { ...initial };
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    return Object.keys(this.store)[index] || null;
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

const accounts = {
  physical: { score: 85, history: [] },
  emotional: { score: 78, history: [] },
  focus: { score: 92, history: [] },
  meaning: { score: 88, history: [] },
};
const embeddedData = {
  vitaflow_accounts: JSON.stringify(accounts),
  vitaflow_todos: '[]',
  vitaflow_happiness: '{}',
  vitaflow_streak: '0',
  vitaflow_completed: '0',
  vitaflow_goal: '',
};
const storage = new FakeStorage({
  vitaflow_stale_from_older_snapshot: 'must be removed',
});
const inputElements = new Map();

const initialDataContext = vm.createContext({
  Date: FixedDate,
  EMBEDDED_DATA: embeddedData,
  embeddedRestoreSignatureKey: '__test_embedded_signature',
  localSyncHasRemoteData: false,
  localStorage: storage,
  console,
  document: {
    getElementById(id) {
      if (!inputElements.has(id)) inputElements.set(id, { value: '' });
      return inputElements.get(id);
    },
  },
  getEmbeddedDataSignature: () => 'snapshot-signature',
  restoreBackupData(data) {
    const incomingKeys = new Set(Object.keys(data).filter(key => key.startsWith('vitaflow_')));
    for (let i = storage.length - 1; i >= 0; i--) {
      const key = storage.key(i);
      if (key?.startsWith('vitaflow_') && !incomingKeys.has(key)) storage.removeItem(key);
    }
    incomingKeys.forEach(key => storage.setItem(key, data[key]));
  },
  updateMainScores() {},
});

vm.runInContext(fs.readFileSync('src/modules/date-utils.js', 'utf8'), initialDataContext);
vm.runInContext(fs.readFileSync('src/modules/initial-data.js', 'utf8'), initialDataContext);
vm.runInContext('initData()', initialDataContext);

assert.equal(
  storage.getItem('vitaflow_stale_from_older_snapshot'),
  null,
  'restoring an embedded snapshot should remove stale VitaFlow keys'
);
assert.equal(inputElements.get('emotionYear')?.value, '2026', 'emotion board should open on the local year');
assert.equal(inputElements.get('emotionMonth')?.value, '6', 'emotion board should open on the local month');

const remoteStorage = new FakeStorage({
  ...embeddedData,
  vitaflow_todos: '[{"id":99,"text":"newer server data"}]',
});
let protectedRestoreCalls = 0;
const protectedInputElements = new Map();
const protectedInitialDataContext = vm.createContext({
  Date: FixedDate,
  EMBEDDED_DATA: {
    ...embeddedData,
    vitaflow_todos: '[{"id":1,"text":"older embedded data"}]',
  },
  embeddedRestoreSignatureKey: '__test_embedded_signature',
  localSyncHasRemoteData: true,
  localStorage: remoteStorage,
  console,
  document: {
    getElementById(id) {
      if (!protectedInputElements.has(id)) protectedInputElements.set(id, { value: '' });
      return protectedInputElements.get(id);
    },
  },
  getEmbeddedDataSignature: () => 'older-snapshot-signature',
  restoreBackupData() {
    protectedRestoreCalls++;
  },
  showLocalSyncDiagnostic() {},
  updateMainScores() {},
});

vm.runInContext(fs.readFileSync('src/modules/date-utils.js', 'utf8'), protectedInitialDataContext);
vm.runInContext(fs.readFileSync('src/modules/initial-data.js', 'utf8'), protectedInitialDataContext);
vm.runInContext('initData()', protectedInitialDataContext);

assert.equal(protectedRestoreCalls, 0, 'an older embedded snapshot must not overwrite data loaded from the sync server');
assert.equal(
  remoteStorage.getItem('vitaflow_todos'),
  '[{"id":99,"text":"newer server data"}]',
  'sync server data should remain intact when an embedded snapshot is present'
);

const offlineStorage = new FakeStorage({
  ...embeddedData,
  vitaflow_todos: '[{"id":77,"text":"offline edit"}]',
  __vitaflow_sync_pending: '1',
});
let offlineRestoreCalls = 0;
const offlineContext = vm.createContext({
  Date: FixedDate,
  EMBEDDED_DATA: { ...embeddedData, vitaflow_todos: '[{"id":1,"text":"old snapshot"}]' },
  embeddedRestoreSignatureKey: '__test_embedded_signature',
  localSyncHasRemoteData: false,
  hasLocalSyncPending: () => true,
  localStorage: offlineStorage,
  console,
  document: { getElementById: () => ({ value: '' }) },
  getEmbeddedDataSignature: () => 'old-snapshot-signature',
  restoreBackupData() { offlineRestoreCalls++; },
  showLocalSyncDiagnostic() {},
  updateMainScores() {},
});
vm.runInContext(fs.readFileSync('src/modules/date-utils.js', 'utf8'), offlineContext);
vm.runInContext(fs.readFileSync('src/modules/initial-data.js', 'utf8'), offlineContext);
vm.runInContext('initData()', offlineContext);
assert.equal(offlineRestoreCalls, 0, 'an embedded snapshot must not replace pending offline changes');
assert.equal(offlineStorage.getItem('vitaflow_todos'), '[{"id":77,"text":"offline edit"}]');

const calendarChildren = [];
const calendarContext = vm.createContext({
  Date: FixedDate,
  currentYear: 2026, currentMonth: 6, selectedDate: '2026-07-01',
  happyEmojis: { 5: '😐', 7: '😊', 9: '😄' },
  localStorage: new FakeStorage({ vitaflow_happiness: JSON.stringify({ '2026-07-01': 6, '2026-07-02': 8 }) }),
  document: {
    createElement: () => ({ style: {}, innerHTML: '' }),
    getElementById: id => id === 'calendar'
      ? { innerHTML: '', appendChild: child => calendarChildren.push(child) }
      : { textContent: '' },
  },
});
vm.runInContext(fs.readFileSync('src/modules/date-utils.js', 'utf8'), calendarContext);
vm.runInContext(fs.readFileSync('src/modules/calendar-todos.js', 'utf8'), calendarContext);
vm.runInContext('renderCalendar()', calendarContext);
assert.ok(calendarChildren.every(child => !String(child.innerHTML).includes('undefined')),
  'intermediate happiness scores must not render undefined on the calendar');
assert.ok(calendarChildren.some(child => String(child.innerHTML).includes('😐')),
  'intermediate happiness scores should use the same neutral fallback as the emotion board');

const appSource = fs.readFileSync('src/app.js', 'utf8');
const rangeStart = appSource.indexOf('        function renderAllTrendCharts()');
const rangeEnd = appSource.indexOf('        function getAccountDataForRange(', rangeStart);
const rangeInputs = {
  trendStartDate: { value: '2026-06-01' },
  trendEndDate: { value: '2026-06-10' },
};
const rangeCalls = [];
const rangeAlerts = [];
const rangeContext = vm.createContext({
  Date: FixedDate,
  document: { getElementById: id => rangeInputs[id] },
  accountsData: {},
  alert: message => rangeAlerts.push(message),
  getAccountDataForRange(account, start, end) {
    rangeCalls.push({ account, start, end });
    return [];
  },
  renderTrendChart() {},
});
vm.runInContext(fs.readFileSync('src/modules/date-utils.js', 'utf8'), rangeContext);
vm.runInContext(appSource.slice(rangeStart, rangeEnd), rangeContext);
vm.runInContext('renderAllTrendCharts()', rangeContext);
assert.equal(rangeCalls[0].start.getDate(), 1, 'an explicit trend start date must not be shifted back six days');
assert.equal(rangeCalls[0].end.getDate(), 10);

rangeCalls.length = 0;
rangeInputs.trendStartDate.value = '';
vm.runInContext('renderAllTrendCharts()', rangeContext);
assert.equal(rangeAlerts.length, 0, 'a default trend range should be based on the selected end date');
assert.equal(rangeCalls[0].start.getDate(), 4, 'the default trend range should include the seven days ending on the selected end date');
assert.equal(rangeCalls[0].end.getDate(), 10);

const bootSource = fs.readFileSync('src/modules/boot.js', 'utf8');
const chartInitStart = bootSource.indexOf('        function initChartsAfterAssetsReady()');
const chartInitEnd = bootSource.indexOf('        async function bootVitaFlow()', chartInitStart);
const bootContext = vm.createContext({
  Chart() {},
  accountsData: {},
  chartInitCalls: 0,
  initMainChart() {
    bootContext.chartInitCalls++;
  },
  runInitStep(name, fn) {
    fn();
  },
});
vm.runInContext(bootSource.slice(chartInitStart, chartInitEnd), bootContext);
vm.runInContext('initChartsAfterAssetsReady()', bootContext);
assert.equal(bootContext.chartInitCalls, 0, 'charts should wait until account data is initialized');
bootContext.accountsData = {
  physical: { history: [] },
  emotional: { history: [] },
  focus: { history: [] },
  meaning: { history: [] },
};
vm.runInContext('initChartsAfterAssetsReady()', bootContext);
assert.equal(bootContext.chartInitCalls, 1, 'charts should initialize after all account data is available');

console.log('date and initial data tests passed');
