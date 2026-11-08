import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_BRIDGE_PORT = 18789;
const ALLOWED_ORIGIN = 'https://insistgang.top';
const UPSTREAM = 'https://finance.insistgang.top/api/data';
const METHODS = new Set(['GET', 'POST', 'PUT']);
const PREFLIGHT_HEADERS = new Set(['content-type']);
const DEFAULT_LIMIT = 32 * 1024 * 1024;
const DEFAULT_TOKEN_FILE = path.join(os.homedir(), '.config', 'ops-hub', 'vitaflow-sync-token');

class BridgeError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function requestError(status, message) { return new BridgeError(status, message); }

function positiveInteger(value, name, maximum) {
  if (!Number.isSafeInteger(value) || value <= 0 || value > maximum) throw new Error(`${name} is invalid`);
  return value;
}

function portNumber(value) {
  if (!Number.isInteger(value) || value < 0 || value > 65535) throw new Error('bridge port is invalid');
  return value;
}

function readPrivateToken(tokenFile) {
  if (typeof tokenFile !== 'string' || !path.isAbsolute(tokenFile)) throw new Error('bridge token file must be an absolute private file');
  let fd, token;
  try {
    fd = fs.openSync(tokenFile, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size > 4096) throw new Error('invalid token file');
    if (process.platform !== 'win32' && ((stat.mode & 0o077) !== 0 || (typeof process.getuid === 'function' && stat.uid !== process.getuid()))) {
      throw new Error('invalid token permissions');
    }
    const bytes = Buffer.alloc(4097);
    const size = fs.readSync(fd, bytes, 0, bytes.length, 0);
    if (size > 4096) throw new Error('invalid token file');
    token = bytes.subarray(0, size).toString('utf8').trim();
  } catch { throw new Error('bridge token file must be readable, private, and owned by the current user'); }
  finally { if (fd !== undefined) fs.closeSync(fd); }
  if (!/^[A-Za-z0-9_-]{32,512}$/.test(token)) throw new Error('bridge token file contains an invalid token');
  return token;
}

function abortable(promise, signal) {
  return new Promise((resolve, reject) => {
    const aborted = () => reject(requestError(504, 'Sync service timed out'));
    if (signal.aborted) return aborted();
    signal.addEventListener('abort', aborted, { once: true });
    Promise.resolve(promise).then(resolve, reject).finally(() => signal.removeEventListener('abort', aborted));
  });
}

function rawHeaderCount(req, name) {
  let count = 0;
  for (let index = 0; index < req.rawHeaders.length; index += 2) if (req.rawHeaders[index].toLowerCase() === name) count++;
  return count;
}

function sendJson(res, status, payload, cors = false) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
    vary: 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Request-Private-Network',
    ...(cors ? { 'access-control-allow-origin': ALLOWED_ORIGIN } : {}),
  };
  res.writeHead(status, headers);
  res.end(status === 204 || status === 304 ? undefined : JSON.stringify(payload));
}

function readRequestBody(req, maximum, signal) {
  return new Promise((resolve, reject) => {
    let size = 0, settled = false;
    const chunks = [];
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      req.off('data', onData);
      req.off('end', onEnd);
      req.off('aborted', onAborted);
      req.off('error', onError);
      signal.removeEventListener('abort', onTimeout);
      if (error) { req.pause(); reject(error); } else resolve(value);
    };
    const onData = chunk => {
      size += chunk.length;
      if (size > maximum) finish(requestError(413, 'Request is too large'));
      else chunks.push(chunk);
    };
    const onEnd = () => finish(null, Buffer.concat(chunks));
    const onAborted = () => finish(requestError(400, 'Request was interrupted'));
    const onError = () => finish(requestError(400, 'Request could not be read'));
    const onTimeout = () => finish(requestError(504, 'Sync service timed out'));
    if (signal.aborted) return onTimeout();
    if (Number(req.headers['content-length']) > maximum) return finish(requestError(413, 'Request is too large'));
    req.on('data', onData);
    req.on('end', onEnd);
    req.on('aborted', onAborted);
    req.on('error', onError);
    signal.addEventListener('abort', onTimeout, { once: true });
  });
}

async function readUpstreamBody(response, maximum, signal) {
  if (Number(response.headers.get('content-length')) > maximum) throw requestError(502, 'Sync service response is too large');
  const reader = response.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      if (signal.aborted) throw requestError(504, 'Sync service timed out');
      const { done, value } = await abortable(reader.read(), signal);
      if (done) return Buffer.concat(chunks);
      size += value.byteLength;
      if (size > maximum) throw requestError(502, 'Sync service response is too large');
      chunks.push(Buffer.from(value));
    }
  } finally {
    try { void reader.cancel().catch(() => {}); } catch {}
  }
}

function restrictListen(server, defaultPort) {
  const original = server.listen;
  server.listen = function (...args) {
    if (!args.length) args = [defaultPort, '127.0.0.1'];
    if (typeof args[0] === 'object' && args[0] !== null) {
      const options = { ...args[0] };
      if (!Object.hasOwn(options, 'port') || Object.hasOwn(options, 'path') || Object.hasOwn(options, 'fd') ||
          (options.host !== undefined && options.host !== '127.0.0.1')) throw new Error('bridge requires a loopback TCP listener on 127.0.0.1');
      options.port = portNumber(options.port);
      options.host = '127.0.0.1';
      args[0] = options;
    } else if (typeof args[0] === 'number') {
      portNumber(args[0]);
      if (typeof args[1] === 'string') {
        if (args[1] !== '127.0.0.1') throw new Error('bridge requires a loopback listener on 127.0.0.1');
      } else args.splice(1, 0, '127.0.0.1');
    } else throw new Error('bridge requires a loopback TCP listener on 127.0.0.1');
    return original.apply(this, args);
  };
  return server;
}

export function createVitaFlowLocalBridge(options = {}) {
  const configuredPort = portNumber(options.port ?? DEFAULT_BRIDGE_PORT);
  const token = readPrivateToken(options.tokenFile ?? DEFAULT_TOKEN_FILE);
  const maximumRequest = positiveInteger(options.maxRequestBytes ?? DEFAULT_LIMIT, 'request limit', DEFAULT_LIMIT);
  const maximumResponse = positiveInteger(options.maxResponseBytes ?? DEFAULT_LIMIT, 'response limit', DEFAULT_LIMIT);
  const timeoutMs = positiveInteger(options.timeoutMs ?? 15000, 'timeout', 60000);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('Node fetch is required');

  const server = http.createServer(async (req, res) => {
    let cors = false, controller, timer;
    try {
      const actualPort = server.address()?.port;
      if (rawHeaderCount(req, 'host') !== 1 || ![`127.0.0.1:${actualPort}`, `localhost:${actualPort}`].includes(req.headers.host)) {
        throw requestError(403, 'Host is not allowed');
      }
      if (rawHeaderCount(req, 'origin') !== 1 || req.headers.origin !== ALLOWED_ORIGIN) throw requestError(403, 'Origin is not allowed');
      cors = true;
      if (!/^\/api\/data(?:\?[^#]*)?$/.test(req.url) || req.url.length > 2048) throw requestError(404, 'Not found');
      const incoming = new URL(req.url, 'http://127.0.0.1');
      for (const [key, value] of incoming.searchParams) {
        if (!['t', 'revision'].includes(key) || value.length > 256) throw requestError(400, 'Query parameter is not allowed');
      }
      if (req.headers.authorization !== undefined || req.headers['x-vitaflow-token'] !== undefined) throw requestError(400, 'Browser credentials are not accepted');

      if (req.method === 'OPTIONS') {
        const requested = String(req.headers['access-control-request-headers'] || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
        const privateNetwork = req.headers['access-control-request-private-network'];
        if (!METHODS.has(req.headers['access-control-request-method']) || requested.some(value => !PREFLIGHT_HEADERS.has(value)) ||
            (privateNetwork !== undefined && privateNetwork !== 'true')) throw requestError(403, 'Preflight is not allowed');
        res.setHeader('access-control-allow-methods', 'GET,POST,PUT,OPTIONS');
        res.setHeader('access-control-allow-headers', 'content-type');
        if (privateNetwork === 'true') res.setHeader('access-control-allow-private-network', 'true');
        sendJson(res, 204, null, true);
        return;
      }
      if (!METHODS.has(req.method)) throw requestError(405, 'Method is not allowed');
      if (req.method !== 'GET' && String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') {
        throw requestError(415, 'JSON content type is required');
      }
      if (req.method === 'GET' && (Number(req.headers['content-length']) > 0 || req.headers['transfer-encoding'])) throw requestError(400, 'GET bodies are not accepted');

      controller = new AbortController();
      timer = setTimeout(() => controller.abort(), timeoutMs);
      const body = req.method === 'GET' ? undefined : await readRequestBody(req, maximumRequest, controller.signal);
      if (body) {
        let parsed;
        try { parsed = JSON.parse(body.toString('utf8')); } catch { throw requestError(400, 'Valid JSON is required'); }
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw requestError(400, 'A JSON object is required');
      }
      const target = new URL(UPSTREAM);
      target.search = incoming.search;
      const upstream = await abortable(fetchImpl(target.href, {
        method: req.method,
        headers: { origin: ALLOWED_ORIGIN, 'x-vitaflow-token': token, ...(body ? { 'content-type': 'application/json' } : {}) },
        ...(body ? { body } : {}), redirect: 'error', credentials: 'omit', signal: controller.signal,
      }), controller.signal);
      if (upstream.status >= 300 && upstream.status < 400 && upstream.status !== 304) throw requestError(502, 'Upstream redirects are not accepted');
      if (upstream.status === 304 || upstream.status === 204) { sendJson(res, upstream.status, null, true); return; }
      if (!/^application\/json(?:\s*;|$)/i.test(upstream.headers.get('content-type') || '')) throw requestError(502, 'Sync service returned an invalid response');
      const raw = await readUpstreamBody(upstream, maximumResponse, controller.signal);
      if (raw.includes(Buffer.from(token))) throw requestError(502, 'Sync service returned an invalid response');
      let payload;
      try { payload = JSON.parse(raw.toString('utf8')); } catch { throw requestError(502, 'Sync service returned an invalid response'); }
      if (!payload || typeof payload !== 'object' || Array.isArray(payload) || JSON.stringify(payload).includes(token)) {
        throw requestError(502, 'Sync service returned an invalid response');
      }
      sendJson(res, upstream.status, payload, true);
    } catch (error) {
      if (!res.destroyed && !res.writableEnded) {
        const safeError = error instanceof BridgeError;
        const status = controller?.signal.aborted ? 504 : safeError ? error.status : 502;
        sendJson(res, status, { ok: false, error: status === 504 ? 'Sync service timed out' : safeError ? error.message : 'Sync service is unavailable' }, cors);
        if (!req.complete) { res.once('finish', () => req.destroy()); req.pause(); }
      }
    } finally {
      clearTimeout(timer);
      controller?.abort();
    }
  });
  server.requestTimeout = Math.min(timeoutMs + 1000, 61000);
  server.headersTimeout = Math.min(timeoutMs, 10000);
  server.keepAliveTimeout = 1000;
  return restrictListen(server, configuredPort);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const port = process.env.PORT === undefined ? DEFAULT_BRIDGE_PORT : Number(process.env.PORT);
    const server = createVitaFlowLocalBridge({ port });
    server.on('error', () => { console.error('VitaFlow local bridge could not start'); process.exitCode = 1; });
    server.listen(port, '127.0.0.1', () => console.log(`VitaFlow local bridge ready on 127.0.0.1:${server.address().port}`));
  } catch {
    console.error('VitaFlow local bridge configuration is invalid');
    process.exitCode = 1;
  }
}
