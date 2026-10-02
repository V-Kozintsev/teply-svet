// Stable save IDs, not visible level numbers. Removed lamp and prototype boards
// stay outside the playable catalog; their pipe renderers remain available.
export const chapterOneIds = Object.freeze([
  ...Array.from({ length: 12 }, (_, i) => i + 1),
  ...Array.from({ length: 14 }, (_, i) => i + 31).filter(id => id !== 35),
]);
export const isChapterOne = id => chapterOneIds.includes(id);
export const isAdaptiveLevel = isChapterOne;
