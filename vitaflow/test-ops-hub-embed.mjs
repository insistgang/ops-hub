import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const handlers = {};
const sent = [];
const scrolled = [];
let backs = 0;
const parent = { postMessage: (data, origin) => sent.push({ data, origin }) };
const attrs = {};
const context = {
  URLSearchParams,
  localSyncAvailable: true,
  goBack: () => { backs += 1; },
  document: {
    body: { classList: { add() {} }, setAttribute: (key, value) => { attrs[key] = value; } },
    getElementById: id => ({ scrollIntoView: () => scrolled.push(id) })
  },
  window: { parent, location: { search: '?embed=ops-hub' }, addEventListener: (type, fn) => { handlers[type] = fn; } }
};
vm.runInNewContext(fs.readFileSync('src/modules/ops-hub-embed.js', 'utf8'), context);
handlers['vitaflow:ready']();
assert.equal(sent.length, 1);
assert.equal(sent[0].data.type, 'ops:vitaflow:ready');
assert.equal(sent[0].data.storage, 'server');
assert.deepEqual(Object.keys(sent[0].data).sort(), ['storage', 'type'], 'the readiness bridge must not disclose personal records');
handlers.message({ source: {}, data: { type: 'ops:vitaflow:navigate', view: 'dailyPlan' } });
handlers.message({ source: parent, data: { type: 'ops:vitaflow:navigate', view: 'not-a-view' } });
assert.equal(backs, 0);
handlers.message({ source: parent, data: { type: 'ops:vitaflow:navigate', view: 'dailyPlan' } });
assert.equal(backs, 1);
assert.deepEqual(scrolled, ['dailyPlan']);
handlers.message({ source: parent, data: { type: 'ops:vitaflow:theme', theme: 'dark' } });
assert.equal(attrs['data-ops-theme'], 'dark');
handlers.message({ source: parent, data: { type: 'ops:vitaflow:theme', theme: 'arbitrary-style' } });
assert.equal(attrs['data-ops-theme'], 'dark');
console.log('Ops-Hub embed bridge tests passed');
