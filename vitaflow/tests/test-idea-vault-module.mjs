import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('schedule-system-2.0.html', 'utf8');

[
  '想法仓库',
  'ideaVaultIdea',
  'ideaVaultTrigger',
  'ideaVaultMotif',
  'ideaVaultUncertainty',
  'ideaVaultNextStep',
  'ideaVaultInbox',
  'ideaVaultMotifs',
  'ideaVaultActions',
  "const ideaVaultStorageKey = 'vitaflow_idea_vault'",
  'function createIdeaVaultFragment()',
  'function renderIdeaVault()',
  'function promoteIdeaVaultFragment(id)',
  'function createIdeaVaultAction()',
].forEach(fragment => {
  assert.ok(html.includes(fragment), `generated HTML should include ${fragment}`);
});

console.log('idea vault module tests passed');
