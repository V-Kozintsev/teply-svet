import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyChapterProgress,
  chapters,
  formatChapterStars,
  getChapterState,
  getCurrentChapter,
  getTotalStars,
  type ChapterSummary,
} from '../src/chapters.ts';
import { applyLevelProgress, levels } from '../src/levels.ts';
import { createEmptyProgress, recordLevelResult } from '../src/progress.ts';

test('the concept has one playable chapter followed by the renamed coming-soon chapter', () => {
  assert.deepEqual(
    chapters.map((chapter) => chapter.title),
    ['Тихий двор', 'На исходе заряда'],
  );
  assert.deepEqual(
    chapters.map((chapter) => chapter.maxStars),
    [51, 0],
  );
  assert.deepEqual(
    chapters.map((chapter) => getChapterState(chapter, 0)),
    ['available', 'coming-soon'],
  );
  assert.equal(getCurrentChapter(chapters, 999)?.id, 1);
});

test('a full playable chapter keeps its completed state', () => {
  const complete: ChapterSummary = { ...chapters[0], earnedStars: 51 };
  assert.equal(getChapterState(complete, 51), 'completed');
});

test('large chapter star totals use readable groups', () => {
  assert.equal(formatChapterStars(0), '0');
  assert.equal(formatChapterStars(12480), '12\u202f480');
});

test('chapter totals include every retained board in chapter one', () => {
  let progress = recordLevelResult(createEmptyProgress(), 1, 3).progress;
  progress = recordLevelResult(progress, 63, 2).progress;
  const catalog = applyChapterProgress(chapters, applyLevelProgress(levels, progress), progress);
  assert.equal(catalog[0].earnedStars, 1);
  assert.equal(catalog[1].earnedStars, 0);
  assert.equal(getTotalStars(catalog), 1);
  assert.equal(catalog[0].completedLevels, 1);
  assert.equal(catalog[0].totalLevels, 25);
  assert.equal(catalog[1].completedLevels, 0);
  assert.equal(catalog[1].totalLevels, 0);
});

test('chapter completion counts levels once regardless of earned stars or repeated wins', () => {
  let progress = createEmptyProgress();
  for (const [id, stars] of [
    [31, 1],
    [39, 1],
    [40, 3],
    [2, 2],
    [40, 3],
    [63, 3],
  ])
    progress = recordLevelResult(progress, id, stars).progress;
  const catalog = applyChapterProgress(chapters, applyLevelProgress(levels, progress), progress);
  assert.equal(catalog[0].completedLevels, 4);
  assert.equal(catalog[0].totalLevels, 25);
  assert.equal(catalog[0].earnedStars, 7);
  assert.equal(catalog[1].completedLevels, 0);
});

test('completion covers the entire current chapter without requiring every collectible', () => {
  let progress = createEmptyProgress();
  const empty = applyChapterProgress(chapters, applyLevelProgress(levels, progress), progress);
  assert.equal(empty[0].completedLevels, 0);
  for (const level of levels) progress = recordLevelResult(progress, level.id, 1).progress;
  const full = applyChapterProgress(chapters, applyLevelProgress(levels, progress), progress);
  assert.equal(full[0].completedLevels, full[0].totalLevels);
  assert.equal(full[0].totalLevels, 25);
  assert.equal(full[0].earnedStars, 25);
});
