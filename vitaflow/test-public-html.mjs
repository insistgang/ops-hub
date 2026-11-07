import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripEmbeddedData } from './strip-embedded-data.mjs';

const html = fs.readFileSync('schedule-system-2.0.html', 'utf8');
assert.ok(stripEmbeddedData(html) === html,
  'the public VitaFlow HTML must not contain a private snapshot; run npm run build:html');
console.log('public HTML contains no embedded private snapshot');
