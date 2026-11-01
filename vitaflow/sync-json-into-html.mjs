import fs from 'node:fs';

const htmlPath = process.argv[2] || 'schedule-system-2.0.html';
const jsonPath = process.argv[3] || 'my-schedule.json';

const html = fs.readFileSync(htmlPath, 'utf8');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const safeData = JSON.stringify(data)
  .replace(/</g, '\\u003c')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');
const block = `<script>window.EMBEDDED_DATA = ${safeData};</script>`;

const dataSlot = /<script>window\.EMBEDDED_DATA\s*=\s*\{[\s\S]*?\};?\s*<\/script>|<script>\s*\/\*\s*__EMBEDDED_DATA_PLACEHOLDER__\s*\*\/\s*<\/script>/g;

let replacedSlot = false;
let output = html.replace(dataSlot, () => {
  if (replacedSlot) return '';
  replacedSlot = true;
  return block;
});
if (!replacedSlot) {
  output = html.replace('</head>', `    ${block}\n</head>`);
}

if (!output.includes('__vitaflow_embedded_restore_signature')) {
  throw new Error('HTML is missing the one-time embedded restore guard.');
}

fs.writeFileSync(htmlPath, output);
console.log(`Embedded ${Object.keys(data).length} localStorage keys from ${jsonPath} into ${htmlPath}`);
