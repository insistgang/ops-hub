const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

/** index.html 中引用的本地 js/css 资源（外链 CDN、图标不在管辖范围）。 */
function localAssets(html) {
  const assets = [];
  // <script src="..."> 与 <link rel="stylesheet" href="...">
  const patterns = [
    /<script\b[^>]*?\bsrc="([^"]+)"/g,
    /<link\b[^>]*?\brel="stylesheet"[^>]*?\bhref="([^"]+)"/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const url = match[1];
      if (/^https?:/i.test(url) || url.startsWith('//')) continue;
      assets.push(url);
    }
  }
  return assets;
}

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim();
}

function hasGit() {
  try {
    git(['rev-parse', '--git-dir']);
    git(['rev-parse', '--verify', 'HEAD']);
    return true;
  } catch (_) {
    return false;
  }
}

const assets = localAssets(indexHtml);
const withQuery = assets.map((url) => {
  const [file, query] = url.split('?');
  const version = new URLSearchParams(query || '').get('v');
  return { url, file, version };
});

test('每个本地资源都带 ?v= 版本号', () => {
  assert.ok(assets.length > 0, 'index.html 未解析到任何本地资源，选择器可能失效');
  const missing = withQuery.filter((asset) => !asset.version).map((asset) => asset.file);
  assert.deepEqual(missing, [], `以下资源缺少 ?v= 版本号：${missing.join('、')}`);
});

test('引用的资源文件真实存在', () => {
  const absent = withQuery.filter((asset) => !fs.existsSync(path.join(root, asset.file)));
  assert.deepEqual(absent.map((a) => a.file), [], 'index.html 引用了不存在的文件');
});

test('修改过的前端文件必须同步提升版本号', { skip: hasGit() ? false : '当前目录不是完整 Git 仓库' }, () => {
  const headHtml = git(['show', 'HEAD:index.html']);
  const headVersions = new Map(
    localAssets(headHtml)
      .map((url) => url.split('?'))
      .map(([file, query]) => [file, new URLSearchParams(query || '').get('v')]),
  );

  const stale = [];
  for (const asset of withQuery) {
    // data/*.js 由运行时 fetch(...?t=) 兜底，改动不强制升版本
    if (asset.file.startsWith('data/')) continue;
    let dirty;
    try {
      git(['diff', '--quiet', 'HEAD', '--', asset.file]);
      dirty = false;
    } catch (_) {
      dirty = true;
    }
    if (dirty && headVersions.get(asset.file) === asset.version) stale.push(asset.file);
  }

  assert.deepEqual(
    stale,
    [],
    `这些文件已改动但 index.html 未提升版本号，浏览器会继续用旧缓存：${stale.join('、')}`,
  );
});
