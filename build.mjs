#!/usr/bin/env node
/**
 * Ops-Hub 统一构建入口。
 *
 * 三个原生工作区（VitaFlow / 体重 / 财务）以前各自跑各自的 build-native.mjs，
 * 漏跑一个就会出现「源码改了、线上产物没变」的静默漂移——体重深色主题补丁
 * 曾被直接写进生成产物，任何一次重建都会把它抹掉。这里把四条构建收成一条
 * 管线：要么全部生成，要么全部校验，漏跑不可能再发生。
 *
 *   node build.mjs           生成全部产物
 *   node build.mjs --check   校验产物与源码一致（CI / 提交前）
 *
 * 零依赖：只用 Node 内置模块，与「零构建纯净单页」铁律不冲突——本脚本只负责
 * 在开发期合成产物，线上仍是不需要任何构建步骤的静态文件。
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));

const steps = [
  { dir: 'vitaflow', script: 'build-html.mjs', label: 'VitaFlow 独立版 HTML' },
  { dir: 'vitaflow', script: 'build-native.mjs', label: 'VitaFlow 原生工作区' },
  { dir: 'weight-tracker', script: 'build-native.mjs', label: '体重原生工作区' },
  { dir: 'finance', script: 'build-native.mjs', label: '财务原生工作区' },
];

const checkOnly = process.argv.includes('--check');
const verb = checkOnly ? '校验' : '构建';
const failures = [];

for (const step of steps) {
  const cwd = path.join(root, step.dir);
  const args = [path.join(cwd, step.script), ...(checkOnly ? ['--check'] : [])];
  process.stdout.write(`${verb} ${step.label} ... `);
  try {
    execFileSync(process.execPath, args, { cwd, stdio: 'pipe', encoding: 'utf8' });
    console.log('OK');
  } catch (error) {
    console.log('失败');
    // 子进程断言失败时 stderr 带整段堆栈，这里只留真正有用的那行原因
    const raw = String(error.stderr || error.message || '').trim();
    const assertion = raw.match(/AssertionError[^\n]*?:\s*([^\n]+)/);
    const detail = assertion ? assertion[1].trim() : raw.split('\n').slice(0, 3).join('\n').trim();
    if (detail) console.error(`  ${detail}`);
    failures.push(`${step.dir}/${step.script}`);
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} 个步骤失败：${failures.join('、')}`);
  if (checkOnly) console.error('产物与源码不一致，先运行 node build.mjs 重新生成。');
  process.exit(1);
}

console.log(checkOnly ? '\n全部产物与源码一致。' : '\n全部产物已生成。');
