import { createElement, LockKeyhole } from 'lucide';
import levelsHtml from './ui/levels.html?raw';
import { getLevelPage, hasMaximumLevelStars, type LevelSummary } from './levels';
import { chooseLevelLayout } from './level-layout';
import { createSelectionFeedback } from './selection-feedback';

const layoutObservers = new WeakMap<HTMLElement, () => void>();

export function mountLevelSelection(
  host: HTMLElement,
  catalog: readonly LevelSummary[],
  onSelect: (level: LevelSummary, page: number) => void,
  onInteract: () => void,
  initialPage?: number,
  initialLevelId?: number,
) {
  layoutObservers.get(host)?.();
  const selectionFeedback = createSelectionFeedback();
  host.innerHTML = levelsHtml;
  const grid = host.querySelector<HTMLOListElement>('.level-grid')!;
  const previous = host.querySelector<HTMLButtonElement>('[data-level-page="previous"]')!;
  const next = host.querySelector<HTMLButtonElement>('[data-level-page="next"]')!;
  const counter = host.querySelector<HTMLElement>('.levels-page-counter')!;
  const navigation = host.querySelector<HTMLElement>('[data-levels-navigation]')!;
  let current = getLevelPage(catalog, initialPage);
  let pageSize = 12;
  let anchorId =
    initialLevelId ??
    current.items.find((level) => level.state === 'current')?.id ??
    current.items[0]?.id;
  const selection = host.querySelector<HTMLElement>('.level-selection')!;

  function fitGrid() {
    const style = getComputedStyle(grid);
    const width = Math.floor(
      grid.getBoundingClientRect().width -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight) -
        1,
    );
    const height = Math.floor(
      selection.getBoundingClientRect().height -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom) -
        1,
    );
    if (width <= 0 || height <= 0) return;
    const gap = parseFloat(style.gap);
    const maximum = parseFloat(style.getPropertyValue('--level-max-size'));
    const minimum = parseFloat(style.getPropertyValue('--level-min-size'));
    const pagerHeight =
      parseFloat(getComputedStyle(previous).height) +
      parseFloat(getComputedStyle(navigation).marginTop);
    const best = chooseLevelLayout(
      catalog.length,
      width,
      height,
      gap,
      maximum,
      minimum,
      pagerHeight,
    );
    if (pageSize !== best.pageSize) {
      const focused = grid.contains(document.activeElement)
        ? (document.activeElement as HTMLElement).dataset.levelId
        : undefined;
      if (focused) anchorId = Number(focused);
      pageSize = best.pageSize;
      const anchorPage = Array.from({ length: best.pageCount }, (_, page) =>
        getLevelPage(catalog, page, pageSize, true),
      ).find((page) => page.items.some((level) => level.id === anchorId));
      current = anchorPage ?? getLevelPage(catalog, 0, pageSize, true);
      render();
      if (focused)
        grid
          .querySelector<HTMLButtonElement>(`[data-level-id="${focused}"]`)
          ?.focus({ preventScroll: true });
    }
    grid.style.setProperty('--level-columns', String(best.columns));
    grid.style.setProperty('--level-size', `${Math.max(44, best.size)}px`);
  }

  function render() {
    selectionFeedback.cancel();
    counter.querySelector('[data-level-page-current]')!.textContent = String(current.page + 1);
    counter.querySelector('[data-level-page-total]')!.textContent = String(current.pageCount);
    counter.setAttribute('aria-label', `Страница ${current.page + 1} из ${current.pageCount}`);
    previous.disabled = current.page === 0;
    next.disabled = current.page === current.pageCount - 1;
    navigation.hidden = current.pageCount <= 1;
    grid.replaceChildren();

    for (const level of current.items) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'level-tile';
      button.dataset.state = level.state;
      button.dataset.levelId = String(level.id);
      button.disabled = level.state === 'locked';
      const maximumStars = level.maxStars ?? 3;
      const status = level.completed
        ? `Пройден. Лучший результат: ${level.stars} из ${maximumStars} звёзд. Пройти ещё раз`
        : level.state === 'current'
          ? 'Доступен'
          : 'Закрыт';
      const spokenName = level.name === `Уровень ${level.id}` ? '' : `${level.name}. `;
      button.setAttribute(
        'aria-label',
        `Уровень ${level.displayNumber ?? level.id}. ${spokenName}${status}`,
      );
      if (level.state === 'current') button.setAttribute('aria-current', 'true');

      const number = document.createElement('span');
      number.className = 'level-tile-number';
      number.textContent = String(level.displayNumber ?? level.id);
      number.setAttribute('aria-hidden', 'true');
      button.append(number);

      if (hasMaximumLevelStars(level)) {
        const complete = document.createElement('img');
        complete.className = 'level-complete';
        complete.src = './assets/menu/level-complete.png';
        complete.alt = '';
        complete.draggable = false;
        complete.setAttribute('aria-hidden', 'true');
        button.append(complete);
      }

      if (level.completed) {
        const score = document.createElement('span');
        score.className = 'level-score';
        score.setAttribute('aria-hidden', 'true');
        for (let star = 1; star <= maximumStars; star++) {
          const image = document.createElement('img');
          image.src =
            star <= level.stars ? './assets/menu/star-filled.png' : './assets/menu/star-empty.png';
          image.alt = '';
          image.draggable = false;
          score.append(image);
        }
        button.append(score);
      }

      if (level.state === 'locked') {
        const lock = createElement(LockKeyhole, { 'aria-hidden': 'true', class: 'level-lock' });
        button.append(lock);
      }

      button.addEventListener('click', () => {
        if (button.disabled) return;
        if (selectionFeedback.run(button, () => onSelect(level, current.page))) onInteract();
      });
      item.append(button);
      grid.append(item);
    }
    grid.scrollTop = 0;
  }

  function changePage(delta: number, button: HTMLButtonElement) {
    if (button.disabled) return;
    onInteract();
    current = getLevelPage(catalog, current.page + delta, pageSize, true);
    anchorId = current.items[0]?.id;
    render();
    fitGrid();
    // Keep keyboard focus in the pager when its active arrow becomes disabled.
    if (button.disabled) (delta > 0 ? previous : next).focus({ preventScroll: true });
  }
  previous.addEventListener('click', () => changePage(-1, previous));
  next.addEventListener('click', () => changePage(1, next));
  render();
  const observer = new ResizeObserver(fitGrid);
  observer.observe(selection);
  window.addEventListener('resize', fitGrid);
  window.visualViewport?.addEventListener('resize', fitGrid);
  layoutObservers.set(host, () => {
    selectionFeedback.cancel();
    observer.disconnect();
    window.removeEventListener('resize', fitGrid);
    window.visualViewport?.removeEventListener('resize', fitGrid);
  });
}
