import chapterScreenHtml from './ui/chapters.html?raw';
import { createSelectionFeedback } from './selection-feedback';
import {
  formatChapterStars,
  getChapterState,
  type ChapterSummary,
  type ChapterVisual,
} from './chapters';

const star =
  '<img class="chapter-star" src="./assets/menu/star-filled.png" alt="" draggable="false" />';
const completedMark =
  '<svg class="chapter-completed-mark" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5"/><path d="m7 12 3.3 3.3L17 8.6"/></svg>';

function buildScenery(visual: ChapterVisual) {
  if (visual === 'first-plot') {
    return '<img class="chapter-courtyard-art" src="./assets/menu/chapter-courtyard.webp" width="1024" height="1024" alt="" draggable="false" decoding="async" />';
  }

  return '<img class="chapter-forest-art" src="./assets/menu/forest-soon.webp" alt="" draggable="false" decoding="async" />';
}

export function getChapterScreenMarkup() {
  return chapterScreenHtml;
}

export function mountChapterSelection(
  screen: HTMLElement,
  catalog: readonly ChapterSummary[],
  totalStars: number,
  availableStars: number | null,
  onSelect: (chapter: ChapterSummary, button: HTMLButtonElement) => void,
  onHome: () => void,
  onInteract: () => void,
  onStars: (button: HTMLButtonElement) => void,
) {
  const selectionFeedback = createSelectionFeedback();
  const viewport = screen.querySelector<HTMLElement>('.chapter-scroll')!;
  const list = screen.querySelector<HTMLOListElement>('.chapter-list')!;
  const previous = screen.querySelector<HTMLButtonElement>('[data-chapter-page="previous"]')!;
  const next = screen.querySelector<HTMLButtonElement>('[data-chapter-page="next"]')!;
  const total = screen.querySelector<HTMLElement>('[data-chapter-total]')!;
  const topUpButton = screen.querySelector<HTMLButtonElement>('[data-chapter-action="stars"]')!;
  function setAvailableStars(balance: number | null) {
    const formatted = balance === null ? '—' : formatChapterStars(balance);
    total.textContent = formatted;
    topUpButton.setAttribute(
      'aria-label',
      balance === null
        ? 'Пополнить звёзды. Баланс недоступен'
        : `Доступно звёзд: ${formatted}. Пополнить`,
    );
  }
  setAvailableStars(availableStars);
  list.replaceChildren();

  for (const [page, chapter] of catalog.entries()) {
    const state = getChapterState(chapter, totalStars);
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chapter-card';
    button.dataset.chapterId = String(chapter.id);
    button.dataset.state = state;
    button.disabled = state === 'locked' || state === 'coming-soon';
    button.setAttribute(
      'aria-label',
      state === 'coming-soon'
        ? `Глава ${chapter.id}. Скоро`
        : state === 'locked'
          ? `Глава ${chapter.id}. Закрыта. Звёзды первой главы: ${chapter.prerequisiteStars ?? 0} из ${chapter.unlockAt}`
          : `Глава ${chapter.id}. Пройдено ${chapter.completedLevels} из ${chapter.totalLevels} уровней`,
    );

    const status =
      state === 'coming-soon'
        ? '<span class="chapter-coming-soon">Скоро</span>'
        : state === 'locked'
          ? `<span class="chapter-lock-group" aria-hidden="true"><span class="chapter-lock"><i data-lucide="lock-keyhole"></i></span><span class="chapter-threshold">${star}<strong>${chapter.prerequisiteStars ?? 0}</strong><span>/</span><strong>${chapter.unlockAt}</strong></span></span>`
          : `<span class="chapter-progress" style="--chapter-completion: ${chapter.totalLevels ? (chapter.completedLevels / chapter.totalLevels) * 100 : 0}%"><span class="chapter-progress-label">${completedMark}<span>Пройдено <strong>${chapter.completedLevels}</strong> из <strong>${chapter.totalLevels}</strong></span></span><span class="chapter-progress-track"><span class="chapter-progress-fill"></span></span></span>`;

    button.innerHTML = `
      <span class="chapter-visual chapter-visual-${chapter.visual}" aria-hidden="true">${buildScenery(chapter.visual)}<span class="chapter-status">${status}</span></span>
      <span class="chapter-card-copy">
        <span class="chapter-number">Глава ${chapter.id}</span>
        <span class="chapter-divider" aria-hidden="true"><i></i><b></b><i></i></span>
      </span>`;
    button.addEventListener('click', () => {
      if (button.disabled || !isCenteredPage(page)) return;
      if (
        selectionFeedback.run(button, () => {
          if (isCenteredPage(page)) onSelect(chapter, button);
        })
      )
        onInteract();
    });
    item.append(button);
    list.append(item);
  }

  let currentPage = 0;
  let scrollFrame = 0;
  let resizeFrame = 0;
  let resizing = false;
  let viewportWidth = viewport.clientWidth;
  let viewportHeight = viewport.clientHeight;

  function getPageCount() {
    return Math.max(1, catalog.length);
  }

  function getPageOffset(page: number) {
    const item = list.children.item(page) as HTMLElement | null;
    if (!item) return 0;
    const itemBox = item.getBoundingClientRect();
    const viewportBox = viewport.getBoundingClientRect();
    const centeredOffset =
      viewport.scrollLeft +
      itemBox.left -
      viewportBox.left -
      (viewportBox.width - itemBox.width) / 2;
    const lastOffset = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    return Math.max(0, Math.min(lastOffset, centeredOffset));
  }

  function updateArrows() {
    const lastPage = getPageCount() - 1;
    previous.disabled = currentPage <= 0;
    next.disabled = currentPage >= lastPage;
    for (const [page, item] of Array.from(list.children).entries()) {
      const button = item.querySelector<HTMLButtonElement>('.chapter-card')!;
      const unavailable = ['locked', 'coming-soon'].includes(button.dataset.state!);
      button.disabled = unavailable || !isCenteredPage(page);
    }
  }

  function isCenteredPage(page: number) {
    const item = list.children.item(page);
    if (!item || page !== currentPage || !viewport.clientWidth) return false;
    const cardBox = item.getBoundingClientRect();
    const viewportBox = viewport.getBoundingClientRect();
    return (
      Math.abs(cardBox.left + cardBox.width / 2 - viewportBox.left - viewportBox.width / 2) <= 2
    );
  }

  function moveToPage(page: number, behavior: ScrollBehavior) {
    currentPage = Math.max(0, Math.min(getPageCount() - 1, page));
    viewport.scrollTo({ left: getPageOffset(currentPage), behavior });
    updateArrows();
  }

  function nearestPage() {
    let page = 0;
    let distance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < getPageCount(); index++) {
      const nextDistance = Math.abs(viewport.scrollLeft - getPageOffset(index));
      if (nextDistance >= distance) break;
      page = index;
      distance = nextDistance;
    }
    currentPage = page;
    updateArrows();
  }

  function pageBy(delta: number) {
    if ((delta < 0 && previous.disabled) || (delta > 0 && next.disabled)) return;
    selectionFeedback.cancel();
    onInteract();
    moveToPage(
      currentPage + delta,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    );
  }

  previous.addEventListener('click', () => pageBy(-1));
  next.addEventListener('click', () => pageBy(1));

  function resizeCarousel() {
    resizing = true;
    window.cancelAnimationFrame(scrollFrame);
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      viewportWidth = viewport.clientWidth;
      viewportHeight = viewport.clientHeight;
      moveToPage(currentPage, 'instant');
      resizeFrame = window.requestAnimationFrame(() => {
        resizing = false;
        updateArrows();
      });
    });
  }

  viewport.addEventListener('scroll', () => {
    // Native scroll snap can move during reflow. Keep the selected chapter until
    // its new position is restored, instead of treating that movement as a swipe.
    if (resizing) return;
    if (viewport.clientWidth !== viewportWidth || viewport.clientHeight !== viewportHeight) {
      resizeCarousel();
      return;
    }
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(nearestPage);
  });

  const carouselResize = new ResizeObserver(resizeCarousel);
  carouselResize.observe(viewport);
  window.addEventListener('resize', resizeCarousel);
  updateArrows();

  screen
    .querySelector<HTMLButtonElement>('[data-chapter-action="home"]')!
    .addEventListener('click', () => {
      selectionFeedback.cancel();
      onInteract();
      onHome();
    });
  topUpButton.addEventListener('click', () => {
    selectionFeedback.cancel();
    onInteract();
    onStars(topUpButton);
  });

  return {
    setAvailableStars,
    focusChapter(chapterId: number) {
      const chapterIndex = catalog.findIndex((chapter) => chapter.id === chapterId);
      if (chapterIndex >= 0) moveToPage(chapterIndex, 'auto');
      screen
        .querySelector<HTMLButtonElement>(`[data-chapter-id="${chapterId}"]:not(:disabled)`)
        ?.focus({ preventScroll: true });
    },
  };
}
