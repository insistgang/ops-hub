import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('schedule-system-2.0.html', 'utf8');

const escapeMatch = html.match(/function escapeHtml\(value\) \{[\s\S]*?\n        \}/);
assert.ok(escapeMatch, 'escapeHtml helper should exist');
const inlineArgMatch = html.match(/function inlineHandlerArg\(value\) \{[\s\S]*?\n        \}/);
assert.ok(inlineArgMatch, 'inline handler arguments should use a dedicated encoder');

const context = vm.createContext({});
vm.runInContext(`${escapeMatch[0]}; ${inlineArgMatch[0]}; this.escapeHtml = escapeHtml; this.inlineHandlerArg = inlineHandlerArg;`, context);

assert.equal(
  context.escapeHtml(`<img src=x onerror="alert('x')">&`),
  '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;',
  'escapeHtml should encode text and attribute-breaking characters'
);
assert.equal(
  context.inlineHandlerArg(`');alert('x');//`),
  '&quot;&#39;);alert(&#39;x&#39;);//&quot;',
  'inline handler values should remain a single encoded JavaScript literal'
);

assert.ok(
  html.includes('>${escapeHtml(todo.text)}</span>'),
  'todo text inserted via innerHTML should be escaped'
);

assert.ok(
  html.includes('value="${record.notes ? escapeHtml(record.notes) : \'\'}"'),
  'media calendar note input value should escape saved notes'
);

assert.ok(html.includes('src="${escapeHtml(img)}"'), 'saved image sources should be attribute-escaped');
assert.ok(html.includes('src="${escapeHtml(note.images[0])}"'), 'film cover sources should be attribute-escaped');
assert.ok(
  html.includes('onclick="${config.openFunctionName}(${inlineHandlerArg(doc.id)})"'),
  'imported document ids should be encoded before entering inline handlers'
);
assert.ok(
  html.includes('onclick="openFilmEditor(${inlineHandlerArg(note.id)})"'),
  'imported film ids should be encoded before entering inline handlers'
);
assert.ok(
  html.includes('<option value="${escapeHtml(c.id)}"'),
  'imported category ids should be escaped before entering option values'
);
assert.ok(
  html.includes('onclick="promoteIdeaVaultFragment(${inlineHandlerArg(fragment.id)})"'),
  'idea vault ids should be encoded before entering inline handlers'
);
assert.ok(
  html.includes('id="skillProgress" min="0" max="100" value="${progress}"'),
  'imported skill progress should be normalized before entering an attribute'
);
assert.ok(
  !html.includes('toggleTodo(${todo.id})'),
  'todo ids should never be inserted directly into inline handlers'
);
[
  '${todo.date}',
  '${item.timeRange}',
  '${record.icon}',
  '${review.startDate}',
  '${review.endDate}',
].forEach(expression => {
  assert.ok(!html.includes(expression), `${expression} should not enter generated markup without escaping`);
});

console.log('html escaping tests passed');
