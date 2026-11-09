/**
 * 公开体重投影与浏览器 Store 的契约。
 *
 * 2026-11-10 实测事故：公开投影漏掉顶层 `groups` 键，而 Store 的 validateState
 * 要求 groups 必须是数组，于是浏览器把整份状态判为「格式异常」而拒绝加载，
 * 今日摘要能读到 `__OPS_WEIGHT__` 但体重页永远空白。这条测试专门盯住这类形状约定。
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const { createStore, STORAGE_KEY } = require(path.join(root, 'weight-tracker/js/store.js'));

function readProjection() {
  const source = fs.readFileSync(path.join(root, 'data/public/weight.js'), 'utf8');
  // 在当前 realm 求值：vm 沙箱里的数组原型与本 realm 不同，deepEqual 会误判。
  const window = {};
  new Function('window', source)(window);
  return window.__OPS_WEIGHT__;
}

function memoryStorage(seed) {
  const values = new Map(Object.entries(seed || {}));
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

test('公开体重投影能被 Store 正常加载并读出记录', () => {
  const projection = readProjection();
  assert.ok(projection, 'data/public/weight.js 必须导出 __OPS_WEIGHT__');
  const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(projection) });
  const store = createStore(storage);

  const user = store.getActiveUser();
  assert.ok(user, '公开投影必须带一个可用的当前使用者');
  const records = store.listRecords(user.id);
  assert.ok(records.length > 0, '公开投影必须至少带一条本人记录');
  assert.ok(records.every((record) => record.userId === user.id), '只能发布本人记录');
  assert.ok(Number.isFinite(records[0].weight), '体重必须是数值');
  assert.equal(store.listGroups().length, 0, '本机小组不得进入公开投影');
});

test('公开体重投影不含他人记录与本机小组内容', () => {
  const projection = readProjection();
  const blob = JSON.stringify(projection);
  assert.deepEqual(projection.groups, [], '本机小组必须为空');
  assert.equal(projection.users.length, 1, '只发布一个使用者');
  const ids = new Set(projection.users.map((user) => user.id));
  for (const record of projection.records) {
    assert.ok(ids.has(record.userId), '不得出现其他使用者的记录');
  }
  assert.ok(!blob.includes('memberIds'), '不得携带小组成员关系');
});
