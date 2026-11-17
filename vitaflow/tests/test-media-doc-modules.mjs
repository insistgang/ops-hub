import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('schedule-system-2.0.html', 'utf8');

assert.ok(html.includes('const mediaDocModules = {'), 'shared media doc module config should exist');
assert.ok(html.includes('function createMediaDoc(moduleName)'), 'shared create helper should exist');
assert.ok(html.includes('function renderMediaDocs(moduleName)'), 'shared render helper should exist');
assert.ok(html.includes('function openMediaDoc(moduleName, id)'), 'shared open helper should exist');
assert.ok(html.includes('function saveMediaDoc(moduleName)'), 'shared save helper should exist');

[
  ['createWriting', "createMediaDoc('writing')"],
  ['renderWritingDocs', "renderMediaDocs('writing')"],
  ['openWritingDoc', "openMediaDoc('writing', id)"],
  ['saveWriting', "saveMediaDoc('writing')"],
  ['createLazyy', "createMediaDoc('lazyy')"],
  ['renderLazyyDocs', "renderMediaDocs('lazyy')"],
  ['openLazyyDoc', "openMediaDoc('lazyy', id)"],
  ['saveLazyy', "saveMediaDoc('lazyy')"],
  ['createAds', "createMediaDoc('ads')"],
  ['renderAdsDocs', "renderMediaDocs('ads')"],
  ['openAdsDoc', "openMediaDoc('ads', id)"],
  ['saveAds', "saveMediaDoc('ads')"],
  ['createIdeas', "createMediaDoc('ideas')"],
  ['renderIdeasDocs', "renderMediaDocs('ideas')"],
  ['openIdeasDoc', "openMediaDoc('ideas', id)"],
  ['saveIdeas', "saveMediaDoc('ideas')"],
].forEach(([functionName, call]) => {
  const idArg = functionName.startsWith('open') ? 'id' : '';
  assert.ok(
    html.includes(`function ${functionName}(${idArg}) { ${call}; }`),
    `${functionName} should remain as a small compatibility wrapper`
  );
});

console.log('media doc module tests passed');
