'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { createStore, STORAGE_KEY, localDateKey } = require('../js/store.js');

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    values
  };
}

const today = () => localDateKey();
const yesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
};

test('a new store is empty and does not read or overwrite the old activity data', () => {
  const oldData = '{"users":{"liugang":{"weight":96}}}';
  const storage = memoryStorage({ weightTrackerData: oldData });
  const store = createStore(storage);
  assert.deepEqual(store.listUsers(), []);
  assert.equal(store.getActiveUser(), null);
  assert.throws(() => store.addRecord({ date: today(), weight: 80 }), { code: 'NO_ACTIVE_USER' });
  store.createUser({ name: '本机使用者' });
  assert.equal(storage.getItem('weightTrackerData'), oldData);
  assert.deepEqual([...storage.values.keys()].sort(), [STORAGE_KEY, 'weightTrackerData'].sort());
});

test('multiple local users keep their own records when switching', () => {
  const store = createStore(memoryStorage());
  const alice = store.createUser({ name: '甲', goal: 70 });
  const first = store.addRecord({ date: today(), weight: 80, note: '晨间记录' });
  const bob = store.createUser({ name: '乙' });
  store.addRecord({ date: today(), weight: 60 });
  assert.equal(store.getActiveUser().id, bob.id);
  assert.equal(store.listRecords().length, 1);
  assert.equal(store.listRecords()[0].weight, 60);
  assert.throws(() => store.updateRecord(first.id, { weight: 79 }), { code: 'RECORD_NOT_FOUND' });
  assert.throws(() => store.deleteRecord(first.id), { code: 'RECORD_NOT_FOUND' });
  store.switchUser(alice.id);
  assert.equal(store.listRecords()[0].weight, 80);
  assert.equal(store.getActiveUser().goal, 70);
  assert.equal(store.listUsers().length, 2);
});

test('records add, update and delete without altering another user', () => {
  const store = createStore(memoryStorage());
  const user = store.createUser({ name: '甲' });
  const record = store.addRecord({ date: today(), weight: 80.25, note: '初始' });
  assert.equal(record.weight, 80.3);
  assert.equal(record.userId, user.id);
  const updated = store.updateRecord(record.id, { date: yesterday(), weight: 79.9, note: '修正' });
  assert.equal(updated.id, record.id);
  assert.equal(updated.createdAt, record.createdAt);
  assert.equal(updated.note, '修正');
  assert.equal(store.listRecords()[0].date, yesterday());
  assert.equal(store.deleteRecord(record.id).id, record.id);
  assert.deepEqual(store.listRecords(), []);
  assert.throws(() => store.deleteRecord(record.id), { code: 'RECORD_NOT_FOUND' });
});

test('same-day records remain separate and are sorted by date then creation order', () => {
  const store = createStore(memoryStorage());
  store.createUser({ name: '甲' });
  const first = store.addRecord({ date: today(), weight: 80 });
  const earlier = store.addRecord({ date: yesterday(), weight: 81 });
  const second = store.addRecord({ date: today(), weight: 79.8 });
  assert.deepEqual(store.listRecords().map(record => record.id), [earlier.id, first.id, second.id]);
});

test('new instances recover users, active selection, goals and records', () => {
  const storage = memoryStorage();
  const store = createStore(storage);
  const user = store.createUser({ name: '  甲  ', goal: 72.4 });
  store.addRecord({ date: today(), weight: 80.2, note: '已保存' });
  store.updateUser(user.id, { name: '甲的新名字', goal: null });
  const restored = createStore(storage);
  assert.equal(restored.getActiveUser().name, '甲的新名字');
  assert.equal(restored.getActiveUser().goal, null);
  assert.equal(restored.listRecords()[0].note, '已保存');
});

test('invalid dates, future dates, weights and unknown users fail without persisting changes', () => {
  const storage = memoryStorage();
  const store = createStore(storage);
  store.createUser({ name: '甲' });
  const before = storage.getItem(STORAGE_KEY);
  const future = new Date();
  future.setDate(future.getDate() + 1);
  for (const date of ['2026-02-30', '2026-13-01', '2026-2-01', '', localDateKey(future)]) {
    assert.throws(() => store.addRecord({ date, weight: 80 }), { code: 'INVALID_DATE' });
  }
  for (const weight of [0, -1, 501, NaN, Infinity, '', 'abc', true, null]) {
    assert.throws(() => store.addRecord({ date: today(), weight }), { code: 'INVALID_WEIGHT' });
  }
  assert.throws(() => store.switchUser('missing'), { code: 'USER_NOT_FOUND' });
  assert.throws(() => store.listRecords('missing'), { code: 'USER_NOT_FOUND' });
  assert.equal(storage.getItem(STORAGE_KEY), before);
});

test('valid leap dates are accepted while impossible leap dates are rejected', () => {
  const store = createStore(memoryStorage());
  store.createUser({ name: '甲' });
  assert.equal(store.addRecord({ date: '2024-02-29', weight: 80 }).date, '2024-02-29');
  assert.throws(() => store.addRecord({ date: '2025-02-29', weight: 80 }), { code: 'INVALID_DATE' });
});

test('names, goals and notes use bounded validated values', () => {
  const store = createStore(memoryStorage());
  for (const name of ['', '   ', 'a'.repeat(41), null]) {
    assert.throws(() => store.createUser({ name }), { code: 'INVALID_NAME' });
  }
  for (const goal of [0, -1, 501, 'abc', true]) {
    assert.throws(() => store.createUser({ name: '甲', goal }), { code: 'INVALID_GOAL' });
  }
  const user = store.createUser({ name: '甲', goal: '' });
  assert.equal(user.goal, null);
  assert.throws(() => store.addRecord({ date: today(), weight: 80, note: 'a'.repeat(301) }), { code: 'INVALID_NOTE' });
  assert.throws(() => store.updateUser(user.id, { name: ' ' }), { code: 'INVALID_NAME' });
});

test('returned values are detached from persisted store state', () => {
  const store = createStore(memoryStorage());
  const user = store.createUser({ name: '甲' });
  const record = store.addRecord({ date: today(), weight: 80 });
  user.name = '外部修改';
  record.weight = 1;
  store.getState().users[0].name = '外部修改';
  store.listRecords()[0].note = '外部修改';
  assert.equal(store.getActiveUser().name, '甲');
  assert.equal(store.listRecords()[0].weight, 80);
  assert.equal(store.listRecords()[0].note, '');
});

test('storage failures report explicit errors and do not mutate in-memory state', () => {
  const storage = memoryStorage();
  const store = createStore(storage);
  store.createUser({ name: '甲' });
  storage.setItem = () => { throw new Error('quota exceeded'); };
  assert.throws(() => store.addRecord({ date: today(), weight: 80 }), { code: 'STORAGE_UNAVAILABLE' });
  assert.deepEqual(store.listRecords(), []);
});

test('a stale second instance cannot overwrite records saved in the first instance', () => {
  const storage = memoryStorage();
  const initial = createStore(storage);
  initial.createUser({ name: '甲' });
  const firstTab = createStore(storage);
  const secondTab = createStore(storage);
  firstTab.addRecord({ date: today(), weight: 80, note: 'A 新增' });
  assert.throws(() => secondTab.addRecord({ date: today(), weight: 79, note: 'B 新增' }), { code: 'STORAGE_CONFLICT' });
  assert.deepEqual(secondTab.listRecords(), []);
  assert.deepEqual(createStore(storage).listRecords().map(record => record.note), ['A 新增']);
  const refreshed = createStore(storage);
  refreshed.addRecord({ date: today(), weight: 79, note: 'B 刷新后新增' });
  assert.deepEqual(createStore(storage).listRecords().map(record => record.note), ['A 新增', 'B 刷新后新增']);
});

test('concurrent first-time user creation reports conflict and preserves the saved user', () => {
  const storage = memoryStorage();
  const firstTab = createStore(storage);
  const secondTab = createStore(storage);
  firstTab.createUser({ name: '先保存的使用者' });
  assert.throws(() => secondTab.createUser({ name: '后保存的使用者' }), { code: 'STORAGE_CONFLICT' });
  assert.deepEqual(secondTab.listUsers(), []);
  assert.equal(secondTab.getActiveUser(), null);
  assert.deepEqual(createStore(storage).listUsers().map(user => user.name), ['先保存的使用者']);
});

test('a failed pre-write storage read preserves memory and allows a later retry', () => {
  const storage = memoryStorage();
  const store = createStore(storage);
  store.createUser({ name: '甲' });
  const read = storage.getItem;
  const before = read(STORAGE_KEY);
  storage.getItem = () => { throw new Error('storage permission denied'); };
  assert.throws(() => store.addRecord({ date: today(), weight: 80 }), { code: 'STORAGE_UNAVAILABLE' });
  assert.deepEqual(store.listRecords(), []);
  storage.getItem = read;
  assert.equal(read(STORAGE_KEY), before);
  store.addRecord({ date: today(), weight: 80 });
  assert.equal(store.listRecords().length, 1);
});

test('malformed saved state is reported and preserved for recovery', () => {
  const storage = memoryStorage({ [STORAGE_KEY]: '{broken' });
  assert.throws(() => createStore(storage), { code: 'INVALID_DATA' });
  assert.equal(storage.getItem(STORAGE_KEY), '{broken');
  const invalid = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ version: 1, users: [], records: [], activeUserId: 'missing' }) });
  assert.throws(() => createStore(invalid), { code: 'INVALID_DATA' });
});

test('local groups require explicit membership and never contain personal records', () => {
  const storage = memoryStorage();
  const store = createStore(storage);
  const alice = store.createUser({ name: '甲' });
  store.addRecord({ date: today(), weight: 80 });
  const group = store.createGroup('周末小组');
  assert.deepEqual(group.memberIds, [alice.id]);
  const bob = store.createUser({ name: '乙' });
  assert.deepEqual(store.listGroups()[0].memberIds, [alice.id]);
  assert.deepEqual(store.listRecords(), []);
  store.joinGroup(group.id);
  store.joinGroup(group.id);
  assert.deepEqual(store.listGroups()[0].memberIds, [alice.id, bob.id]);
  assert.equal('records' in store.listGroups()[0], false);
  assert.equal('weights' in store.listGroups()[0], false);
  const restored = createStore(storage);
  assert.deepEqual(restored.listGroups()[0].memberIds, [alice.id, bob.id]);
  restored.leaveGroup(group.id);
  restored.leaveGroup(group.id);
  assert.deepEqual(restored.listGroups()[0].memberIds, [alice.id]);
  assert.equal(restored.listRecords(alice.id)[0].weight, 80);
  assert.throws(() => restored.joinGroup('missing'), { code: 'GROUP_NOT_FOUND' });
  assert.throws(() => restored.joinGroup(group.id, 'missing'), { code: 'USER_NOT_FOUND' });
});

test('group creation validates names and requires a selected local user', () => {
  const store = createStore(memoryStorage());
  assert.throws(() => store.createGroup('小组'), { code: 'NO_ACTIVE_USER' });
  store.createUser({ name: '甲' });
  for (const name of ['', '  ', 'a'.repeat(41), null]) {
    assert.throws(() => store.createGroup(name), { code: 'INVALID_GROUP_NAME' });
  }
});

test('the same module exposes the documented browser global without CommonJS', () => {
  const context = { window: {}, Date, Math, JSON, Error, Map, Set };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/store.js'), 'utf8'), context);
  assert.equal(typeof context.window.WeightStore.createStore, 'function');
  assert.equal(context.window.WeightStore.STORAGE_KEY, STORAGE_KEY);
});
