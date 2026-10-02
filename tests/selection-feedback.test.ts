import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { createSelectionFeedback } from '../src/selection-feedback.ts';

function setup(t: TestContext) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { setTimeout, clearTimeout },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  const button = {
    disabled: false,
    isConnected: true,
    dataset: {} as Record<string, string>,
    ownerDocument: { hidden: false },
    blocked: false,
    closest() {
      return this.blocked ? {} : null;
    },
    getClientRects() {
      return [1];
    },
  };
  const feedback = createSelectionFeedback();
  let selections = 0;
  const choose = () => selections++;
  return {
    button,
    feedback,
    choose,
    selections: () => selections,
    run: () => feedback.run(button as unknown as HTMLButtonElement, choose),
  };
}

test('selection is visible before navigation and a repeated click cannot double-open it', (t) => {
  const s = setup(t);
  assert.equal(s.run(), true);
  assert.equal(s.button.dataset.selecting, 'true');
  assert.equal(s.run(), false);
  t.mock.timers.tick(179);
  assert.equal(s.selections(), 0);
  t.mock.timers.tick(1);
  assert.equal(s.selections(), 1);
  assert.equal(s.button.dataset.selecting, undefined);
  assert.equal(s.run(), true);
  t.mock.timers.tick(180);
  assert.equal(s.selections(), 2);
});

test('cancelling a selection removes feedback and cannot navigate later', (t) => {
  const s = setup(t);
  s.run();
  s.feedback.cancel();
  assert.equal(s.button.dataset.selecting, undefined);
  t.mock.timers.tick(500);
  assert.equal(s.selections(), 0);
});

test('disabled, hidden, replaced or closed-dialog controls cannot navigate', (t) => {
  const s = setup(t);
  s.button.disabled = true;
  assert.equal(s.run(), false);
  s.button.disabled = false;
  for (const mode of ['hidden', 'removed', 'closed', 'disabled']) {
    s.button.ownerDocument.hidden = false;
    s.button.isConnected = true;
    s.button.blocked = false;
    s.button.disabled = false;
    assert.equal(s.run(), true);
    if (mode === 'hidden') s.button.ownerDocument.hidden = true;
    if (mode === 'removed') s.button.isConnected = false;
    if (mode === 'closed') s.button.blocked = true;
    if (mode === 'disabled') s.button.disabled = true;
    t.mock.timers.tick(180);
    assert.equal(s.selections(), 0);
    assert.equal(s.button.dataset.selecting, undefined);
  }
});
