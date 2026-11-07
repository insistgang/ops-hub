import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const directory = fileURLToPath(new URL('.', import.meta.url));
export function buildNative() {
  const read = file => fs.readFileSync(path.join(directory, file), 'utf8').replace(/\r\n?/g, '\n');
  const html = read('src/template.html');
  const dashboard = read('src/dashboard.js');
  const runtime = read('src/runtime.js');
  const css = read('src/styles.css');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'Finance IDs must be unique');
  assert.ok(ids.every(id => id.startsWith('finance-')));
  for (const reference of html.matchAll(/\b(?:for|aria-controls|aria-labelledby)="([^"]+)"/g)) assert.ok(reference[1].split(/\s+/).every(id => ids.includes(id)), 'Finance label reference is missing');
  const js = runtime.replace("'__FINANCE_HTML__'", JSON.stringify(html)).replace('/* FINANCE_DASHBOARD */', dashboard).replace(/[ \t]+$/gm, '');
  const pureEnd = dashboard.indexOf('    function selectPeriod(');
  const dailyStart = dashboard.indexOf('    function dailyRows(');
  const dailyEnd = dashboard.indexOf('    function recordStatusLabel(', dailyStart);
  assert.ok(pureEnd > 0 && dailyStart > 0 && dailyEnd > dailyStart);
  const formatStart = dashboard.indexOf('    const escapeHTML');
  const formatEnd = dashboard.indexOf('    function renderDashboard', formatStart);
  const layerStart = dashboard.indexOf('    const ASSET_LAYERS');
  const layerEnd = dashboard.indexOf('function renderAssetLayers', layerStart);
  const incomeStart = dashboard.indexOf('    function renderIncomeBreakdown');
  const incomeEnd = dashboard.indexOf('    function renderIncomeDetails', incomeStart);
  const layerRenderEnd = dashboard.indexOf('    const chartInstances', layerEnd);
  const model = dashboard.slice(0, pureEnd) + dashboard.slice(dailyStart, dailyEnd) + dashboard.slice(formatStart, formatEnd) + dashboard.slice(layerStart, layerRenderEnd) + dashboard.slice(incomeStart, incomeEnd);
  return { js, css: css.replace(/[ \t]+$/gm, ''), html, model };
}
function main() {
  const built = buildNative();
  for (const [file, content] of [['native-workspace.js', built.js], ['native-workspace.css', built.css]]) {
    const target = path.join(directory, file);
    if (process.argv.includes('--check')) assert.ok(fs.existsSync(target) && fs.readFileSync(target, 'utf8') === content, `${file} is stale; run node build-native.mjs`);
    else fs.writeFileSync(target, content);
  }
}
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();
