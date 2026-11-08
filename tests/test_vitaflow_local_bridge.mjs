import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createVitaFlowLocalBridge } from '../scripts/vitaflow-local-bridge.mjs';

const origin = 'https://insistgang.top';
const token = 'synthetic-bridge-token-0123456789abcdef0123456789';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vitaflow-bridge-test-'));
const tokenFile = path.join(root, 'token');
fs.writeFileSync(tokenFile, token + '\n', { mode: 0o600 });
const calls = [];
let reply = async () => new Response(JSON.stringify({ data: { vitaflow_todos: '[]' }, revision: 'synthetic-revision' }), { headers: { 'content-type': 'application/json', 'set-cookie': 'must-not-reach-browser=1' } });

function request(server, { method = 'GET', target = '/api/data', headers = {}, body, omitOrigin = false, omitHost = false } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: server.address().port, method, path: target, setHost: !omitHost,
      headers: { ...(!omitHost ? { host: `127.0.0.1:${server.address().port}` } : {}), ...(!omitOrigin ? { origin } : {}), ...headers } }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
      res.on('error', reject);
    });
    req.on('error', reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}

const server = createVitaFlowLocalBridge({ tokenFile, port: 0, maxRequestBytes: 256, maxResponseBytes: 512, timeoutMs: 150,
  fetchImpl: async (url, options) => { calls.push({ url: String(url), options }); return reply(url, options); },
});

try {
  assert.throws(() => server.listen(0, '0.0.0.0'), /127\.0\.0\.1|loopback/);
  assert.throws(() => server.listen({ fd: 1 }), /loopback|TCP/);
  await new Promise(resolve => server.listen(0, resolve));
  assert.equal(server.address().address, '127.0.0.1');

  for (const headers of [
    { origin: '' }, { origin: 'null' }, { origin: 'https://untrusted.example' },
    { host: 'attacker.example' }, { host: `127.0.0.1:${server.address().port + 1}` },
    { host: `127.0.0.1.attacker.example:${server.address().port}` },
  ]) {
    const response = await request(server, { headers });
    assert.ok([400, 403].includes(response.status));
    assert.equal(response.headers['access-control-allow-origin'], undefined);
    assert.equal(response.body.includes(token), false);
  }
  assert.equal(calls.length, 0, 'invalid browser requests must not reach the upstream');
  assert.equal((await request(server, { omitOrigin: true })).status, 403);
  assert.equal((await request(server, { omitHost: true })).status, 400, 'HTTP/1.1 without a Host is rejected by Node before reaching the bridge');
  assert.equal((await request(server, { headers: { origin: [origin, origin] } })).status, 403);

  for (const target of ['/','/api/public','//attacker.example/api/data','/api/data?key=secret','/api/data?token=secret','/api/data?target=https://attacker.example']) {
    assert.ok([400, 404].includes((await request(server, { target })).status));
  }
  const preflight = await request(server, { method: 'OPTIONS', headers: {
    'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type', 'access-control-request-private-network': 'true',
  } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers['access-control-allow-origin'], origin);
  assert.equal(preflight.headers['access-control-allow-private-network'], 'true');
  assert.equal(preflight.headers['access-control-allow-credentials'], undefined);
  assert.equal(preflight.body, '');
  for (const extra of [
    { 'access-control-request-method': 'DELETE' },
    { 'access-control-request-method': 'POST', 'access-control-request-headers': 'authorization' },
    { 'access-control-request-method': 'POST', 'access-control-request-private-network': 'false' },
    { origin: 'https://untrusted.example', 'access-control-request-method': 'POST', 'access-control-request-private-network': 'true' },
  ]) {
    const response = await request(server, { method: 'OPTIONS', headers: extra });
    assert.equal(response.status, 403);
    assert.equal(response.headers['access-control-allow-private-network'], undefined);
  }
  assert.equal(calls.length, 0, 'preflight must never carry the server token upstream');

  const read = await request(server, { target: '/api/data?t=123&revision=abc', headers: { cookie: 'local_secret=ignored' } });
  assert.equal(read.status, 200);
  assert.equal(read.headers['access-control-allow-origin'], origin);
  assert.equal(read.headers['cache-control'], 'no-store');
  assert.equal(read.headers['set-cookie'], undefined);
  assert.equal(read.body.includes(token), false);
  assert.equal(calls.at(-1).url, 'https://finance.insistgang.top/api/data?t=123&revision=abc');
  assert.equal(calls.at(-1).options.headers['x-vitaflow-token'], token);
  assert.equal(calls.at(-1).options.headers.origin, origin);
  assert.equal(calls.at(-1).options.headers.cookie, undefined);
  assert.equal(calls.at(-1).options.headers.authorization, undefined);
  assert.equal(calls.at(-1).options.redirect, 'error');
  assert.equal(calls.at(-1).options.credentials, 'omit');

  const body = JSON.stringify({ baseRevision: 'abc', patch: { vitaflow_todos: '[]' } });
  const write = await request(server, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
  assert.equal(write.status, 200);
  assert.equal(calls.at(-1).options.body.toString(), body);
  const count = calls.length;
  assert.equal((await request(server, { method: 'POST', body })).status, 415);
  assert.equal((await request(server, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{broken' })).status, 400);
  assert.equal((await request(server, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: 'x'.repeat(300) })).status, 413);
  assert.equal((await request(server, { headers: { 'x-vitaflow-token': 'browser-input-must-not-be-forwarded' } })).status, 400);
  assert.equal(calls.length, count, 'invalid mutations/credentials must not reach upstream');

  reply = async () => new Response(JSON.stringify({ secret: token }), { headers: { 'content-type': 'application/json' } });
  const leaked = await request(server);
  assert.equal(leaked.status, 502);
  assert.equal(leaked.body.includes(token), false);
  reply = async () => new Response('{"secret":"' + [...token].map(char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')).join('') + '"}', { headers: { 'content-type': 'application/json' } });
  const escapedLeak = await request(server);
  assert.equal(escapedLeak.status, 502);
  assert.equal(escapedLeak.body.includes(token), false);
  reply = async () => new Response('x'.repeat(600), { headers: { 'content-type': 'application/json' } });
  assert.equal((await request(server)).status, 502);
  reply = async () => new Response('<html>redirect target</html>', { status: 302, headers: { location: 'https://untrusted.example', 'content-type': 'text/html' } });
  assert.equal((await request(server)).status, 502);
  reply = async (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('synthetic timeout'))));
  assert.equal((await request(server)).status, 504);
  reply = async () => new Promise(() => {});
  assert.equal((await request(server)).status, 504, 'timeout must not rely on upstream transport honoring AbortSignal');
  reply = async () => new Response(new ReadableStream({ start() {} }), { headers: { 'content-type': 'application/json' } });
  assert.equal((await request(server)).status, 504, 'response-body timeout must be bounded');
  reply = async () => { throw Object.assign(new Error(token), { status: 400 }); };
  const unsafeError = await request(server);
  assert.equal(unsafeError.status, 502);
  assert.equal(unsafeError.body.includes(token), false, 'upstream exception messages must never be relayed');

  if (process.platform !== 'win32') {
    fs.chmodSync(tokenFile, 0o644);
    assert.throws(() => createVitaFlowLocalBridge({ tokenFile }), /private/);
    fs.chmodSync(tokenFile, 0o600);
  }
  assert.throws(() => createVitaFlowLocalBridge({ tokenFile, port: -1 }), /port/);
  assert.throws(() => createVitaFlowLocalBridge({ tokenFile, port: 65536 }), /port/);
  console.log('VitaFlow local bridge security tests passed');
} finally {
  if (server.listening) await new Promise(resolve => server.close(resolve));
  fs.rmSync(root, { recursive: true, force: true });
}
