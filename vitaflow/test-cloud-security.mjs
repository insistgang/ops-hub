import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createLocalSyncServer } from './local-sync-server.mjs';

const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vitaflow-cloud-security-'));
const dataPath = path.join(rootDir, 'private.json');
const token = 'synthetic-cloud-token-0123456789abcdef0123456789';
const origin = 'https://example.test';
const headers = { origin, 'x-vitaflow-token': token };
const tokenFile = path.join(rootDir, 'private-token');
fs.writeFileSync(dataPath, JSON.stringify({ vitaflow_todos: '[]' }));
fs.writeFileSync(tokenFile, token, { mode: 0o600 });
fs.writeFileSync(path.join(rootDir, 'schedule-system-2.0.html'), '<title>local app</title>');

try {
  assert.throws(() => createLocalSyncServer({ rootDir, dataPath, cloudMode: 'true', token, allowedOrigins: [origin] }), /boolean/);
  assert.throws(() => createLocalSyncServer({ rootDir, dataPath, cloudMode: true, publicRead: 'true', token, allowedOrigins: [origin] }), /boolean/);
  assert.throws(() => createLocalSyncServer({ rootDir, dataPath, publicRead: true, token }), /cloud/i);
  assert.doesNotThrow(() => createLocalSyncServer({ rootDir, dataPath, cloudMode: true, allowedOrigins: [origin], tokenFile, quiet: true }));
  if (process.platform !== 'win32') {
    fs.chmodSync(tokenFile, 0o640);
    assert.doesNotThrow(() => createLocalSyncServer({ rootDir, dataPath, cloudMode: true, allowedOrigins: [origin], tokenFile, quiet: true }), 'root:service 0640 token files are supported');
    fs.chmodSync(tokenFile, 0o644);
    assert.throws(() => createLocalSyncServer({ rootDir, dataPath, cloudMode: true, allowedOrigins: [origin], tokenFile, quiet: true }), /private/);
    fs.chmodSync(tokenFile, 0o600);
  }
  for (const options of [
    { token, allowedOrigins: [] },
    { token, allowedOrigins: ['*'] },
    { token, allowedOrigins: ['http://example.test'] },
    { token, allowedOrigins: ['https://example.test/path'] },
    { token, allowedOrigins: ['https://user:pass@example.test'] },
    { token: 'short-token', allowedOrigins: [origin] },
  ]) {
    assert.throws(() => createLocalSyncServer({ rootDir, dataPath, cloudMode: true, quiet: true, ...options }),
      'cloud mode must require explicit safe configuration');
  }

  const server = createLocalSyncServer({ rootDir, dataPath, cloudMode: true, allowedOrigins: [origin], token, quiet: true, maxRequestBytes: 1024 });
  assert.throws(() => server.listen(0, '0.0.0.0'), /loopback|回环/i, 'cloud mode must never bind all interfaces');
  assert.throws(() => server.listen({ port: 0, host: '192.0.2.1' }), /loopback|回环/i);
  assert.throws(() => server.listen({ fd: 1 }), /loopback|回环/i, 'inherited sockets must not bypass loopback binding');
  await new Promise(resolve => server.listen(0, resolve));
  assert.equal(server.address().address, '127.0.0.1', 'omitted host must still bind loopback');
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    const unauthenticated = await fetch(`${base}/api/data`, { headers: { origin } });
    assert.equal(unauthenticated.status, 401);
    assert.equal(unauthenticated.headers.get('access-control-allow-origin'), origin);
    assert.equal(unauthenticated.headers.get('vary'), 'Origin');
    assert.equal(unauthenticated.headers.get('access-control-allow-credentials'), 'true');
    const publicDisabled = await fetch(`${base}/api/public`, { headers: { origin } });
    assert.equal(publicDisabled.status, 401, 'public reads must remain disabled by default');
    assert.equal((await publicDisabled.json()).data, undefined);

    const blocked = await fetch(`${base}/api/data`, { headers: { origin: 'https://untrusted.test', 'x-vitaflow-token': token } });
    assert.equal(blocked.status, 403, 'a correct token must not bypass the origin allowlist');
    assert.equal(blocked.headers.get('access-control-allow-origin'), null);
    assert.equal((await blocked.json()).data, undefined);
    const opaque = await fetch(`${base}/api/data`, { headers: { origin: 'null', 'x-vitaflow-token': token } });
    assert.equal(opaque.status, 403, 'opaque origins must be rejected');

    const query = await fetch(`${base}/api/data?key=${token}`, { headers });
    assert.equal(query.status, 400, 'URL credentials must be rejected even alongside a valid header');
    assert.equal(query.headers.get('set-cookie'), null);
    assert.equal((await query.text()).includes(token), false);
    const cookie = await fetch(`${base}/api/data`, { headers: { origin, cookie: `vitaflow_key=${token}` } });
    assert.equal(cookie.status, 401, 'cookies must never authenticate cloud requests');
    const wrong = await fetch(`${base}/api/data`, { headers: { origin, authorization: 'Bearer wrong' } });
    assert.equal(wrong.status, 401);

    const preflight = await fetch(`${base}/api/data`, { method: 'OPTIONS', headers: {
      origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type,x-vitaflow-token',
    } });
    assert.equal(preflight.status, 204, 'approved browser preflight must not require the private token');
    assert.equal(await preflight.text(), '');
    assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
    assert.match(preflight.headers.get('access-control-allow-headers'), /authorization/);
    for (const extra of [
      { origin: 'https://untrusted.test', 'access-control-request-method': 'POST' },
      { origin, 'access-control-request-method': 'DELETE' },
      { origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'x-unexpected' },
      { 'access-control-request-method': 'POST' },
    ]) {
      const response = await fetch(`${base}/api/data`, { method: 'OPTIONS', headers: extra });
      assert.ok([400, 403, 405].includes(response.status), 'unexpected preflight must be rejected');
    }

    const initialResponse = await fetch(`${base}/api/data`, { headers });
    assert.equal(initialResponse.status, 200);
    assert.equal(initialResponse.headers.get('set-cookie'), null);
    assert.equal(initialResponse.headers.get('cache-control'), 'no-store');
    const initial = await initialResponse.json();
    assert.deepEqual(initial.data, { vitaflow_todos: '[]' });
    const bearerResponse = await fetch(`${base}/api/data`, { headers: { authorization: `Bearer ${token}` } });
    assert.equal(bearerResponse.status, 200, 'trusted non-browser clients may use Bearer auth without Origin');
    assert.equal(bearerResponse.headers.get('access-control-allow-origin'), null);

    const unchanged = await fetch(`${base}/api/data?revision=${initial.revision}`, { headers });
    assert.equal(unchanged.status, 304);
    assert.equal(unchanged.headers.get('access-control-allow-origin'), origin);

    const update = { baseRevision: initial.revision, patch: { vitaflow_todos: '[{"id":1,"text":"synthetic"}]' } };
    const rejectedContent = await fetch(`${base}/api/data`, { method: 'POST', headers, body: JSON.stringify(update) });
    assert.equal(rejectedContent.status, 415, 'cloud writes must be JSON, not browser simple-request forms');
    const blockedWrite = await fetch(`${base}/api/data`, { method: 'POST', headers: { ...headers, origin: 'https://untrusted.test', 'content-type': 'application/json' }, body: JSON.stringify(update) });
    assert.equal(blockedWrite.status, 403);
    assert.deepEqual(JSON.parse(fs.readFileSync(dataPath, 'utf8')), initial.data);

    const write = await fetch(`${base}/api/data`, { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(update) });
    assert.equal(write.status, 200);
    const saved = await write.json();
    assert.equal(saved.data.vitaflow_todos, update.patch.vitaflow_todos);
    assert.notEqual(saved.revision, initial.revision);
    assert.ok(fs.existsSync(`${dataPath}.bak`), 'existing backups remain enabled');
    const eventHealth = await fetch(`${base}/api/health?t=1`, { headers });
    const events = (await eventHealth.json()).recentEvents;
    assert.ok(events.some(event => event.keysCount === 1), 'cloud events may report counts without arbitrary payload key names');
    assert.ok(events.every(event => !Object.hasOwn(event, 'keys')));
    const conflict = await fetch(`${base}/api/data`, { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(update) });
    assert.equal(conflict.status, 409, 'cloud mode must preserve optimistic concurrency');
    for (const body of ['{bad json', '[]', 'null']) {
      const malformed = await fetch(`${base}/api/data`, { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body });
      assert.equal(malformed.status, 400);
      assert.equal((await malformed.text()).includes(rootDir), false);
    }
    const oversize = await fetch(`${base}/api/data`, { method: 'PUT', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({ baseRevision: saved.revision, data: { vitaflow_todos: 'x'.repeat(2048) } }) });
    assert.equal(oversize.status, 413);
    const staticResponse = await fetch(`${base}/`, { headers });
    assert.equal(staticResponse.status, 404, 'cloud mode exposes the data API only');

    fs.writeFileSync(dataPath, '{broken-private-data');
    const corrupt = await fetch(`${base}/api/data`, { headers });
    assert.equal(corrupt.status, 500);
    const errorText = await corrupt.text();
    assert.equal(errorText.includes('broken-private-data'), false, 'parse failures must not echo private JSON');
    assert.equal(errorText.includes(rootDir), false, 'parse failures must not disclose filesystem paths');
    assert.equal(errorText.includes(token), false);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  const publicDataPath = path.join(rootDir, 'public-test.json');
  const escapedToken = [...token].map(character => '\\u' + character.charCodeAt(0).toString(16).padStart(4, '0')).join('');
  const publicSource = {
    vitaflow_todos: '[{"id":1,"text":"synthetic public task","completed":false}]',
    vitaflow_accounts: '{"physical":{"score":70,"history":[]}}',
    vitaflow_writing: JSON.stringify([{ title: 'synthetic note', content: `saved ${token}`, apiKey: 'do-not-publish', nested: {
      password: 'also-private', value: 'keep', [token]: 'credential-as-key',
      rows: [{ [`prefix-${token}-suffix`]: 'nested-key-value', [escapedToken]: 'escaped-key-value', encodedContent: escapedToken }],
    } }]),
    vitaflow_learning_notes: '[{"title":"synthetic learning note"}]',
    vitaflow_novel_outlines: '[{"title":"synthetic novel outline","chapters":[]}]',
    vitaflow_ai_chat: 'unselected-private-chat',
    vitaflow_api_key: 'private-key-value',
    vitaflow_unknown_future_key: 'unknown-private-value',
  };
  fs.writeFileSync(publicDataPath, JSON.stringify(publicSource));
  const publicServer = createLocalSyncServer({ rootDir, dataPath: publicDataPath, cloudMode: true, publicRead: true, allowedOrigins: [origin], token, quiet: true });
  await new Promise(resolve => publicServer.listen(0, resolve));
  const publicBase = `http://127.0.0.1:${publicServer.address().port}`;
  try {
    const published = await fetch(`${publicBase}/api/public`, { headers: { origin } });
    assert.equal(published.status, 200, 'explicit public mode permits anonymous reads');
    assert.equal(published.headers.get('cache-control'), 'no-store');
    assert.equal(published.headers.get('access-control-allow-origin'), origin);
    assert.equal(published.headers.get('access-control-allow-methods'), 'GET,OPTIONS');
    assert.equal(published.headers.get('set-cookie'), null);
    const payload = await published.json();
    assert.equal(payload.readOnly, true);
    assert.equal(payload.keys, 5);
    assert.deepEqual(Object.keys(payload.data).sort(), ['vitaflow_accounts', 'vitaflow_learning_notes', 'vitaflow_novel_outlines', 'vitaflow_todos', 'vitaflow_writing']);
    assert.equal(payload.data.vitaflow_novel_outlines, publicSource.vitaflow_novel_outlines, 'authorized novel outlines are published');
    assert.equal(payload.data.vitaflow_todos, publicSource.vitaflow_todos);
    const note = JSON.parse(payload.data.vitaflow_writing)[0];
    assert.equal(note.title, 'synthetic note');
    assert.equal(note.nested.value, 'keep');
    assert.equal(Object.hasOwn(note, 'apiKey'), false);
    assert.equal(Object.hasOwn(note.nested, 'password'), false);
    assert.equal(Object.hasOwn(note.nested, token), false, 'server credentials used as object property names must be removed');
    assert.deepEqual(Object.keys(note.nested.rows[0]), ['encodedContent'], 'deep and Unicode-escaped credential property names must be removed');
    assert.equal(note.nested.rows[0].encodedContent, '[已移除凭据]', 'Unicode-escaped credential values must be redacted');
    assert.equal(JSON.stringify(payload).includes(token), false, 'the server credential must not leak even when copied into an approved record');
    assert.equal(JSON.stringify(payload).includes('private-key-value'), false);
    assert.equal(JSON.stringify(payload).includes('unselected-private-chat'), false);
    assert.equal(typeof payload.revision, 'string');
    assert.equal(typeof payload.updatedAt, 'string');
    const direct = await fetch(`${publicBase}/api/public`);
    assert.equal(direct.status, 200, 'direct public URL reading is supported');
    assert.equal(direct.headers.get('access-control-allow-origin'), null);
    const blockedPublic = await fetch(`${publicBase}/api/public`, { headers: { origin: 'https://untrusted.test' } });
    assert.equal(blockedPublic.status, 403);
    assert.equal((await blockedPublic.json()).data, undefined);
    const privateStillLocked = await fetch(`${publicBase}/api/data`, { headers: { origin } });
    assert.equal(privateStillLocked.status, 401, 'public mode must not unlock the private sync endpoint');
    for (const requestHeaders of [{ origin }, headers]) {
      const rejected = await fetch(`${publicBase}/api/public`, { method: 'POST', headers: { ...requestHeaders, 'content-type': 'application/json' }, body: '{}' });
      assert.equal(rejected.status, 405, 'public endpoint must never accept writes, even with a token');
      assert.equal((await rejected.json()).data, undefined);
    }
    const privateWrite = await fetch(`${publicBase}/api/data`, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: '{}' });
    assert.equal(privateWrite.status, 401, 'anonymous private writes stay blocked');
    const readPreflight = await fetch(`${publicBase}/api/public`, { method: 'OPTIONS', headers: { origin, 'access-control-request-method': 'GET' } });
    assert.equal(readPreflight.status, 204);
    const writePreflight = await fetch(`${publicBase}/api/public`, { method: 'OPTIONS', headers: { origin, 'access-control-request-method': 'POST' } });
    assert.equal(writePreflight.status, 403);
    const unchanged = await fetch(`${publicBase}/api/public?revision=${payload.revision}`, { headers: { origin } });
    assert.equal(unchanged.status, 304);
    assert.equal(unchanged.headers.get('access-control-allow-origin'), origin);
    assert.deepEqual(JSON.parse(fs.readFileSync(publicDataPath, 'utf8')), publicSource, 'public reads and rejected writes must not alter source records');
    fs.writeFileSync(publicDataPath, JSON.stringify({ ...publicSource, vitaflow_api_key: 'changed-private-key' }));
    const afterPrivateChange = await (await fetch(`${publicBase}/api/public`, { headers: { origin } })).json();
    assert.equal(afterPrivateChange.revision, payload.revision, 'public revision must be computed only from the public projection');
    fs.writeFileSync(publicDataPath, `not-json-${token}`);
    const corruptPublic = await fetch(`${publicBase}/api/public`, { headers: { origin } });
    assert.equal(corruptPublic.status, 500);
    assert.equal((await corruptPublic.text()).includes(token), false, 'public error paths must never repeat source credentials');
  } finally {
    await new Promise(resolve => publicServer.close(resolve));
  }

  const guardedToken = JSON.stringify({ ok: false, error: 'Public records are read-only' });
  const guardedServer = createLocalSyncServer({ rootDir, dataPath, cloudMode: true, publicRead: true, allowedOrigins: [origin], token: guardedToken, quiet: true });
  await new Promise(resolve => guardedServer.listen(0, resolve));
  try {
    const guarded = await fetch(`http://127.0.0.1:${guardedServer.address().port}/api/public`, { method: 'POST', headers: { origin } });
    const body = await guarded.text();
    assert.equal(guarded.status, 500, 'the final serialized public-response guard must fail closed if any response body contains the configured token');
    assert.equal(body, '{"ok":false}');
    assert.equal(body.includes(guardedToken), false);
  } finally {
    await new Promise(resolve => guardedServer.close(resolve));
  }

  const dataDir = path.join(rootDir, 'writable-data');
  fs.mkdirSync(dataDir);
  const serverPath = fileURLToPath(new URL('./local-sync-server.mjs', import.meta.url));
  const env = {
    ...process.env,
    VITAFLOW_CLOUD_MODE: '1', VITAFLOW_PUBLIC_READ: '1', VITAFLOW_ALLOWED_ORIGINS: origin,
    VITAFLOW_DATA_DIR: dataDir, VITAFLOW_TOKEN_FILE: tokenFile,
    HOST: '127.0.0.1', PORT: '0',
  };
  const child = spawn(process.execPath, [serverPath], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  try {
    const port = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('cloud CLI did not become ready')), 5000);
      child.once('error', error => { clearTimeout(timer); reject(error); });
      child.once('exit', code => { clearTimeout(timer); reject(new Error(`cloud CLI exited before ready (${code})`)); });
      child.stdout.on('data', () => {
        const match = stdout.match(/loopback port (\d+)/);
        if (match) { clearTimeout(timer); resolve(Number(match[1])); }
      });
    });
    const cliData = await fetch(`http://127.0.0.1:${port}/api/data`, { headers });
    const empty = await cliData.json();
    const cliWrite = await fetch(`http://127.0.0.1:${port}/api/data`, {
      method: 'POST', headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ baseRevision: empty.revision, patch: { vitaflow_todos: '[]' } }),
    });
    assert.equal(cliWrite.status, 200);
    assert.ok(fs.existsSync(path.join(dataDir, 'my-schedule.json')), 'CLI data is written to the separate data directory');
    const cliPublic = await fetch(`http://127.0.0.1:${port}/api/public`, { headers: { origin } });
    assert.equal(cliPublic.status, 200, 'the explicit CLI flag enables anonymous public reads');
    assert.equal(stdout.includes(token), false, 'cloud startup must never print the token');
    assert.equal(stdout.includes(tokenFile), false, 'cloud startup must not log the token file path');
    assert.equal(stderr, '');
  } finally {
    child.kill('SIGTERM');
    await new Promise(resolve => { if (child.exitCode !== null || child.signalCode !== null) resolve(); else child.once('exit', resolve); });
  }
  for (const args of [
    { env: { ...env, HOST: '0.0.0.0' }, arguments: [] },
    { env: { ...env, VITAFLOW_DATA_DIR: '' }, arguments: [] },
    { env: { ...env, VITAFLOW_TOKEN_FILE: '' }, arguments: [] },
    { env: { ...env, VITAFLOW_CLOUD_MODE: 'true' }, arguments: [] },
    { env: { ...env, VITAFLOW_PUBLIC_READ: 'true' }, arguments: [] },
    { env: { ...env, VITAFLOW_CLOUD_MODE: '0' }, arguments: [] },
    { env, arguments: ['--print-token'] },
  ]) {
    const rejected = spawnSync(process.execPath, [serverPath, ...args.arguments], { env: args.env, encoding: 'utf8', timeout: 5000 });
    assert.equal(rejected.status, 1, 'unsafe cloud startup must fail closed');
    assert.equal((rejected.stdout + rejected.stderr).includes(token), false);
  }
} finally {
  fs.rmSync(rootDir, { recursive: true, force: true });
}

console.log('cloud security tests passed');
