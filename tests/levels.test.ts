import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyLevelProgress,
  getLevelPage,
  getLevelUrl,
  hasMaximumLevelStars,
  levels,
  type LevelSummary,
} from '../src/levels.ts';
import { createEmptyProgress, recordLevelResult } from '../src/progress.ts';

const catalog = (count: number, completed: number): LevelSummary[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Уровень ${index + 1}`,
    completed: index < completed,
    stars: 0,
    selectable: true,
  }));

test('opens the next available level page and clamps navigation to the actual catalog', () => {
  const levels = catalog(29, 12);
  const next = getLevelPage(levels);
  assert.equal(next.page, 1);
  assert.equal(next.pageCount, 3);
  assert.equal(next.items[0].id, 13);
  assert.equal(next.items[0].state, 'current');
  assert.equal(next.items[1].state, 'locked');
  assert.equal(getLevelPage(levels, -1).page, 0);
  const last = getLevelPage(levels, 30);
  assert.equal(last.page, 2);
  assert.deepEqual(
    last.items.map((level) => level.id),
    [25, 26, 27, 28, 29],
  );
});

test('replay and completion counts do not depend on the number of stars', () => {
  const levels = catalog(5, 2);
  levels[1].stars = 3;
  levels[4].stars = 3;
  const page = getLevelPage(levels);
  assert.equal(page.completed, 2);
  assert.deepEqual(
    page.items.map((level) => level.state),
    ['completed', 'completed', 'current', 'locked', 'locked'],
  );
  assert.ok(getLevelPage(catalog(5, 5)).items.every((level) => level.state === 'completed'));
});

test('the completion checkmark requires the level’s maximum stars', () => {
  const saved = (displayNumber: number, stars: 1 | 2 | 3, maxStars?: 1 | 2 | 3) => ({
    id: displayNumber,
    displayNumber,
    name: `Уровень ${displayNumber}`,
    completed: true,
    stars,
    maxStars,
  });
  assert.equal(hasMaximumLevelStars(saved(1, 1)), true);
  assert.equal(hasMaximumLevelStars(saved(12, 1)), false);
  assert.equal(hasMaximumLevelStars(saved(12, 2)), true);
  assert.equal(hasMaximumLevelStars(saved(14, 2)), false);
  assert.equal(hasMaximumLevelStars(saved(14, 3)), true);
  assert.equal(hasMaximumLevelStars({ ...saved(14, 3), completed: false }), false);
});

test('a small or empty catalog does not invent additional levels', () => {
  assert.equal(getLevelPage(catalog(5, 0)).items.length, 5);
  assert.equal(getLevelPage(catalog(5, 0)).pageCount, 1);
  const empty = getLevelPage([]);
  assert.equal(empty.total, 0);
  assert.equal(empty.page, 0);
  assert.equal(empty.pageCount, 1);
  assert.deepEqual(empty.items, []);
});

test('the current chapter contains its 26 playable stable routes', () => {
  assert.equal(levels.length, 26);
  assert.deepEqual(
    getLevelPage(levels).items.map((level) => level.state),
    ['current', ...Array.from({ length: 11 }, () => 'locked')],
  );
  assert.equal(
    getLevelUrl(levels[0], 'https://example.test/game/'),
    'https://example.test/game/levels/31/index.html',
  );
  assert.equal(
    getLevelUrl(levels[1], 'https://example.test/game/'),
    'https://example.test/game/levels/32/index.html',
  );
  assert.ok(levels.every((level) => getLevelUrl(level, 'https://example.test/game/')));
  assert.equal(
    getLevelUrl(levels.at(-1)!, 'https://example.test/game/'),
    'https://example.test/game/levels/45/index.html',
  );
});

test('saved completion unlocks the next playable level and preserves its best stars', () => {
  const firstComplete = recordLevelResult(createEmptyProgress(), 31, 3).progress;
  const afterFirst = applyLevelProgress(levels, firstComplete);
  assert.deepEqual(
    getLevelPage(afterFirst).items.map((level) => level.state),
    ['completed', 'current', ...Array.from({ length: 10 }, () => 'locked')],
  );
  assert.equal(afterFirst[0].stars, 1);

  const bothComplete = recordLevelResult(firstComplete, 32, 2).progress;
  const afterBoth = applyLevelProgress(levels, bothComplete);
  assert.deepEqual(
    getLevelPage(afterBoth).items.map((level) => level.state),
    ['completed', 'completed', 'current', ...Array.from({ length: 9 }, () => 'locked')],
  );
  assert.equal(afterBoth[1].stars, 1);
});

test('retiring the fifth board keeps outage-board saves and unlocks it after the fourth', () => {
  let progress = createEmptyProgress();
  for (const id of [31, 32, 33, 34, 35]) progress = recordLevelResult(progress, id, 1).progress;
  const current = applyLevelProgress(levels, progress);
  assert.equal(
    current.some((level) => level.id === 35),
    false,
  );
  assert.equal(current[4].id, 36);
  assert.equal(current[4].displayNumber, 5);
  assert.equal(getLevelPage(current).items[4].state, 'current');
  const completed = applyLevelProgress(levels, recordLevelResult(progress, 36, 1).progress);
  assert.equal(completed[4].completed, true);
  assert.equal(getLevelPage(completed).items[5].id, 37);
  assert.equal(getLevelPage(completed).items[5].state, 'current');
});

test('learning sequence does not map removed legacy saves', () => {
  const progress = recordLevelResult(
    recordLevelResult(createEmptyProgress(), 1, 3).progress,
    13,
    2,
  ).progress;
  const current = applyLevelProgress(levels, progress);
  assert.deepEqual(
    current.slice(0, 2).map((l) => [l.id, l.displayNumber, l.stars]),
    [
      [31, 1, 0],
      [32, 2, 0],
    ],
  );
  assert.equal(current.find((l) => l.id === 1)?.displayNumber, 11);
  assert.equal(current.find((l) => l.id === 1)?.stars, 1);
  assert.equal(
    current.find((l) => l.id === 13),
    undefined,
  );
  assert.equal(current.find((l) => l.id === 45)?.stars, 0);
  assert.equal(current.filter((l) => l.chapter === 1).length, 26);
  assert.deepEqual(
    current.map((l) => l.displayNumber),
    Array.from({ length: 26 }, (_, i) => i + 1),
  );
});

test('finishing the former chapter unlocks the new finale without changing old results', () => {
  let progress = createEmptyProgress();
  for (const level of levels.slice(0, -1))
    progress = recordLevelResult(progress, level.id, 3).progress;
  progress = recordLevelResult(progress, 35, 1).progress;
  const before = structuredClone(progress);
  const current = applyLevelProgress(levels, progress);
  const page = getLevelPage(current);
  assert.equal(page.page, 2);
  assert.equal(page.completed, 25);
  assert.equal(page.items.at(-1)?.id, 45);
  assert.equal(page.items.at(-1)?.state, 'current');
  assert.equal(current.find((level) => level.id === 12)?.stars, 3);
  assert.deepEqual(progress, before);
  const finished = applyLevelProgress(levels, recordLevelResult(progress, 45, 3).progress);
  assert.equal(getLevelPage(finished).completed, 26);
  assert.equal(getLevelPage(finished).items.at(-1)?.state, 'completed');
});

test('inserting the no-star ramp caps early scores and unlocks the new seventh entry', () => {
  let progress = recordLevelResult(createEmptyProgress(), 38, 3).progress;
  for (const id of [31, 32, 33, 34, 36, 37]) {
    progress = recordLevelResult(progress, id, 3).progress;
  }
  const current = applyLevelProgress(levels, progress);
  const page = getLevelPage(current);
  assert.equal(current[6].id, 42);
  assert.equal(current[6].stars, 0);
  assert.equal(page.items[6].state, 'current');
  assert.equal(current[7].id, 38);
  assert.equal(current[7].displayNumber, 8);
  assert.equal(current[7].stars, 1);
});
