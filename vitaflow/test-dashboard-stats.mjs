import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

process.env.TZ = 'Asia/Taipei';

const context = vm.createContext({ Date, console });
vm.runInContext(fs.readFileSync('src/modules/date-utils.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('src/modules/dashboard-stats.js', 'utf8'), context);

const endDate = new Date(2026, 6, 10, 12, 0, 0);
const todos = [
  { date: '2026-07-08', completed: true },
  { date: '2026-07-10', completed: true },
  { date: '2026-07-10', completed: true },
  { date: '2026-07-10', completed: false },
  { date: '2026-07-03', completed: true },
];
context.todos = todos;
context.endDate = endDate;

assert.deepEqual(
  JSON.parse(vm.runInContext('JSON.stringify(getCompletedTaskTrend(todos, 7, endDate))', context)),
  {
    labels: ['7/4', '7/5', '7/6', '7/7', '7/8', '7/9', '7/10'],
    dates: ['2026-07-04', '2026-07-05', '2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09', '2026-07-10'],
    values: [0, 0, 0, 0, 1, 0, 2],
  },
  'task trend should count only completed todos on each local day'
);

context.accountData = {
  physical: { history: [{ date: '2026-07-09', score: 60 }, { date: '2026-07-10', score: 80 }] },
  emotional: { history: [{ date: '2026-07-09', score: 80 }, { date: '2026-07-10', score: 100 }] },
  focus: { history: [] },
  meaning: { history: [] },
};

assert.deepEqual(
  JSON.parse(vm.runInContext('JSON.stringify(getAverageAccountTrend(accountData, 3, endDate))', context)),
  {
    labels: ['7/8', '7/9', '7/10'],
    dates: ['2026-07-08', '2026-07-09', '2026-07-10'],
    values: [null, 70, 90],
  },
  'average trend should use recorded account history and leave missing days empty'
);

context.streakRecords = [
  { date: '2026-07-06', created: '2026-07-06T01:10:00.000Z' },
  { date: '2026-07-07', created: '2026-07-07T01:20:00.000Z' },
  { date: '2026-07-08', created: '2026-07-08T01:30:00.000Z' },
  { date: '2026-07-10', created: '2026-07-10T01:40:00.000Z' },
  { date: '2026-07-10', created: '2026-07-10T02:00:00.000Z' },
];

assert.deepEqual(
  JSON.parse(vm.runInContext('JSON.stringify(getStreakTrend(streakRecords, 7, endDate))', context)).values,
  [0, 0, 1, 1, 1, 0, 1],
  'streak trend should deduplicate records from the same day'
);
assert.deepEqual(
  JSON.parse(vm.runInContext('JSON.stringify(getStreakSummary(streakRecords, endDate))', context)),
  { current: 1, longest: 3, monthRate: 40, commonTime: '09:00-10:00' },
  'streak summary should be derived from actual records'
);

class FixedRecordDate extends Date {
  constructor(...args) {
    if (args.length === 0) {
      super(2026, 6, 10, 9, 30, 0, 0);
      return;
    }
    super(...args);
  }
}

class MemoryStorage {
  constructor(initial) {
    this.store = { ...initial };
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }
}

context.Date = FixedRecordDate;
context.localStorage = new MemoryStorage({
  vitaflow_streak: '14',
  vitaflow_streak_records: '[]',
});
context.document = {
  getElementById(id) {
    if (id === 'streakDateInput') return { value: '2026-07-10' };
    return { textContent: '' };
  },
};
context.alertMessages = [];
context.alert = message => context.alertMessages.push(message);
context.updateMainScores = () => {};

const appSource = fs.readFileSync('src/app.js', 'utf8');
const scoreElements = new Map();
const scoreContext = vm.createContext({
  accountsData: {
    physical: { score: 88 },
    emotional: { score: 84 },
    focus: { score: 87 },
    meaning: { score: 85 },
  },
  localStorage: new MemoryStorage({ vitaflow_streak: '14', vitaflow_completed: '430' }),
  document: {
    getElementById(id) {
      if (!scoreElements.has(id)) scoreElements.set(id, { textContent: '' });
      return scoreElements.get(id);
    },
  },
  updateProgressRing() {},
});
const updateScoresStart = appSource.indexOf('        function updateMainScores()');
const updateScoresEnd = appSource.indexOf('        function renderAllTrendCharts()', updateScoresStart);
vm.runInContext(appSource.slice(updateScoresStart, updateScoresEnd), scoreContext);
vm.runInContext('updateMainScores()', scoreContext);

assert.equal(scoreElements.get('physicalProgress')?.textContent, 88, 'physical detail score should match the dashboard');
assert.equal(scoreElements.get('emotionalProgress')?.textContent, 84, 'emotional detail score should match the dashboard');
assert.equal(scoreElements.get('focusProgress')?.textContent, 87, 'focus detail score should match the dashboard');
assert.equal(scoreElements.get('meaningProgress')?.textContent, 85, 'meaning detail score should match the dashboard');
assert.equal(scoreElements.get('streakProgress')?.textContent, '14', 'streak detail count should match the dashboard');
assert.equal(scoreElements.get('tasksProgress')?.textContent, '430', 'task detail count should match the dashboard');
assert.equal(scoreElements.get('avgProgress')?.textContent, 86, 'average detail score should match the dashboard');

const recordStreakStart = appSource.indexOf('        function recordStreak()');
const recordStreakEnd = appSource.indexOf('        function generateGoalSuggestions()', recordStreakStart);
vm.runInContext(appSource.slice(recordStreakStart, recordStreakEnd), context);
vm.runInContext(`
  renderStreakHistory = () => {};
  renderStreakChart = () => {};
  renderStreakAnalysis = () => {};
`, context);
vm.runInContext('recordStreak(); recordStreak();', context);

const migratedStreakRecords = JSON.parse(context.localStorage.getItem('vitaflow_streak_records'));
assert.equal(context.localStorage.getItem('vitaflow_streak'), '15', 'first structured check-in should preserve the legacy streak count');
assert.equal(migratedStreakRecords.length, 15, 'legacy streak days should be migrated into dated records once');
assert.equal(new Set(migratedStreakRecords.map(record => record.date)).size, 15, 'repeated same-day check-in should not create duplicates');

console.log('dashboard stats tests passed');
