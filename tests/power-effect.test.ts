import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { createPowerEffect } from '../src/power-effect.ts';

function setup(t: TestContext) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const motion = new (class extends EventTarget {
    matches = false;
  })();
  const counts = { frames: 0, cancelled: 0, starts: 0, stops: 0, contexts: 0 };
  const visual = {
    animate() {
      counts.frames++;
      return {
        cancel() {
          counts.cancelled++;
        },
      };
    },
  };
  const box = {
    clientWidth: 80,
    querySelector: () => visual,
    querySelectorAll: () => Array.from({ length: 5 }, () => visual),
  };
  class FakeContext {
    state = 'suspended';
    destination = {};
    constructor() {
      counts.contexts++;
    }
    async resume() {
      this.state = 'running';
    }
    async suspend() {
      this.state = 'suspended';
    }
    async decodeAudioData() {
      return {};
    }
    createGain() {
      return { gain: { value: 0 }, connect() {}, disconnect() {} };
    }
    createBufferSource() {
      return {
        buffer: null,
        onended: null,
        connect(gain: unknown) {
          return gain;
        },
        disconnect() {},
        start() {
          counts.starts++;
        },
        stop() {
          counts.stops++;
        },
      };
    }
  }
  const previousMotion = Object.getOwnPropertyDescriptor(globalThis, 'matchMedia');
  const previousAudio = Object.getOwnPropertyDescriptor(globalThis, 'AudioContext');
  Object.defineProperty(globalThis, 'matchMedia', { configurable: true, value: () => motion });
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: FakeContext });
  t.after(() => {
    for (const [name, previous] of [
      ['matchMedia', previousMotion],
      ['AudioContext', previousAudio],
    ] as const) {
      if (previous) Object.defineProperty(globalThis, name, previous);
      else Reflect.deleteProperty(globalThis, name);
    }
  });
  t.mock.method(globalThis, 'fetch', async () => new Response(new Uint8Array([1])));
  const effect = createPowerEffect(box as unknown as HTMLElement, 'test-sound.mp3', true);
  return { effect, counts, motion, tick: (ms: number) => t.mock.timers.tick(ms) };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

test('power sparks stay silent before a gesture and stop when the scene is inactive', async (t) => {
  const { effect, counts, tick } = setup(t);
  effect.setActive(true);
  tick(1400);
  assert.ok(counts.frames > 0);
  assert.equal(counts.contexts, 0);
  effect.activate();
  await settle();
  const framesBefore = counts.frames;
  tick(2999);
  assert.equal(counts.frames, framesBefore);
  tick(1);
  assert.ok(counts.frames > framesBefore);
  assert.ok(counts.starts > 0);
  effect.setActive(false);
  assert.ok(counts.stops > 0);
  assert.ok(counts.cancelled > 0);
  const before = { ...counts };
  tick(30000);
  assert.deepEqual(counts, before);
});

test('muting during sound preparation prevents a late electrical burst', async (t) => {
  const { effect, counts, tick } = setup(t);
  effect.setActive(true);
  effect.activate();
  effect.setSoundEnabled(false);
  await settle();
  tick(1400);
  assert.ok(counts.frames > 0);
  assert.equal(counts.starts, 0);
  effect.setSoundEnabled(true);
  effect.activate();
  await settle();
  tick(9000);
  assert.ok(counts.starts > 0);
});

test('reduced motion cancels current sparks and future electrical sounds', async (t) => {
  const { effect, counts, motion, tick } = setup(t);
  effect.setActive(true);
  effect.activate();
  await settle();
  tick(1400);
  motion.matches = true;
  motion.dispatchEvent(new Event('change'));
  const before = { ...counts };
  tick(30000);
  assert.deepEqual(counts, before);
  motion.matches = false;
  motion.dispatchEvent(new Event('change'));
  await settle();
  tick(1400);
  assert.ok(counts.frames > before.frames);
});
