import test from 'node:test';
import assert from 'node:assert/strict';
import { createYandexRewardedHost, isYandexGameHost } from '../src/yandex-rewarded.ts';

test('rewarded video is available only on a Yandex host or with an injected SDK', () => {
  assert.equal(isYandexGameHost('games.s3.yandex.net'), true);
  assert.equal(isYandexGameHost('localhost'), false);
  assert.equal(isYandexGameHost('yandex.net.evil.test'), false);
});

test('closing an ad gives no hint; only the reward callback does', async () => {
  let callbacks: Record<string, () => void> = {};
  const suspended: boolean[] = [];
  const mock = {
    location: { hostname: 'games.s3.yandex.net' },
    YaGames: {
      init: async () => ({
        adv: {
          showRewardedVideo: (options: { callbacks: typeof callbacks }) => {
            callbacks = options.callbacks;
          },
        },
      }),
    },
  } as unknown as Window;
  const host = createYandexRewardedHost(mock, (value) => suspended.push(value));
  const skipped = host.showHintAd();
  await new Promise((resolve) => setImmediate(resolve));
  callbacks.onOpen();
  callbacks.onClose();
  assert.equal(await skipped, false);
  const completed = host.showStarAd();
  await new Promise((resolve) => setImmediate(resolve));
  callbacks.onOpen();
  callbacks.onRewarded();
  callbacks.onClose();
  assert.equal(await completed, true);
  const failed = host.showStarAd();
  await new Promise((resolve) => setImmediate(resolve));
  callbacks.onOpen();
  callbacks.onRewarded();
  callbacks.onError();
  assert.equal(await failed, false);
  assert.deepEqual(suspended, [true, false, true, false, true, false]);
});

test('a stalled SDK initialization returns control and a later request can retry', async () => {
  let attempts = 0;
  let callbacks: Record<string, () => void> = {};
  const mock = {
    location: { hostname: 'games.s3.yandex.net' },
    YaGames: {
      init: () =>
        ++attempts === 1
          ? new Promise(() => {})
          : Promise.resolve({
              adv: {
                showRewardedVideo: (options: { callbacks: typeof callbacks }) => {
                  callbacks = options.callbacks;
                },
              },
            }),
    },
  } as unknown as Window;
  const host = createYandexRewardedHost(mock, () => {}, { sdkTimeoutMs: 10 });
  assert.equal(await host.showStarAd(), false);
  const retry = host.showStarAd();
  await new Promise((resolve) => setImmediate(resolve));
  callbacks.onOpen();
  callbacks.onRewarded();
  callbacks.onClose();
  assert.equal(await retry, true);
  assert.equal(attempts, 2);
});

test('an SDK script that never loads is removed and can be requested again', async () => {
  let removed = 0;
  let appended = 0;
  const mock = {
    location: { hostname: 'games.s3.yandex.net' },
    document: {
      createElement: () => ({ remove: () => removed++ }),
      head: { append: () => appended++ },
    },
  } as unknown as Window;
  const host = createYandexRewardedHost(mock, () => {}, { sdkTimeoutMs: 10 });
  assert.equal(await host.showHintAd(), false);
  assert.equal(await host.showHintAd(), false);
  assert.equal(appended, 2);
  assert.equal(removed, 2);
});

test('ad waiting expires, late callbacks cannot reward, and a late visible video still pauses play', async () => {
  const calls: Array<Record<string, () => void>> = [];
  const suspended: boolean[] = [];
  const mock = {
    location: { hostname: 'games.s3.yandex.net' },
    YaGames: {
      init: async () => ({
        adv: {
          showRewardedVideo: (options: { callbacks: Record<string, () => void> }) =>
            calls.push(options.callbacks),
        },
      }),
    },
  } as unknown as Window;
  const host = createYandexRewardedHost(mock, (value) => suspended.push(value), {
    adStartTimeoutMs: 10,
  });
  assert.equal(await host.showStarAd(), false);
  assert.equal(host.active, false);
  calls[0].onOpen();
  assert.equal(host.active, true);
  assert.equal(await host.showStarAd(), false);
  assert.equal(calls.length, 1);
  calls[0].onRewarded();
  calls[0].onClose();
  calls[0].onOpen();
  assert.equal(host.active, false);
  assert.deepEqual(suspended, [true, false]);
  const retry = host.showStarAd();
  await new Promise((resolve) => setImmediate(resolve));
  calls[1].onOpen();
  // The waiting deadline must not cut short a video already on screen.
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(host.active, true);
  assert.equal(await host.showHintAd(), false);
  calls[1].onRewarded();
  calls[1].onClose();
  assert.equal(await retry, true);
  assert.equal(host.active, false);
});

test('late closure of an expired request cannot resume sound over a newer video', async () => {
  const calls: Array<Record<string, () => void>> = [];
  const suspended: boolean[] = [];
  const mock = {
    location: { hostname: 'games.s3.yandex.net' },
    YaGames: {
      init: async () => ({
        adv: {
          showRewardedVideo: (options: { callbacks: Record<string, () => void> }) =>
            calls.push(options.callbacks),
        },
      }),
    },
  } as unknown as Window;
  const host = createYandexRewardedHost(mock, (value) => suspended.push(value), {
    adStartTimeoutMs: 10,
  });
  assert.equal(await host.showStarAd(), false);
  const retry = host.showStarAd();
  await new Promise((resolve) => setImmediate(resolve));
  calls[1].onOpen();
  calls[0].onOpen();
  calls[0].onClose();
  assert.equal(host.active, true);
  assert.equal(suspended.at(-1), true);
  calls[1].onRewarded();
  calls[1].onClose();
  assert.equal(await retry, true);
  assert.equal(suspended.at(-1), false);
});
