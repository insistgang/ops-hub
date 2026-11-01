import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const outputPath = 'schedule-system-2.0.html';
const templatePath = 'src/schedule-template.html';
const stylesPath = 'src/styles.css';
const appPath = 'src/app.js';
const chartJsPath = 'vendor/chartjs/chart.umd.min.js';
const fontAwesomeCssPath = 'vendor/fontawesome/css/all.min.css';
const fontAwesomeWebfontsPath = 'vendor/fontawesome/webfonts';
const appModules = {
  'date-utils': 'src/modules/date-utils.js',
  'calendar-todos': 'src/modules/calendar-todos.js',
  'media-planning': 'src/modules/media-planning.js',
  'wellness-tools': 'src/modules/wellness-tools.js',
  'dashboard-stats': 'src/modules/dashboard-stats.js',
  'initial-data': 'src/modules/initial-data.js',
  'media-docs': 'src/modules/media-docs.js',
  'idea-vault': 'src/modules/idea-vault.js',
  'sync-and-backup': 'src/modules/sync-and-backup.js',
  'boot': 'src/modules/boot.js',
};
const embeddedPlaceholder = '<script>/* __EMBEDDED_DATA_PLACEHOLDER__ */</script>';

function readFile(path) {
  return fs.readFileSync(path, 'utf8')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '');
}

function getMimeType(path) {
  if (path.endsWith('.woff2')) return 'font/woff2';
  if (path.endsWith('.ttf')) return 'font/ttf';
  return 'application/octet-stream';
}

function toDataUri(path) {
  return `data:${getMimeType(path)};base64,${fs.readFileSync(path).toString('base64')}`;
}

function inlineFontAwesomeFonts(css) {
  return css.replace(/url\((['"]?)\.\.\/webfonts\/([^)'"]+)\1\)/g, (match, quote, fileName) => {
    const fontPath = `${fontAwesomeWebfontsPath}/${fileName}`;
    if (!fs.existsSync(fontPath)) {
      throw new Error(`Missing Font Awesome webfont: ${fontPath}`);
    }
    return `url("${toDataUri(fontPath)}")`;
  });
}

function escapeInlineScript(code) {
  return code.replace(/<\/script/gi, '<\\/script');
}

function wrapBrowserGlobalScript(code) {
  return `(function() {\nvar module = undefined;\nvar exports = undefined;\nvar define = undefined;\n${code}\n})();`;
}

function buildVendorAssets(eol) {
  const chartJs = escapeInlineScript(wrapBrowserGlobalScript(readFile(chartJsPath)));
  const fontAwesomeCss = inlineFontAwesomeFonts(readFile(fontAwesomeCssPath));
  return `<style>${eol}${fontAwesomeCss}${eol}    </style>${eol}    <script>${eol}${chartJs}${eol}    </script>`;
}

function extractEmbeddedBlock(html) {
  const embedded = html.match(/<script>window\.EMBEDDED_DATA\s*=\s*\{[\s\S]*?\};?<\/script>/);
  if (embedded) return embedded[0];
  const placeholder = html.match(/<script>\s*\/\*\s*__EMBEDDED_DATA_PLACEHOLDER__\s*\*\/\s*<\/script>/);
  if (placeholder) return placeholder[0];
  return embeddedPlaceholder;
}

export function buildHtml({ existingHtml = '' } = {}) {
  const template = readFile(templatePath);
  const styles = readFile(stylesPath);
  let app = readFile(appPath);
  Object.entries(appModules).forEach(([name, path]) => {
    const marker = new RegExp(`^        // VITAFLOW_MODULE: ${name}\\r?\\n`, 'm');
    app = app.replace(marker, readFile(path));
  });
  const embeddedBlock = extractEmbeddedBlock(existingHtml);
  const eol = template.includes('\r\n') ? '\r\n' : '\n';

  return template
    .replace('<!-- VITAFLOW_VENDOR_ASSETS -->', buildVendorAssets(eol))
    .replace('<!-- VITAFLOW_EMBEDDED_DATA -->', embeddedBlock)
    .replace('<!-- VITAFLOW_STYLES -->', `<style>${eol}${styles}${eol}    </style>`)
    .replace('<!-- VITAFLOW_APP_SCRIPT -->', `<script>${eol}${escapeInlineScript(app)}${eol}    </script>`);
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const existingHtml = fs.existsSync(outputPath) ? readFile(outputPath) : '';
  const html = buildHtml({ existingHtml });

  if (checkOnly) {
    assert.ok(html === existingHtml, 'schedule-system-2.0.html is not in sync with src/*; run npm run build:html');
    return;
  }

  fs.writeFileSync(outputPath, html);
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
