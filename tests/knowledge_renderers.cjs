const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const read = name => fs.readFileSync(path.join(__dirname, '..', 'js', name), 'utf8');

function node(tag) {
  return {
    tag, className: '', textContent: '', hidden: false, title: '',
    children: [], style: {},
    appendChild(child) { this.children.push(child); return child; },
    classList: { add() {}, remove() {}, toggle() {} },
  };
}

function makeDocument(ids) {
  const store = {};
  for (const id of ids) store[id] = node('div');
  // 与 index.html 一致：三个卡片初始带 hidden，渲染成功才解除
  for (const id of ['knowledge-projects', 'knowledge-finance', 'knowledge-energy']) {
    if (store[id]) store[id].hidden = true;
  }
  return {
    store,
    document: {
      readyState: 'complete',
      getElementById: id => store[id] || null,
      createElement: tag => node(tag),
      addEventListener() {},
    },
  };
}

function flatten(el) {
  let out = el.textContent || '';
  for (const child of el.children) out += ' ' + flatten(child);
  return out;
}

function run(file, globals, ids) {
  const { store, document } = makeDocument(ids);
  const window = { ...globals, addEventListener() {} };
  vm.runInNewContext(read(file), { document, window, location: { protocol: 'file:' }, Date, Math, Number });
  return store;
}

test('项目台账渲染卡片并原样转义名称', () => {
  const payload = {
    available: true,
    projects: {
      total: 2,
      truncated: false,
      items: [
        { name: '项目甲', relative: '03-Projects/项目甲', date_hint: null, updated: '2026-11-07T10:00+08:00', file_count: 13, summary: '一句话说明' },
        { name: '<img src=x onerror=alert(1)>', relative: '03-Projects/x.md', date_hint: '2026-10-31', updated: '2026-10-31T09:00+08:00', file_count: 1, summary: null },
      ],
    },
  };
  const ids = ['knowledge-projects', 'knowledge-projects-list', 'knowledge-projects-meta'];
  const store = run('knowledge-projects.js', { __OPS_KNOWLEDGE__: payload }, ids);

  assert.equal(store['knowledge-projects'].hidden, false);
  assert.equal(store['knowledge-projects-list'].children.length, 2);
  const text = flatten(store['knowledge-projects-list']);
  assert.match(text, /项目甲/);
  assert.match(text, /03-Projects\/项目甲/);
  assert.match(text, /<img src=x onerror=alert\(1\)>/, '外部文本必须原样作为文本渲染');
  assert.match(store['knowledge-projects-meta'].textContent, /2/);
});

test('项目台账无数据时整块隐藏', () => {
  const store = run('knowledge-projects.js', { __OPS_KNOWLEDGE__: { available: true, projects: { items: [] } } },
    ['knowledge-projects', 'knowledge-projects-list', 'knowledge-projects-meta']);
  assert.equal(store['knowledge-projects'].hidden, true);
});

test('财务投影渲染概况行与支出标签', () => {
  const payload = {
    available: true,
    finance: {
      month: '2026-11',
      file: '06-Growth/Finance/2026-11-financial-review.md',
      as_of: '消费截至 2026-11-07',
      summary: [
        { label: '已记录支出合计', amount_raw: '746.50', note: '共12笔' },
        { label: '当前可用现金', amount_raw: '43,014.00', note: '' },
      ],
      expenses: [{ label: '订阅AI', amount_raw: '468.00', note: 'DeepSeek 充值' }],
    },
  };
  const ids = ['knowledge-finance', 'knowledge-finance-head', 'knowledge-finance-asof',
    'knowledge-finance-rows', 'knowledge-finance-expenses', 'knowledge-finance-source'];
  const store = run('knowledge-finance.js', { __OPS_KNOWLEDGE__: payload }, ids);

  assert.equal(store['knowledge-finance'].hidden, false);
  assert.equal(store['knowledge-finance-rows'].children.length, 2);
  assert.equal(store['knowledge-finance-expenses'].children.length, 1);
  const text = flatten(store['knowledge-finance-rows']);
  assert.match(text, /746\.50/);
  assert.match(text, /43,014\.00/);
  assert.match(store['knowledge-finance-head'].textContent, /2026-11/);
});

test('财务投影无数据时整块隐藏', () => {
  const store = run('knowledge-finance.js', { __OPS_KNOWLEDGE__: { available: true, finance: { summary: [] } } },
    ['knowledge-finance', 'knowledge-finance-head', 'knowledge-finance-asof',
      'knowledge-finance-rows', 'knowledge-finance-expenses', 'knowledge-finance-source']);
  assert.equal(store['knowledge-finance'].hidden, true);
});

test('日记精力渲染三项指标与七天条形', () => {
  const day = (date, score) => ({
    date,
    file: `01-Daily/2026-11/${date}.md`,
    metrics: { 精力: { score, scale: 10, basis: '' }, 情绪: { score, scale: 10, basis: '' }, 专注: { score, scale: 10, basis: '' } },
    extra: {},
  });
  const payload = { available: true, energy: { days: [day('2026-11-07', 7.8), day('2026-11-06', 6.5)] } };
  const ids = ['knowledge-energy', 'knowledge-energy-label', 'knowledge-energy-rows',
    'knowledge-energy-extra', 'knowledge-energy-source'];
  const store = run('knowledge-energy.js', { __OPS_KNOWLEDGE__: payload }, ids);

  assert.equal(store['knowledge-energy'].hidden, false);
  assert.equal(store['knowledge-energy-rows'].children.length, 3, '三个指标各一行');
  const firstRow = store['knowledge-energy-rows'].children[0];
  assert.equal(firstRow.children[0].textContent, '精力');
  assert.equal(firstRow.children[2].children.length, 2, '两天两根条形');
  assert.match(store['knowledge-energy-label'].textContent, /最近 2 天/);
});

test('日记精力优先用公开快照，且无数据时隐藏', () => {
  const ids = ['knowledge-energy', 'knowledge-energy-label', 'knowledge-energy-rows',
    'knowledge-energy-extra', 'knowledge-energy-source'];
  const publicData = { days: [{ date: '2026-11-07', metrics: { 精力: { score: 5, scale: 10, basis: '' } }, extra: {} }] };
  const shown = run('knowledge-energy.js', { __OPS_PUBLIC_ENERGY__: publicData }, ids);
  assert.equal(shown['knowledge-energy'].hidden, false);
  assert.match(shown['knowledge-energy-label'].textContent, /最近 1 天/);

  const hidden = run('knowledge-energy.js', {}, ids);
  assert.equal(hidden['knowledge-energy'].hidden, true);
});
