import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMusicPlayer, type MusicStatus } from '../src/music.ts';

class FakeAudio extends EventTarget {
  preload = '';
  loop = false;
  volume = 1;
  paused = true;
  currentTime = 42;
  error = null;
  attempts = 0;
  nextPlay: () => Promise<void> = () => Promise.resolve();
  play() {
    this.attempts++;
    this.paused = false;
    return this.nextPlay();
  }
  pause() {
    this.paused = true;
  }
  load() {}
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

test('a native loop-boundary pause resumes without overriding mute or background state', async () => {
  const audio = new FakeAudio();
  const player = createMusicPlayer(audio as unknown as HTMLAudioElement, true, () => {});
  player.activate();
  await settle();
  audio.paused = true;
  audio.currentTime = 0;
  audio.dispatchEvent(new Event('seeked'));
  await settle();
  assert.equal(audio.attempts, 2);
  assert.equal(audio.paused, false);
  player.setEnabled(false);
  audio.dispatchEvent(new Event('seeked'));
  assert.equal(audio.attempts, 2);
  assert.equal(audio.paused, true);
  player.setSuspended(true);
  player.setEnabled(true);
  audio.dispatchEvent(new Event('seeked'));
  assert.equal(audio.attempts, 2);
  assert.equal(audio.paused, true);
});

test('music starts on entry and resumes the same position after a hidden tab', async () => {
  const audio = new FakeAudio();
  const player = createMusicPlayer(audio as unknown as HTMLAudioElement, true, () => {});
  assert.equal(audio.volume, 0.063);
  player.setSuspended(false);
  assert.equal(audio.attempts, 1);
  player.activate();
  await settle();
  assert.equal(audio.paused, false);
  player.setSuspended(true);
  assert.equal(audio.paused, true);
  player.setSuspended(false);
  await settle();
  assert.equal(audio.paused, false);
  assert.equal(audio.currentTime, 42);
  player.setEnabled(false);
  player.setSuspended(true);
  player.setSuspended(false);
  assert.equal(audio.paused, true);
  assert.equal(audio.attempts, 2);
});

test('muting while playback is loading prevents late completion from restarting music', async () => {
  const audio = new FakeAudio();
  let finish!: () => void;
  audio.nextPlay = () =>
    new Promise<void>((resolve) => {
      finish = resolve;
    });
  const states: MusicStatus[] = [];
  const player = createMusicPlayer(audio as unknown as HTMLAudioElement, true, (status) =>
    states.push(status),
  );
  player.activate();
  player.setEnabled(false);
  finish();
  await settle();
  audio.dispatchEvent(new Event('playing'));
  assert.equal(audio.paused, true);
  assert.notEqual(states.at(-1), 'playing');
});

test('a browser playback denial is recoverable through the next user gesture', async () => {
  const audio = new FakeAudio();
  audio.nextPlay = () => {
    audio.paused = true;
    return Promise.reject(new DOMException('Gesture required', 'NotAllowedError'));
  };
  const states: MusicStatus[] = [];
  const player = createMusicPlayer(audio as unknown as HTMLAudioElement, true, (status) =>
    states.push(status),
  );
  player.activate();
  await settle();
  assert.equal(states.at(-1), 'blocked');
  audio.nextPlay = () => Promise.resolve();
  player.activate();
  await settle();
  assert.equal(states.at(-1), 'playing');
});
