import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const cliTmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vitaflow-build-'));
try {
  const cliDir = path.join(cliTmpDir, '中文 path %');
  fs.mkdirSync(cliDir);
  const cliPath = path.join(cliDir, 'build-html.mjs');
  fs.copyFileSync('build-html.mjs', cliPath);
  for (const directory of ['src', 'vendor']) {
    fs.symlinkSync(path.resolve(directory), path.join(cliDir, directory), 'dir');
  }
  execFileSync(process.execPath, [cliPath], { cwd: cliDir, stdio: 'pipe' });
  const cliOutputPath = path.join(cliDir, 'schedule-system-2.0.html');
  assert.ok(fs.existsSync(cliOutputPath), 'build CLI must create HTML when its path contains Chinese/space characters');
  const cliHtml = fs.readFileSync(cliOutputPath, 'utf8');
  assert.ok(cliHtml.includes('function initData()'), 'build CLI must emit application code instead of an empty file');
  assert.ok(cliHtml.includes('__EMBEDDED_DATA_PLACEHOLDER__'), 'a clean build must use a data placeholder');
  const sampleDataBlock = '<script>window.EMBEDDED_DATA = {"vitaflow_todos":"[{\\"text\\":\\"synthetic record\\"}]"};</script>';
  fs.writeFileSync(cliOutputPath, cliHtml.replace('<script>/* __EMBEDDED_DATA_PLACEHOLDER__ */</script>', sampleDataBlock));
  execFileSync(process.execPath, [cliPath], { cwd: cliDir, stdio: 'pipe' });
  const rebuiltHtml = fs.readFileSync(cliOutputPath, 'utf8');
  assert.ok(rebuiltHtml.includes(sampleDataBlock), 'rebuilding must preserve an existing embedded snapshot exactly');
  execFileSync(process.execPath, [cliPath, '--check'], { cwd: cliDir, stdio: 'pipe' });
  const secretSentinel = 'private-check-sentinel';
  fs.writeFileSync(cliOutputPath, `${rebuiltHtml}\n<!-- ${secretSentinel} -->`);
  assert.throws(() => execFileSync(process.execPath, [cliPath, '--check'], {
    cwd: cliDir,
    stdio: 'pipe',
  }), error => !String(error.stderr).includes(secretSentinel),
  'build CLI --check must fail without printing private HTML content');
} finally {
  fs.rmSync(cliTmpDir, { recursive: true, force: true });
}

[
  'src/schedule-template.html',
  'src/styles.css',
  'src/app.js',
  'src/modules/date-utils.js',
  'src/modules/dashboard-stats.js',
  'src/modules/initial-data.js',
  'src/modules/media-docs.js',
  'src/modules/idea-vault.js',
  'src/modules/sync-and-backup.js',
  'src/modules/boot.js',
  'vendor/chartjs/chart.umd.min.js',
  'vendor/fontawesome/css/all.min.css',
  'build-html.mjs',
].forEach(file => {
  assert.ok(fs.existsSync(file), `${file} should exist`);
});

execFileSync(process.execPath, ['build-html.mjs', '--check'], { stdio: 'pipe' });

const html = fs.readFileSync('schedule-system-2.0.html', 'utf8');
assert.ok(!html.includes('\r'), 'generated HTML should use stable LF line endings');
assert.ok(!/[ \t]+$/m.test(html), 'generated HTML should not contain trailing whitespace');
assert.ok(!html.includes('cdn.jsdelivr.net/npm/chart.js'), 'generated HTML should not load Chart.js from CDN');
assert.ok(!html.includes('cdnjs.cloudflare.com/ajax/libs/font-awesome'), 'generated HTML should not load Font Awesome from CDN');
assert.ok(!html.includes('../webfonts/'), 'generated HTML should inline every Font Awesome webfont');
assert.ok(html.includes('Chart.js v4.4.0'), 'generated HTML should inline the vendored Chart.js runtime');
assert.ok(html.includes('Font Awesome 6'), 'generated HTML should inline the vendored Font Awesome CSS');
assert.ok(html.includes('var module = undefined;'), 'vendored UMD scripts should run in browser-global mode');
assert.ok(html.includes('function initData()'), 'initial data module should be inlined into generated HTML');
assert.ok(html.includes('function formatLocalDate('), 'date utility module should be inlined into generated HTML');
assert.ok(html.includes('function getCompletedTaskTrend('), 'dashboard stats module should be inlined into generated HTML');
assert.ok(!/<button[^>]*\bstyle="[^"]*"[^>]*\bstyle="[^"]*"[^>]*id="stopPomodoroBtn"/.test(html), 'stop button must not contain duplicate style attributes');
assert.ok(/id="stopPomodoroBtn"[^>]*style="[^"]*display:\s*none/.test(html) || /style="[^"]*display:\s*none[^"]*"[^>]*id="stopPomodoroBtn"/.test(html), 'stop button should be hidden before a timer starts');
assert.ok(html.includes('function renderIdeaVault()'), 'idea vault module should be inlined into generated HTML');
assert.ok(html.includes('async function bootVitaFlow()'), 'boot module should be inlined into generated HTML');

const chartScript = Array.from(html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g))
  .map(match => match[1])
  .find(code => code.includes('Chart.js v4.4.0'));
assert.ok(chartScript, 'generated HTML should contain an inline Chart.js script block');

const browserLikeGlobal = {
  console,
  requestAnimationFrame: () => 0,
  setTimeout,
  clearTimeout,
};
browserLikeGlobal.window = browserLikeGlobal;
browserLikeGlobal.self = browserLikeGlobal;
vm.runInNewContext(chartScript, browserLikeGlobal, { timeout: 1000 });
assert.equal(browserLikeGlobal.window.Chart?.version, '4.4.0', 'vendored Chart.js should attach to window.Chart');

console.log('build html tests passed');
