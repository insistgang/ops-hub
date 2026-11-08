import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const DEFAULT_HTML_FILE = 'schedule-system-2.0.html';
const DEFAULT_DATA_FILE = 'my-schedule.json';
const TOKEN_FILE = 'sync-token.txt';
const TOKEN_COOKIE = 'vitaflow_key';
const PRIVATE_FILE_MODE = 0o600;
const BACKUP_GENERATIONS = 7;
const DEFAULT_MAX_REQUEST_BYTES = 32 * 1024 * 1024;
const STATIC_FILE_ALIASES = {
  '日程系统2.0.html': DEFAULT_HTML_FILE,
};
const PUBLIC_STATIC_FILES = new Set([DEFAULT_HTML_FILE]);
const CLOUD_METHODS = new Set(['GET', 'POST', 'PUT']);
const CLOUD_HEADERS = new Set(['content-type', 'x-vitaflow-token', 'authorization']);
const responseCorsHeaders = new WeakMap();

function normalizeCloudOrigins(value) {
  const origins = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',').map(item => item.trim()) : [];
  if (!origins.length) throw new Error('cloud mode requires explicit HTTPS allowed origins');
  for (const origin of origins) {
    let parsed;
    try { parsed = new URL(origin); } catch { throw new Error('cloud allowed origin must be an HTTPS origin'); }
    if (parsed.protocol !== 'https:' || parsed.origin !== origin || parsed.username || parsed.password) {
      throw new Error('cloud allowed origin must be an HTTPS origin without a path or credentials');
    }
  }
  return new Set(origins);
}

function readCloudTokenFile(filePath) {
  if (!path.isAbsolute(filePath)) throw new Error('cloud token file must be an absolute path');
  let stat, token;
  try {
    stat = fs.statSync(filePath);
    token = fs.readFileSync(filePath, 'utf8').trim();
  } catch { throw new Error('cloud token file cannot be read'); }
  if (!stat.isFile() || (process.platform !== 'win32' && (stat.mode & 0o037) !== 0)) {
    throw new Error('cloud token file must be private (owner access and optional group read only)');
  }
  return token;
}

function enforceCloudListen(server) {
  const listen = server.listen;
  server.listen = function (...args) {
    const isLoopback = host => host === '127.0.0.1' || host === '::1';
    if (args[0] && typeof args[0] === 'object') {
      const options = { ...args[0] };
      if (!('port' in options) || 'path' in options || 'fd' in options || (options.host !== undefined && !isLoopback(options.host))) {
        throw new Error('cloud mode must bind a loopback address');
      }
      options.host ||= '127.0.0.1';
      args[0] = options;
    } else if (typeof args[0] === 'number') {
      if (typeof args[1] === 'string') {
        if (!isLoopback(args[1])) throw new Error('cloud mode must bind a loopback address');
      } else args.splice(1, 0, '127.0.0.1');
    } else throw new Error('cloud mode must bind a loopback TCP address');
    return listen.apply(this, args);
  };
  return server;
}

function corsHeaders(res) {
  return responseCorsHeaders.get(res) || {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
    'access-control-allow-headers': 'content-type,x-vitaflow-token',
  };
}

export function loadOrCreateToken(rootDir) {
  const envToken = (process.env.VITAFLOW_TOKEN || '').trim();
  if (envToken) return envToken;
  const tokenPath = path.join(rootDir, TOKEN_FILE);
  let existing = '';
  try {
    existing = fs.readFileSync(tokenPath, 'utf8').trim();
  } catch {}
  if (existing) {
    enforcePrivateFileMode(tokenPath);
    return existing;
  }
  const token = crypto.randomBytes(8).toString('hex');
  fs.writeFileSync(tokenPath, token + '\n', { mode: PRIVATE_FILE_MODE });
  enforcePrivateFileMode(tokenPath);
  return token;
}

function enforcePrivateFileMode(filePath) {
  if (process.platform !== 'win32') fs.chmodSync(filePath, PRIVATE_FILE_MODE);
}

function enforcePrivateDataFiles(dataPath) {
  const backupPath = `${dataPath}.bak`;
  const paths = [dataPath, backupPath];
  for (let index = 1; index < BACKUP_GENERATIONS; index += 1) {
    paths.push(`${backupPath}.${index}`);
  }
  for (const filePath of paths) {
    if (fs.existsSync(filePath)) enforcePrivateFileMode(filePath);
  }
}

function isTokenMatch(candidate, token) {
  if (!candidate || !token) return false;
  const a = Buffer.from(String(candidate));
  const b = Buffer.from(String(token));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getRequestToken(req, url, cloudMode = false) {
  if (cloudMode) {
    const headerKey = req.headers['x-vitaflow-token'];
    if (headerKey) return String(headerKey);
    return /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '')?.[1] || '';
  }
  const queryKey = url.searchParams.get('key');
  if (queryKey) return queryKey;
  const headerKey = req.headers['x-vitaflow-token'];
  if (headerKey) return String(headerKey);
  const cookieMatch = (req.headers.cookie || '').match(/(?:^|;\s*)vitaflow_key=([^;]+)/);
  if (cookieMatch) {
    try {
      return decodeURIComponent(cookieMatch[1]);
    } catch {
      return cookieMatch[1];
    }
  }
  return '';
}

function buildTokenCookie(token) {
  return `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`;
}

function normalizeData(data) {
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  const output = {};
  for (const [key, value] of Object.entries(source)) {
    if (key.startsWith('vitaflow_')) {
      output[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
  }
  return output;
}

function isDataObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readJsonFile(dataPath) {
  if (!fs.existsSync(dataPath)) return {};
  enforcePrivateDataFiles(dataPath);
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!isDataObject(data)) {
    throw new Error('数据文件格式无效，需要恢复为 JSON 对象后再同步');
  }
  return normalizeData(data);
}

function createDataRevision(data) {
  return crypto.createHash('sha256').update(JSON.stringify(normalizeData(data))).digest('hex').slice(0, 24);
}

function moveFileReplacing(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath)) return;
  if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
  fs.renameSync(sourcePath, targetPath);
  enforcePrivateFileMode(targetPath);
}

function rotateBackupFiles(backupPath) {
  const oldestPath = `${backupPath}.${BACKUP_GENERATIONS - 1}`;
  if (fs.existsSync(oldestPath)) fs.unlinkSync(oldestPath);
  for (let index = BACKUP_GENERATIONS - 2; index >= 1; index -= 1) {
    moveFileReplacing(`${backupPath}.${index}`, `${backupPath}.${index + 1}`);
  }
  moveFileReplacing(backupPath, `${backupPath}.1`);
}

function preserveValidBackup(dataPath) {
  if (!fs.existsSync(dataPath)) return;
  try {
    readJsonFile(dataPath);
  } catch {
    return;
  }
  const backupPath = `${dataPath}.bak`;
  const tmpBackupPath = `${backupPath}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  try {
    fs.copyFileSync(dataPath, tmpBackupPath);
    enforcePrivateFileMode(tmpBackupPath);
    rotateBackupFiles(backupPath);
    fs.renameSync(tmpBackupPath, backupPath);
    enforcePrivateFileMode(backupPath);
  } finally {
    if (fs.existsSync(tmpBackupPath)) fs.unlinkSync(tmpBackupPath);
  }
}

function writeJsonFile(dataPath, data) {
  const normalized = normalizeData(data);
  if (fs.existsSync(dataPath)) {
    const current = readJsonFile(dataPath);
    const keys = Object.keys(normalized);
    if (keys.length === Object.keys(current).length && keys.every(key => normalized[key] === current[key])) {
      return current;
    }
  }
  const tmpPath = `${dataPath}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(normalized, null, 2), { mode: PRIVATE_FILE_MODE });
    enforcePrivateFileMode(tmpPath);
    preserveValidBackup(dataPath);
    fs.renameSync(tmpPath, dataPath);
    enforcePrivateFileMode(dataPath);
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
  return normalized;
}

function patchJsonFile(dataPath, patch) {
  const current = readJsonFile(dataPath);
  const normalizedPatch = normalizeData(patch);
  for (const key of Object.keys(patch || {})) {
    if (key.startsWith('vitaflow_') && patch[key] === null) {
      delete current[key];
      delete normalizedPatch[key];
    }
  }
  return writeJsonFile(dataPath, { ...current, ...normalizedPatch });
}

function requestError(status, message) {
  return Object.assign(new Error(message), { status });
}

function readRequestJson(req, maxRequestBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;
    let settled = false;
    function fail(error) {
      if (settled) return;
      settled = true;
      chunks.length = 0;
      reject(error);
    }
    function rejectTooLarge() {
      fail(requestError(413, `同步请求超过大小上限（${maxRequestBytes} 字节）`));
    }
    req.on('data', chunk => {
      if (settled) return;
      bytes += chunk.length;
      if (bytes > maxRequestBytes) {
        rejectTooLarge();
        return;
      }
      chunks.push(chunk);
    });
    req.on('error', fail);
    req.on('aborted', () => fail(requestError(400, '同步请求未完整接收')));
    req.on('end', () => {
      if (settled) return;
      let payload;
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        payload = text ? JSON.parse(text) : {};
      } catch {
        fail(requestError(400, '请求体必须是有效 JSON'));
        return;
      }
      if (!isDataObject(payload)) {
        fail(requestError(400, '请求体必须是 JSON 对象'));
        return;
      }
      settled = true;
      resolve(payload);
    });
    if (Number(req.headers['content-length']) > maxRequestBytes) rejectTooLarge();
  });
}

function sendJson(res, status, payload, extraHeaders) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...corsHeaders(res),
    ...(extraHeaders || {}),
  });
  res.end(body);
}

function sendNotModified(res, extraHeaders) {
  res.writeHead(304, {
    'cache-control': 'no-store',
    ...corsHeaders(res),
    ...(extraHeaders || {}),
  });
  res.end();
}

function sendText(res, status, text) {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(text);
}

function sendAuthRequiredPage(res) {
  res.writeHead(401, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end('<!doctype html><html lang="zh"><meta charset="utf-8"><title>需要访问口令</title>'
    + '<body style="font-family:sans-serif;max-width:32em;margin:15vh auto;padding:0 1em;line-height:1.9;color:#444">'
    + '<h2>🔒 需要访问口令</h2>'
    + '<p>请使用启动服务器的终端窗口里显示的完整地址打开本页面（带 <code>?key=</code> 的那种）。</p>'
    + '<p>口令保存在服务器文件夹的 <code>sync-token.txt</code> 里。</p>'
    + '</body></html>');
}

function serveStaticFile(req, res, rootDir, extraHeaders) {
  const url = new URL(req.url, 'http://local');
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = pathname === '/' ? DEFAULT_HTML_FILE : pathname.slice(1);
  const relativePath = STATIC_FILE_ALIASES[requestedPath] || requestedPath;
  if (!PUBLIC_STATIC_FILES.has(relativePath)) {
    sendText(res, 404, 'Not found');
    return;
  }
  const resolved = path.resolve(rootDir, relativePath);
  if (!resolved.startsWith(path.resolve(rootDir) + path.sep) && resolved !== path.resolve(rootDir)) {
    sendText(res, 403, 'Forbidden');
    return;
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    sendText(res, 404, 'Not found');
    return;
  }
  const type = CONTENT_TYPES[path.extname(resolved).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, {
    'content-type': type,
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
    ...(extraHeaders || {}),
  });
  fs.createReadStream(resolved).pipe(res);
}

export function createLocalSyncServer(options = {}) {
  if (options.cloudMode !== undefined && typeof options.cloudMode !== 'boolean') throw new Error('cloudMode must be an explicit boolean');
  const cloudMode = options.cloudMode === true;
  const allowedOrigins = cloudMode ? normalizeCloudOrigins(options.allowedOrigins) : null;
  const rootDir = options.rootDir || __dirname;
  if (cloudMode && !options.dataPath && !options.dataDir) throw new Error('cloud mode requires an explicit data directory or path');
  const dataPath = options.dataPath || path.join(options.dataDir || rootDir, DEFAULT_DATA_FILE);
  if (cloudMode && !path.isAbsolute(dataPath)) throw new Error('cloud data path must be absolute');
  enforcePrivateDataFiles(dataPath);
  const quiet = !!options.quiet;
  const maxRequestBytes = options.maxRequestBytes ?? DEFAULT_MAX_REQUEST_BYTES;
  if (!Number.isSafeInteger(maxRequestBytes) || maxRequestBytes <= 0) {
    throw new Error('maxRequestBytes 必须是正整数');
  }
  const token = cloudMode
    ? (options.tokenFile ? readCloudTokenFile(options.tokenFile) : String(options.token || '').trim())
    : (options.token || '').trim() || loadOrCreateToken(rootDir);
  if (cloudMode && token.length < 32) throw new Error('cloud mode requires a token with at least 32 characters');
  const recentEvents = [];

  function recordEvent(event) {
    const next = {
      time: new Date().toISOString(),
      ...event,
    };
    if (cloudMode && next.keys) {
      next.keysCount = next.keys.length;
      delete next.keys;
    }
    recentEvents.push(next);
    while (recentEvents.length > 80) recentEvents.shift();
    if (!quiet) {
      const detail = next.keys ? ` keys=${next.keys.join(',')}` : '';
      console.log(`[${next.time}] ${next.method || ''} ${next.path || ''} ${next.status || ''}${detail}`);
    }
  }

  function getFileInfo() {
    const data = readJsonFile(dataPath);
    const stat = fs.existsSync(dataPath) ? fs.statSync(dataPath) : null;
    return {
      data,
      revision: createDataRevision(data),
      updatedAt: stat ? stat.mtime.toISOString() : new Date(0).toISOString(),
      keys: Object.keys(data).length,
    };
  }

  const server = http.createServer(async (req, res) => {
    if (cloudMode) {
      responseCorsHeaders.set(res, { vary: 'Origin' });
      res.setHeader('referrer-policy', 'no-referrer');
      res.setHeader('x-content-type-options', 'nosniff');
    }
    try {
      const url = new URL(req.url, 'http://local');
      if (cloudMode) {
        const origin = req.headers.origin;
        if (origin !== undefined && !allowedOrigins.has(origin)) {
          sendJson(res, 403, { ok: false, error: 'Origin is not allowed' });
          return;
        }
        if (origin) {
          responseCorsHeaders.set(res, {
            vary: 'Origin',
            'access-control-allow-origin': origin,
            'access-control-allow-credentials': 'true',
            'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
            'access-control-allow-headers': 'content-type,x-vitaflow-token,authorization',
          });
        }
        if (['key', 'token', 'access_token', 'password', 'authorization'].some(name => url.searchParams.has(name)) || url.username || url.password) {
          sendJson(res, 400, { ok: false, error: 'URL credentials are not accepted' });
          return;
        }
      }
      if (req.method === 'OPTIONS') {
        if (cloudMode) {
          const method = req.headers['access-control-request-method'];
          const requestedHeaders = String(req.headers['access-control-request-headers'] || '')
            .split(',').map(header => header.trim().toLowerCase()).filter(Boolean);
          if (!req.headers.origin || !CLOUD_METHODS.has(method) || requestedHeaders.some(header => !CLOUD_HEADERS.has(header))) {
            sendJson(res, 403, { ok: false, error: 'Preflight is not allowed' });
            return;
          }
        }
        sendJson(res, 204, {});
        return;
      }
      const authed = isTokenMatch(getRequestToken(req, url, cloudMode), token);
      // 用 ?key= 打开时顺便种 cookie，之后不带 key 的书签也能访问
      const cookieHeaders = !cloudMode && authed && url.searchParams.get('key')
        ? { 'set-cookie': buildTokenCookie(token) }
        : null;
      if (url.pathname === '/api/health' && req.method === 'GET') {
        if (!authed) {
          sendJson(res, 200, { ok: true, authRequired: true });
          return;
        }
        const info = getFileInfo();
        sendJson(res, 200, {
          ok: true,
          revision: info.revision,
          updatedAt: info.updatedAt,
          keys: info.keys,
          features: { patch: true, revision: true },
          recentEvents,
        }, cookieHeaders);
        return;
      }
      if (url.pathname.startsWith('/api/') && !authed) {
        recordEvent({
          method: req.method,
          path: url.pathname,
          status: 401,
          remoteAddress: req.socket.remoteAddress,
        });
        sendJson(res, 401, { ok: false, error: '需要访问口令（key）' });
        return;
      }
      if (url.pathname === '/api/data' && req.method === 'GET') {
        const info = getFileInfo();
        if (url.searchParams.get('revision') === info.revision) {
          sendNotModified(res, cookieHeaders);
          return;
        }
        sendJson(res, 200, {
          data: info.data,
          revision: info.revision,
          updatedAt: info.updatedAt,
          keys: info.keys,
          features: { patch: true, revision: true },
        }, cookieHeaders);
        return;
      }
      if (url.pathname === '/api/data' && (req.method === 'POST' || req.method === 'PUT')) {
        if (cloudMode && String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') {
          sendJson(res, 415, { ok: false, error: 'Cloud writes require application/json' });
          return;
        }
        const payload = await readRequestJson(req, maxRequestBytes);
        const currentInfo = getFileInfo();
        if (typeof payload.baseRevision !== 'string') {
          recordEvent({
            method: req.method,
            path: url.pathname,
            status: 428,
            remoteAddress: req.socket.remoteAddress,
          });
          sendJson(res, 428, {
            ok: false,
            error: '写入缺少 baseRevision，请先拉取最新数据',
            data: currentInfo.data,
            revision: currentInfo.revision,
            updatedAt: currentInfo.updatedAt,
            keys: currentInfo.keys,
            features: { patch: true, revision: true },
          }, cookieHeaders);
          return;
        }
        if (payload.baseRevision !== currentInfo.revision) {
          recordEvent({
            method: req.method,
            path: url.pathname,
            status: 409,
            remoteAddress: req.socket.remoteAddress,
          });
          sendJson(res, 409, {
            ok: false,
            error: '服务器数据已被其他设备更新',
            data: currentInfo.data,
            revision: currentInfo.revision,
            updatedAt: currentInfo.updatedAt,
            keys: currentInfo.keys,
            features: { patch: true, revision: true },
          }, cookieHeaders);
          return;
        }
        const hasPatch = isDataObject(payload.patch);
        const hasData = isDataObject(payload.data);
        if (hasPatch === hasData) {
          recordEvent({
            method: req.method,
            path: url.pathname,
            status: 400,
            remoteAddress: req.socket.remoteAddress,
          });
          sendJson(res, 400, {
            ok: false,
            error: '写入必须且只能包含 data 或 patch 之一',
            revision: currentInfo.revision,
          }, cookieHeaders);
          return;
        }
        const isPatch = hasPatch;
        const data = isPatch
          ? patchJsonFile(dataPath, payload.patch)
          : writeJsonFile(dataPath, payload.data);
        const revision = createDataRevision(data);
        recordEvent({
          method: req.method,
          path: url.pathname,
          mode: isPatch ? 'patch' : 'replace',
          status: 200,
          remoteAddress: req.socket.remoteAddress,
          keys: Object.keys(isPatch ? payload.patch : payload.data || payload).filter(key => key.startsWith('vitaflow_')),
        });
        sendJson(res, 200, {
          ok: true,
          data,
          revision,
          updatedAt: fs.statSync(dataPath).mtime.toISOString(),
          keys: Object.keys(data).length,
          features: { patch: true, revision: true },
        }, cookieHeaders);
        return;
      }
      if (cloudMode) {
        sendJson(res, 404, { ok: false, error: 'Not found' });
        return;
      }
      if (!authed) {
        sendAuthRequiredPage(res);
        return;
      }
      serveStaticFile(req, res, rootDir, cookieHeaders);
    } catch (error) {
      if (!res.destroyed && !res.writableEnded) {
        const status = Number.isInteger(error.status) && error.status >= 400 && error.status <= 599 ? error.status : 500;
        sendJson(res, status, { ok: false, error: cloudMode && status >= 500 ? 'Sync service is temporarily unavailable' : error.message });
      }
    }
  });
  return cloudMode ? enforceCloudListen(server) : server;
}

function getLanAddresses() {
  const results = [];
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const item of entries || []) {
      if (item.family === 'IPv4' && !item.internal && isLikelyReachableLanAddress(item.address)) {
        results.push(item.address);
      }
    }
  }
  return results;
}

function isLikelyReachableLanAddress(address) {
  return /^10\./.test(address)
    || /^192\.168\./.test(address)
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(address);
}

if (process.argv[1] === __filename) {
  if (process.env.VITAFLOW_CLOUD_MODE && !['0', '1'].includes(process.env.VITAFLOW_CLOUD_MODE)) {
    console.error('VITAFLOW_CLOUD_MODE must be 1 (cloud) or 0 (local)');
    process.exit(1);
  }
  const cloudMode = process.env.VITAFLOW_CLOUD_MODE === '1';
  if (process.argv.includes('--print-token')) {
    if (cloudMode) {
      console.error('Token printing is disabled in cloud mode');
      process.exit(1);
    }
    console.log(loadOrCreateToken(__dirname));
    process.exit(0);
  }
  const port = Number(process.env.PORT || process.argv[2] || 8787);
  const host = process.env.HOST || (cloudMode ? '127.0.0.1' : '0.0.0.0');
  const maxRequestBytes = process.env.VITAFLOW_MAX_REQUEST_BYTES === undefined
    ? DEFAULT_MAX_REQUEST_BYTES
    : Number(process.env.VITAFLOW_MAX_REQUEST_BYTES);
  try {
    if (cloudMode && (!process.env.VITAFLOW_DATA_DIR || !path.isAbsolute(process.env.VITAFLOW_DATA_DIR))) {
      throw new Error('VITAFLOW_DATA_DIR must be an absolute writable data directory in cloud mode');
    }
    if (cloudMode && !process.env.VITAFLOW_TOKEN_FILE) throw new Error('VITAFLOW_TOKEN_FILE is required in cloud mode');
    const token = cloudMode ? undefined : loadOrCreateToken(__dirname);
    const server = createLocalSyncServer({
      cloudMode, token, maxRequestBytes,
      ...(cloudMode ? {
        allowedOrigins: process.env.VITAFLOW_ALLOWED_ORIGINS,
        dataDir: process.env.VITAFLOW_DATA_DIR,
        tokenFile: process.env.VITAFLOW_TOKEN_FILE,
      } : {}),
    });
    server.listen(port, host, () => {
      if (cloudMode) {
        console.log(`VitaFlow cloud sync API running on loopback port ${server.address().port}; header authentication required`);
        return;
      }
      console.log(`VitaFlow local sync server running:`);
      console.log(`  Local: http://127.0.0.1:${port}/${DEFAULT_HTML_FILE}?key=${token}`);
      for (const address of getLanAddresses()) {
        console.log(`  LAN:   http://${address}:${port}/${DEFAULT_HTML_FILE}?key=${token}`);
      }
      console.log(`  Data:  ${path.join(__dirname, DEFAULT_DATA_FILE)}`);
      console.log(`  Token: ${path.join(__dirname, TOKEN_FILE)} (访问口令，请勿分享给不信任的人)`);
    });
  } catch (error) {
    console.error(cloudMode ? `VitaFlow cloud configuration error: ${error.message}` : error.message);
    process.exitCode = 1;
  }
}
