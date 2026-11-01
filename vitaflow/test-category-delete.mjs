import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('src/app.js', 'utf8');

class FakeStorage {
  constructor(initial) {
    this.store = { ...initial };
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }
}

const cases = [
  {
    label: 'learning',
    functionName: 'deleteLearningCategory',
    nextFunctionName: 'renderLearningNotes',
    categoriesKey: 'vitaflow_learning_categories',
    notesKey: 'vitaflow_learning_notes',
    renderCategories: 'renderLearningCategories',
    renderNotes: 'renderLearningNotes',
  },
  {
    label: 'reading',
    functionName: 'deleteReadingCategory',
    nextFunctionName: 'renderReadingNotes',
    categoriesKey: 'vitaflow_reading_categories',
    notesKey: 'vitaflow_reading_notes',
    renderCategories: 'renderReadingCategories',
    renderNotes: 'renderReadingNotes',
  },
  {
    label: 'film',
    functionName: 'deleteFilmCategory',
    nextFunctionName: 'renderFilmNotes',
    categoriesKey: 'vitaflow_film_categories',
    notesKey: 'vitaflow_film_notes',
    renderCategories: 'renderFilmCategories',
    renderNotes: 'renderFilmNotes',
  },
];

for (const item of cases) {
  const start = source.indexOf(`function ${item.functionName}(`);
  const end = source.indexOf(`function ${item.nextFunctionName}(`, start);
  assert.notEqual(start, -1, `${item.functionName} should exist`);
  assert.notEqual(end, -1, `${item.nextFunctionName} should exist`);

  const storage = new FakeStorage({
    [item.categoriesKey]: JSON.stringify([
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ]),
    [item.notesKey]: JSON.stringify([
      { id: 'note-a', category: 'a' },
      { id: 'note-b', category: 'b' },
    ]),
  });
  let confirmCalls = 0;
  let renderCalls = 0;
  const context = vm.createContext({
    localStorage: storage,
    console,
    confirm() {
      confirmCalls++;
      return true;
    },
    [item.renderCategories]() {
      renderCalls++;
    },
    [item.renderNotes]() {
      renderCalls++;
    },
  });

  vm.runInContext(source.slice(start, end), context);
  vm.runInContext(`${item.functionName}('missing')`, context);

  assert.deepEqual(
    JSON.parse(storage.getItem(item.categoriesKey)),
    [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
    `${item.label}: a missing category id must not delete the last category`
  );
  assert.deepEqual(
    JSON.parse(storage.getItem(item.notesKey)),
    [{ id: 'note-a', category: 'a' }, { id: 'note-b', category: 'b' }],
    `${item.label}: a missing category id should be a no-op`
  );
  assert.equal(confirmCalls, 0, `${item.label}: a missing category should not open a destructive confirmation`);
  assert.equal(renderCalls, 0, `${item.label}: a missing category should not trigger rerenders`);

  vm.runInContext(`${item.functionName}('a')`, context);
  assert.deepEqual(JSON.parse(storage.getItem(item.categoriesKey)), [{ id: 'b', name: 'B' }]);
  assert.deepEqual(
    JSON.parse(storage.getItem(item.notesKey)),
    [{ id: 'note-a', category: null }, { id: 'note-b', category: 'b' }]
  );
  assert.equal(confirmCalls, 1);
  assert.equal(renderCalls, 2);
}

console.log('category deletion tests passed');
