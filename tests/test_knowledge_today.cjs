const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../js/knowledge-today.js'), 'utf8');

function node(tag) {
  return {
    tag, className: '', textContent: '', hidden: false, title: '', children: [],
    appendChild(child) { this.children.push(child); return child; },
    text(child) { this.textContent = child; },
  };
}

function setup(knowledge) {
  const ids = {};
  for (const id of ['knowledge-card', 'knowledge-date', 'knowledge-direction', 'knowledge-capacity',
    'knowledge-warning', 'knowledge-items', 'knowledge-empty', 'hard-nodes-count',
    'hard-nodes-list', 'hard-nodes-empty', 'knowledge-wip', 'knowledge-wip-list']) {
    ids[id] = node('div');
  }
  ids['knowledge-card'].hidden = true;
  const grid = node('div');
  grid.classList = { values: [], add(name) { this.values.push(name); } };
  const document = {
    readyState: 'complete',
    getElementById: id => ids[id] || null,
    createElement: tag => node(tag),
    querySelector: selector => (selector === '.today-grid' ? grid : null),
    addEventListener() {},
  };
  const window = { __OPS_KNOWLEDGE__: knowledge };
  vm.runInNewContext(source, { document, window, Number });
  ids.__grid = grid;
  return ids;
}

const sample = {
  available: true,
  warnings: [],
  today_plan: {
    date: '2026-11-07', is_today: true, file: '2026-11-07.md',
    direction: '先把本人动作做掉。', capacity: '七成',
    items: [{
      n: 1, tag: 'P0·大论文', title: '过第一批 10 张', assignee: '必须本人',
      done_standard: '把 10 行填上字', estimate: '45--60 分钟', first_step: '双击启动器',
    }],
  },
  wip: {
    items: [
      { position: '1／首要', title: '小论文终读与投稿', assignee: '先 AI 起草、后本人终判', action: '比对投稿须知' },
      { position: '3／机动', title: '六级备考', assignee: '必须本人', action: '' },
    ],
  },
  hard_nodes: {
    active: [
      { kind: 'node', date: '2026-11-15', type: '里程碑', title: '全图复核目标', days_left: 8 },
      { kind: 'node', date: '2026-12-12', type: '考试', title: '六级笔试', days_left: 35 },
    ],
    overdue: [
      { kind: 'node', date: '2026-10-27', type: '续费', title: '过期项', days_left: -11, overdue_days: 11 },
    ],
  },
};

test('无私有快照时整块隐藏，不渲染任何内容', () => {
  const ids = setup(undefined);
  assert.equal(ids['knowledge-card'].hidden, true);
  assert.equal(ids['knowledge-items'].children.length, 0);

  const unavailable = setup({ available: false, error: '知识库目录不存在' });
  assert.equal(unavailable['knowledge-card'].hidden, true);
});

test('渲染今日必做的标签、标题与完成标准', () => {
  const ids = setup(sample);
  assert.equal(ids['knowledge-card'].hidden, false);
  assert.match(ids['knowledge-date'].textContent, /2026-11-07/);

  const items = ids['knowledge-items'].children;
  assert.equal(items.length, 1);
  const [head, meta, std] = items[0].children;
  assert.equal(head.children[0].textContent, 'P0·大论文');
  assert.equal(head.children[1].textContent, '过第一批 10 张');
  assert.match(meta.textContent, /必须本人/);
  assert.match(meta.textContent, /45--60 分钟/);
  assert.match(std.textContent, /把 10 行填上字/);
});

test('硬节点按剩余天数分级并置顶逾期项', () => {
  const ids = setup(sample);
  const rows = ids['hard-nodes-list'].children;
  assert.equal(rows.length, 3);
  assert.equal(rows[0].className, 'knowledge-node knowledge-node--overdue');
  assert.equal(rows[0].children[0].textContent, '逾期 11 天');
  assert.equal(rows[1].className, 'knowledge-node knowledge-node--soon');
  assert.equal(rows[1].children[0].textContent, '8 天后');
  assert.equal(rows[2].className, 'knowledge-node knowledge-node--normal');
  assert.equal(rows[2].children[0].textContent, '35 天后');
  assert.equal(ids['hard-nodes-count'].textContent, '3 条');
});

test('降级信息显示在提示区', () => {
  const ids = setup({ ...sample, warnings: ['缺少今日计划，已回退到 2026-11-06'] });
  assert.equal(ids['knowledge-warning'].hidden, false);
  assert.match(ids['knowledge-warning'].textContent, /已回退/);

  const clean = setup(sample);
  assert.equal(clean['knowledge-warning'].hidden, true);
});

test('渲染当前 WIP 三件事', () => {
  const ids = setup(sample);
  const box = ids['knowledge-wip'];
  assert.equal(box.hidden, false);
  const rows = ids['knowledge-wip-list'].children;
  assert.equal(rows.length, 2);
  assert.equal(rows[0].children[0].textContent, '1／首要');
  assert.equal(rows[0].children[1].textContent, '小论文终读与投稿');
  assert.equal(rows[0].children[1].title, '比对投稿须知');
  assert.match(rows[0].children[2].textContent, /先 AI 起草/);

  const empty = setup({ ...sample, wip: { items: [] } });
  assert.equal(empty['knowledge-wip'].hidden, true);
});

test('无知识库时给栅格加单列降级类', () => {
  const ids = setup(undefined);
  assert.deepEqual(ids.__grid.classList.values, ['no-knowledge']);

  const withData = setup(sample);
  assert.deepEqual(withData.__grid.classList.values, []);
});
