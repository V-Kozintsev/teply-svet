import type { LevelSummary } from './levels.ts';
import {
  createEmptyProgress,
  firstChapterStars,
  isChapterUnlocked,
  type PlayerProgress,
} from './progress.ts';

export type ChapterVisual = 'first-plot' | 'forest-soon';

export interface ChapterSummary {
  id: number;
  title: string;
  earnedStars: number;
  maxStars: number;
  completedLevels: number;
  totalLevels: number;
  unlockAt: number;
  visual: ChapterVisual;
  comingSoon?: boolean;
  unlocked?: boolean;
  prerequisiteStars?: number;
}

export const chapters: readonly ChapterSummary[] = [
  {
    id: 1,
    title: 'Тихий двор',
    earnedStars: 0,
    maxStars: 51,
    completedLevels: 0,
    totalLevels: 0,
    unlockAt: 0,
    visual: 'first-plot',
  },
  {
    id: 2,
    title: 'На исходе заряда',
    earnedStars: 0,
    maxStars: 0,
    completedLevels: 0,
    totalLevels: 0,
    unlockAt: 0,
    visual: 'forest-soon',
    comingSoon: true,
  },
];

export function applyChapterProgress(
  catalog: readonly ChapterSummary[],
  levelCatalog: readonly LevelSummary[],
  progress: PlayerProgress = createEmptyProgress(),
): readonly ChapterSummary[] {
  return catalog.map((chapter) => {
    const chapterLevels = levelCatalog.filter(
      (level) => (level.chapter ?? Math.ceil(level.id / 12)) === chapter.id,
    );
    const earnedStars = chapterLevels.reduce((total, level) => total + level.stars, 0);
    return {
      ...chapter,
      earnedStars,
      completedLevels: chapterLevels.filter((level) => level.completed).length,
      totalLevels: chapterLevels.length,
      unlocked: isChapterUnlocked(progress, chapter.id),
      prerequisiteStars: firstChapterStars(progress),
    };
  });
}

export function getTotalStars(catalog: readonly ChapterSummary[]) {
  return catalog.reduce((total, chapter) => total + chapter.earnedStars, 0);
}

export function formatChapterStars(totalStars: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
    .format(Math.max(0, Math.floor(totalStars)))
    .replaceAll('\u00a0', '\u202f');
}

export function getChapterState(chapter: ChapterSummary, _totalStars: number) {
  if (chapter.comingSoon) return 'coming-soon' as const;
  if (chapter.id !== 1 && !chapter.unlocked) return 'locked' as const;
  if (chapter.earnedStars >= chapter.maxStars) return 'completed' as const;
  return 'available' as const;
}

export function getCurrentChapter(
  catalog: readonly ChapterSummary[],
  totalStars = getTotalStars(catalog),
) {
  return [...catalog]
    .reverse()
    .find((chapter) => ['available', 'completed'].includes(getChapterState(chapter, totalStars)));
}
