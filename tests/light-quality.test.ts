import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(
  'resources/references/ui-review/glass-first-energy-canvas.js',
  'utf8',
);
const factory = vm.runInNewContext(source + ';createLightQuality');

test('light keeps full quality at iPhone v6 cadence and through occasional stalls', () => {
  const changes: number[] = [];
  const quality = factory(2, (value: number) => changes.push(value));
  let now = 0;
  for (let i = 0; i < 7200; i++) quality.frame((now += i % 40 === 0 ? 80 : 17), true);
  assert.deepEqual(changes, []);
});
test('sustained slow drawing reduces only bounded bitmap density without oscillation', () => {
  const changes: number[] = [];
  const quality = factory(2, (value: number) => changes.push(value));
  let now = 0;
  for (let i = 0; i < 1000; i++) quality.frame((now += 33), true);
  for (let i = 0; i < 1000; i++) quality.frame((now += 16), true);
  assert.deepEqual(changes, [1.5, 1]);
});
test('loading, pauses, missing clock and long gaps do not count as sustained slow rendering', () => {
  const changes: number[] = [];
  const quality = factory(2, (value: number) => changes.push(value));
  let now = 0;
  for (let round = 0; round < 10; round++) {
    for (let i = 0; i < 80; i++) quality.frame((now += 33), true);
    quality.frame((now += 1000), true);
    quality.frame((now += 33), false);
  }
  assert.deepEqual(changes, []);
});
