import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseLevelLayout } from '../src/level-layout.ts';
import { getLevelPage, type LevelSummary } from '../src/levels.ts';

test('all fifteen levels use one page when desktop or phone space permits', () => {
  for (const [width, height, gap, max, min] of [
    [608, 300, 12, 76, 44],
    [364, 156, 7, 64, 44],
    [268, 142, 5, 64, 44],
  ]) {
    const layout = chooseLevelLayout(15, width, height, gap, max, min, 38);
    assert.equal(layout.pageCount, 1);
    assert.equal(layout.pageSize, 15);
    assert.ok(layout.size >= min);
    assert.ok(layout.columns * layout.size + (layout.columns - 1) * gap <= width);
    const rows = Math.ceil(15 / layout.columns);
    assert.ok(rows * layout.size + (rows - 1) * gap <= height);
  }
});

test('a crowded phone catalog paginates instead of reducing finger targets', () => {
  for (const [width, height, minimum] of [
    [268, 116, 44],
    [290, 560, 56],
    [520, 760, 56],
  ]) {
    const layout = chooseLevelLayout(32, width, height, 8, 120, minimum, 54);
    assert.ok(layout.size >= minimum);
    const rows = Math.ceil(layout.pageSize / layout.columns);
    assert.ok(layout.columns * layout.size + (layout.columns - 1) * 8 <= width);
    assert.ok(rows * layout.size + (rows - 1) * 8 + (layout.pageCount > 1 ? 54 : 0) <= height);
  }
  assert.ok(chooseLevelLayout(15, 268, 116, 5, 64, 44, 38).pageCount > 1);
});

test('crowded catalogs paginate evenly without an orphan remainder', () => {
  for (const count of [10, 13, 15, 17, 28, 29, 30, 32, 36]) {
    const layout = chooseLevelLayout(count, 224, 95, 5, 64, 36, 38);
    const catalog: LevelSummary[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: String(i + 1),
      completed: true,
      stars: 3,
      path: 'test',
    }));
    const pages = Array.from({ length: layout.pageCount }, (_, page) =>
      getLevelPage(catalog, page, layout.pageSize, true),
    );
    const sizes = pages.map((page) => page.items.length);
    assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1);
    assert.ok(Math.min(...sizes) >= 3);
    assert.deepEqual(
      pages.flatMap((page) => page.items.map((level) => level.id)),
      catalog.map((level) => level.id),
    );
  }
});
