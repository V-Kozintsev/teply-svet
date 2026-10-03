import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmptyProgress,
  firstChapterLevelIds,
  firstChapterFinalLevelId,
  firstChapterStars,
  getProgressStars,
  getSavedLevel,
  isChapterUnlocked,
  mergeProgress,
  readProgress,
  recordLevelResult,
} from '../src/progress.ts';
import { levels } from '../src/levels.ts';

test('clean, damaged and incompatible saves start empty', () => {
  assert.deepEqual(readProgress(null), createEmptyProgress());
  assert.deepEqual(readProgress('{broken'), createEmptyProgress());
  assert.deepEqual(
    readProgress('{"version":0,"levels":{"1":{"completed":true,"bestStars":3}}}'),
    createEmptyProgress(),
  );
});

test('early best stars respect the one-star cap and survive serialization', () => {
  let progress = recordLevelResult(createEmptyProgress(), 1, 1).progress;
  progress = recordLevelResult(progress, 1, 3).progress;
  assert.deepEqual(getSavedLevel(progress, 1), { completed: true, bestStars: 1 });
  assert.equal(recordLevelResult(progress, 1, 2).gainedStars, 0);
  assert.deepEqual(readProgress(JSON.stringify(progress)), progress);
});

test('invalid records are discarded safely', () => {
  const progress = readProgress(
    JSON.stringify({
      version: 1,
      rulesVersion: 2,
      levels: {
        1: { completed: true, bestStars: 3 },
        2: { completed: true, bestStars: 9 },
        nope: { completed: true, bestStars: 2 },
      },
    }),
  );
  assert.deepEqual(Object.keys(progress.levels), ['1']);
  assert.equal(getProgressStars(progress), 1);
});

test('zero stars never records a completion', () => {
  const empty = createEmptyProgress();
  assert.deepEqual(recordLevelResult(empty, 2, 0), { progress: empty, gainedStars: 0 });
});

test('all 26 playable boards form chapter one and stable 45 is final', () => {
  assert.equal(firstChapterLevelIds.length, 26);
  assert.deepEqual(
    levels.map((level) => level.id),
    [...firstChapterLevelIds],
  );
  assert.equal(levels.at(-1)?.id, firstChapterFinalLevelId);
  assert.equal(firstChapterFinalLevelId, 45);
  assert.equal(levels.at(-1)?.displayNumber, 26);
});

test('new finale adds only its earned stars while keeping historical results', () => {
  let progress = createEmptyProgress();
  for (const id of firstChapterLevelIds.slice(0, -1))
    progress = recordLevelResult(progress, id, 3).progress;
  progress = recordLevelResult(progress, 35, 1).progress;
  const restored = readProgress(JSON.stringify(progress));
  assert.deepEqual(restored, progress);
  assert.equal(firstChapterStars(restored), 51);
  assert.equal(getProgressStars(restored), 52);
  const finale = recordLevelResult(restored, 45, 3);
  assert.equal(finale.gainedStars, 3);
  assert.equal(firstChapterStars(finale.progress), 54);
  assert.equal(getProgressStars(finale.progress), 55);
  assert.deepEqual(finale.progress.levels[35], progress.levels[35]);
  for (const id of [10, 11, 12]) assert.deepEqual(finale.progress.levels[id], progress.levels[id]);
  assert.equal(recordLevelResult(finale.progress, 45, 3).gainedStars, 0);
  assert.equal(isChapterUnlocked(finale.progress, 2), false);
});

test('removed legacy 13–24 saves remain data but cannot map to a playable board', () => {
  const progress = recordLevelResult(createEmptyProgress(), 13, 3).progress;
  assert.equal(getSavedLevel(progress, 13)?.bestStars, 3);
  assert.equal(
    levels.some((level) => level.id === 13),
    false,
  );
  assert.equal(firstChapterStars(progress), 0);
});

test('retired fifth-board history keeps its original reward but leaves chapter totals', () => {
  let progress = recordLevelResult(createEmptyProgress(), 35, 1).progress;
  progress = recordLevelResult(progress, 36, 1).progress;
  const restored = readProgress(JSON.stringify(progress));
  assert.deepEqual(restored, progress);
  assert.equal(firstChapterStars(restored), 1);
  assert.equal(getProgressStars(restored), 2);
  assert.equal(recordLevelResult(restored, 35, 3).gainedStars, 0);
});

test('only chapter one is playable; chapter two is always the coming-soon destination', () => {
  const progress = recordLevelResult(createEmptyProgress(), 63, 3).progress;
  assert.equal(isChapterUnlocked(progress, 1), true);
  assert.equal(isChapterUnlocked(progress, 2), false);
  assert.equal(isChapterUnlocked(progress, 3), false);
});

test('merge keeps the best result without reviving removed chapter access', () => {
  const low = recordLevelResult(createEmptyProgress(), 45, 1).progress;
  const high = recordLevelResult(createEmptyProgress(), 45, 3).progress;
  const merged = mergeProgress(low, { ...high, unlockedChapters: [1, 2] });
  assert.equal(getSavedLevel(merged, 45)?.bestStars, 3);
  assert.deepEqual(merged.unlockedChapters, [1]);
});
