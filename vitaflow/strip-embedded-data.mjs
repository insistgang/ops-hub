// git clean filter：提交时把 HTML 里的内嵌数据快照替换为占位符，
// 避免每次数据变化在仓库里产生数百 KB 的 diff。
// 工作目录里的文件不受影响，双击 HTML 应急打开时依然带数据。
// 用法：cat schedule-system-2.0.html | node strip-embedded-data.mjs

import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const PLACEHOLDER = '<script>/* __EMBEDDED_DATA_PLACEHOLDER__ */</script>';
const DATA_SLOT = /<script>window\.EMBEDDED_DATA\s*=\s*\{[\s\S]*?\};?\s*<\/script>|<script>\s*\/\*\s*__EMBEDDED_DATA_PLACEHOLDER__\s*\*\/\s*<\/script>/g;

export function stripEmbeddedData(html) {
  let keptPlaceholder = false;
  const stripped = html.replace(DATA_SLOT, () => {
    if (keptPlaceholder) return '';
    keptPlaceholder = true;
    return PLACEHOLDER;
  });
  // Only the generated snapshot format is supported. Refuse changed or damaged
  // data scripts rather than silently passing private records through to Git.
  const scripts = stripped.matchAll(/<script\b[^>]*>([\s\S]*?)(?:<\/script\s*>|$)/gi);
  for (const [, code] of scripts) {
    if (/^\s*window\s*\.\s*EMBEDDED_DATA\s*=/.test(code)) {
      throw new Error('Unrecognized embedded data block; refusing to emit unsanitized HTML.');
    }
  }
  return stripped;
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const chunks = [];
  process.stdin.on('data', chunk => chunks.push(chunk));
  process.stdin.on('end', () => {
    process.stdout.write(stripEmbeddedData(Buffer.concat(chunks).toString('utf8')));
  });
}
