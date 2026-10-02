import type { LevelSummary } from '../levels';

// Used only by the explicit local design preview, never as saved player progress.
export function createPreviewLevels(): readonly LevelSummary[] {
  const sampleStars = [3, 2, 1, 3, 2, 1] as const;
  return Array.from({ length: 36 }, (_, index) => ({
    id: index + 1,
    name: `Пример уровня ${index + 1}`,
    completed: index < sampleStars.length,
    stars: sampleStars[index] ?? 0,
    selectable: true,
  }));
}
