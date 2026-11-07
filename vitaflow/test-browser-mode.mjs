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

// 公开站（外部域名）不得静默探测私有 API
context.location = { protocol: 'https:', hostname: 'insistgang.top', search: '?embed=ops-hub' };
requests = 0;
notices.length = 0;
assert.equal(context.isLocalSyncPossible(), false, 'public site must not probe a private API');
await context.initLocalSync();
assert.equal(requests, 0, 'public site must not issue any API request');
assert.ok(notices.every(notice => !notice.error), 'public site must not show a sync error');

// 显式连接时必须真的探测，不能被门禁挡住
context.showLocalSyncDiagnostic = () => {};
context.location = { protocol: 'http:', hostname: '127.0.0.1', search: '' };
requests = 0;
const originalFetch = context.fetch;
context.fetch = async () => { requests += 1; throw new Error('connection refused'); };
await context.initLocalSync({ force: true });
assert.equal(requests, 1, 'explicit connect must still probe the private service');
context.fetch = originalFetch;
console.log('explicit browser storage mode tests passed');
