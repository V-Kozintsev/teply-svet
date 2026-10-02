import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmptyProgress,
  recordLevelResult,
  firstChapterLevelIds,
  getProgressStars,
} from '../src/progress.ts';
import {
  createHintWallet,
  syncHintProgress,
  enterHintChapter,
  claimFreeHint,
  buyHintWithStars,
  hintStarCost,
  hintGiftCooldown,
  acceptConfirmedHintReward,
  acceptConfirmedStarReward,
  applyHintMutation,
  unlockHintTool,
  migrateHintWallet,
  freeHintAvailableAt,
  applyChargeAttemptFailure,
  capAttemptTimer,
  refreshAttemptTimer,
  returningAttemptTimeLimit,
  samePuzzleWithChangedTimer,
  chargeLifeRechargeMs,
  refreshChargeLives,
  buyChargeLife,
  chargeLifeStarCost,
  type HintAttempt,
  type HintMutation,
} from '../src/hints.ts';

const openedWallet = () => {
  const wallet = createHintWallet();
  unlockHintTool(wallet);
  return wallet;
};

const attempt = (): HintAttempt => ({
  id: 'attempt',
  signature: 'layout',
  revision: 0,
  rotations: [0, 0],
  planId: null,
  manualTurns: 0,
  demoUsed: false,
  completed: false,
  busyUntil: 0,
  timeRemainingMs: 120_000,
  timerStarted: true,
  timerDeadlineAt: null,
  lockedForLife: false,
});
const request = (turns = 1, kind: HintMutation['kind'] = 'hint'): HintMutation => ({
  levelId: 2,
  attemptId: 'attempt',
  revision: 0,
  operationId: 'one',
  kind,
  transition: (a) => ({
    ...a,
    rotations: [a.rotations[0] + turns, a.rotations[1]],
    planId: 'full',
  }),
});

test('a shorter level limit caps a saved attempt without resetting its progress', () => {
  const saved = attempt();
  saved.rotations = [2, 1];
  saved.timeRemainingMs = 100_000;
  saved.timerDeadlineAt = 210_000;
  capAttemptTimer(saved, 40_000, 100_000);
  assert.equal(saved.timeRemainingMs, 40_000);
  assert.equal(saved.timerDeadlineAt, 140_000);
  assert.deepEqual(saved.rotations, [2, 1]);
  saved.timeRemainingMs = 12_000;
  saved.timerDeadlineAt = 112_000;
  capAttemptTimer(saved, 40_000, 100_000);
  assert.equal(saved.timeRemainingMs, 12_000);
  assert.equal(saved.timerDeadlineAt, 112_000);
});

test('a new visit restores full time while retaining the saved pipe arrangement', () => {
  const saved = attempt();
  saved.rotations = [2, 1];
  saved.manualTurns = 5;
  saved.timeRemainingMs = 7_000;
  saved.timerDeadlineAt = 107_000;
  refreshAttemptTimer(saved, 40_000);
  assert.equal(saved.timeRemainingMs, 40_000);
  assert.equal(saved.timerStarted, false);
  assert.equal(saved.timerDeadlineAt, null);
  assert.deepEqual(saved.rotations, [2, 1]);
  assert.equal(saved.manualTurns, 5);
  assert.equal(returningAttemptTimeLimit(saved, 80_000, 40_000), 80_000);
  saved.outageTriggered = true;
  assert.equal(returningAttemptTimeLimit(saved, 80_000, 40_000), 40_000);
});

test('timer-only signature changes preserve the saved puzzle attempt', () => {
  assert.equal(samePuzzleWithChangedTimer('43|layout|95', '43|layout|10'), true);
  assert.equal(samePuzzleWithChangedTimer('43|layout|95', '43|new-layout|10'), false);
  assert.equal(samePuzzleWithChangedTimer('43|layout|95', '43|layout|invalid'), false);
});

test('changing only outage clocks preserves an authored attempt but changing its pipes does not', () => {
  const signature = (outage: unknown, limit = 80) =>
    [
      '36',
      '5',
      'pipes',
      'rotations',
      '',
      'goals',
      '[]',
      '[]',
      '[]',
      '[]',
      '[]',
      '[]',
      '[]',
      JSON.stringify(outage),
      'true',
      limit,
    ].join('|');
  const before = { breakCell: 12, retrySeconds: 40, turns: [[11, 3]] };
  assert.equal(
    samePuzzleWithChangedTimer(signature(before), signature({ ...before, retrySeconds: 50 }, 70)),
    true,
  );
  assert.equal(
    samePuzzleWithChangedTimer(
      signature(before),
      signature({ ...before, remainingPenaltySeconds: 10 }, 70),
    ),
    true,
  );
  assert.equal(
    samePuzzleWithChangedTimer(signature(before), signature({ ...before, turns: [[13, 3]] }, 70)),
    false,
  );
  assert.equal(samePuzzleWithChangedTimer(signature(null), signature(before, 70)), false);
});

test('rewarded star needs confirmation and is credited only once per receipt', () => {
  const wallet = createHintWallet();
  assert.equal(acceptConfirmedStarReward(wallet, { id: 'star:one', confirmed: false }), false);
  assert.equal(acceptConfirmedStarReward(wallet, { id: 'hint:one', confirmed: true }), false);
  assert.equal(wallet.starBalance, 0);
  assert.equal(acceptConfirmedStarReward(wallet, { id: 'star:one', confirmed: true }), true);
  assert.equal(acceptConfirmedStarReward(wallet, { id: 'star:one', confirmed: true }), false);
  assert.equal(wallet.starBalance, 1);
  assert.deepEqual(wallet.rewardedReceipts, ['star:one']);
});

test('no hidden hints before the tool; its first opening saves three and the star baseline once', () => {
  let progress = createEmptyProgress();
  for (const id of firstChapterLevelIds.slice(0, 11))
    progress = recordLevelResult(progress, id, 3).progress;
  const wallet = createHintWallet(progress);
  assert.equal(wallet.balance, 0);
  assert.equal(wallet.starBaseline, null);
  assert.equal(claimFreeHint(wallet, 1000), false);
  assert.equal(unlockHintTool(wallet), true);
  assert.equal(wallet.balance, 3);
  assert.equal(wallet.starBaseline, 11);
  wallet.balance = 1;
  syncHintProgress(wallet, progress);
  const reloaded = migrateHintWallet(JSON.parse(JSON.stringify(wallet)));
  assert.equal(unlockHintTool(reloaded), false);
  assert.equal(reloaded.balance, 1);
  assert.equal(reloaded.starBaseline, 11);
  assert.equal(wallet.balance, 1);
  assert.deepEqual(wallet.progress, progress);
});

test('twenty new best stars award one across chapters, preserving remainder and old bests', () => {
  let progress = createEmptyProgress();
  progress = recordLevelResult(progress, 31, 1).progress;
  const wallet = createHintWallet(progress);
  unlockHintTool(wallet);
  for (const id of firstChapterLevelIds.slice(1, 14))
    progress = recordLevelResult(progress, id, 3).progress;
  syncHintProgress(wallet, progress);
  assert.equal(wallet.balance, 3); // 18 new stars
  progress = recordLevelResult(progress, firstChapterLevelIds[14], 3).progress;
  syncHintProgress(wallet, progress);
  assert.equal(wallet.balance, 4); // 21 new stars; one carried
  assert.equal(wallet.starMilestone, 1);
  const oldProgress = progress;
  progress = recordLevelResult(progress, 31, 3).progress; // Early best is capped at one.
  for (const id of firstChapterLevelIds.slice(15))
    progress = recordLevelResult(progress, id, 3).progress;
  syncHintProgress(wallet, progress);
  assert.equal(wallet.balance, 5); // 50 new stars; two milestones
  syncHintProgress(wallet, recordLevelResult(progress, 31, 3).progress);
  syncHintProgress(wallet, progress);
  syncHintProgress(wallet, oldProgress);
  syncHintProgress(wallet, createEmptyProgress());
  assert.equal(wallet.balance, 5);
  assert.equal(getProgressStars(wallet.progress), 51);
});

test('entering a chapter never grants inventory or changes the twenty-star remainder', () => {
  const wallet = openedWallet();
  assert.equal(enterHintChapter(wallet, 1), false);
  assert.equal(enterHintChapter(wallet, 2), false);
  wallet.progress.unlockedChapters.push(2);
  const before = wallet.balance;
  assert.equal(enterHintChapter(wallet, 2), false);
  assert.deepEqual(wallet.chapters, []);
  assert.equal(enterHintChapter(wallet, 3), false);
  assert.equal(wallet.balance, before);
  assert.equal(wallet.starMilestone, 0);
});

test('the optional empty-wallet gift observes one shared 24-hour cooldown', () => {
  const wallet = openedWallet();
  assert.equal(claimFreeHint(wallet, 1000), false);
  wallet.balance = 0;
  assert.equal(claimFreeHint(wallet, 1000), true);
  assert.equal(wallet.balance, 1);
  wallet.balance = 0;
  assert.equal(claimFreeHint(wallet, 1001), false);
  assert.equal(claimFreeHint(wallet, 0), false);
  assert.equal(claimFreeHint(wallet, 1000 + hintGiftCooldown - 1), false);
  assert.equal(claimFreeHint(wallet, 1000 + hintGiftCooldown), true);
  assert.equal(freeHintAvailableAt(wallet), 1000 + 2 * hintGiftCooldown);
  const reloaded = migrateHintWallet(JSON.parse(JSON.stringify(wallet)));
  reloaded.balance = 0;
  assert.equal(claimFreeHint(reloaded, 1000 + hintGiftCooldown + 1), false);
  assert.equal(claimFreeHint(reloaded, 1000 + 10 * hintGiftCooldown), true);
  assert.equal(reloaded.balance, 1); // Missed days never accumulate.
});

test('one automatic move costs one for 90, 180 and 270 degrees, including the last hint', () => {
  for (const turns of [1, 2, 3]) {
    const wallet = createHintWallet();
    wallet.balance = 1;
    wallet.attempts[2] = attempt();
    assert.equal(applyHintMutation(wallet, request(turns)), 'applied');
    assert.equal(wallet.balance, 0);
    assert.equal(wallet.attempts[2].rotations[0], turns);
    assert.equal(wallet.attempts[2].revision, 1);
    assert.equal(applyHintMutation(wallet, request(turns)), 'duplicate');
    assert.equal(wallet.balance, 0);
  }
});

test('stale, impossible and failed requests cannot spend a wallet or overwrite an attempt', () => {
  const wallet = openedWallet();
  wallet.attempts[2] = attempt();
  const original = structuredClone(wallet);
  assert.equal(applyHintMutation(wallet, { ...request(), revision: 9 }), 'stale');
  assert.deepEqual(wallet, original);
  assert.equal(applyHintMutation(wallet, { ...request(), transition: () => null }), 'noop');
  assert.deepEqual(wallet, original);
  assert.equal(applyHintMutation(wallet, { ...request(), transition: (a) => a }), 'noop');
  assert.deepEqual(wallet, original);
  assert.throws(() =>
    applyHintMutation(wallet, {
      ...request(),
      transition: () => {
        throw new Error('failed');
      },
    }),
  );
  assert.deepEqual(wallet, original);
  wallet.balance = 0;
  assert.equal(applyHintMutation(wallet, request()), 'empty');
  assert.deepEqual(wallet.attempts[2], original.attempts[2]);
});

test('manual turns and the single tutorial demo are free, with no repeatable demo credit', () => {
  const wallet = openedWallet();
  wallet.attempts[2] = attempt();
  assert.equal(applyHintMutation(wallet, request(3, 'tutorial')), 'applied');
  assert.equal(wallet.balance, 3);
  assert.equal(wallet.attempts[2].demoUsed, true);
  assert.equal(
    applyHintMutation(wallet, { ...request(1, 'tutorial'), revision: 1, operationId: 'two' }),
    'noop',
  );
  assert.equal(
    applyHintMutation(wallet, { ...request(1, 'manual'), revision: 1, operationId: 'manual' }),
    'applied',
  );
  assert.equal(wallet.balance, 3);
});

test('a hint costs stars only when the tool is unlocked and funds are sufficient', () => {
  const wallet = createHintWallet();
  wallet.starBalance = hintStarCost;
  assert.equal(buyHintWithStars(wallet), false);
  unlockHintTool(wallet);
  assert.equal(buyHintWithStars(wallet), true);
  assert.equal(wallet.starBalance, 0);
  assert.equal(wallet.balance, 4);
  assert.equal(buyHintWithStars(wallet), false);
  assert.equal(wallet.balance, 4);
});

test('ad rewards require a confirmed receipt and never reward the same receipt twice', () => {
  const wallet = createHintWallet();
  assert.equal(acceptConfirmedHintReward(wallet, { id: 'receipt', confirmed: false }), false);
  assert.equal(wallet.balance, 0);
  assert.equal(acceptConfirmedHintReward(wallet, { id: 'receipt', confirmed: true }), true);
  assert.equal(acceptConfirmedHintReward(wallet, { id: 'receipt', confirmed: true }), false);
  assert.equal(wallet.balance, 1);
});

test('another tab cannot buy a move while the current hint animation is busy', () => {
  const wallet = openedWallet();
  wallet.attempts[2] = attempt();
  assert.equal(applyHintMutation(wallet, { ...request(), now: 1000, holdMs: 500 }), 'applied');
  const next = { ...request(), revision: 1, operationId: 'next', now: 1100 };
  assert.equal(applyHintMutation(wallet, next), 'busy');
  assert.equal(wallet.balance, 2);
  assert.equal(applyHintMutation(wallet, { ...next, now: 1500 }), 'applied');
  assert.equal(wallet.balance, 1);
});

test('ending an attempt spends exactly one life and creates one idempotent randomized retry', () => {
  const wallet = createHintWallet();
  wallet.attempts[2] = { ...attempt(), demoUsed: true };
  const request = {
    levelId: 2,
    attemptId: 'attempt',
    signature: 'layout',
    rotations: [1, 3],
    timeLimitMs: 95_000,
    operationId: 'abandon-one',
    now: 1_000,
  };
  assert.equal(applyChargeAttemptFailure(wallet, request), 'applied');
  assert.equal(wallet.lives, 4);
  assert.equal(wallet.lifeRefillAt, 1_000 + chargeLifeRechargeMs);
  assert.notEqual(wallet.attempts[2].id, 'attempt');
  assert.deepEqual(wallet.attempts[2].rotations, [1, 3]);
  assert.equal(wallet.attempts[2].timeRemainingMs, 95_000);
  assert.equal(wallet.attempts[2].timerStarted, false);
  assert.equal(wallet.attempts[2].timerDeadlineAt, null);
  assert.equal(wallet.attempts[2].demoUsed, true);
  assert.equal(applyChargeAttemptFailure(wallet, request), 'duplicate');
  assert.equal(wallet.lives, 4);
  assert.equal(
    applyChargeAttemptFailure(wallet, { ...request, operationId: 'stale-two' }),
    'stale',
  );
  assert.equal(wallet.lives, 4);
});

test('the final life locks the prepared retry until a fuse is restored', () => {
  const wallet = createHintWallet();
  wallet.lives = 1;
  wallet.attempts[2] = attempt();
  assert.equal(
    applyChargeAttemptFailure(wallet, {
      levelId: 2,
      attemptId: 'attempt',
      signature: 'layout',
      rotations: [2, 1],
      timeLimitMs: 120_000,
      operationId: 'last-life',
      now: 2_000,
    }),
    'applied',
  );
  assert.equal(wallet.lives, 0);
  assert.equal(wallet.attempts[2].lockedForLife, true);
  refreshChargeLives(wallet, 2_000 + chargeLifeRechargeMs - 1);
  assert.equal(wallet.attempts[2].lockedForLife, true);
  refreshChargeLives(wallet, 2_000 + chargeLifeRechargeMs);
  assert.equal(wallet.lives, 1);
  assert.equal(wallet.attempts[2].lockedForLife, false);
});

test('paid fuses accumulate above five and survive wallet reload without changing the attempt', () => {
  const wallet = createHintWallet();
  wallet.starBalance = 30;
  wallet.attempts[2] = { ...attempt(), timeRemainingMs: 19_000, timerStarted: true };
  const savedAttempt = structuredClone(wallet.attempts[2]);
  for (let count = 0; count < 10; count++) assert.equal(buyChargeLife(wallet, 1_000), true);
  assert.equal(wallet.lives, 15);
  assert.equal(wallet.starBalance, 0);
  assert.equal(wallet.lifeRefillAt, null);
  assert.deepEqual(wallet.attempts[2], savedAttempt);
  const reloaded = migrateHintWallet(JSON.parse(JSON.stringify(wallet)));
  assert.equal(reloaded.lives, 15);
  refreshChargeLives(reloaded, Date.now() + 100 * chargeLifeRechargeMs);
  assert.equal(reloaded.lives, 15);
  assert.equal(reloaded.lifeRefillAt, null);
});

test('free regeneration stops at five and starts only after paid reserves fall below five', () => {
  const wallet = createHintWallet();
  wallet.lives = 7;
  wallet.attempts[2] = attempt();
  for (let count = 0; count < 3; count++) {
    assert.equal(
      applyChargeAttemptFailure(wallet, {
        levelId: 2,
        attemptId: wallet.attempts[2].id,
        signature: 'layout',
        rotations: [1, 3],
        timeLimitMs: 95_000,
        operationId: `reserve-${count}`,
        now: 1_000,
      }),
      'applied',
    );
    assert.equal(wallet.lifeRefillAt, count < 2 ? null : 1_000 + chargeLifeRechargeMs);
  }
  assert.equal(wallet.lives, 4);
  refreshChargeLives(wallet, 1_000 + 10 * chargeLifeRechargeMs);
  assert.equal(wallet.lives, 5);
  assert.equal(wallet.lifeRefillAt, null);
});

test('a fuse purchase charges exactly three stars and does not grant stock when unaffordable', () => {
  const wallet = createHintWallet();
  wallet.starBalance = chargeLifeStarCost - 1;
  assert.equal(buyChargeLife(wallet, 1_000), false);
  assert.equal(wallet.lives, 5);
  assert.equal(wallet.starBalance, 2);
  wallet.starBalance = chargeLifeStarCost;
  assert.equal(buyChargeLife(wallet, 1_000), true);
  assert.equal(wallet.lives, 6);
  assert.equal(wallet.starBalance, 0);
});

test('legacy wallets retain inventory and cooldown without restoring the removed chapter', () => {
  let progress = createEmptyProgress();
  for (const id of firstChapterLevelIds.slice(0, 8))
    progress = recordLevelResult(progress, id, 3).progress;
  const legacy = {
    ...openedWallet(),
    version: 1,
    balance: 9,
    starMilestone: 2,
    attempts: { 1: attempt() },
    freeClaimedAt: 1000,
    progress: { version: 1, levels: progress.levels },
  };
  const wallet = migrateHintWallet(legacy);
  assert.equal(wallet.balance, 9);
  assert.equal(wallet.starBaseline, 8);
  assert.equal(wallet.starMilestone, 0);
  assert.deepEqual(wallet.progress.unlockedChapters, [1]);
  assert.equal(wallet.freeClaimedAt, 1000);
  assert.equal(unlockHintTool(wallet), false);
  syncHintProgress(wallet, progress);
  assert.equal(wallet.balance, 9);
  const reloaded = migrateHintWallet(JSON.parse(JSON.stringify(wallet)));
  assert.deepEqual(reloaded, wallet);
});

test('legacy chapter entry and wallet mirrors cannot restore removed access', () => {
  const entered = migrateHintWallet({
    ...createHintWallet(),
    version: 1,
    chapters: [2],
    balance: 5,
  });
  assert.deepEqual(entered.progress.unlockedChapters, [1]);
  assert.equal(entered.toolUnlocked, false);
  unlockHintTool(entered);
  assert.equal(entered.balance, 5); // Already issued legacy starter is not issued twice.
  const walletProgress = createEmptyProgress();
  const mirrorProgress = createEmptyProgress();
  for (const id of firstChapterLevelIds.slice(0, 4))
    walletProgress.levels[id] = { completed: true, bestStars: 3 };
  for (const id of firstChapterLevelIds.slice(4, 8))
    mirrorProgress.levels[id] = { completed: true, bestStars: 3 };
  const merged = migrateHintWallet(
    { ...createHintWallet(walletProgress), version: 1 },
    mirrorProgress,
  );
  assert.deepEqual(merged.progress.unlockedChapters, [1]);
});
