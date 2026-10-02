import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readPreferences } from '../src/preferences.ts';

test('unavailable or damaged saved settings preserve access to the menu', () => {
  for (const value of [null, '', '{broken', 'null', '3', '"text"']) {
    assert.deepEqual(readPreferences(value), { sound: true, music: true });
  }
});

test('saved booleans override defaults but malformed values do not enable sound', () => {
  assert.deepEqual(readPreferences('{"sound":false,"music":false}'), {
    sound: false,
    music: false,
  });
  assert.deepEqual(readPreferences('{"sound":"false","music":0}'), {
    sound: true,
    music: true,
  });
});

test('earlier settings retain muted sounds and discard the removed motion setting', () => {
  assert.deepEqual(readPreferences('{"sound":false,"motion":false}'), {
    sound: false,
    music: true,
  });
});
