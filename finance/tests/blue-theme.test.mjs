import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { buildNative } from '../build-native.mjs';

const built = buildNative();
const model = vm.createContext({});
vm.runInContext(built.model, model);

test('finance theme is blue, with distinct expense and capital colors', () => {
  assert.equal(vm.runInContext('FINANCE_THEME.income', model), '#365ad8');
  assert.equal(vm.runInContext('safeColor("#10B981")', model), '#365ad8');
  assert.equal(vm.runInContext('safeColor("#059669")', model), '#365ad8');
  assert.equal(vm.runInContext('safeColor("red;position:fixed")', model), '#94a3b8');
  assert.equal(vm.runInContext('FINANCE_THEME.income !== FINANCE_THEME.routine && FINANCE_THEME.income !== FINANCE_THEME.capital', model), true);
  assert.equal(vm.runInContext('ASSET_LAYERS.find(row => row.key === "cash").color', model), '#365ad8');
  assert.match(built.css, /\.finance-period \{ background:var\(--ops-surface/);
  assert.doesNotMatch(built.css, /linear-gradient\(135deg,#17355c,#294e7d\)/);
  assert.match(built.css, /#finance-native\[data-ops-theme="light"\]/);
  assert.match(built.css, /--finance-accent:#92b5ed/);
});

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

test('key blue labels remain legible on light and dark surfaces', () => {
  for (const [foreground, background] of [['365ad8', 'ffffff'], ['62758e', 'ffffff'], ['273142', 'ffffff'], ['92b5ed', '181923']]) {
    const a = luminance(foreground), b = luminance(background);
    assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5, `${foreground} on ${background}`);
  }
});
