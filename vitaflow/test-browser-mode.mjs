import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let requests = 0;
const context = vm.createContext({ location: { protocol: 'https:', search: '?embed=ops-hub&mode=browser' }, fetch: async () => { requests += 1; throw new Error('unexpected API request'); } });
vm.runInContext(fs.readFileSync('src/modules/sync-and-backup.js', 'utf8'), context);
const notices = [];
context.showLocalSyncDiagnostic = (message, error) => notices.push({ message, error });
assert.equal(context.isLocalSyncPossible(), false, 'explicit browser mode must not probe a private API');
await context.initLocalSync();
assert.equal(requests, 0);
assert.ok(notices.every(notice => !notice.error), 'browser mode must not show a sync error');
context.location.search = '?key=synthetic';
assert.equal(context.isLocalSyncPossible(), true, 'normal private-service pages retain synchronization');
console.log('explicit browser storage mode tests passed');
