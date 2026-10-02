import { getSavedLevel, type PlayerProgress, type StarScore } from './progress.ts';

export interface LevelSummary {
  id: number;
  displayNumber?: number;
  chapter?: number;
  name: string;
  completed: boolean;
  stars: StarScore;
  maxStars?: StarScore;
  path?: string;
  selectable?: boolean;
}

export function getLevelMaximumStars(displayNumber: number): Exclude<StarScore, 0> {
  if (displayNumber < 12) return 1;
  if (displayNumber < 14) return 2;
  return 3;
}

export function hasMaximumLevelStars(level: LevelSummary): boolean {
  const maximum = level.maxStars ?? getLevelMaximumStars(level.displayNumber ?? level.id);
  return level.completed && level.stars >= maximum;
}

const originalLevels: readonly LevelSummary[] = [
  'Перекрёстный двор',
  'Звёздная дорожка',
  'Тропа у калитки',
  'С другой стороны',
  'Дальний огонёк',
  'Подземный ход',
  'Подземное переплетение',
  'Две тайные линии',
  'Труба на салазках',
  'Нужное положение',
  'Путь со звёздами',
  'Согласованный свет',
].map((name, index) => ({
  id: index + 1,
  displayNumber: index === 0 ? 12 : index + 15,
  chapter: 1,
  name,
  completed: false,
  stars: 0,
  path: `./levels/${index + 1}/index.html`,
}));

// IDs remain save keys; visible numbering follows the expanding chapter catalog.
const openingIds = [31, 32, 33, 34, 35, 36, 37, 42, 38, 43, 44, 41, 39, 40] as const;
const openingLevels: readonly LevelSummary[] = [
  'Первый свет',
  'Свет за поворотом',
  'Небольшой обход',
  'Дорожка через двор',
  'Путь к огоньку',
  'Лишний поворот',
  'Найди свою дорожку',
  'За ближним поворотом',
  'Через середину двора',
  'Дальний обход',
  'Перед большим путём',
  'Первый свет звезды',
  'Дорога к звезде',
  'Два огонька',
].map((name, index) => ({
  id: openingIds[index],
  displayNumber: index < 11 ? 1 + index : 2 + index,
  chapter: 1,
  name,
  completed: false,
  stars: 0 as StarScore,
  path: `./levels/${openingIds[index]}/index.html`,
}));

export const levels: readonly LevelSummary[] = [
  ...openingLevels.slice(0, 11),
  originalLevels[0],
  ...openingLevels.slice(11),
  ...originalLevels.slice(1, 12),
]
  .filter((level) => level.id !== 35)
  .map((level, index) => ({ ...level, displayNumber: index + 1 }));

export function applyLevelProgress(
  catalog: readonly LevelSummary[],
  progress: PlayerProgress,
): readonly LevelSummary[] {
  return catalog.map((level) => {
    const saved = level.path ? getSavedLevel(progress, level.id) : undefined;
    const maxStars = getLevelMaximumStars(level.displayNumber ?? level.id);
    return saved
      ? {
          ...level,
          completed: true,
          stars: Math.min(saved.bestStars, maxStars) as StarScore,
          maxStars,
        }
      : { ...level, completed: false, stars: 0, maxStars };
  });
}

export function getLevelUrl(level: LevelSummary, baseUrl: string) {
  return level.path ? new URL(level.path, baseUrl).href : null;
}

export const levelsPerPage = 12;

export function getLevelPage(
  catalog: readonly LevelSummary[],
  requestedPage?: number,
  pageSize = levelsPerPage,
  balanced = false,
) {
  const perPage = Math.max(1, Math.floor(pageSize));
  const nextIndex = catalog.findIndex(
    (level) => !level.completed && Boolean(level.path || level.selectable),
  );
  const nextId = catalog[nextIndex]?.id;
  const pageCount = Math.max(1, Math.ceil(catalog.length / perPage));
  const base = Math.floor(catalog.length / pageCount);
  const extra = catalog.length % pageCount;
  const start = (page: number) => (balanced ? page * base + Math.min(page, extra) : page * perPage);
  const initialPage =
    nextIndex < 0
      ? pageCount - 1
      : (Array.from({ length: pageCount }, (_, page) => page).find(
          (page) => nextIndex < start(page + 1),
        ) ?? 0);
  const page = Math.max(0, Math.min(pageCount - 1, requestedPage ?? initialPage));
  return {
    page,
    pageCount,
    total: catalog.length,
    completed: catalog.filter((level) => level.completed).length,
    items: catalog.slice(start(page), start(page + 1)).map((level) => ({
      ...level,
      // Replay is always available; stars are a result, not an entry fee.
      state: level.completed ? 'completed' : level.id === nextId ? 'current' : 'locked',
    })),
  };
}
