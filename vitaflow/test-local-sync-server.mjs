import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createLocalSyncServer, loadOrCreateToken } from './local-sync-server.mjs';

const tokenDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vitaflow-token-'));
try {
  const token = loadOrCreateToken(tokenDir);
  const tokenPath = path.join(tokenDir, 'sync-token.txt');
  assert.equal(token.length, 16, 'generated tokens should contain 64 bits of randomness');
  if (process.platform !== 'win32') {
    assert.equal(fs.statSync(tokenPath).mode & 0o777, 0o600, 'new token files should be private');
    fs.chmodSync(tokenPath, 0o644);
    assert.equal(loadOrCreateToken(tokenDir), token, 'tightening permissions must preserve the token');
    assert.equal(fs.statSync(tokenPath).mode & 0o777, 0o600, 'existing token files should be tightened');
  }
} finally {
  fs.rmSync(tokenDir, { recursive: true, force: true });
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vitaflow-sync-'));
const dataPath = path.join(tmpDir, 'data.json');
fs.writeFileSync(dataPath, JSON.stringify({ vitaflow_todos: '[]' }, null, 2));
fs.writeFileSync(`${dataPath}.bak`, JSON.stringify({ vitaflow_todos: '["older"]' }, null, 2));
fs.writeFileSync(path.join(tmpDir, 'schedule-system-2.0.html'), '<!doctype html><title>VitaFlow</title>');
fs.writeFileSync(path.join(tmpDir, 'private-note.txt'), 'must not be served');

const TOKEN = 'test-token-1234';
const authHeaders = { 'x-vitaflow-token': TOKEN };

const server = createLocalSyncServer({ rootDir: tmpDir, dataPath, quiet: true, token: TOKEN, maxRequestBytes: 1024 });
if (process.platform !== 'win32') {
  assert.equal(fs.statSync(dataPath).mode & 0o777, 0o600, 'server initialization should tighten existing data');
  assert.equal(fs.statSync(`${dataPath}.bak`).mode & 0o777, 0o600, 'server initialization should tighten backups');
}
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

try {
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const noAuthRes = await fetch(`${baseUrl}/api/data`);
  assert.equal(noAuthRes.status, 401, 'API without token should be rejected');

  const wrongAuthRes = await fetch(`${baseUrl}/api/data`, { headers: { 'x-vitaflow-token': 'wrong-token' } });
  assert.equal(wrongAuthRes.status, 401, 'API with wrong token should be rejected');

  const noAuthStaticRes = await fetch(`${baseUrl}/data.json`);
  assert.equal(noAuthStaticRes.status, 401, 'static files without token should be rejected');

  const appPageRes = await fetch(`${baseUrl}/?key=${TOKEN}`);
  assert.equal(appPageRes.status, 200, 'the generated VitaFlow HTML should remain available');
  assert.equal(appPageRes.headers.get('referrer-policy'), 'no-referrer', 'page links must not leak the key in referrers');
  assert.equal(appPageRes.headers.get('x-content-type-options'), 'nosniff');
  const privateFileRes = await fetch(`${baseUrl}/private-note.txt?key=${TOKEN}`);
  assert.equal(privateFileRes.status, 404, 'authenticated users must not browse arbitrary project files');
  const directDataRes = await fetch(`${baseUrl}/data.json?key=${TOKEN}`);
  assert.equal(directDataRes.status, 404, 'data files should only be available through the authenticated API');

  const noAuthHealthRes = await fetch(`${baseUrl}/api/health`);
  assert.equal(noAuthHealthRes.status, 200, 'health check should stay reachable for start scripts');
  const noAuthHealth = await noAuthHealthRes.json();
  assert.equal(noAuthHealth.authRequired, true);
  assert.equal(noAuthHealth.updatedAt, undefined, 'unauthenticated health must not leak details');

  const queryAuthRes = await fetch(`${baseUrl}/api/data?key=${TOKEN}`);
  assert.equal(queryAuthRes.status, 200, 'query key should authenticate');
  const setCookie = queryAuthRes.headers.get('set-cookie') || '';
  assert.ok(setCookie.includes('vitaflow_key='), 'query key auth should set the cookie');

  const cookieAuthRes = await fetch(`${baseUrl}/api/data`, { headers: { cookie: `vitaflow_key=${TOKEN}` } });
  assert.equal(cookieAuthRes.status, 200, 'cookie should authenticate');

  const initialRes = await fetch(`${baseUrl}/api/data`, { headers: authHeaders });
  assert.equal(initialRes.status, 200);
  const initial = await initialRes.json();
  assert.deepEqual(initial.data, { vitaflow_todos: '[]' });
  assert.equal(typeof initial.updatedAt, 'string');
  assert.equal(typeof initial.revision, 'string', 'data responses should include an optimistic concurrency revision');
  if (process.platform !== 'win32') {
    assert.equal(fs.statSync(dataPath).mode & 0o777, 0o600, 'existing data files should be tightened on read');
    assert.equal(fs.statSync(`${dataPath}.bak`).mode & 0o777, 0o600, 'existing backups should be tightened on read');
  }

  for (const body of ['{invalid json', 'null', '[]', '42']) {
    const invalidBodyRes = await fetch(`${baseUrl}/api/data`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeaders },
      body,
    });
    assert.equal(invalidBodyRes.status, 400, 'malformed JSON and non-object request bodies should be client errors');
    assert.equal((await invalidBodyRes.json()).ok, false);
    assert.deepEqual(JSON.parse(fs.readFileSync(dataPath, 'utf8')), initial.data, 'invalid requests must leave data untouched');
  }

  const boundaryPayload = { baseRevision: initial.revision, patch: { vitaflow_todos: '[]' }, padding: '' };
  boundaryPayload.padding = 'x'.repeat(1024 - Buffer.byteLength(JSON.stringify(boundaryPayload)));
  const boundaryRes = await fetch(`${baseUrl}/api/data`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...authHeaders },
    body: JSON.stringify(boundaryPayload),
  });
  assert.equal(boundaryRes.status, 200, 'requests exactly at the configured byte limit should remain valid');

  const oversizedBody = JSON.stringify({
    baseRevision: initial.revision,
    data: { vitaflow_todos: 'x'.repeat(2048) },
  });
  const oversizedRes = await fetch(`${baseUrl}/api/data`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...authHeaders },
    body: oversizedBody,
  });
  assert.equal(oversizedRes.status, 413, 'requests with an oversized content length should be rejected');
  assert.match((await oversizedRes.json()).error, /1024/, 'size errors should explain the configured byte limit');

  const chunkedRes = await new Promise((resolve, reject) => {
    const request = http.request(`${baseUrl}/api/data`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeaders },
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    request.on('error', reject);
    request.write(oversizedBody.slice(0, 500));
    request.end(oversizedBody.slice(500));
  });
  assert.equal(chunkedRes.status, 413, 'chunked requests must obey the same byte limit');
  assert.equal(JSON.parse(chunkedRes.body).ok, false);
  assert.deepEqual(JSON.parse(fs.readFileSync(dataPath, 'utf8')), initial.data, 'oversized requests must leave data untouched');

  const unchangedRes = await fetch(
    `${baseUrl}/api/data?revision=${encodeURIComponent(initial.revision)}`,
    { headers: authHeaders }
  );
  assert.equal(unchangedRes.status, 304, 'matching revisions should avoid sending the full data file again');
  assert.equal(await unchangedRes.text(), '', '304 responses should not include a response body');

  const legacyWriteRes = await fetch(`${baseUrl}/api/data`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-vitaflow-token': TOKEN },
    body: JSON.stringify({ data: { vitaflow_todos: '["legacy overwrite"]' } }),
  });
  assert.equal(legacyWriteRes.status, 428, 'legacy writes without a base revision should be rejected');
  assert.deepEqual(JSON.parse(fs.readFileSync(dataPath, 'utf8')), { vitaflow_todos: '[]' });

  const invalidWriteRes = await fetch(`${baseUrl}/api/data`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-vitaflow-token': TOKEN },
    body: JSON.stringify({ baseRevision: initial.revision }),
  });
  assert.equal(invalidWriteRes.status, 400, 'writes must explicitly contain either data or patch');
  assert.deepEqual(
    JSON.parse(fs.readFileSync(dataPath, 'utf8')),
    { vitaflow_todos: '[]' },
    'invalid write bodies must not clear the data file'
  );

  const nextData = {
    vitaflow_todos: JSON.stringify([{ id: 1, text: 'phone note', completed: false }]),
    vitaflow_happiness: '{}',
    ignored_key: 'should not be persisted',
  };
  const writeRes = await fetch(`${baseUrl}/api/data`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-vitaflow-token': TOKEN },
    body: JSON.stringify({ data: nextData, baseRevision: initial.revision }),
  });
  assert.equal(writeRes.status, 200);
  const writePayload = await writeRes.json();
  assert.notEqual(writePayload.revision, initial.revision, 'successful writes should advance the revision');

  const stored = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  assert.deepEqual(Object.keys(stored).sort(), ['vitaflow_happiness', 'vitaflow_todos']);
  assert.equal(stored.vitaflow_todos, nextData.vitaflow_todos);
  if (process.platform !== 'win32') {
    assert.equal(fs.statSync(dataPath).mode & 0o777, 0o600, 'data files should be private');
    assert.equal(fs.statSync(`${dataPath}.bak`).mode & 0o777, 0o600, 'backup files should be private');
  }
  assert.deepEqual(
    JSON.parse(fs.readFileSync(`${dataPath}.bak`, 'utf8')),
    { vitaflow_todos: '[]' },
    'the previous valid data file should be retained as a one-generation backup'
  );

  const previousMtime = new Date('2025-01-01T00:00:00Z');
  fs.utimesSync(dataPath, previousMtime, previousMtime);
  const backupSnapshot = () => Object.fromEntries(fs.readdirSync(tmpDir)
    .filter(name => name.startsWith('data.json.bak'))
    .map(name => [name, fs.readFileSync(path.join(tmpDir, name), 'utf8')]));
  const backupsBeforeNoop = backupSnapshot();
  for (const payload of [
    { data: stored, baseRevision: writePayload.revision },
    { patch: { vitaflow_todos: stored.vitaflow_todos }, baseRevision: writePayload.revision },
  ]) {
    const noopRes = await fetch(`${baseUrl}/api/data`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeaders },
      body: JSON.stringify(payload),
    });
    assert.equal(noopRes.status, 200, 'unchanged writes should remain successful');
    const noop = await noopRes.json();
    assert.equal(noop.revision, writePayload.revision, 'unchanged writes should retain the revision');
    assert.equal(noop.updatedAt, previousMtime.toISOString(), 'unchanged writes should retain the data timestamp');
    assert.deepEqual(backupSnapshot(), backupsBeforeNoop, 'unchanged writes must not rotate away useful history');
  }

  const staleWriteRes = await fetch(`${baseUrl}/api/data`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-vitaflow-token': TOKEN },
    body: JSON.stringify({
      patch: { vitaflow_todos: '[{"id":404,"text":"stale overwrite"}]' },
      baseRevision: initial.revision,
    }),
  });
  assert.equal(staleWriteRes.status, 409, 'a stale client must not overwrite a newer server revision');
  const staleWritePayload = await staleWriteRes.json();
  assert.equal(staleWritePayload.revision, writePayload.revision);
  assert.deepEqual(staleWritePayload.data, stored, 'conflicts should return the current server data for resolution');
  assert.deepEqual(JSON.parse(fs.readFileSync(dataPath, 'utf8')), stored, 'conflicted writes must leave the file unchanged');

  const patchData = {
    vitaflow_todos: JSON.stringify([{ id: 2, text: 'patched phone note', completed: false }]),
    ignored_key: 'still ignored',
  };
  const patchRes = await fetch(`${baseUrl}/api/data`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-vitaflow-token': TOKEN },
    body: JSON.stringify({ patch: patchData, baseRevision: writePayload.revision }),
  });
  assert.equal(patchRes.status, 200);
  const patchPayload = await patchRes.json();
  assert.notEqual(patchPayload.revision, writePayload.revision);

  const patched = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  assert.deepEqual(Object.keys(patched).sort(), ['vitaflow_happiness', 'vitaflow_todos']);
  assert.equal(patched.vitaflow_todos, patchData.vitaflow_todos);
  assert.equal(patched.vitaflow_happiness, '{}');

  const deletePatchRes = await fetch(`${baseUrl}/api/data`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-vitaflow-token': TOKEN },
    body: JSON.stringify({ patch: { vitaflow_happiness: null }, baseRevision: patchPayload.revision }),
  });
  assert.equal(deletePatchRes.status, 200);
  const deletePatchPayload = await deletePatchRes.json();

  const deletePatched = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  assert.deepEqual(Object.keys(deletePatched), ['vitaflow_todos']);
  assert.equal(deletePatched.vitaflow_todos, patchData.vitaflow_todos);

  const readBackRes = await fetch(`${baseUrl}/api/data`, { headers: authHeaders });
  const readBack = await readBackRes.json();
  assert.equal(readBack.data.vitaflow_todos, patchData.vitaflow_todos);
  assert.equal(readBack.data.vitaflow_happiness, undefined);
  assert.equal(readBack.features.patch, true);
  assert.equal(readBack.revision, deletePatchPayload.revision);

  let rotationRevision = deletePatchPayload.revision;
  for (let index = 0; index < 8; index += 1) {
    const rotationRes = await fetch(`${baseUrl}/api/data`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-vitaflow-token': TOKEN },
      body: JSON.stringify({
        patch: { vitaflow_todos: JSON.stringify([`rotation-${index}`]) },
        baseRevision: rotationRevision,
      }),
    });
    assert.equal(rotationRes.status, 200);
    rotationRevision = (await rotationRes.json()).revision;
  }

  assert.equal(
    JSON.parse(fs.readFileSync(`${dataPath}.bak`, 'utf8')).vitaflow_todos,
    JSON.stringify(['rotation-6']),
    'the latest backup should contain the immediately preceding revision'
  );
  assert.equal(
    JSON.parse(fs.readFileSync(`${dataPath}.bak.6`, 'utf8')).vitaflow_todos,
    JSON.stringify(['rotation-0']),
    'the oldest retained backup should contain the seventh preceding revision'
  );
  assert.equal(fs.existsSync(`${dataPath}.bak.7`), false, 'backup retention should stop at seven generations');

  for (const invalidStoredData of [null, [], 'unexpected string', 42]) {
    const invalidStoredText = JSON.stringify(invalidStoredData);
    fs.writeFileSync(dataPath, invalidStoredText);
    const corruptReadRes = await fetch(`${baseUrl}/api/data`, { headers: authHeaders });
    assert.equal(corruptReadRes.status, 500, 'invalid persisted shapes must not be exposed as empty data');
    const corruptWriteRes = await fetch(`${baseUrl}/api/data`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeaders },
      body: JSON.stringify({ patch: { vitaflow_todos: '[]' }, baseRevision: rotationRevision }),
    });
    assert.equal(corruptWriteRes.status, 500, 'invalid persisted data must block overwrites');
    assert.equal(fs.readFileSync(dataPath, 'utf8'), invalidStoredText, 'invalid persisted data must remain recoverable');
  }

  const largeDataPath = path.join(tmpDir, 'large-data.json');
  const defaultLimitServer = createLocalSyncServer({ rootDir: tmpDir, dataPath: largeDataPath, quiet: true, token: TOKEN });
  await new Promise(resolve => defaultLimitServer.listen(0, '127.0.0.1', resolve));
  try {
    const defaultUrl = `http://127.0.0.1:${defaultLimitServer.address().port}/api/data`;
    const emptyState = await (await fetch(defaultUrl, { headers: authHeaders })).json();
    const largeRecord = 'x'.repeat(512 * 1024);
    const largeWriteRes = await fetch(defaultUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeaders },
      body: JSON.stringify({ baseRevision: emptyState.revision, data: { vitaflow_notes: largeRecord } }),
    });
    assert.equal(largeWriteRes.status, 200, 'the default limit should accommodate existing snapshots larger than 414 KB');
    assert.equal(JSON.parse(fs.readFileSync(largeDataPath, 'utf8')).vitaflow_notes, largeRecord);
  } finally {
    await new Promise(resolve => defaultLimitServer.close(resolve));
  }
} finally {
  await new Promise(resolve => server.close(resolve));
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log('local sync server tests passed');
