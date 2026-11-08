import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildHtml } from './build-html.mjs';

const html = buildHtml();
const start = html.indexOf('// 数据备份 / 单文件携带 / 跨设备迁移 系统');
const end = html.indexOf('        function refreshVisibleData()', start);

assert.notEqual(start, -1, 'local sync script block was not found');
assert.notEqual(end, -1, 'local sync script block end was not found');

const syncScript = html.slice(start, end);
assert.ok(!html.includes('cloud-sync-config.js'), 'generated HTML should not load cloud sync config');
assert.ok(!syncScript.includes('VITAFLOW_CLOUD_SYNC'), 'client sync code should not read cloud sync config');
assert.ok(!syncScript.toLowerCase().includes('supabase'), 'client sync code should not include Supabase support');
assert.ok(!syncScript.includes('互联网同步'), 'client sync code should not include internet sync status paths');
const embeddedMarkerStart = syncScript.indexOf('function markCurrentEmbeddedDataAsRestored()');
const embeddedMarkerEnd = syncScript.indexOf('// 读取全部 localStorage 数据', embeddedMarkerStart);
const pollingStart = syncScript.indexOf('async function fetchLocalSyncUpdates()');
assert.ok(
  syncScript.slice(pollingStart).includes('拉取其他设备更新失败'),
  'polling failures should be visible in diagnostics'
);
assert.ok(
  !syncScript.slice(embeddedMarkerStart, embeddedMarkerEnd).includes('拉取其他设备更新失败'),
  'embedded snapshot bookkeeping should not report an unrelated polling failure'
);

class FakeStorage {
  constructor(initial) {
    this.store = { ...initial };
    this.failOnSetKey = null;
    this.failedSet = false;
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
    if (key === this.failOnSetKey && !this.failedSet) {
      this.failedSet = true;
      throw new Error(`simulated write failure for ${key}`);
    }
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

const scheduledTimeouts = [];
const scheduledIntervals = [];
const fetchCalls = [];
let nextFetchPayload = null;
let nextFetchStatus = 200;
const context = vm.createContext({
  Storage: FakeStorage,
  URLSearchParams,
  localStorage: new FakeStorage({ vitaflow_todos: '[]' }),
  location: { protocol: 'http:' },
  clearTimeout() {},
  setTimeout(fn, delay) {
    scheduledTimeouts.push({ fn, delay });
    return scheduledTimeouts.length;
  },
  setInterval(fn, delay) {
    scheduledIntervals.push({ fn, delay });
    return scheduledIntervals.length;
  },
  fetch: async (url, options = {}) => {
    fetchCalls.push({ url, options });
    const status = nextFetchStatus;
    nextFetchStatus = 200;
    const payloadSource = nextFetchPayload || { ok: true, updatedAt: '2026-07-02T00:00:00.000Z', features: { patch: true } };
    nextFetchPayload = null;
    const payload = await payloadSource;
    return {
      status,
      ok: status >= 200 && status < 300,
      json: async () => payload,
    };
  },
  updateSaveStatus() {},
});

vm.runInContext(html.slice(start, end), context);

vm.runInContext(`
  localSyncAvailable = true;
  localSyncReady = false;
  localSyncShouldSeed = false;
  localSyncLastRevision = 'revision-1';
  enableLocalSyncAfterInitialRender();
`, context);

assert.equal(scheduledTimeouts.length, 0, 'initial render should not upload unchanged data');
assert.ok(
  scheduledIntervals.some(item => item.fn.name === 'checkLocalSyncDirty' && item.delay === 30000),
  'dirty watcher should be a low-frequency fallback because setItem/removeItem hooks do normal uploads'
);

context.localStorage.store.vitaflow_todos = '[{"id":1,"text":"phone edit"}]';
vm.runInContext('checkLocalSyncDirty();', context);

assert.equal(scheduledTimeouts.length, 1, 'local sync should upload when data changes without a setItem hook');

scheduledTimeouts.length = 0;
vm.runInContext(`
  localSyncSupportsPatch = true;
  markLocalDataChanged('vitaflow_todos');
`, context);

assert.equal(scheduledTimeouts.length, 1, 'marking todos changed should schedule an upload');

await scheduledTimeouts[0].fn();
assert.equal(fetchCalls.length, 1, 'upload should call the sync API');

const body = JSON.parse(fetchCalls[0].options.body);
assert.equal(body.baseRevision, 'revision-1');
assert.deepEqual(Object.keys(body.patch), ['vitaflow_todos']);
assert.equal(body.patch.vitaflow_todos, '[{"id":1,"text":"phone edit"}]');

scheduledTimeouts.length = 0;
fetchCalls.length = 0;
context.localStorage.store.vitaflow_remove_me = 'old value';

vm.runInContext(`
  installLocalSyncHook();
  localSyncSupportsPatch = true;
  localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
  localStorage.removeItem('vitaflow_remove_me');
`, context);

assert.equal(scheduledTimeouts.length, 1, 'removing a vitaflow key should schedule an upload');

await scheduledTimeouts[0].fn();
assert.equal(fetchCalls.length, 1, 'remove upload should call the sync API');

const removeBody = JSON.parse(fetchCalls[0].options.body);
assert.deepEqual(removeBody.patch, { vitaflow_remove_me: null });
assert.equal(removeBody.baseRevision, 'revision-1');

scheduledTimeouts.length = 0;
fetchCalls.length = 0;

context.localStorage.store = {
  vitaflow_todos: '[{"id":1,"text":"desktop edit"}]',
};
nextFetchPayload = {
  ok: true,
  updatedAt: '2026-07-03T00:00:00.000Z',
  features: { patch: true },
  data: {
    vitaflow_todos: '[{"id":1,"text":"desktop edit"}]',
    vitaflow_remote_note: 'created on another device',
  },
};
vm.runInContext(`
  localSyncReady = true;
  localSyncSupportsPatch = true;
  markLocalDataChanged('vitaflow_todos');
`, context);

await vm.runInContext('uploadLocalSyncData()', context);

assert.equal(
  context.localStorage.getItem('vitaflow_remote_note'),
  'created on another device',
  'upload response should reconcile data merged by the server'
);
assert.equal(
  vm.runInContext('localSyncLastSyncedSnapshot', context),
  JSON.stringify(context.localStorage.store),
  'sync snapshot should describe the reconciled local state'
);

scheduledTimeouts.length = 0;
fetchCalls.length = 0;

context.localStorage.store = {
  vitaflow_todos: '[{"id":1,"text":"desktop v1"}]',
};
let resolveConcurrentUpload;
nextFetchPayload = new Promise(resolve => {
  resolveConcurrentUpload = resolve;
});
vm.runInContext(`
  localSyncReady = true;
  localSyncSupportsPatch = true;
  localSyncChangedKeys.clear();
  localSyncDeletedKeys.clear();
  markLocalDataChanged('vitaflow_todos');
`, context);

const concurrentUpload = vm.runInContext('uploadLocalSyncData()', context);
context.localStorage.setItem('vitaflow_todos', '[{"id":1,"text":"desktop v2"}]');
resolveConcurrentUpload({
  ok: true,
  updatedAt: '2026-07-04T00:00:00.000Z',
  features: { patch: true },
  data: {
    vitaflow_todos: '[{"id":1,"text":"desktop v1"}]',
    vitaflow_remote_note: 'remote while upload was running',
  },
});
await concurrentUpload;

assert.equal(
  context.localStorage.getItem('vitaflow_todos'),
  '[{"id":1,"text":"desktop v2"}]',
  'a server response must not overwrite local edits made while the upload was in flight'
);
assert.equal(
  context.localStorage.getItem('vitaflow_remote_note'),
  'remote while upload was running',
  'remote keys should still be applied when a concurrent local edit exists'
);
assert.equal(
  vm.runInContext("localSyncChangedKeys.has('vitaflow_todos')", context),
  true,
  'a concurrent local edit should remain queued for the next upload'
);

scheduledTimeouts.length = 0;
fetchCalls.length = 0;

context.localStorage.store = {
  vitaflow_todos: '["old"]',
  vitaflow_removed_remotely: 'stale',
};
vm.runInContext(`
  localSyncReady = false;
  restoreBackupData({ vitaflow_todos: '["new"]' });
`, context);

assert.deepEqual(
  context.localStorage.store,
  { vitaflow_todos: '["new"]', __vitaflow_sync_pending: '1' },
  'a manual restore should replace stale keys and remain queued for local sync'
);

context.localStorage.store = {
  vitaflow_a: '{"version":"old"}',
  vitaflow_b: '[]',
};
context.localStorage.failOnSetKey = 'vitaflow_c';
context.localStorage.failedSet = false;

assert.throws(
  () => vm.runInContext(`
    restoreBackupData({
      vitaflow_a: '{"version":"new"}',
      vitaflow_c: '[]'
    });
  `, context),
  /simulated write failure/,
  'a failed restore should report the write error'
);
assert.deepEqual(
  context.localStorage.store,
  { vitaflow_a: '{"version":"old"}', vitaflow_b: '[]' },
  'a failed restore must roll back every VitaFlow key'
);

context.localStorage.failOnSetKey = null;
assert.throws(
  () => vm.runInContext("restoreBackupData({ vitaflow_todos: '{broken json' });", context),
  /vitaflow_todos/,
  'malformed structured data should be rejected before replacing local data'
);
assert.deepEqual(
  context.localStorage.store,
  { vitaflow_a: '{"version":"old"}', vitaflow_b: '[]' },
  'validation failures must leave the existing data untouched'
);

scheduledTimeouts.length = 0;
fetchCalls.length = 0;
context.localStorage.store = { vitaflow_todos: '[]' };
nextFetchStatus = 304;
vm.runInContext(`
  localSyncAvailable = true;
  localSyncReady = true;
  localSyncConflict = null;
  localSyncLastRevision = 'revision-unchanged';
  localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
`, context);

await vm.runInContext('fetchLocalSyncUpdates()', context);
assert.equal(fetchCalls.length, 1);
assert.ok(
  fetchCalls[0].url.includes('revision=revision-unchanged'),
  'polling should send the last revision for a conditional response'
);

scheduledTimeouts.length = 0;
fetchCalls.length = 0;
context.localStorage.store = { vitaflow_todos: '[{"id":1,"text":"before poll"}]' };
let finishPolling;
nextFetchPayload = new Promise(resolve => { finishPolling = resolve; });
vm.runInContext(`
  localSyncAvailable = true;
  localSyncReady = true;
  localSyncConflict = null;
  localSyncUploading = false;
  localSyncChangedKeys.clear();
  localSyncDeletedKeys.clear();
  localSyncLastRevision = 'revision-before-poll';
  localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
`, context);
const inFlightPoll = vm.runInContext('fetchLocalSyncUpdates()', context);
context.localStorage.setItem('vitaflow_todos', '[{"id":1,"text":"edited during poll"}]');
finishPolling({ revision: 'revision-from-poll', updatedAt: '2026-07-05T00:00:00.000Z',
  data: { vitaflow_todos: '[{"id":2,"text":"server update"}]' }, features: { patch: true } });
await inFlightPoll;
assert.equal(context.localStorage.getItem('vitaflow_todos'), '[{"id":1,"text":"edited during poll"}]',
  'a delayed polling response must not overwrite an edit made while the request was in flight');
assert.equal(vm.runInContext('localSyncLastRevision', context), 'revision-before-poll',
  'the upload must retain its original revision so the server can detect a conflict');
assert.equal(context.localStorage.getItem('__vitaflow_sync_pending'), '1');
assert.ok(scheduledTimeouts.length > 0, 'the preserved local edit should remain queued');

scheduledTimeouts.length = 0;
fetchCalls.length = 0;
context.localStorage.store = {
  vitaflow_todos: '[{"id":1,"text":"local edit"}]',
};
nextFetchStatus = 409;
nextFetchPayload = {
  ok: false,
  error: '版本冲突',
  revision: 'revision-server-newer',
  updatedAt: '2026-07-05T00:00:00.000Z',
  data: {
    vitaflow_todos: '[{"id":2,"text":"server edit"}]',
  },
};
vm.runInContext(`
  localSyncAvailable = true;
  localSyncReady = true;
  localSyncLastRevision = 'revision-local-base';
  localSyncChangedKeys.clear();
  localSyncDeletedKeys.clear();
  localSyncChangedKeys.add('vitaflow_todos');
`, context);

await vm.runInContext('uploadLocalSyncData()', context);
assert.equal(
  context.localStorage.getItem('vitaflow_todos'),
  '[{"id":1,"text":"local edit"}]',
  'a revision conflict must not overwrite the local edit'
);
assert.equal(vm.runInContext('Boolean(localSyncConflict)', context), true, 'the client should pause in a conflict state');
assert.equal(
  vm.runInContext("localSyncChangedKeys.has('vitaflow_todos')", context),
  true,
  'conflicted local keys must remain pending'
);
assert.equal(scheduledTimeouts.length, 0, 'a conflict should not enter an automatic retry loop');

await vm.runInContext("resolveLocalSyncConflict('remote')", context);
assert.equal(
  context.localStorage.getItem('vitaflow_todos'),
  '[{"id":2,"text":"server edit"}]',
  'choosing the server copy should apply it transactionally'
);
assert.equal(vm.runInContext('localSyncConflict', context), null, 'resolving a conflict should resume normal sync');
assert.equal(vm.runInContext('localSyncLastRevision', context), 'revision-server-newer');

scheduledTimeouts.length = 0;
fetchCalls.length = 0;
context.localStorage.store = {
  vitaflow_todos: '[{"id":3,"text":"preferred local edit"}]',
};
nextFetchStatus = 409;
nextFetchPayload = {
  ok: false,
  error: '版本冲突',
  revision: 'revision-server-latest',
  updatedAt: '2026-07-06T00:00:00.000Z',
  data: {
    vitaflow_todos: '[{"id":4,"text":"another server edit"}]',
  },
};
vm.runInContext(`
  localSyncChangedKeys.add('vitaflow_todos');
  localSyncLastRevision = 'revision-server-newer';
`, context);
await vm.runInContext('uploadLocalSyncData()', context);

nextFetchPayload = {
  ok: true,
  revision: 'revision-local-won',
  updatedAt: '2026-07-06T00:00:01.000Z',
  features: { patch: true, revision: true },
  data: {
    vitaflow_todos: '[{"id":3,"text":"preferred local edit"}]',
  },
};
await vm.runInContext("resolveLocalSyncConflict('local')", context);

const localResolutionBody = JSON.parse(fetchCalls[1].options.body);
assert.equal(localResolutionBody.baseRevision, 'revision-server-latest');
assert.deepEqual(localResolutionBody.data, {
  vitaflow_todos: '[{"id":3,"text":"preferred local edit"}]',
});
assert.equal(localResolutionBody.patch, undefined, 'keeping local should intentionally replace the full server snapshot');
assert.equal(vm.runInContext('localSyncLastRevision', context), 'revision-local-won');
assert.equal(vm.runInContext('localSyncConflict', context), null);

vm.runInContext(`
  localSyncAvailable = false;
  localSyncReady = false;
  localSyncConflict = null;
  localStorage.removeItem('__vitaflow_sync_pending');
  localStorage.setItem('vitaflow_todos', '[{"id":5,"text":"offline edit"}]');
`, context);
assert.equal(
  context.localStorage.getItem('__vitaflow_sync_pending'),
  '1',
  'offline edits should persist a pending marker before any server is available'
);

class ReloadStorage extends FakeStorage {}
const reloadStorage = new ReloadStorage({
  vitaflow_todos: '[{"id":5,"text":"offline edit"}]',
  __vitaflow_sync_pending: '1',
});
const reloadContext = vm.createContext({
  Storage: ReloadStorage,
  URLSearchParams,
  localStorage: reloadStorage,
  location: { protocol: 'http:', search: '' },
  clearTimeout() {},
  setTimeout,
  setInterval,
  fetch: async () => ({
    status: 200,
    ok: true,
    json: async () => ({
      revision: 'revision-after-reload',
      updatedAt: '2026-07-07T00:00:00.000Z',
      features: { patch: true, revision: true },
      data: { vitaflow_todos: '[{"id":6,"text":"server edit"}]' },
    }),
  }),
  updateSaveStatus() {},
  console,
});
vm.runInContext(syncScript, reloadContext);
await vm.runInContext('initLocalSync()', reloadContext);
assert.equal(
  reloadStorage.getItem('vitaflow_todos'),
  '[{"id":5,"text":"offline edit"}]',
  'reload should not overwrite a pending local edit with the server snapshot'
);
assert.equal(vm.runInContext('Boolean(localSyncConflict)', reloadContext), true);
assert.equal(vm.runInContext('localSyncHasRemoteData', reloadContext), true);

await vm.runInContext("resolveLocalSyncConflict('remote')", reloadContext);
assert.equal(reloadStorage.getItem('vitaflow_todos'), '[{"id":6,"text":"server edit"}]');
assert.equal(reloadStorage.getItem('__vitaflow_sync_pending'), null, 'resolving with the server copy should clear the marker');

async function connectInitialCopies(localData, remoteData) {
  class InitialStorage extends FakeStorage {
    constructor(data) { super(data); this.recordWrites = []; }
    setItem(key, value) { this.recordWrites.push(['set', key]); this.store[key] = String(value); }
    removeItem(key) { this.recordWrites.push(['remove', key]); delete this.store[key]; }
  }
  const storage = new InitialStorage(localData);
  const calls = [];
  const timers = [];
  const initialContext = vm.createContext({
    Storage: InitialStorage,
    URLSearchParams,
    localStorage: storage,
    location: { protocol: 'http:', search: '' },
    clearTimeout() {},
    setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; },
    setInterval() { return 1; },
    fetch: async (url, options = {}) => {
      calls.push({ url, options });
      return { status: 200, ok: true, json: async () => ({ data: remoteData, revision: 'initial-server-revision', features: { patch: true, revision: true } }) };
    },
    updateSaveStatus() {},
  });
  vm.runInContext(syncScript, initialContext);
  await vm.runInContext('initLocalSync()', initialContext);
  return { storage, calls, timers, context: initialContext, read: expression => vm.runInContext(expression, initialContext) };
}

const existingLocal = { vitaflow_todos: '[{"id":10,"text":"local record"}]' };
const differentRemote = { vitaflow_todos: '[{"id":11,"text":"server record"}]' };
const firstConflict = await connectInitialCopies(existingLocal, differentRemote);
assert.equal(firstConflict.read('Boolean(localSyncConflict)'), true, 'different non-empty copies require a choice even without a pending marker');
assert.equal(firstConflict.storage.getItem('vitaflow_todos'), existingLocal.vitaflow_todos, 'initial connection cannot replace existing local records');
assert.ok(firstConflict.storage.recordWrites.every(([, key]) => !key.startsWith('vitaflow_')), 'no business data may be written before a conflict choice');
assert.equal(firstConflict.calls.length, 1, 'initial conflict must not upload either version');

const emptyDefaults = {
  vitaflow_accounts: JSON.stringify({ physical: { score: null, history: [] }, emotional: { score: null, history: [] }, focus: { score: null, history: [] }, meaning: { score: null, history: [] } }),
  vitaflow_todos: '[]', vitaflow_happiness: '{}', vitaflow_streak: '0', vitaflow_streak_records: '[]', vitaflow_completed: '0', vitaflow_goal: '',
};
const blankCopy = await connectInitialCopies(emptyDefaults, differentRemote);
assert.equal(blankCopy.read('Boolean(localSyncConflict)'), false, 'empty initData defaults alone are not private records');
assert.equal(blankCopy.storage.getItem('vitaflow_todos'), differentRemote.vitaflow_todos, 'a blank client can adopt real server records');
const freshCopy = await connectInitialCopies({}, differentRemote);
assert.equal(freshCopy.read('Boolean(localSyncConflict)'), false);
assert.equal(freshCopy.storage.getItem('vitaflow_todos'), differentRemote.vitaflow_todos, 'a truly empty client can adopt server records');

const pendingDeletion = await connectInitialCopies({ ...emptyDefaults, __vitaflow_sync_pending: '1' }, differentRemote);
assert.equal(pendingDeletion.read('Boolean(localSyncConflict)'), true, 'an empty pending copy may represent intentional deletion and still requires a choice');
assert.equal(pendingDeletion.storage.getItem('vitaflow_todos'), '[]');

const recordedZero = await connectInitialCopies({ vitaflow_accounts: '{"physical":{"score":0,"history":[]}}' }, differentRemote);
assert.equal(recordedZero.read('Boolean(localSyncConflict)'), true, 'recorded zero scores are meaningful and cannot be treated as empty defaults');

const sameData = await connectInitialCopies({ ...existingLocal, vitaflow_goal: '', __vitaflow_sync_pending: '1' }, { vitaflow_todos: '[ { "text": "local record", "id": 10 } ]' });
assert.equal(sameData.read('Boolean(localSyncConflict)'), false, 'equivalent data does not conflict because of property order, whitespace, or empty defaults');
assert.equal(sameData.storage.getItem('vitaflow_todos'), existingLocal.vitaflow_todos, 'identical connection preserves existing local bytes');
assert.equal(sameData.storage.getItem('__vitaflow_sync_pending'), null);
assert.ok(sameData.storage.recordWrites.every(([, key]) => !key.startsWith('vitaflow_')));

const seedCopy = await connectInitialCopies({ ...existingLocal, __vitaflow_sync_pending: '1' }, {});
assert.equal(seedCopy.read('Boolean(localSyncConflict)'), false, 'an actually empty remote can be seeded without replacing local data');
assert.equal(seedCopy.read('localSyncShouldSeed'), true);
assert.equal(seedCopy.storage.getItem('vitaflow_todos'), existingLocal.vitaflow_todos);
assert.ok(seedCopy.storage.recordWrites.every(([, key]) => !key.startsWith('vitaflow_')));
const defaultServer = await connectInitialCopies(existingLocal, emptyDefaults);
assert.equal(defaultServer.read('Boolean(localSyncConflict)'), false, 'a default-only server has no meaningful records to lose');
assert.equal(defaultServer.read('localSyncShouldSeed'), true);
assert.equal(defaultServer.storage.getItem('vitaflow_todos'), existingLocal.vitaflow_todos);

const corruptedCopy = await connectInitialCopies({ vitaflow_todos: '{broken' }, differentRemote);
assert.equal(corruptedCopy.read('localSyncAvailable'), false, 'a corrupt local copy cannot be silently replaced by initial sync');
assert.equal(corruptedCopy.storage.getItem('vitaflow_todos'), '{broken');
assert.ok(corruptedCopy.storage.recordWrites.every(([, key]) => !key.startsWith('vitaflow_')));
const corruptRemote = await connectInitialCopies(existingLocal, { vitaflow_todos: '{broken' });
assert.equal(corruptRemote.read('localSyncAvailable'), false, 'invalid server records must be rejected before any replacement');
assert.equal(corruptRemote.storage.getItem('vitaflow_todos'), existingLocal.vitaflow_todos);
assert.ok(corruptRemote.storage.recordWrites.every(([, key]) => !key.startsWith('vitaflow_')));

console.log('local sync client tests passed');
