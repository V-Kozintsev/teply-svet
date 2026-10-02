export type StarScore = 0 | 1 | 2 | 3;

export interface SavedLevelProgress {
  completed: true;
  bestStars: Exclude<StarScore, 0>;
}

export interface PlayerProgress {
  version: 1;
  rulesVersion: 2;
  levels: Record<string, SavedLevelProgress>;
  unlockedChapters: number[];
}

export const progressStorageKey = 'teply-svet.progress.v1';
// Stable save IDs, not visible numbers. Keep this mapping checked against the catalog.
export const firstChapterLevelIds = [
  31, 32, 33, 34, 36, 37, 42, 38, 43, 44, 1, 41, 39, 40, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
] as const;
export const firstChapterFinalLevelId = 12;

export function getLevelStarCap(levelId: number): Exclude<StarScore, 0> {
  // Retired results remain in the save and wallet history with their original cap.
  if (levelId === 35) return 1;
  const position = firstChapterLevelIds.indexOf(levelId as (typeof firstChapterLevelIds)[number]);
  if (position < 0) return 3;
  if (position < 11) return 1;
  if (position < 13) return 2;
  return 3;
}

function normalizeLevelStars(levelId: number, stars: number): Exclude<StarScore, 0> {
  return Math.max(1, Math.min(getLevelStarCap(levelId), Math.floor(stars))) as Exclude<
    StarScore,
    0
  >;
}

export function firstChapterStars(progress: PlayerProgress): number {
  return firstChapterLevelIds.reduce((sum, id) => {
    const saved = progress.levels[id]?.bestStars;
    return sum + (saved ? normalizeLevelStars(id, saved) : 0);
  }, 0);
}

export function isChapterUnlocked(_progress: PlayerProgress, chapter: number): boolean {
  return chapter === 1;
}

export function mergeProgress(current: PlayerProgress, incoming: PlayerProgress): PlayerProgress {
  const next: PlayerProgress = {
    version: 1,
    rulesVersion: 2,
    levels: Object.fromEntries(
      Object.entries(current.levels).map(([id, result]) => [
        id,
        { completed: true, bestStars: normalizeLevelStars(Number(id), result.bestStars) },
      ]),
    ),
    unlockedChapters: [1],
  };
  for (const [id, result] of Object.entries(incoming.levels)) {
    const levelId = Number(id);
    const incomingStars = normalizeLevelStars(levelId, result.bestStars);
    const currentStars = next.levels[id]
      ? normalizeLevelStars(levelId, next.levels[id].bestStars)
      : 0;
    const bestStars = Math.max(incomingStars, currentStars);
    next.levels[id] = { completed: true, bestStars: bestStars as 1 | 2 | 3 };
  }
  return next;
}

export function createEmptyProgress(): PlayerProgress {
  return { version: 1, rulesVersion: 2, levels: {}, unlockedChapters: [1] };
}

export function readProgress(raw: string | null): PlayerProgress {
  if (!raw) return createEmptyProgress();
  try {
    const parsed = JSON.parse(raw) as {
      version?: unknown;
      rulesVersion?: unknown;
      unlockedChapters?: unknown;
      levels?: Record<string, { completed?: unknown; bestStars?: unknown }>;
    };
    if (parsed.version !== 1 || !parsed.levels || typeof parsed.levels !== 'object') {
      return createEmptyProgress();
    }

    const levels: Record<string, SavedLevelProgress> = {};
    for (const [key, value] of Object.entries(parsed.levels)) {
      const levelId = Number(key);
      const stars = Number(value?.bestStars);
      if (
        !Number.isInteger(levelId) ||
        levelId < 1 ||
        value?.completed !== true ||
        !Number.isInteger(stars) ||
        stars < 1 ||
        stars > 3
      ) {
        continue;
      }
      levels[String(levelId)] = {
        completed: true,
        bestStars: normalizeLevelStars(levelId, stars),
      };
    }
    const progress: PlayerProgress = {
      version: 1,
      rulesVersion: 2,
      levels,
      unlockedChapters: [1],
    };
    return progress;
  } catch {
    return createEmptyProgress();
  }
}

export function getSavedLevel(progress: PlayerProgress, levelId: number) {
  const saved = progress.levels[String(levelId)];
  return saved ? { ...saved, bestStars: normalizeLevelStars(levelId, saved.bestStars) } : undefined;
}

export function recordLevelResult(
  progress: PlayerProgress,
  levelId: number,
  stars: number,
): { progress: PlayerProgress; gainedStars: number } {
  if (!Number.isInteger(levelId) || levelId < 1 || !Number.isFinite(stars) || stars < 1) {
    return { progress, gainedStars: 0 };
  }
  const awarded = normalizeLevelStars(levelId, stars);
  const storedPrevious = progress.levels[String(levelId)]?.bestStars ?? 0;
  const previous = storedPrevious ? normalizeLevelStars(levelId, storedPrevious) : 0;
  const bestStars = Math.max(previous, awarded) as SavedLevelProgress['bestStars'];
  if (storedPrevious === bestStars) return { progress, gainedStars: 0 };
  const next: PlayerProgress = {
    ...progress,
    unlockedChapters: [1],
    levels: {
      ...progress.levels,
      [String(levelId)]: { completed: true, bestStars },
    },
  };
  return {
    progress: next,
    gainedStars: bestStars - previous,
  };
}

export function getProgressStars(progress: PlayerProgress) {
  return Object.entries(progress.levels).reduce(
    (total, [id, level]) => total + normalizeLevelStars(Number(id), level.bestStars),
    0,
  );
}
