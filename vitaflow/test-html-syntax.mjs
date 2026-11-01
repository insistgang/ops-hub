// 安全网：提取 HTML 里所有内联 <script> 块，用 node --check 做语法校验。
// 大规模改动页面 JS 后，先保证没有低级语法错误。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const html = fs.readFileSync('schedule-system-2.0.html', 'utf8');
const blocks = [];
const scriptPattern = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let match;
while ((match = scriptPattern.exec(html)) !== null) {
  if (match[1].trim()) blocks.push({ offset: match.index, code: match[1] });
}

assert.ok(blocks.length >= 2, `expected at least 2 inline script blocks, got ${blocks.length}`);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vitaflow-syntax-'));
try {
  blocks.forEach((block, i) => {
    const file = path.join(tmpDir, `block-${i}.js`);
    fs.writeFileSync(file, block.code);
    try {
      execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    } catch (error) {
      const line = html.slice(0, block.offset).split('\n').length;
      throw new Error(`inline script #${i} (starts at HTML line ${line}) has a syntax error:\n${error.stderr}`);
    }
  });
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log(`html inline script syntax OK (${blocks.length} blocks)`);
