import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHtml } from './build-html.mjs';

const directory = fileURLToPath(new URL('.', import.meta.url));
const root = '#vitaflow-native';

function splitSelectors(value) {
  const parts = [];
  let start = 0, depth = 0, quote = '';
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; }
    else if (c === '"' || c === "'") quote = c;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === ',' && depth === 0) { parts.push(value.slice(start, i)); start = i + 1; }
  }
  parts.push(value.slice(start));
  return parts;
}

/** Scope selectors while leaving declarations, font faces and keyframe steps intact. */
export function scopeCss(input) {
  const names = new Map([...input.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)/g)].map(m => [m[1], `vf-native-${m[1]}`]));
  const notices = input.match(/\/\*![\s\S]*?\*\//g) || [];
  const css = input.replace(/\/\*[\s\S]*?\*\//g, '');
  function animations(value) {
    return value.replace(/((?:^|;)\s*(?:-[\w]+-)?animation(?:-name)?\s*:\s*)([^;{}]+)/g, (_, property, content) => {
      for (const [name, replacement] of names) content = content.replace(new RegExp(`\\b${name}\\b`, 'g'), replacement);
      return property + content;
    });
  }
  function rules(text, keyframes = false) {
    let output = '', cursor = 0;
    while (cursor < text.length) {
      let open = cursor, quote = '', parens = 0;
      for (; open < text.length; open++) {
        const c = text[open];
        if (quote) { if (c === '\\') open++; else if (c === quote) quote = ''; }
        else if (c === '"' || c === "'") quote = c;
        else if (c === '(' || c === '[') parens++;
        else if (c === ')' || c === ']') parens--;
        else if (c === '{' && parens === 0) break;
      }
      if (open === text.length) { output += text.slice(cursor); break; }
      let end = open + 1, depth = 1;
      quote = '';
      for (; end < text.length && depth; end++) {
        const c = text[end];
        if (quote) { if (c === '\\') end++; else if (c === quote) quote = ''; }
        else if (c === '"' || c === "'") quote = c;
        else if (c === '{') depth++;
        else if (c === '}') depth--;
      }
      if (depth) throw new Error('Unbalanced VitaFlow CSS');
      const header = text.slice(cursor, open).trim();
      const contents = text.slice(open + 1, end - 1);
      if (/^@(?:media|supports|layer|container|document)\b/i.test(header)) output += `${header} {${rules(contents)}}\n`;
      else if (/^@(?:-webkit-)?keyframes\b/i.test(header)) output += `${header.replace(/(keyframes\s+)([\w-]+)/, (_, prefix, name) => prefix + names.get(name))} {${rules(contents, true)}}\n`;
      else if (header.startsWith('@') || keyframes) output += `${header} {${animations(contents)}}\n`;
      else {
        const selectors = splitSelectors(header).map(selector => {
          let value = selector.trim();
          value = value.replace(/^(?::root|:host|html|body)(?=[\s.#[:>+~]|$)/, root);
          value = value.replace(/^\.ops-hub-embed(?=[\s.[:>+~]|$)/, `${root}.ops-hub-embed`);
          return value.startsWith(root) ? value : `${root} ${value}`;
        });
        output += `${selectors.join(', ')} {${animations(contents)}}\n`;
      }
      cursor = end;
    }
    return output;
  }
  return notices.join('\n') + (notices.length ? '\n' : '') + rules(css);
}

export function buildNative(options = {}) {
  const previous = process.cwd();
  let html;
  try { process.chdir(directory); html = buildHtml({ existingHtml: '' }); }
  finally { process.chdir(previous); }
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)].map(m => m[1]);
  assert.ok(!scripts.some(code => /^\s*window\s*\.\s*EMBEDDED_DATA\s*=/.test(code)), 'Native input must not contain a snapshot');
  let app = scripts.find(code => code.includes('async function bootVitaFlow()'));
  assert.ok(app, 'VitaFlow application script is missing');
  const bootstrapStart = app.indexOf("        if (document.readyState === 'loading')");
  const bootstrapEndMarker = "        window.addEventListener('load', initChartsAfterAssetsReady, { once: true });";
  const bootstrapEnd = app.indexOf(bootstrapEndMarker, bootstrapStart);
  assert.ok(bootstrapStart >= 0 && bootstrapEnd >= 0, 'VitaFlow boot interface changed');
  app = app.slice(0, bootstrapStart) + app.slice(bootstrapEnd + bootstrapEndMarker.length);
  // Existing synchronization owns merge/revision/conflict decisions. Only prevent
  // its obsolete async continuations from mutating a newer native connection.
  for (const [name, next] of [['initLocalSync', 'function enableLocalSyncAfterInitialRender'], ['uploadLocalSyncData', 'function startLocalSyncDirtyWatcher'], ['fetchLocalSyncUpdates', 'function refreshVisibleData']]) {
    const start = app.indexOf(`async function ${name}(`);
    const end = app.indexOf(next, start);
    assert.ok(start >= 0 && end > start, `VitaFlow sync boundary changed: ${name}`);
    let section = app.slice(start, end);
    assert.ok(section.includes('} catch (e) {'), `VitaFlow sync error boundary changed: ${name}`);
    // 按函数头定位而不是写死签名：新增参数（如 initLocalSync(options)）不再打断构建
    const brace = section.indexOf('{');
    assert.ok(brace > 0, `VitaFlow sync boundary changed: ${name}`);
    section = (section.slice(0, brace + 1) + '\n            const nativeSyncGeneration = nativeContext.generation;' + section.slice(brace + 1))
      .replace('} catch (e) {', '} catch (e) {\n                if (nativeSyncGeneration !== nativeContext.generation) return;');
    if (name === 'uploadLocalSyncData') {
      const marker = '} finally {\n                localSyncUploading = false;';
      assert.ok(section.includes(marker), 'VitaFlow upload completion boundary changed');
      section = section.replace(marker, '} finally {\n                if (nativeSyncGeneration !== nativeContext.generation) return;\n                localSyncUploading = false;');
    }
    app = app.slice(0, start) + section + app.slice(end);
  }
  const body = html.match(/<body\b[^>]*>([\s\S]*)<\/body\s*>/i)?.[1].replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '').trim();
  assert.ok(body && !/<iframe\b/i.test(body), 'Native body must be a document fragment');
  const hostHtml = options.hostHtml ?? fs.readFileSync(path.join(directory, '..', 'index.html'), 'utf8');
  const hostIds = new Set([...hostHtml.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));
  const duplicate = [...body.matchAll(/\bid=["']([^"']+)["']/g)].find(match => hostIds.has(match[1]));
  assert.ok(!duplicate, `Native VitaFlow has a duplicate host ID: ${duplicate?.[1]}`);
  const names = JSON.parse(fs.readFileSync(path.join(directory, 'src/native/ui-handlers.json'), 'utf8'));
  assert.equal(names.length, 166);
  assert.equal(new Set(names).size, names.length);
  for (const name of names) assert.match(app, new RegExp(`\\bfunction ${name}\\s*\\(`));
  const runtime = fs.readFileSync(path.join(directory, 'src/native/runtime.js'), 'utf8');
  const vendor = scripts.filter(code => code.includes('Chart.js v4.4.0')).join('\n');
  assert.ok(vendor, 'Vendored Chart.js is missing');
  const js = runtime
    .replace("/* NATIVE_BODY */ ''", JSON.stringify(body))
    .replace('/* NATIVE_NAMES */ []', JSON.stringify(names))
    .replace('/* NATIVE_VENDOR */', vendor)
    .replace('/* NATIVE_APP */', app)
    .replace('/* NATIVE_UI */', names.map(name => `${name}: ${name}`).join(',\n'))
    .replace(/[ \t]+$/gm, '');
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map(m => m[1]);
  const aliases = `${root}, ${root}.ops-hub-embed[data-ops-theme] { --page-bg:var(--ops-page,#f6f5f7); --surface:var(--ops-surface,#fff); --surface-muted:var(--ops-surface-muted,#faf8fb); --text:var(--ops-text,#302b36); --muted:var(--ops-muted,#756c7c); --accent:var(--ops-accent,#80548d); --border:var(--ops-border,#e7e1eb); --card-shadow:var(--ops-shadow,none); min-height:0; padding:0; background:none; }\n${root} .container, ${root} .detail-page {max-width:none;}\n`;
  return { js, css: (styles.map(scopeCss).join('\n') + aliases).replace(/[ \t]+$/gm, ''), body, names };
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
