const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(style = null, dark = false) {
  const source = fs.readFileSync(path.join(__dirname, '../vitaflow/src/app.js'), 'utf8');
  const start = source.indexOf('// VITAFLOW_CHART_THEME_START');
  const end = source.indexOf('// VITAFLOW_CHART_THEME_END');
  assert.ok(start >= 0 && end > start, 'chart theme adapter must be present');
  let observer;
  const root = { getAttribute: () => style, classList: { contains: name => name === 'dark' && dark } };
  class Chart {
    constructor(ctx, config) { this.config = config; this.data = config.data; this.options = config.options; this.updates = 0; }
    update() { this.updates += 1; }
    destroy() { for (const plugin of this.config.plugins || []) plugin.afterDestroy?.(this); }
  }
  const window = {
    document: { documentElement: root },
    addEventListener() {},
    MutationObserver: class { constructor(callback) { observer = callback; } observe() {} },
  };
  const context = vm.createContext({ window, document: window.document, Chart, console });
  vm.runInContext(source.slice(start, end), context);
  return {
    create(config) { return context.createVitaFlowChart({}, config); },
    switchStyle(value, isDark = false) { style = value; dark = isDark; observer?.(); },
  };
}

function config() {
  return { type: 'line', data: { datasets: [{
    data: [1, 2, null, 4],
    borderColor: ['#e88a4c', '#c4679c', '#8b5e9e', '#a78bfa'],
    backgroundColor: 'rgba(196, 103, 156, 0.2)',
    pointBackgroundColor: ['#ef4444', '#22c55e'],
  }] }, options: { scales: { x: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } } } } };
}

test('standalone chart palette stays intact without an Ops-Hub style', () => {
  const original = config();
  const chart = setup().create(original);
  assert.deepEqual(chart.data.datasets[0].borderColor, ['#e88a4c', '#c4679c', '#8b5e9e', '#a78bfa']);
});

test('host palette keeps four series distinct and preserves data and semantic colors', () => {
  const chart = setup('ocean').create(config());
  const series = chart.data.datasets[0];
  assert.equal(new Set(series.borderColor).size, 4);
  assert.ok(series.borderColor.every(value => !['#e88a4c', '#c4679c', '#8b5e9e', '#a78bfa'].includes(value)));
  assert.deepEqual(series.data, [1, 2, null, 4]);
  assert.deepEqual(series.pointBackgroundColor, ['#ef4444', '#22c55e']);
  assert.match(series.backgroundColor, /^rgba\(.+, 0\.2\)$/);
});

test('live style switches use original color roles and destroyed charts stop updating', () => {
  const app = setup('ocean');
  const chart = app.create(config());
  const original = [...chart.data.datasets[0].borderColor];
  app.switchStyle('forest', true);
  assert.notDeepEqual(chart.data.datasets[0].borderColor, original);
  assert.equal(new Set(chart.data.datasets[0].borderColor).size, 4);
  assert.equal(chart.updates, 1);
  chart.destroy();
  app.switchStyle('paper');
  assert.equal(chart.updates, 1);
});
