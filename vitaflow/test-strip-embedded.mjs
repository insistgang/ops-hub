import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { stripEmbeddedData } from './strip-embedded-data.mjs';

const sample = [
  '<head>',
  '    <script>window.EMBEDDED_DATA = {"vitaflow_todos":"[{\\"text\\":\\"秘密内容\\u003cb\\u003e\\"}]"};</script>',
  '    <script src="local-helper.js"></script>',
  '</head>',
].join('\n');

const stripped = stripEmbeddedData(sample);
assert.ok(!stripped.includes('window.EMBEDDED_DATA'), 'embedded data should be removed');
assert.ok(!stripped.includes('秘密内容'), 'private content should be removed');
assert.ok(stripped.includes('local-helper.js'), 'other scripts must survive');

// 产出的占位符必须能被 sync-json-into-html.mjs 的占位符正则重新识别
const placeholderPattern = /<script>\s*\/\*\s*__EMBEDDED_DATA_PLACEHOLDER__\s*\*\/\s*<\/script>/;
assert.ok(placeholderPattern.test(stripped), 'placeholder must match sync-json-into-html pattern');

// 幂等：对已剥离的内容再跑一遍不变
assert.equal(stripEmbeddedData(stripped), stripped, 'strip should be idempotent');

const duplicateSample = [
  '<head>',
  '    <script>window.EMBEDDED_DATA = {"vitaflow_todos":"old secret one"};</script>',
  '    <script>/* __EMBEDDED_DATA_PLACEHOLDER__ */</script>',
  '    <script>window.EMBEDDED_DATA = {"vitaflow_todos":"old secret two"};</script>',
  '    <script>const marker = "__vitaflow_embedded_restore_signature";</script>',
  '</head>',
].join('\n');
const deduplicated = stripEmbeddedData(duplicateSample);
assert.equal(
  (deduplicated.match(/__EMBEDDED_DATA_PLACEHOLDER__/g) || []).length,
  1,
  'clean filter should collapse duplicate data slots to one placeholder'
);
assert.ok(!deduplicated.includes('old secret one'));
assert.ok(!deduplicated.includes('old secret two'));
assert.ok(!/<script>window\.EMBEDDED_DATA\s*=/.test(deduplicated));

const unsupportedDataBlocks = [
  '<script>\nwindow.EMBEDDED_DATA = {"secret":"synthetic-private-record"};</script>',
  '<script type="text/javascript">window.EMBEDDED_DATA = {"secret":"synthetic-private-record"};</script>',
  '<script>window.EMBEDDED_DATA = {"secret":"synthetic-private-record";</script>',
];
for (const html of unsupportedDataBlocks) {
  assert.throws(() => stripEmbeddedData(html), /refusing/i, 'unrecognized embedded data must fail instead of returning private data');
}
const exportScript = '<script>const block = \'<script>window.EMBEDDED_DATA = \' + safe + \';<\\/script>\';</script>';
assert.equal(stripEmbeddedData(exportScript), exportScript, 'the export function source must not be mistaken for a data snapshot');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vitaflow-embed-'));
try {
  const cliDir = path.join(tmpDir, '中文 path %');
  fs.mkdirSync(cliDir);
  const cliPath = path.join(cliDir, 'strip-embedded-data.mjs');
  fs.copyFileSync('strip-embedded-data.mjs', cliPath);
  const cliOutput = execFileSync(process.execPath, [cliPath], {
    input: duplicateSample,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  assert.equal(cliOutput, deduplicated, 'clean filter CLI must emit the complete sanitized HTML from a Chinese/space path');
  assert.equal(execFileSync(process.execPath, [cliPath], {
    input: '<html><body>safe content</body></html>',
    encoding: 'utf8',
  }), '<html><body>safe content</body></html>', 'clean filter CLI must preserve pages without embedded data');
  assert.throws(() => execFileSync(process.execPath, [cliPath], {
    input: unsupportedDataBlocks[2],
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }), error => error.status !== 0 && error.stdout === '' && !error.stderr.includes('synthetic-private-record'), 'a failed clean filter must exit nonzero without emitting private content');

  const htmlPath = path.join(tmpDir, 'schedule.html');
  const jsonPath = path.join(tmpDir, 'data.json');
  fs.writeFileSync(htmlPath, duplicateSample);
  fs.writeFileSync(jsonPath, JSON.stringify({ vitaflow_todos: '[{"text":"new <private>"}]' }));
  execFileSync(process.execPath, ['sync-json-into-html.mjs', htmlPath, jsonPath], {
    cwd: process.cwd(),
    stdio: 'pipe',
  });
  const synced = fs.readFileSync(htmlPath, 'utf8');
  assert.equal(
    (synced.match(/<script>window\.EMBEDDED_DATA\s*=/g) || []).length,
    1,
    'syncing an HTML file repeatedly should leave exactly one embedded assignment'
  );
  assert.ok(!synced.includes('old secret one'));
  assert.ok(!synced.includes('old secret two'));
  assert.ok(synced.includes('new \\u003cprivate>'), 'embedded JSON should keep script-breaking characters escaped');
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// 对真实文件生效，且体积显著缩小
// 注意：页面 JS 代码里也合法地含有 window.EMBEDDED_DATA 字符串（导出功能的正则与拼接），
// 所以只断言"赋值块"被移除，而不是字符串完全消失
const assignmentBlock = /<script>window\.EMBEDDED_DATA\s*=\s*\{/;
const realHtml = fs.readFileSync('schedule-system-2.0.html', 'utf8');
if (assignmentBlock.test(realHtml)) {
  const realStripped = stripEmbeddedData(realHtml);
  assert.ok(!assignmentBlock.test(realStripped), 'real embedded assignment block should be removed');
  assert.ok(realStripped.length < realHtml.length, 'stripped file should be smaller');
  assert.ok(realStripped.includes('__vitaflow_embedded_restore_signature'), 'restore guard must survive');
}

console.log('strip embedded data tests passed');
