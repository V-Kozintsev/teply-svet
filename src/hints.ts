import {
  createEmptyProgress,
  progressStorageKey,
  readProgress,
  recordLevelResult,
  getProgressStars,
  mergeProgress,
  isChapterUnlocked,
  type PlayerProgress,
} from './progress.ts';

export const hintWalletKey = 'teply-svet.hints.v1';
export const hintGiftCooldown = 24 * 60 * 60 * 1000;
export const maxChargeLives = 5;
export const chargeLifeRechargeMs = 20 * 60 * 1000;
export const dailyChargeCooldown = 24 * 60 * 60 * 1000;
export const chargeLifeStarCost = 3;
export const hintStarCost = 2;

// LAN previews use HTTP, where randomUUID is unavailable in mobile browsers.
export function createHintId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export interface HintAttempt {
  id: string;
  signature: string;
  revision: number;
  rotations: number[];
  planId: string | null;
  manualTurns: number;
  demoUsed: boolean;
  completed: boolean;
  busyUntil: number;
  timeRemainingMs: number | null;
  timerStarted: boolean;
  timerDeadlineAt: number | null;
  outageTriggered: boolean;
  outagePending: boolean;
  lockedForLife: boolean;
}

export function capAttemptTimer(attempt: HintAttempt, timeLimitMs: number, now = Date.now()) {
  const limit = Math.max(1_000, Math.floor(timeLimitMs));
  if (attempt.timeRemainingMs !== null)
    attempt.timeRemainingMs = Math.min(attempt.timeRemainingMs, limit);
  if (attempt.timerDeadlineAt !== null)
    attempt.timerDeadlineAt = Math.min(attempt.timerDeadlineAt, now + limit);
}

export function refreshAttemptTimer(attempt: HintAttempt, timeLimitMs: number) {
  attempt.timeRemainingMs = Math.max(1_000, Math.floor(timeLimitMs));
  attempt.timerStarted = false;
  attempt.timerDeadlineAt = null;
}

export function returningAttemptTimeLimit(
  attempt: HintAttempt,
  timeLimitMs: number,
  outageTimeLimitMs: number | null,
) {
  return attempt.outageTriggered && outageTimeLimitMs !== null ? outageTimeLimitMs : timeLimitMs;
}

export function samePuzzleWithChangedTimer(previous: string, next: string) {
  const previousEnd = previous.lastIndexOf('|');
  const nextEnd = next.lastIndexOf('|');
  if (
    previousEnd <= 0 ||
    nextEnd <= 0 ||
    !/^\d+$/.test(previous.slice(previousEnd + 1)) ||
    !/^\d+$/.test(next.slice(nextEnd + 1))
  )
    return false;
  const previousBoard = previous.slice(0, previousEnd),
    nextBoard = next.slice(0, nextEnd);
  if (previousBoard === nextBoard) return true;
  // Authored signatures contain fifteen board fields before the clock. Changes
  // to an emergency clock or penalty preserve the same saved pipe arrangement.
  const a = previousBoard.split('|'),
    b = nextBoard.split('|');
  if (
    a.length !== 15 ||
    b.length !== 15 ||
    a.some((field, index) => index !== 13 && field !== b[index])
  )
    return false;
  try {
    const withoutClock = (field: string) => {
      const outage = JSON.parse(field);
      if (outage === null || typeof outage !== 'object' || Array.isArray(outage)) return field;
      const { retrySeconds, remainingPenaltySeconds, ...board } = outage;
      return JSON.stringify(board);
    };
    return withoutClock(a[13]) === withoutClock(b[13]);
  } catch {
    return false;
  }
}

export interface HintWallet {
  version: 3;
  revision: number;
  balance: number;
  started: true;
  toolUnlocked: boolean;
  starterGranted: boolean;
  starBaseline: number | null;
  starMilestone: number;
  chapters: number[];
  freeClaimedAt: number | null;
  rewardedReceipts: string[];
  operations: string[];
  attempts: Record<string, HintAttempt>;
  progress: PlayerProgress;
  starBalance: number;
  lives: number;
  lifeRefillAt: number | null;
  dailyChargeClaimedAt: number | null;
}

export function createHintWallet(progress = createEmptyProgress()): HintWallet {
  const wallet: HintWallet = {
    version: 3,
    revision: 0,
    balance: 0,
    started: true,
    toolUnlocked: false,
    starterGranted: false,
    starBaseline: null,
    starMilestone: 0,
    chapters: [],
    freeClaimedAt: null,
    rewardedReceipts: [],
    operations: [],
    attempts: {},
    progress: createEmptyProgress(),
    starBalance: 0,
    lives: maxChargeLives,
    lifeRefillAt: null,
    dailyChargeClaimedAt: null,
  };
  syncHintProgress(wallet, progress);
  wallet.starBalance = getProgressStars(wallet.progress);
  return wallet;
}

export function syncHintProgress(wallet: HintWallet, progress: PlayerProgress): void {
  wallet.progress = mergeProgress(wallet.progress, progress);
  if (!wallet.toolUnlocked || wallet.starBaseline === null) return;
  const milestone = Math.floor(
    Math.max(0, getProgressStars(wallet.progress) - wallet.starBaseline) / 20,
  );
  if (milestone > wallet.starMilestone) {
    wallet.balance += milestone - wallet.starMilestone;
    wallet.starMilestone = milestone;
  }
}

export function unlockHintTool(wallet: HintWallet): boolean {
  if (wallet.toolUnlocked) return false;
  wallet.toolUnlocked = true;
  wallet.starBaseline = getProgressStars(wallet.progress);
  wallet.starMilestone = 0;
  if (!wallet.starterGranted) {
    wallet.balance += 3;
    wallet.starterGranted = true;
  }
  return true;
}

export function enterHintChapter(wallet: HintWallet, chapter: number): boolean {
  if (
    !Number.isInteger(chapter) ||
    chapter < 2 ||
    !isChapterUnlocked(wallet.progress, chapter) ||
    wallet.chapters.includes(chapter)
  )
    return false;
  wallet.chapters.push(chapter);
  return true;
}

export function freeHintAvailableAt(wallet: HintWallet): number {
  if (!wallet.toolUnlocked) return Infinity;
  return wallet.freeClaimedAt === null ? 0 : wallet.freeClaimedAt + hintGiftCooldown;
}

export function claimFreeHint(wallet: HintWallet, now: number): boolean {
  if (
    !wallet.toolUnlocked ||
    wallet.balance !== 0 ||
    !Number.isFinite(now) ||
    now < freeHintAvailableAt(wallet)
  )
    return false;
  wallet.freeClaimedAt = now;
  wallet.balance++;
  return true;
}

export function buyHintWithStars(wallet: HintWallet): boolean {
  if (!wallet.toolUnlocked || wallet.starBalance < hintStarCost) return false;
  wallet.starBalance -= hintStarCost;
  wallet.balance++;
  return true;
}

export function refreshChargeLives(wallet: HintWallet, now: number): void {
  if (!Number.isFinite(now)) return;
  wallet.lives = Math.max(0, Math.floor(wallet.lives));
  if (wallet.lives >= maxChargeLives) {
    wallet.lifeRefillAt = null;
    for (const attempt of Object.values(wallet.attempts)) attempt.lockedForLife = false;
    return;
  }
  if (wallet.lifeRefillAt === null || !Number.isFinite(wallet.lifeRefillAt))
    wallet.lifeRefillAt = now + chargeLifeRechargeMs;
  while (
    wallet.lifeRefillAt !== null &&
    now >= wallet.lifeRefillAt &&
    wallet.lives < maxChargeLives
  ) {
    wallet.lives++;
    wallet.lifeRefillAt += chargeLifeRechargeMs;
  }
  if (wallet.lives > 0)
    for (const attempt of Object.values(wallet.attempts)) attempt.lockedForLife = false;
  if (wallet.lives >= maxChargeLives) wallet.lifeRefillAt = null;
}

export function buyChargeLife(wallet: HintWallet, now: number): boolean {
  refreshChargeLives(wallet, now);
  if (wallet.lives === Number.MAX_SAFE_INTEGER || wallet.starBalance < chargeLifeStarCost)
    return false;
  wallet.starBalance -= chargeLifeStarCost;
  wallet.lives++;
  for (const attempt of Object.values(wallet.attempts)) attempt.lockedForLife = false;
  if (wallet.lives >= maxChargeLives) wallet.lifeRefillAt = null;
  return true;
}

export function dailyChargeAvailableAt(wallet: HintWallet): number {
  return wallet.dailyChargeClaimedAt === null
    ? 0
    : wallet.dailyChargeClaimedAt + dailyChargeCooldown;
}

export function claimDailyChargeLives(wallet: HintWallet, now: number): boolean {
  refreshChargeLives(wallet, now);
  if (wallet.lives !== 0 || !Number.isFinite(now) || now < dailyChargeAvailableAt(wallet))
    return false;
  wallet.dailyChargeClaimedAt = now;
  wallet.lives = Math.min(maxChargeLives, wallet.lives + 2);
  for (const attempt of Object.values(wallet.attempts)) attempt.lockedForLife = false;
  wallet.lifeRefillAt = now + chargeLifeRechargeMs;
  return true;
}

// Only the rewarded-ad callback may confirm this receipt; a closed ad is not a reward.
export function acceptConfirmedHintReward(
  wallet: HintWallet,
  receipt: { id: string; confirmed: boolean },
): boolean {
  if (!receipt.confirmed || !receipt.id || wallet.rewardedReceipts.includes(receipt.id))
    return false;
  wallet.rewardedReceipts.push(receipt.id);
  wallet.balance++;
  return true;
}

export function acceptConfirmedStarReward(
  wallet: HintWallet,
  receipt: { id: string; confirmed: boolean },
): boolean {
  if (
    !receipt.confirmed ||
    !receipt.id.startsWith('star:') ||
    wallet.rewardedReceipts.includes(receipt.id)
  )
    return false;
  wallet.rewardedReceipts.push(receipt.id);
  wallet.starBalance++;
  return true;
}

export interface HintMutation {
  levelId: number;
  attemptId: string;
  revision: number;
  operationId: string;
  kind: 'manual' | 'hint' | 'tutorial';
  now?: number;
  holdMs?: number;
  transition: (attempt: HintAttempt) => HintAttempt | null;
}

export type HintMutationStatus = 'applied' | 'duplicate' | 'stale' | 'busy' | 'empty' | 'noop';

export type ChargeAttemptFailureStatus = 'applied' | 'duplicate' | 'stale' | 'empty';

export interface ChargeAttemptFailure {
  levelId: number;
  attemptId: string;
  signature: string;
  rotations: number[];
  timeLimitMs: number;
  operationId: string;
  now?: number;
}

export function applyChargeAttemptFailure(
  wallet: HintWallet,
  request: ChargeAttemptFailure,
): ChargeAttemptFailureStatus {
  refreshChargeLives(wallet, request.now ?? Date.now());
  if (wallet.operations.includes(request.operationId)) return 'duplicate';
  const attempt = wallet.attempts[request.levelId];
  if (
    !attempt ||
    attempt.id !== request.attemptId ||
    attempt.completed ||
    request.signature !== attempt.signature ||
    request.rotations.length !== attempt.rotations.length ||
    !request.rotations.every(Number.isSafeInteger)
  )
    return 'stale';
  if (wallet.lives <= 0) return 'empty';
  const now = request.now ?? Date.now();
  wallet.lives--;
  if (wallet.lives < maxChargeLives && wallet.lifeRefillAt === null)
    wallet.lifeRefillAt = now + chargeLifeRechargeMs;
  wallet.attempts[request.levelId] = {
    id: createHintId(),
    signature: request.signature,
    revision: 0,
    rotations: [...request.rotations],
    planId: null,
    manualTurns: 0,
    demoUsed: attempt.demoUsed,
    completed: false,
    busyUntil: 0,
    timeRemainingMs: Math.max(1_000, Math.floor(request.timeLimitMs)),
    timerStarted: false,
    timerDeadlineAt: null,
    outageTriggered: false,
    outagePending: false,
    lockedForLife: wallet.lives === 0,
  };
  wallet.operations = [...wallet.operations.slice(-511), request.operationId];
  return 'applied';
}

export function applyHintMutation(wallet: HintWallet, request: HintMutation): HintMutationStatus {
  if (wallet.operations.includes(request.operationId)) return 'duplicate';
  const attempt = wallet.attempts[request.levelId];
  if (
    !attempt ||
    attempt.id !== request.attemptId ||
    attempt.revision !== request.revision ||
    attempt.completed
  )
    return 'stale';
  const now = request.now ?? Date.now();
  if (now < (attempt.busyUntil ?? 0)) return 'busy';
  if (request.kind === 'tutorial' && attempt.demoUsed) return 'noop';
  const next = request.transition(structuredClone(attempt));
  if (
    !next ||
    next.rotations.length !== attempt.rotations.length ||
    !next.rotations.every(Number.isSafeInteger) ||
    next.rotations.every((angle, index) => angle === attempt.rotations[index])
  )
    return 'noop';
  const cost = request.kind === 'hint' ? 1 : 0;
  if (wallet.balance < cost) return 'empty';
  next.id = attempt.id;
  next.signature = attempt.signature;
  next.revision = attempt.revision + 1;
  next.demoUsed = attempt.demoUsed || request.kind === 'tutorial';
  next.busyUntil =
    request.kind === 'manual' ? 0 : now + Math.min(1000, Math.max(0, request.holdMs ?? 0));
  wallet.attempts[request.levelId] = next;
  wallet.balance -= cost;
  // Older replayed requests also fail the attempt/revision check after this bounded log.
  wallet.operations = [...wallet.operations.slice(-511), request.operationId];
  return 'applied';
}

export function migrateHintWallet(value: unknown, incoming = createEmptyProgress()): HintWallet {
  const wallet = value as HintWallet;
  const version = (value as { version?: unknown })?.version;
  if (
    !wallet ||
    (version !== 1 && version !== 2 && version !== 3) ||
    wallet.started !== true ||
    !Number.isSafeInteger(wallet.balance) ||
    wallet.balance < 0 ||
    !Number.isSafeInteger(wallet.revision) ||
    !Number.isSafeInteger(wallet.starMilestone) ||
    !Array.isArray(wallet.chapters) ||
    !Array.isArray(wallet.operations) ||
    !Array.isArray(wallet.rewardedReceipts) ||
    !wallet.attempts ||
    !wallet.progress
  ) {
    throw new Error('Не удалось прочитать сохранённый запас подсказок');
  }
  wallet.progress = mergeProgress(readProgress(JSON.stringify(wallet.progress)), incoming);
  if (version === 1) {
    // Keep previously issued inventory and cooldown. Old stars never pay a second time.
    wallet.version = 3;
    wallet.toolUnlocked =
      Object.keys(wallet.attempts).some((key) => {
        const id = Number(key);
        return (id >= 1 && id <= 30) || [39, 40, 41].includes(id);
      }) ||
      Object.keys(wallet.progress.levels).some((key) => {
        const id = Number(key);
        return (id >= 1 && id <= 30) || [39, 40, 41].includes(id);
      });
    wallet.starterGranted = true;
    wallet.starBaseline = wallet.toolUnlocked ? getProgressStars(wallet.progress) : null;
    wallet.starMilestone = 0;
  } else if (
    typeof wallet.toolUnlocked !== 'boolean' ||
    typeof wallet.starterGranted !== 'boolean' ||
    (wallet.toolUnlocked
      ? !Number.isSafeInteger(wallet.starBaseline) || wallet.starBaseline! < 0
      : wallet.starBaseline !== null)
  ) {
    throw new Error('Не удалось прочитать правила подсказок');
  }
  if (version === 1 || version === 2) {
    wallet.version = 3;
    wallet.starBalance = getProgressStars(wallet.progress);
    wallet.lives = maxChargeLives;
    wallet.lifeRefillAt = null;
    wallet.dailyChargeClaimedAt = null;
  } else if (
    !Number.isSafeInteger(wallet.starBalance) ||
    wallet.starBalance < 0 ||
    !Number.isSafeInteger(wallet.lives) ||
    wallet.lives < 0 ||
    (wallet.lifeRefillAt !== null && !Number.isFinite(wallet.lifeRefillAt)) ||
    (wallet.dailyChargeClaimedAt !== null && !Number.isFinite(wallet.dailyChargeClaimedAt))
  ) {
    throw new Error('Не удалось прочитать запас заряда');
  }
  for (const attempt of Object.values(wallet.attempts)) {
    if (!Number.isFinite(attempt.timeRemainingMs)) attempt.timeRemainingMs = null;
    if (typeof attempt.timerStarted !== 'boolean') attempt.timerStarted = false;
    if (!Number.isFinite(attempt.timerDeadlineAt)) attempt.timerDeadlineAt = null;
    if (typeof attempt.outageTriggered !== 'boolean') attempt.outageTriggered = false;
    if (typeof attempt.outagePending !== 'boolean') attempt.outagePending = false;
    if (typeof attempt.lockedForLife !== 'boolean') attempt.lockedForLife = false;
  }
  refreshChargeLives(wallet, Date.now());
  return wallet;
}

export function createHintWalletStore() {
  let database: Promise<IDBDatabase> | null = null;
  let current: HintWallet | null = null;
  const listeners = new Set<(wallet: HintWallet) => void>();
  const channel =
    typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(hintWalletKey);
  function open() {
    database ??= new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('teply-svet.player', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('profile');
      request.onerror = () => {
        database = null;
        reject(request.error);
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          database = null;
        };
        db.onclose = () => {
          database = null;
        };
        resolve(db);
      };
    }).catch((error) => {
      // A synchronous open() failure also rejects the promise. Do not cache that
      // failed promise forever: the loading retry must be able to open storage again.
      database = null;
      throw error;
    });
    return database;
  }
  function notify(wallet: HintWallet) {
    if (current && current.revision >= wallet.revision) return;
    current = wallet;
    for (const listener of listeners) {
      try {
        listener(structuredClone(wallet));
      } catch {
        /* UI subscribers cannot cancel a committed operation. */
      }
    }
  }
  async function transact<T>(
    apply: (wallet: HintWallet) => T,
  ): Promise<{ wallet: HintWallet; result: T }> {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profile', 'readwrite');
      const store = tx.objectStore('profile');
      const read = store.get(hintWalletKey);
      let wallet: HintWallet;
      let result: T;
      let changed = false;
      tx.onabort = tx.onerror = () =>
        reject(tx.error ?? new Error('Не удалось сохранить подсказку'));
      read.onsuccess = () => {
        try {
          const raw = localStorage.getItem(hintWalletKey);
          const stored = read.result ?? (raw ? JSON.parse(raw) : null);
          const before = JSON.stringify(stored);
          const progress = readProgress(localStorage.getItem(progressStorageKey));
          wallet = stored ? migrateHintWallet(stored, progress) : createHintWallet(progress);
          syncHintProgress(wallet, progress);
          refreshChargeLives(wallet, Date.now());
          result = apply(wallet);
          changed = !read.result || before !== JSON.stringify(wallet);
          if (changed) {
            wallet.revision++;
            store.put(wallet, hintWalletKey);
          }
        } catch (error) {
          tx.abort();
          reject(error);
        }
      };
      tx.oncomplete = () => {
        // IndexedDB is authoritative. This mirror supports the existing menu/save format.
        try {
          const mirror = JSON.parse(
            localStorage.getItem(hintWalletKey) ?? 'null',
          ) as HintWallet | null;
          if (!mirror || mirror.revision <= wallet.revision) {
            localStorage.setItem(hintWalletKey, JSON.stringify(wallet));
            localStorage.setItem(progressStorageKey, JSON.stringify(wallet.progress));
          }
        } catch {
          /* A full localStorage mirror cannot undo a committed IndexedDB move. */
        }
        notify(wallet);
        if (changed) channel?.postMessage(wallet.revision);
        resolve({ wallet: structuredClone(wallet), result });
      };
    });
  }
  const refresh = () => transact(() => undefined);
  if (channel)
    channel.onmessage = () => {
      void refresh().catch(() => undefined);
    };
  const onStorage = (event: StorageEvent) => {
    if (event.key === hintWalletKey || event.key === progressStorageKey)
      void refresh().catch(() => undefined);
  };
  window.addEventListener('storage', onStorage);
  return {
    read: refresh,
    subscribe(listener: (wallet: HintWallet) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    enterChapter(chapter: number) {
      return transact((wallet) => enterHintChapter(wallet, chapter));
    },
    claimFree(now = Date.now()) {
      return transact((wallet) => claimFreeHint(wallet, now));
    },
    buyHint() {
      return transact((wallet) => buyHintWithStars(wallet));
    },
    acceptRewardedHint(id: string) {
      return transact((wallet) => acceptConfirmedHintReward(wallet, { id, confirmed: true }));
    },
    acceptRewardedStar(id: string) {
      return transact((wallet) => acceptConfirmedStarReward(wallet, { id, confirmed: true }));
    },
    openAttempt(
      levelId: number,
      signature: string,
      rotations: number[],
      restart = false,
      chapter = Math.ceil(levelId / 12),
      hintsEnabled = false,
      timeLimitMs = 120_000,
      refreshTimer = false,
      outageTimeLimitMs: number | null = null,
    ) {
      return transact((wallet) => {
        enterHintChapter(wallet, chapter);
        if (hintsEnabled) unlockHintTool(wallet);
        const previous = wallet.attempts[levelId];
        if (
          !restart &&
          previous &&
          !previous.completed &&
          samePuzzleWithChangedTimer(previous.signature, signature)
        )
          previous.signature = signature;
        if (restart || !previous || previous.signature !== signature || previous.completed) {
          wallet.attempts[levelId] = {
            id: createHintId(),
            signature,
            revision: 0,
            rotations: [...rotations],
            planId: null,
            manualTurns: 0,
            demoUsed: false,
            completed: false,
            busyUntil: 0,
            timeRemainingMs: Math.max(1_000, Math.floor(timeLimitMs)),
            timerStarted: false,
            timerDeadlineAt: null,
            outageTriggered: false,
            outagePending: false,
            lockedForLife: false,
          };
        } else if (refreshTimer)
          refreshAttemptTimer(
            previous,
            returningAttemptTimeLimit(previous, timeLimitMs, outageTimeLimitMs),
          );
        else capAttemptTimer(previous, timeLimitMs);
      });
    },
    mutate(request: HintMutation) {
      return transact((wallet) => applyHintMutation(wallet, request));
    },
    complete(levelId: number, attemptId: string, stars: number) {
      return transact((wallet) => {
        const attempt = wallet.attempts[levelId];
        if (!attempt || attempt.id !== attemptId) return false;
        const result = recordLevelResult(wallet.progress, levelId, stars);
        syncHintProgress(wallet, result.progress);
        wallet.starBalance += result.gainedStars;
        attempt.completed = true;
        return true;
      });
    },
    saveTimer(
      levelId: number,
      attemptId: string,
      remainingMs: number,
      started: boolean,
      deadlineAt: number | null,
    ) {
      return transact((wallet) => {
        const attempt = wallet.attempts[levelId];
        if (!attempt || attempt.id !== attemptId || attempt.completed) return false;
        attempt.timeRemainingMs = Math.max(0, Math.floor(remainingMs));
        attempt.timerStarted = Boolean(started);
        attempt.timerDeadlineAt = Number.isFinite(deadlineAt) ? Math.floor(deadlineAt!) : null;
        return true;
      });
    },
    triggerOutage(levelId: number, attemptId: string, rotations: number[], remainingMs: number) {
      return transact((wallet) => {
        const attempt = wallet.attempts[levelId];
        if (
          !attempt ||
          attempt.id !== attemptId ||
          attempt.completed ||
          attempt.outageTriggered ||
          rotations.length !== attempt.rotations.length ||
          !rotations.every(Number.isSafeInteger)
        )
          return false;
        attempt.revision++;
        attempt.rotations = [...rotations];
        attempt.planId = null;
        attempt.manualTurns = 0;
        attempt.busyUntil = 0;
        attempt.timeRemainingMs = Math.max(0, Math.floor(remainingMs));
        attempt.timerStarted = false;
        attempt.timerDeadlineAt = null;
        attempt.outageTriggered = true;
        attempt.outagePending = true;
        return true;
      });
    },
    acknowledgeOutage(levelId: number, attemptId: string, now = Date.now()) {
      return transact((wallet) => {
        const attempt = wallet.attempts[levelId];
        if (!attempt || attempt.id !== attemptId || attempt.completed || !attempt.outagePending)
          return false;
        attempt.revision++;
        attempt.outagePending = false;
        attempt.timerStarted = true;
        attempt.timerDeadlineAt = now + Math.max(0, attempt.timeRemainingMs ?? 0);
        return true;
      });
    },
    failTimedAttempt(
      levelId: number,
      attemptId: string,
      signature: string,
      rotations: number[],
      timeLimitMs: number,
      operationId: string,
      now = Date.now(),
    ) {
      return transact((wallet) =>
        applyChargeAttemptFailure(wallet, {
          levelId,
          attemptId,
          signature,
          rotations,
          timeLimitMs,
          operationId,
          now,
        }),
      );
    },
    abandonTimedAttempt(
      levelId: number,
      attemptId: string,
      signature: string,
      rotations: number[],
      timeLimitMs: number,
      operationId: string,
      now = Date.now(),
    ) {
      return transact((wallet) =>
        applyChargeAttemptFailure(wallet, {
          levelId,
          attemptId,
          signature,
          rotations,
          timeLimitMs,
          operationId,
          now,
        }),
      );
    },
    buyLife(now = Date.now()) {
      return transact((wallet) => buyChargeLife(wallet, now));
    },
    claimDailyCharge(now = Date.now()) {
      return transact((wallet) => claimDailyChargeLives(wallet, now));
    },
    dispose() {
      channel?.close();
      window.removeEventListener('storage', onStorage);
      listeners.clear();
    },
  };
}
