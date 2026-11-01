import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

for (const file of ['start-tailscale-private.command', 'README-tailscale-private.md']) {
  assert.ok(fs.existsSync(file), `${file} should exist`);
}

execFileSync('/bin/zsh', ['-n', 'start-tailscale-private.command'], { stdio: 'pipe' });

const start = fs.readFileSync('start-tailscale-private.command', 'utf8');
const readme = fs.readFileSync('README-tailscale-private.md', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

assert.ok(start.includes('tailscale status --json'), 'launcher should require a connected tailnet');
assert.ok(start.includes('BackendState'), 'launcher should verify that Tailscale is running');
assert.ok(start.includes('Self.DNSName'), 'launcher should derive the private MagicDNS hostname');
assert.ok(start.includes('HOST=127.0.0.1'), 'VitaFlow must only bind to localhost');
assert.ok(start.includes('authRequired'), 'health check should identify the VitaFlow server');
assert.match(start, /trap\s+['"]?cleanup/, 'launcher should clean up the server it starts');
assert.ok(start.includes('tailscale serve --https=443 "$PORT"'), 'launcher should use foreground HTTPS Serve');
assert.ok(!start.includes('--bg'), 'private sharing should stop when the launcher closes');
assert.ok(!start.includes('tailscale funnel'), 'launcher must never expose VitaFlow publicly');
assert.ok(!/auth[-_]?key/i.test(start), 'launcher must not contain a Tailscale auth key');
assert.ok(start.includes('VITAFLOW_NO_OPEN'), 'automation should be able to suppress browser opening');

assert.ok(readme.includes('tailnet'), 'guide should explain that access stays inside the tailnet');
assert.ok(readme.includes('第二道'), 'guide should preserve the VitaFlow key as a second protection layer');
assert.ok(readme.includes('不要使用 Funnel'), 'guide should explicitly forbid public Funnel access');
assert.ok(pkg.scripts.test.includes('test-tailscale-private.mjs'), 'Tailscale checks should run in npm test');

const mockRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vitaflow-tailscale-'));
try {
  const binDir = path.join(mockRoot, 'bin');
  const stateDir = path.join(mockRoot, 'state');
  fs.mkdirSync(binDir, { recursive: true });
  fs.mkdirSync(stateDir, { recursive: true });

  const writeExecutable = (name, contents) => {
    const target = path.join(binDir, name);
    fs.writeFileSync(target, contents, { mode: 0o755 });
  };

  writeExecutable('tailscale', `#!/bin/zsh
set -eu
print -r -- "$*" >> "$MOCK_STATE/tailscale.log"
if [[ "$1 $2" == "status --json" ]]; then
  print -r -- "{\\"BackendState\\":\\"\${MOCK_TAILSCALE_STATE:-Running}\\",\\"Self\\":{\\"DNSName\\":\\"vitaflow-mac.example.ts.net.\\"}}"
elif [[ "$1 $2" == "serve --https=443" ]]; then
  : > "$MOCK_STATE/serve-ran"
fi
`);

  writeExecutable('node', `#!/bin/zsh
set -eu
if [[ "\${1:-}" == "local-sync-server.mjs" && "\${2:-}" == "--print-token" ]]; then
  print -r -- 'test-private-key'
  exit 0
fi
if [[ "\${1:-}" == "local-sync-server.mjs" ]]; then
  print -r -- "\${HOST:-}" > "$MOCK_STATE/server-host"
  : > "$MOCK_STATE/server-started"
  trap 'print -r -- stopped > "$MOCK_STATE/server-stopped"; exit 0' TERM INT
  while true; do sleep 1; done
fi
exec "$REAL_NODE" "$@"
`);

  writeExecutable('curl', `#!/bin/zsh
if [[ -f "$MOCK_STATE/server-started" ]]; then
  print -r -- '{"ok":true,"authRequired":true}'
  exit 0
fi
exit 22
`);
  writeExecutable('open', '#!/bin/zsh\n: > "$MOCK_STATE/browser-opened"\n');

  const baseEnv = {
    ...process.env,
    MOCK_STATE: stateDir,
    REAL_NODE: process.execPath,
    PATH: `${binDir}:${process.env.PATH}`,
    VITAFLOW_NO_OPEN: '1',
  };

  const disconnected = spawnSync('/bin/zsh', ['start-tailscale-private.command'], {
    cwd: process.cwd(),
    env: { ...baseEnv, MOCK_TAILSCALE_STATE: 'Stopped' },
    encoding: 'utf8',
  });
  assert.equal(disconnected.status, 1, 'a disconnected Tailscale client should block startup');
  assert.equal(fs.existsSync(path.join(stateDir, 'server-started')), false);

  const started = spawnSync('/bin/zsh', ['start-tailscale-private.command'], {
    cwd: process.cwd(),
    env: baseEnv,
    encoding: 'utf8',
    timeout: 5000,
  });
  assert.equal(started.status, 0, started.stderr);
  assert.equal(fs.readFileSync(path.join(stateDir, 'server-host'), 'utf8').trim(), '127.0.0.1');
  assert.ok(fs.existsSync(path.join(stateDir, 'server-stopped')), 'launcher should stop its local server');
  assert.ok(fs.existsSync(path.join(stateDir, 'serve-ran')), 'launcher should start Tailscale Serve');
  assert.match(started.stdout, /https:\/\/vitaflow-mac\.example\.ts\.net\/schedule-system-2\.0\.html\?key=test-private-key/);
  assert.equal(fs.existsSync(path.join(stateDir, 'browser-opened')), false);
} finally {
  fs.rmSync(mockRoot, { recursive: true, force: true });
}

console.log('Tailscale private access tests passed');
