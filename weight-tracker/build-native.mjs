import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('.', import.meta.url));
const mountId = 'weight-native';
const rootSelector = `#${mountId}`;
const referenceAttributes = [
  'for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns',
  'aria-activedescendant', 'aria-details', 'aria-errormessage',
];

function prefixId(id) {
  return id === mountId || id.startsWith('weight-') ? id : `weight-${id}`;
}

function splitSelectors(value) {
  const parts = [];
  let start = 0, depth = 0, quote = '';
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (quote) {
      if (character === '\\') index++;
      else if (character === quote) quote = '';
    } else if (character === '"' || character === "'") quote = character;
    else if (character === '(' || character === '[') depth++;
    else if (character === ')' || character === ']') depth--;
    else if (character === ',' && depth === 0) { parts.push(value.slice(start, index)); start = index + 1; }
  }
  parts.push(value.slice(start));
  return parts;
}

function scopeCss(input) {
  const keyframes = new Map([...input.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)/g)].map(match => [match[1], `weight-native-${match[1]}`]));
  const notices = input.match(/\/\*![\s\S]*?\*\//g) || [];
  const css = input.replace(/\/\*[\s\S]*?\*\//g, '');
  function scopeAnimations(value) {
    return value.replace(/((?:^|;)\s*(?:-[\w]+-)?animation(?:-name)?\s*:\s*)([^;{}]+)/g, (_, property, content) => {
      for (const [name, replacement] of keyframes) content = content.replace(new RegExp(`\\b${name}\\b`, 'g'), replacement);
      return property + content;
    });
  }
  function scopeRules(text, inKeyframes = false) {
    let output = '', cursor = 0;
    while (cursor < text.length) {
      let open = cursor, quote = '', parens = 0;
      for (; open < text.length; open++) {
        const character = text[open];
        if (quote) { if (character === '\\') open++; else if (character === quote) quote = ''; }
        else if (character === '"' || character === "'") quote = character;
        else if (character === '(' || character === '[') parens++;
        else if (character === ')' || character === ']') parens--;
        else if (character === '{' && parens === 0) break;
      }
      if (open === text.length) { output += text.slice(cursor); break; }
      let end = open + 1, depth = 1;
      quote = '';
      for (; end < text.length && depth; end++) {
        const character = text[end];
        if (quote) { if (character === '\\') end++; else if (character === quote) quote = ''; }
        else if (character === '"' || character === "'") quote = character;
        else if (character === '{') depth++;
        else if (character === '}') depth--;
      }
      if (depth) throw new Error('Unbalanced weight-tracker CSS');
      const header = text.slice(cursor, open).trim();
      const contents = text.slice(open + 1, end - 1);
      if (/^@(?:media|supports|layer|container|document)\b/i.test(header)) output += `${header} {${scopeRules(contents)}}\n`;
      else if (/^@(?:-webkit-)?keyframes\b/i.test(header)) {
        const renamed = header.replace(/(keyframes\s+)([\w-]+)/, (_, prefix, name) => prefix + keyframes.get(name));
        output += `${renamed} {${scopeRules(contents, true)}}\n`;
      } else if (header.startsWith('@') || inKeyframes) output += `${header} {${scopeAnimations(contents)}}\n`;
      else {
        const selectors = splitSelectors(header).map(selector => {
          let value = selector.trim();
          value = value.replace(/^(?::root|:host|html|body)(?=[\s.#[:>+~]|$)/, rootSelector);
          value = value.replace(/#(?!weight-)([\w-]+)/g, '#weight-$1');
          return value.startsWith(rootSelector) ? value : `${rootSelector} ${value}`;
        });
        output += `${selectors.join(', ')} {${scopeAnimations(contents)}}\n`;
      }
      cursor = end;
    }
    return output;
  }
  return notices.join('\n') + (notices.length ? '\n' : '') + scopeRules(css);
}

function transformApp(source) {
  let app = source;
  const idAssignment = /empty\.id\s*=\s*(['"])chart-empty\1/;
  assert.ok(idAssignment.test(app), 'WeightTracker chart empty-state ID changed');
  app = app.replace(idAssignment, "empty.id = 'weight-chart-empty'");

  const storageFailure = "    document.querySelectorAll('form button, #profile-add, #profile-edit, #group-create').forEach(button => { button.disabled = true; });";
  assert.ok(app.includes(storageFailure), 'WeightTracker storage error boundary changed');
  app = app.replace(storageFailure, `${storageFailure}\n    window.__WeightNativeBridge.fail(error);`);

  const safeAction = 'try { action(); } catch (error) { showNotice(';
  assert.ok(app.includes(safeAction), 'WeightTracker operation error boundary changed');
  app = app.replace(safeAction, 'try { window.__WeightNativeBridge.setError(null); action(); } catch (error) { window.__WeightNativeBridge.setError(error); showNotice(');

  const renderMarker = '    renderChart(records);renderRecords(records);renderGroups(user);';
  assert.ok(app.includes(renderMarker), 'WeightTracker render boundary changed');
  app = app.replace(renderMarker, `${renderMarker}window.__WeightNativeBridge.dataChanged();`);

  const clearMarker = '  resetRecordForm();render();';
  assert.ok(app.includes(clearMarker), 'WeightTracker initial render boundary changed');
  app = app.replace(clearMarker, `  const nativeClearButton = $('record-clear');
  if (nativeClearButton) nativeClearButton.addEventListener('click', () => {
    resetRecordForm();
    showNotice('已清空未保存的体重输入。');
    window.__WeightNativeBridge.setError(null);
  });
${clearMarker}`);

  const bootstrapMarker = '  resetRecordForm();render();\n})();';
  assert.ok(app.includes(bootstrapMarker), 'WeightTracker app bootstrap boundary changed');
  const api = `
  window.__WeightNativeBridge.connect({
    refresh() {
      if (this.hasUnsavedDraft()) {
        const error = new Error('本机记录已更新，当前页面有未保存输入。请保存或取消编辑，或点击“清空输入”后再重读。');
        window.__WeightNativeBridge.setError(error);
        this.notifyRefreshBlocked();
        return false;
      }
      store = api.createStore(window.localStorage);
      window.__WeightNativeBridge.setError(null);
      showNotice('');
      render();
      return true;
    },
    hasUnsavedDraft() {
      const date = $('record-date').value;
      const profileDialog = $('profile-dialog');
      const groupDialog = $('group-dialog');
      return editingRecord !== null || Boolean($('record-weight').value.trim() || $('record-note').value.trim() || (date && date !== today())) ||
        Boolean(profileDialog.open && ($('profile-name').value.trim() || $('profile-goal').value.trim())) ||
        Boolean(groupDialog.open && $('group-name').value.trim());
    },
    notifyRefreshBlocked() {
      showNotice('当前有未保存输入，已保留输入内容。先保存/取消编辑，或点击“清空输入”，再重读本机记录。');
    },
    activate(view) {
      const targets = { overview: 'overview', 'new-entry': 'new-entry', record: 'new-entry', entry: 'new-entry', history: 'history', groups: 'groups' };
      const target = $(targets[view] || view || 'overview');
      if (target && typeof target.scrollIntoView === 'function') target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return Boolean(target);
    },
    getSummary() {
      const user = store.getActiveUser();
      const records = user ? store.listRecords(user.id) : [];
      const first = records[0], last = records.at(-1);
      return {
        latest: last ? { date: last.date, weight: last.weight } : null,
        goal: user?.goal ?? null,
        change: first && last ? Math.round((last.weight - first.weight) * 10) / 10 : null,
        count: records.length,
        user: user ? { name: user.name, id: user.id } : null,
        error: null,
      };
    },
  });
})();`;
  app = app.replace(bootstrapMarker, `  resetRecordForm();render();${api}`);
  return app;
}

function prefixReferences(html) {
  let output = html.replace(/\bid=(['"])([^'"]+)\1/gi, (_, quote, id) => `id=${quote}${prefixId(id)}${quote}`);
  const refs = /\b(for|aria-labelledby|aria-describedby|aria-controls|aria-owns|aria-activedescendant|aria-details|aria-errormessage)=(['"])([^'"]*)\2/gi;
  output = output.replace(refs, (_, attribute, quote, value) => `${attribute}=${quote}${value.trim().split(/\s+/).filter(Boolean).map(prefixId).join(' ')}${quote}`);
  return output.replace(/\b(href|xlink:href)=(['"])#([^'"]+)\2/gi, (_, attribute, quote, id) => `${attribute}=${quote}#${prefixId(id)}${quote}`);
}

export function buildNative() {
  const sourceHtml = fs.readFileSync(path.join(directory, 'src', 'index.html'), 'utf8');
  const appSource = fs.readFileSync(path.join(directory, 'js/app.js'), 'utf8');
  const storeSource = fs.readFileSync(path.join(directory, 'js/store.js'), 'utf8');
  const runtimeSource = fs.readFileSync(path.join(directory, 'native-runtime.js'), 'utf8');
  const cssSource = fs.readFileSync(path.join(directory, 'css/style.css'), 'utf8');
  const main = sourceHtml.match(/<main\b[^>]*id=['"]main-content['"][^>]*>([\s\S]*?)<\/main\s*>/i)?.[1];
  const dialogs = [...sourceHtml.matchAll(/<dialog\b[\s\S]*?<\/dialog\s*>/gi)].map(match => match[0]);
  assert.ok(main, 'WeightTracker main content is missing');
  assert.ok(dialogs.length, 'WeightTracker dialogs are missing');
  const content = main.replace(/<footer\b[^>]*class=['"][^'"]*page-footer[^'"]*['"][^>]*>[\s\S]*?<\/footer\s*>/i, '');
  const nativeContent = content.replace(
    /<button id=['"]record-cancel['"][^>]*>[\s\S]*?<\/button>/i,
    match => `${match}<button id="record-clear" class="button button-secondary" type="button">清空输入</button>`
  );
  assert.notEqual(nativeContent, content, 'Native record clear control insertion point is missing');
  const html = prefixReferences(`<div class="weight-native-content">${nativeContent}</div>${dialogs.join('\n')}`);
  assert.ok(!/<main\b|id=['"]weight-native['"]/.test(html), 'Native fragment must mount inside the existing root without another root/main');
  const ids = [...html.matchAll(/\bid=['"]([^'"]+)['"]/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'WeightTracker native fragment contains duplicate IDs');
  assert.ok(ids.every(id => id.startsWith('weight-')), 'WeightTracker native fragment contains an unprefixed ID');
  const hostHtml = fs.readFileSync(path.join(directory, '..', 'index.html'), 'utf8');
  const hostIds = new Set([...hostHtml.matchAll(/\bid=['"]([^'"]+)['"]/g)].map(match => match[1]));
  const duplicateHostId = ids.find(id => hostIds.has(id));
  assert.ok(!duplicateHostId, `WeightTracker native fragment duplicates a host ID: ${duplicateHostId}`);
  const idSet = new Set(ids);
  for (const reference of html.matchAll(/\b(?:for|aria-labelledby|aria-describedby|aria-controls|aria-owns|aria-activedescendant|aria-details|aria-errormessage)=['"]([^'"]+)['"]/gi)) {
    for (const id of reference[1].split(/\s+/)) assert.ok(idSet.has(id) || hostIds.has(id), `WeightTracker fragment has a dangling ID reference: ${id}`);
  }
  for (const reference of html.matchAll(/\bhref=['"]#([^'"]+)['"]/gi)) assert.ok(idSet.has(reference[1]) || hostIds.has(reference[1]), `WeightTracker fragment has a dangling href: ${reference[1]}`);

  const app = transformApp(appSource);
  const facade = `
(() => {
  const window = globalThis.window;
  const realDocument = window.document;
  const nativeRoot = realDocument.getElementById('${mountId}');
  const prefixNativeId = id => String(id).startsWith('weight-') ? String(id) : 'weight-' + id;
  const mapSelector = selector => String(selector).replace(/#(?!weight-)([\\w-]+)/g, '#weight-$1');
  const document = {
    getElementById(id) { return nativeRoot.querySelector('#' + prefixNativeId(id)); },
    querySelector(selector) { return nativeRoot.querySelector(mapSelector(selector)); },
    querySelectorAll(selector) { return nativeRoot.querySelectorAll(mapSelector(selector)); },
    createElement: realDocument.createElement.bind(realDocument),
    createElementNS: realDocument.createElementNS.bind(realDocument),
    createTextNode: realDocument.createTextNode.bind(realDocument),
  };
  window.__WeightNativeBootstrap = function () {
    nativeRoot.querySelectorAll('form button, #weight-profile-add, #weight-profile-edit, #weight-group-create').forEach(button => { button.disabled = false; });
    try {
      const projection = window.__OPS_WEIGHT__;
      if (projection && window.localStorage) {
        const KEY = 'weight-tracker:universal:v1';
        const stored = window.localStorage.getItem(KEY);
        if (stored === null || stored === undefined || stored === 'null') {
          // 浏览器里还没有任何本机记录：以投影作为初始内容。
          window.localStorage.setItem(KEY, JSON.stringify(projection));
        } else {
          // 已经有内容：只在读得懂的前提下补齐缺失部分，绝不覆盖或清空已有记录。
          let parsed = null;
          let readable = false;
          try {
            parsed = JSON.parse(stored);
            readable = !!parsed && parsed.version === 1
              && Array.isArray(parsed.users) && Array.isArray(parsed.records) && Array.isArray(parsed.groups);
          } catch (_) { parsed = null; readable = false; }
          if (readable) {
            const users = parsed.users;
            const records = parsed.records;
            const projUsers = Array.isArray(projection.users) ? projection.users : [];
            const projRecords = Array.isArray(projection.records) ? projection.records : [];
            const projUser = projUsers.find(user => user && typeof user.id === 'string' && user.id) || null;
            const projUserId = projUser ? projUser.id : null;
            let changed = false;
            if (projUser && !users.some(user => user && user.id === projUser.id)) {
              users.push(projUser);
              changed = true;
            }
            const known = new Set(records.map(record => record && record.id).filter(Boolean));
            const missing = projRecords.filter(record => record && record.id && record.userId === projUserId && !known.has(record.id));
            if (missing.length) {
              parsed.records = records.concat(missing);
              changed = true;
            }
            // 本机一条记录都没有时切到基准使用者，否则今日摘要与体重页会一边有数据一边空白。
            if (records.length === 0 && projUser && parsed.activeUserId !== projUser.id) {
              parsed.activeUserId = projUser.id;
              changed = true;
            }
            if (changed) window.localStorage.setItem(KEY, JSON.stringify(parsed));
          }
          // 读不懂的旧数据保持原样，让 store 报「已保留原数据」，由人来恢复。
        }
      }
    } catch (_) {}
    ${storeSource}
    ${app}
  };
  window.__WeightNativeBootstrap();
})();
`;
  assert.ok(runtimeSource.includes("/* WEIGHT_NATIVE_FRAGMENT */ ''"), 'WeightTracker native fragment marker is missing');
  const runtime = runtimeSource.replace("/* WEIGHT_NATIVE_FRAGMENT */ ''", JSON.stringify(html));
  const js = `(() => {
  const window = globalThis.window;
  if (window.__WeightNativeBundleLoaded) return;
  window.__WeightNativeBundleLoaded = true;
  ${runtime}
  ${facade}
})();`.replace(/[ \t]+$/gm, '');
  const aliases = `
${rootSelector} {
  --page: var(--ops-page, #f4f7fc);
  --paper: var(--ops-surface, #fff);
  --ink: var(--ops-text, #182742);
  --muted: var(--ops-muted, #5e708b);
  --line: var(--ops-border, #e1e8f2);
  --green: var(--ops-accent, #2864d7);
  --green-dark: var(--ops-accent, #1d4fb7);
  --green-soft: var(--ops-surface-muted, #eaf1ff);
  --lime: var(--ops-border, #cfdefb);
  --radius: var(--ops-radius, 18px);
  color: var(--ops-text, #182742);
  background: var(--ops-page, #f4f7fc);
  font-family: var(--ops-font-body, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
}
${rootSelector} .stat-card-current { background-color: var(--ops-accent, #2864d7); border-color: var(--ops-accent, #2864d7); color: var(--ops-accent-contrast, #fff); }
${rootSelector} .stat-card-current :is(.stat-label, .unit, .stat-caption) { color: var(--ops-accent-contrast, #fff); }
${rootSelector} .button-primary { background-color: var(--ops-accent, #2864d7); border-color: var(--ops-accent, #2864d7); color: var(--ops-accent-contrast, #fff); }
${rootSelector} .button-primary:hover { background-color: var(--ops-accent, #2864d7); color: var(--ops-accent-contrast, #fff); }
${rootSelector} .nav-link:first-child { background-color: var(--ops-surface-muted, #e9f0ff); color: var(--ops-accent, #234d9c); }
${rootSelector} .status-dot { background-color: var(--ops-accent, #4b83e7); }
${rootSelector} .welcome-card { background-color: var(--ops-surface-muted, #edf4ff); border-color: var(--ops-border, #d3e2fb); }
${rootSelector} .profile-dialog { background-color: var(--ops-surface, #fff); color: var(--ops-text, #182742); border-color: var(--ops-border, #d6e2f0); }
${rootSelector} #weight-chart-container polyline { stroke: var(--ops-accent, #2864d7); }
${rootSelector} #weight-chart-container circle { fill: var(--ops-accent, #2864d7); }
${rootSelector} #weight-chart-container line { stroke: var(--ops-border, #dbe5f1); }
${rootSelector} #weight-chart-container text { fill: var(--ops-muted, #657b99); }
${rootSelector} :is(input, select, textarea) { color: var(--ops-text, #182742); background-color: var(--ops-surface, #fff); border-color: var(--ops-border, #d5dfed); }
${rootSelector} :is(input, select, textarea):focus { border-color: var(--ops-accent, #7ca3e7); box-shadow: 0 0 0 3px var(--ops-surface-muted, #eaf1ff); }
${rootSelector} :is(input, textarea)::placeholder { color: var(--ops-muted, #929fb1); }
${rootSelector} :is(.workspace-label, .storage-label, .page-intro, .stat-label, .unit, .stat-caption, .panel-tag, .panel-footnote, .section-description, .field-hint, .form-note, .history-summary, .record-primary time, .record-note, .group-description, .group-info span, .chart-empty p, .chart-empty span) { color: var(--ops-muted, #70839b); }
${rootSelector} .notice { background-color: var(--ops-surface-muted, #edf4ff); border-color: var(--ops-border, #cdddf7); color: var(--ops-text, #31578f); }
${rootSelector} .welcome-card h2, ${rootSelector} .welcome-card p { color: var(--ops-text, #284f91); }
${rootSelector} .stat-card-current :is(.stat-label, .unit, .stat-caption) { color: var(--ops-accent-contrast, #fff); }
`;
  const css = (scopeCss(cssSource) + aliases).replace(/[ \t]+$/gm, '');
  return { html, js, css, ids };
}

function main() {
  const { js, css } = buildNative();
  for (const [name, value] of [['native-workspace.js', js], ['native-workspace.css', css]]) {
    const file = path.join(directory, name);
    if (process.argv.includes('--check')) assert.ok(fs.existsSync(file) && fs.readFileSync(file, 'utf8') === value, `${name} is out of date; run node build-native.mjs`);
    else fs.writeFileSync(file, value);
  }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();
