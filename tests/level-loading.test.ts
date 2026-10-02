import test from 'node:test';
import assert from 'node:assert/strict';
import { canPrefetchLevel, createLevelPreparer } from '../src/level-loading.ts';

const url = 'https://example.test/game/levels/3/index.html';
const documentFor = (id = 3) =>
  new Response(`<div id="warm-glass-level" data-level-id="${id}"></div>`);

test('a failed background preparation does not prevent launching level three', async () => {
  const modes: RequestCache[] = [];
  const prepare = createLevelPreparer(async (_url, options) => {
    modes.push(options!.cache!);
    if (modes.length === 1) throw new TypeError('Network connection lost');
    return documentFor();
  });
  await assert.rejects(prepare(url, 3));
  await prepare(url, 3);
  await prepare(url, 3);
  assert.deepEqual(modes, ['default', 'default']);
});

test('a launch waiting on a failing prefetch makes one fresh request', async () => {
  let rejectFirst!: (error: Error) => void;
  const modes: RequestCache[] = [];
  const prepare = createLevelPreparer(async (_url, options) => {
    modes.push(options!.cache!);
    if (modes.length === 1)
      return new Promise<Response>((_resolve, reject) => {
        rejectFirst = reject;
      });
    return documentFor();
  });
  const prefetch = prepare(url, 3);
  const failure = assert.rejects(prefetch);
  const launch = prepare(url, 3);
  rejectFirst(new Error('Connection lost'));
  await failure;
  await launch;
  assert.deepEqual(modes, ['default', 'reload']);
});

test('the retry button bypasses a stale HTTP response', async () => {
  const modes: RequestCache[] = [];
  const prepare = createLevelPreparer(async (_url, options) => {
    modes.push(options!.cache!);
    return modes.length === 1 ? new Response('Missing', { status: 404 }) : documentFor();
  });
  await assert.rejects(prepare(url, 3), /404/);
  await prepare(url, 3, true);
  assert.deepEqual(modes, ['default', 'reload']);
});

test('background level downloads respect offline, data-saving and very slow connections', () => {
  assert.equal(canPrefetchLevel({ onLine: false }), false);
  assert.equal(canPrefetchLevel({ onLine: true, connection: { saveData: true } }), false);
  for (const effectiveType of ['slow-2g', '2g']) {
    assert.equal(canPrefetchLevel({ onLine: true, connection: { effectiveType } }), false);
  }
  assert.equal(canPrefetchLevel({ onLine: true }), true);
  assert.equal(canPrefetchLevel({ onLine: true, connection: { effectiveType: '3g' } }), true);
});

test('an old failure cannot evict a newer successful request', async () => {
  let rejectFirst!: (error: Error) => void;
  let attempts = 0;
  const prepare = createLevelPreparer(async () => {
    if (++attempts === 1)
      return new Promise<Response>((_resolve, reject) => {
        rejectFirst = reject;
      });
    return documentFor();
  });
  const first = assert.rejects(prepare(url, 3));
  await prepare(url, 3, true);
  rejectFirst(new Error('Old timeout'));
  await first;
  await prepare(url, 3);
  assert.equal(attempts, 2);
});

test('a menu fallback or a different level cannot pass document validation', async () => {
  for (const body of ['<html>Menu</html>', '<div id="warm-glass-level" data-level-id="2"></div>']) {
    const prepare = createLevelPreparer(async () => new Response(body));
    await assert.rejects(prepare(url, 3), /document is invalid/);
  }
});

test('a timed-out request is removed so the next attempt can succeed', async () => {
  let attempts = 0;
  const prepare = createLevelPreparer(async (_url, options) => {
    if (++attempts > 1) return documentFor();
    return new Promise<Response>((_resolve, reject) => {
      options!.signal!.addEventListener('abort', () =>
        reject(new DOMException('Timed out', 'AbortError')),
      );
    });
  }, 10);
  await assert.rejects(prepare(url, 3), { name: 'AbortError' });
  await prepare(url, 3);
  assert.equal(attempts, 2);
});
