import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeVisualImage } from '../src/visual-readiness.ts';

class LoadedImage extends EventTarget {
  complete = true;
  naturalWidth = 128;
  src = 'https://game.test/scene.svg';
  currentSrc = this.src;
  decode = async () => {};
  prepare() {
    return decodeVisualImage(this as unknown as HTMLImageElement);
  }
}

test('a temporary decode rejection retries the loaded image', async () => {
  const image = new LoadedImage();
  let calls = 0;
  image.decode = async () => {
    if (++calls === 1) throw new Error('Decoder interrupted');
  };
  await image.prepare();
  assert.equal(calls, 2);
});

test('an engine unable to decode a loaded SVG can use its normal renderer', async () => {
  const image = new LoadedImage();
  let calls = 0;
  image.decode = async () => {
    calls++;
    throw new Error('Unsupported decode');
  };
  await image.prepare();
  assert.equal(calls, 2);
});

test('a missing or corrupt image cannot pass the loading gate', async () => {
  const image = new LoadedImage();
  image.naturalWidth = 0;
  await assert.rejects(image.prepare(), /renderable/);
});

test('a source replaced during decoding cannot pass as the old loaded image', async () => {
  const image = new LoadedImage();
  image.decode = async () => {
    image.currentSrc = 'https://game.test/other.svg';
    throw new Error('Replaced');
  };
  await assert.rejects(image.prepare(), /Replaced/);
});

test('pending image bytes keep the gate closed and network failure rejects', async () => {
  const image = new LoadedImage();
  image.complete = false;
  let ready = false;
  const pending = image.prepare().then(() => {
    ready = true;
  });
  await Promise.resolve();
  assert.equal(ready, false);
  const failure = assert.rejects(pending, /loaded/);
  image.dispatchEvent(new Event('error'));
  await failure;
});

test('engines without decode still wait for a successful image load', async () => {
  const image = new LoadedImage();
  image.complete = false;
  Object.defineProperty(image, 'decode', { value: undefined });
  const pending = image.prepare();
  image.complete = true;
  image.dispatchEvent(new Event('load'));
  await pending;
});
