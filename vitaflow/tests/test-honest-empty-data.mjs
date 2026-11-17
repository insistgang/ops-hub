import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

process.env.TZ = 'Asia/Taipei';

class FixedDate extends Date {
  constructor(...args) {
    if (args.length === 0) super(2026, 6, 1, 12, 0, 0, 0);
    else super(...args);
  }
  static now() { return new Date(2026, 6, 1, 12, 0, 0, 0).getTime(); }
}

class MemoryStorage {
  constructor(values = {}) { this.values = { ...values }; }
  getItem(key) { return Object.prototype.hasOwnProperty.call(this.values, key) ? this.values[key] : null; }
  setItem(key, value) { this.values[key] = String(value); }
}

const dateUtils = fs.readFileSync('src/modules/date-utils.js', 'utf8');
const initialData = fs.readFileSync('src/modules/initial-data.js', 'utf8');
const appSource = fs.readFileSync('src/app.js', 'utf8');

function initWith(storage) {
  const elements = new Map();
  const context = vm.createContext({
    Date: FixedDate,
    Math: { ...Math, random: () => { throw new Error('initialization must not generate random records'); } },
    localStorage: storage,
    console: { log() {}, warn() {} },
    document: {
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, { value: '' });
        return elements.get(id);
      },
    },
    updateMainScores() {},
  });
  vm.runInContext(dateUtils, context);
  vm.runInContext(initialData, context);
  vm.runInContext('initData()', context);
  return { context, elements };
}

function extract(startMarker, endMarker) {
  const start = appSource.indexOf(startMarker);
  const end = appSource.indexOf(endMarker, start);
  assert.notEqual(start, -1, `missing source marker: ${startMarker}`);
  assert.notEqual(end, -1, `missing source marker: ${endMarker}`);
  return appSource.slice(start, end);
}

const emptyStorage = new MemoryStorage();
const empty = initWith(emptyStorage);
const emptyAccounts = JSON.parse(emptyStorage.getItem('vitaflow_accounts'));
assert.deepEqual(emptyAccounts, {
  physical: { score: null, history: [] },
  emotional: { score: null, history: [] },
  focus: { score: null, history: [] },
  meaning: { score: null, history: [] },
}, 'first use should create four genuinely empty accounts');
assert.equal(emptyStorage.getItem('vitaflow_todos'), '[]', 'first use should not invent todos');
assert.equal(emptyStorage.getItem('vitaflow_happiness'), '{}', 'first use should not invent happiness scores');
assert.equal(empty.elements.get('physicalDateInput')?.value, '2026-07-01');

const originalRecords = {
  vitaflow_accounts: '{"physical":{"score":0,"history":[{"date":"2026-06-30","score":0}]},"emotional":{"score":73,"history":[]},"focus":{"score":null,"history":[]},"meaning":{"score":91,"history":[]}}',
  vitaflow_todos: '[{"id":3,"text":"existing task","completed":false}]',
  vitaflow_happiness: '{"2026-06-30":0}',
};
const existingStorage = new MemoryStorage(originalRecords);
initWith(existingStorage);
for (const [key, value] of Object.entries(originalRecords)) {
  assert.equal(existingStorage.getItem(key), value, `${key} must remain byte-for-byte unchanged`);
}

const scoreElements = new Map();
const scoreContext = vm.createContext({
  accountsData: {
    physical: { score: null, history: [] },
    emotional: { score: null, history: [] },
    focus: { score: null, history: [] },
    meaning: { score: null, history: [] },
  },
  localStorage: new MemoryStorage(),
  document: {
    getElementById(id) {
      if (!scoreElements.has(id)) scoreElements.set(id, { textContent: '', style: {}, dataset: {} });
      return scoreElements.get(id);
    },
    querySelector() { return { style: {} }; },
  },
  updateProgressRing() {},
});
vm.runInContext(extract('        function updateMainScores()', '        function renderAllTrendCharts()'), scoreContext);
vm.runInContext('updateMainScores()', scoreContext);
for (const account of ['physical', 'emotional', 'focus', 'meaning']) {
  assert.equal(scoreElements.get(`${account}Score`)?.textContent, '—', `${account} should be marked unrecorded`);
  assert.equal(scoreElements.get(`${account}Progress`)?.textContent, '—', `${account} progress should be marked unrecorded`);
}
assert.equal(scoreElements.get('avgScore')?.textContent, '—', 'an empty average should not appear as zero');
assert.equal(scoreElements.get('avgProgress')?.textContent, '—');

scoreContext.accountsData = {
  physical: { score: 0, history: [] },
  emotional: { score: null, history: [] },
  focus: { score: 90, history: [] },
  meaning: { score: null, history: [] },
};
vm.runInContext('updateMainScores()', scoreContext);
assert.equal(scoreElements.get('physicalScore')?.textContent, 0, 'a recorded zero must remain visible');
assert.equal(scoreElements.get('avgScore')?.textContent, 45, 'average only recorded numeric scores');

const rangeContext = vm.createContext({
  Date: FixedDate,
  formatLocalDate: date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
  inlineHandlerArg: value => JSON.stringify(value),
  accountsData: {
    physical: { history: [
      { date: '2026-07-01', score: 0 },
      { date: '2026-07-03', score: 42 },
    ] },
  },
});
vm.runInContext(extract('        function getAccountDataForRange(', '        function renderTrendChart('), rangeContext);
assert.deepEqual(
  JSON.parse(vm.runInContext("JSON.stringify(getAccountDataForRange('physical', new Date(2026, 6, 1), new Date(2026, 6, 3)))", rangeContext)),
  [0, null, 42],
  'range charts should preserve recorded zero and use null for missing dates'
);

const compareConfigs = [];
const compareEmptyState = { style: {} };
const compareContext = vm.createContext({
  accountsData: {
    physical: { score: 0 }, emotional: { score: null }, focus: { score: 91 }, meaning: { score: null },
  },
  compareChart: null,
  document: {
    getElementById(id) {
      return id === 'compareChart' ? { getContext: () => ({}) } : compareEmptyState;
    },
  },
  createVitaFlowChart(_canvas, config) { compareConfigs.push(config); return { destroy() {} }; },
});
vm.runInContext(extract('        function renderCompareChart()', '        function recordStreak()'), compareContext);
vm.runInContext('renderCompareChart()', compareContext);
assert.deepEqual(JSON.parse(JSON.stringify(compareConfigs[0].data.labels)), ['体能', '思维']);
assert.deepEqual(JSON.parse(JSON.stringify(compareConfigs[0].data.datasets[0].data)), [0, 91], 'comparison chart should omit missing accounts but preserve zero');
assert.equal(compareEmptyState.style.display, 'none');
compareContext.accountsData = {
  physical: { score: null }, emotional: { score: null }, focus: { score: null }, meaning: { score: null },
};
vm.runInContext('renderCompareChart()', compareContext);
assert.deepEqual(JSON.parse(JSON.stringify(compareConfigs[1].data.labels)), []);
assert.deepEqual(JSON.parse(JSON.stringify(compareConfigs[1].data.datasets[0].data)), []);
assert.equal(compareEmptyState.style.display, 'block', 'an empty comparison should show a pending message');

const detailElements = new Map();
const scoreRecordStorage = new MemoryStorage();
const detailAlerts = [];
for (const id of ['mainPage', 'physicalPage', 'physicalScoreInput', 'physicalPreview', 'physicalDateInput', 'physicalProgress', 'physicalHistoryList']) {
  detailElements.set(id, {
    value: id === 'physicalDateInput' ? '2026-07-01' : '',
    textContent: '', innerHTML: '', style: {}, dataset: {},
    classList: { add() {}, remove() {} },
  });
}
const detailContext = vm.createContext({
  accountsData: {
    physical: { score: null, history: [] }, emotional: { score: null, history: [] },
    focus: { score: null, history: [] }, meaning: { score: null, history: [] },
  },
  accountNames: { physical: '体能' },
  accountColors: { physical: '#e88a4c' },
  document: {
    getElementById: id => detailElements.get(id) || { value: '', textContent: '', innerHTML: '', dataset: {}, style: {} },
    querySelectorAll: () => [],
    querySelector: () => ({ style: {} }),
  },
  localStorage: scoreRecordStorage,
  alert: message => detailAlerts.push(message),
  renderAccountChart() {}, renderHistory() {}, updateMainScores() {},
  updateProgressRing() {},
});
vm.runInContext(extract('        function openDetail(', '        function goBack('), detailContext);
vm.runInContext(extract('        function updateScorePreview(', '        function updateProgressRing('), detailContext);
vm.runInContext("openDetail('physical')", detailContext);
assert.equal(detailElements.get('physicalScoreInput').value, 50, 'an unrecorded range starts at a neutral selection point');
assert.equal(detailElements.get('physicalScoreInput').dataset.scoreSelected, 'false');
assert.equal(detailElements.get('physicalPreview').textContent, '待记录');
vm.runInContext(extract('        function saveRecord(', '        function updateProgressRing('), detailContext);
vm.runInContext("saveRecord('physical')", detailContext);
assert.equal(scoreRecordStorage.getItem('vitaflow_accounts'), null, 'an untouched range must not create a score');
detailElements.get('physicalScoreInput').value = '0';
vm.runInContext("updateScorePreview('physical', '0')", detailContext);
vm.runInContext("saveRecord('physical')", detailContext);
assert.equal(detailContext.accountsData.physical.score, 0, 'an explicitly selected zero is a real score');
assert.deepEqual(JSON.parse(scoreRecordStorage.getItem('vitaflow_accounts')).physical.history, [{ date: '2026-07-01', score: 0 }]);

const emotionBoard = { innerHTML: '' };
const emotionElements = new Map([
  ['emotionBoard', emotionBoard], ['emotionYear', { value: '2026' }], ['emotionMonth', { value: '6' }],
]);
const emotionContext = vm.createContext({
  Date: FixedDate,
  formatLocalDate: date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
  inlineHandlerArg: value => JSON.stringify(value),
  happyEmojis: { 1: '😣', 3: '😕', 5: '😐', 7: '😊', 9: '😄', 10: '🤩' },
  localStorage: new MemoryStorage({ vitaflow_happiness: '{}' }),
  document: { getElementById: id => emotionElements.get(id) },
  renderDefaultEmotionChart() {},
});
vm.runInContext(extract('        function renderEmotionBoard()', '        function showEmojiSelector('), emotionContext);
vm.runInContext('renderEmotionBoard()', emotionContext);
assert.match(emotionBoard.innerHTML, />—<\/div>/, 'an unrecorded emotion day should show a dash');
assert.ok(!emotionBoard.innerHTML.includes('😐'), 'an unrecorded emotion day should not appear neutral by default');

let emotionChartData;
emotionContext.renderEmotionChart = (_labels, data) => { emotionChartData = JSON.parse(JSON.stringify(data)); };
vm.runInContext(extract('        function renderDefaultEmotionChart()', '        function renderEmotionChartWithRange('), emotionContext);
vm.runInContext('renderDefaultEmotionChart()', emotionContext);
assert.deepEqual(emotionChartData, [null, null, null, null, null, null, null]);
emotionContext.localStorage = new MemoryStorage({ vitaflow_happiness: '{"2026-07-01":0}' });
vm.runInContext('renderDefaultEmotionChart()', emotionContext);
assert.deepEqual(emotionChartData, [null, null, null, null, null, null, 0], 'a recorded zero must not be replaced by a fallback score');

const quizValues = new Map();
for (const id of ['meaningQ1', 'meaningQ2', 'meaningQ3']) quizValues.set(id, { value: '5', dataset: { selected: 'false' } });
for (const id of ['meaningQ1Value', 'meaningQ2Value', 'meaningQ3Value', 'meaningTotalScore', 'meaningInterpretation']) {
  quizValues.set(id, { textContent: '' });
}
const quizStorage = new MemoryStorage();
const quizAlerts = [];
const quizContext = vm.createContext({
  Date: FixedDate,
  document: { getElementById: id => quizValues.get(id) },
  localStorage: quizStorage,
  alert: message => quizAlerts.push(message),
  renderMeaningQuizHistory() {}, renderMeaningQuizChart() {},
});
vm.runInContext(extract('        function updateMeaningScore(', '        function renderMeaningQuizHistory('), quizContext);
vm.runInContext('saveMeaningQuiz()', quizContext);
assert.equal(quizStorage.getItem('vitaflow_meaning_quiz'), null, 'an unselected quiz must not create an assessment');
for (const index of [1, 2, 3]) vm.runInContext(`updateMeaningScore(document.getElementById('meaningQ${index}'))`, quizContext);
assert.equal(quizValues.get('meaningTotalScore').textContent, 15);
assert.equal(quizValues.get('meaningInterpretation').textContent, '⚡ 目标感一般');
vm.runInContext('saveMeaningQuiz()', quizContext);
assert.equal(JSON.parse(quizStorage.getItem('vitaflow_meaning_quiz')).length, 1, 'selected answers should retain assessment saving');

const template = fs.readFileSync('src/schedule-template.html', 'utf8');
for (const seeded of [
  'id="physicalScore">85', 'id="emotionalScore">78', 'id="focusScore">92', 'id="meaningScore">88',
  'id="avgScore">86', '福建小城走到上海', '你的思维账户表现最佳', '目标感一般',
]) {
  assert.ok(!template.includes(seeded), `template must not ship synthetic personal state: ${seeded}`);
}
for (const account of ['physical', 'emotional', 'focus', 'meaning']) {
  assert.match(template, new RegExp(`id="${account}Score">—`), `${account} template should start unrecorded`);
}
assert.match(template, /待记录账户评分后展示趋势/);
assert.match(template, /待录入账户评分后展示对比/);

console.log('honest empty data tests passed');
