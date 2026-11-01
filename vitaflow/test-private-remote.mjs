import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const requiredFiles = [
  'setup-private-remote.command',
  'start-private-remote.command',
  'cloudflare/config.yml.example',
  'README-cloudflare-private.md',
];

for (const file of requiredFiles) {
  assert.ok(fs.existsSync(file), `${file} should exist`);
}

for (const file of ['setup-private-remote.command', 'start-private-remote.command']) {
  execFileSync('/bin/zsh', ['-n', file], { stdio: 'pipe' });
}

const setup = fs.readFileSync('setup-private-remote.command', 'utf8');
const start = fs.readFileSync('start-private-remote.command', 'utf8');
const template = fs.readFileSync('cloudflare/config.yml.example', 'utf8');
const readme = fs.readFileSync('README-cloudflare-private.md', 'utf8');
const gitignore = fs.readFileSync('.gitignore', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

assert.ok(setup.includes('umask 077'), 'setup should create user-only Cloudflare files');
assert.match(
  setup,
  /\.cloudflared\/?[^\n]*vitaflow\.yml/,
  'the live tunnel config should stay under the user Cloudflare directory'
);
assert.ok(setup.includes('ACCESS READY'), 'DNS activation should require an explicit Access confirmation');
assert.ok(
  setup.indexOf('ACCESS READY') < setup.indexOf('tunnel route dns'),
  'Access confirmation must happen before DNS is published'
);
assert.ok(
  setup.indexOf('tunnel route dns') < setup.indexOf('> "$ACCESS_READY_FILE"'),
  'the activation marker must only be written after the DNS route succeeds'
);
assert.ok(
  setup.indexOf('tunnel route dns') < setup.indexOf('mv -f "$TEMP_CONFIG" "$CONFIG_FILE"'),
  'a new live config must only replace the old config after DNS succeeds'
);

assert.ok(start.includes('.access-ready'), 'remote start should require the Access activation marker');
assert.ok(
  start.indexOf('.access-ready') < start.lastIndexOf('cloudflared tunnel'),
  'the Access marker must be checked before starting the tunnel'
);
assert.ok(start.includes('HOST=127.0.0.1'), 'the remote launcher should bind VitaFlow to localhost only');
assert.ok(start.includes('CONFIRMED_HOSTNAME'), 'the launcher should match the marker to the configured hostname');
assert.ok(start.includes('authRequired'), 'the health check should identify VitaFlow instead of accepting any local web server');
assert.match(start, /trap\s+['"]?cleanup/, 'the remote launcher should clean up the server it starts');
assert.ok(start.includes('--no-autoupdate'), 'the foreground tunnel should not self-update during a session');
assert.ok(start.includes('VITAFLOW_NO_OPEN'), 'automation should be able to suppress browser opening');

for (const [name, source] of [['setup script', setup], ['start script', start]]) {
  assert.ok(!source.includes('--token'), `${name} must not put a tunnel token on the command line`);
  assert.ok(!source.includes('TUNNEL_TOKEN='), `${name} must not persist a tunnel token`);
}

assert.ok(template.includes('tunnel: <TUNNEL_UUID>'), 'example config should use a UUID placeholder');
assert.ok(template.includes('credentials-file:'), 'example config should document the credentials file');
assert.match(
  template,
  /- service:\s*http_status:404\s*$/,
  'the tunnel config should deny every hostname not explicitly configured'
);
assert.ok(
  !/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(template),
  'example config must not contain a real tunnel UUID'
);

for (const pattern of ['.cloudflared/', 'cloudflare/config.yml', 'cloudflare/*.json', 'cloudflare/*.pem']) {
  assert.ok(gitignore.includes(pattern), `.gitignore should protect ${pattern}`);
}

assert.ok(readme.includes('Cloudflare Access'), 'guide should make Cloudflare Access mandatory');
assert.ok(readme.includes('第二道'), 'guide should retain the VitaFlow key as a second protection layer');
assert.ok(readme.includes('不要把'), 'guide should include a clear credential warning');
assert.ok(pkg.scripts.test.includes('test-private-remote.mjs'), 'the private remote checks should run in npm test');

const mockRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vitaflow-cloudflare-'));
try {
  const homeDir = path.join(mockRoot, 'home');
  const binDir = path.join(mockRoot, 'bin');
  const stateDir = path.join(mockRoot, 'state');
  const configPath = path.join(homeDir, '.cloudflared', 'vitaflow.yml');
  const tunnelId = '11111111-2222-4333-8444-555555555555';
  fs.mkdirSync(binDir, { recursive: true });
  fs.mkdirSync(stateDir, { recursive: true });

  const writeExecutable = (name, contents) => {
    const target = path.join(binDir, name);
    fs.writeFileSync(target, contents, { mode: 0o755 });
    return target;
  };

  writeExecutable('cloudflared', `#!/bin/zsh
set -eu
print -r -- "$*" >> "$MOCK_STATE/cloudflared.log"
if [[ "$1 $2" == "tunnel login" ]]; then
  mkdir -p "$HOME/.cloudflared"
  : > "$HOME/.cloudflared/cert.pem"
elif [[ "$1 $2" == "tunnel list" ]]; then
  if [[ -f "$MOCK_STATE/tunnel-created" ]]; then
    print -r -- '[{"id":"${tunnelId}","name":"vitaflow"}]'
  else
    print -r -- '[]'
  fi
elif [[ "$1 $2" == "tunnel create" ]]; then
  mkdir -p "$HOME/.cloudflared"
  print -r -- '{}' > "$HOME/.cloudflared/${tunnelId}.json"
  : > "$MOCK_STATE/tunnel-created"
elif [[ "$1 $2 $3" == "tunnel route dns" ]]; then
  : > "$MOCK_STATE/dns-routed"
elif [[ "$1" == "tunnel" && "$*" == *" run" ]]; then
  : > "$MOCK_STATE/tunnel-ran"
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
if [[ -f "$MOCK_STATE/impostor-server" ]]; then
  print -r -- '{"ok":true}'
  exit 0
fi
exit 22
`);
  writeExecutable('open', '#!/bin/zsh\n: > "$MOCK_STATE/browser-opened"\n');

  const mockEnv = {
    ...process.env,
    HOME: homeDir,
    MOCK_STATE: stateDir,
    REAL_NODE: process.execPath,
    PATH: `${binDir}:${process.env.PATH}`,
    VITAFLOW_CLOUDFLARED_CONFIG: configPath,
    VITAFLOW_NO_OPEN: '1',
  };

  const rejectedSetup = spawnSync(
    '/bin/zsh',
    ['setup-private-remote.command', 'vitaflow.example.com'],
    { cwd: process.cwd(), env: mockEnv, input: 'NOT READY\n', encoding: 'utf8' }
  );
  assert.equal(rejectedSetup.status, 1, rejectedSetup.stderr);
  assert.equal(fs.existsSync(path.join(stateDir, 'dns-routed')), false, 'DNS must stay unpublished without Access confirmation');
  assert.equal(fs.existsSync(`${configPath}.access-ready`), false, 'rejected setup must not create an Access marker');

  const acceptedSetup = spawnSync(
    '/bin/zsh',
    ['setup-private-remote.command', 'vitaflow.example.com'],
    { cwd: process.cwd(), env: mockEnv, input: 'ACCESS READY\n', encoding: 'utf8' }
  );
  assert.equal(acceptedSetup.status, 0, acceptedSetup.stderr);
  assert.ok(fs.existsSync(path.join(stateDir, 'dns-routed')), 'confirmed setup should publish the DNS route');
  assert.ok(fs.existsSync(`${configPath}.access-ready`), 'confirmed setup should create the Access marker');

  const routesBeforeReconfigure = fs.readFileSync(path.join(stateDir, 'cloudflared.log'), 'utf8')
    .split('\n')
    .filter(line => line.startsWith('tunnel route dns')).length;
  const rejectedReconfigure = spawnSync(
    '/bin/zsh',
    ['setup-private-remote.command', 'new-vitaflow.example.com'],
    { cwd: process.cwd(), env: mockEnv, input: 'NOT READY\n', encoding: 'utf8' }
  );
  assert.equal(rejectedReconfigure.status, 1, rejectedReconfigure.stderr);
  assert.ok(fs.existsSync(`${configPath}.access-ready`), 'rejected reconfiguration should keep the last valid marker');
  assert.ok(fs.readFileSync(configPath, 'utf8').includes('vitaflow.example.com'), 'rejected reconfiguration should keep the last valid config');
  assert.ok(!fs.readFileSync(configPath, 'utf8').includes('new-vitaflow.example.com'));
  const routesAfterReconfigure = fs.readFileSync(path.join(stateDir, 'cloudflared.log'), 'utf8')
    .split('\n')
    .filter(line => line.startsWith('tunnel route dns')).length;
  assert.equal(routesAfterReconfigure, routesBeforeReconfigure, 'rejected reconfiguration must not publish another DNS route');

  if (process.platform !== 'win32') {
    assert.equal(fs.statSync(configPath).mode & 0o777, 0o600, 'live tunnel config should be user-only');
    assert.equal(fs.statSync(`${configPath}.access-ready`).mode & 0o777, 0o600, 'Access marker should be user-only');
  }

  const validMarker = fs.readFileSync(`${configPath}.access-ready`, 'utf8');
  fs.writeFileSync(`${configPath}.access-ready`, validMarker.replace('vitaflow.example.com', 'wrong.example.com'));
  const mismatchedStart = spawnSync('/bin/zsh', ['start-private-remote.command'], {
    cwd: process.cwd(),
    env: mockEnv,
    encoding: 'utf8',
  });
  assert.equal(mismatchedStart.status, 1, 'a stale Access marker should block startup');
  assert.equal(fs.existsSync(path.join(stateDir, 'tunnel-ran')), false);
  assert.equal(fs.existsSync(path.join(stateDir, 'server-started')), false);
  fs.writeFileSync(`${configPath}.access-ready`, validMarker, { mode: 0o600 });

  fs.writeFileSync(path.join(stateDir, 'impostor-server'), 'running');

  const remoteStart = spawnSync('/bin/zsh', ['start-private-remote.command'], {
    cwd: process.cwd(),
    env: mockEnv,
    encoding: 'utf8',
    timeout: 5000,
  });
  assert.equal(remoteStart.status, 0, remoteStart.stderr);
  assert.equal(fs.readFileSync(path.join(stateDir, 'server-host'), 'utf8').trim(), '127.0.0.1');
  assert.ok(fs.existsSync(path.join(stateDir, 'server-stopped')), 'launcher should stop the server it owns');
  assert.ok(fs.existsSync(path.join(stateDir, 'tunnel-ran')), 'launcher should run the configured tunnel');
  assert.match(remoteStart.stdout, /https:\/\/vitaflow\.example\.com\/schedule-system-2\.0\.html\?key=test-private-key/);
  assert.equal(fs.existsSync(path.join(stateDir, 'browser-opened')), false, 'headless mode should not open a browser');
} finally {
  fs.rmSync(mockRoot, { recursive: true, force: true });
}

console.log('private remote access tests passed');
