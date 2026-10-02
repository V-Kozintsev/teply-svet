import './styles/index.css';
import { createHintId, createHintWalletStore } from './hints';
const hintWallet = createHintWalletStore();
import menuHtml from './ui/menu.html?raw';
import settingsHtml from './ui/settings.html?raw';
import levelLaunchHtml from './ui/level-launch.html?raw';
import {
  createIcons,
  House,
  LockKeyhole,
  Music,
  Play,
  Settings,
  Slash,
  Volume2,
  Zap,
} from 'lucide';
import { loadAssets, audioSources, prepareMenuVisuals, prepareMenuAudio } from './loader';
import { readPreferences, storageKey, type Preferences } from './preferences';
import { createMusicPlayer, type MusicStatus } from './music';
import { applyLevelProgress, getLevelUrl, levels, type LevelSummary } from './levels';
import { mountLevelSelection } from './level-selection';
import { canPrefetchLevel, createLevelPreparer } from './level-loading';
import { waitForVisualPaint } from './visual-readiness';
import {
  applyChapterProgress,
  chapters,
  getChapterState,
  getCurrentChapter,
  getTotalStars,
} from './chapters';
import { getChapterScreenMarkup, mountChapterSelection } from './chapter-selection';
import { createPreviewLevels } from './previews/levels';
import { createPowerEffect } from './power-effect';
import { createMenuGarden } from './menu-garden';
import { createSceneryReactions } from './garden-life';
import { installPointerFeedback } from './pointer-feedback';
import { createSelectionFeedback } from './selection-feedback';
import { installGameTouchGuard, installGameViewport } from './game-touch';
import { createEmptyProgress, progressStorageKey, readProgress } from './progress';

const entryParameters = new URLSearchParams(location.search);
const levelsPreview = import.meta.env.DEV && entryParameters.get('preview') === 'levels';
const levelsRequested = entryParameters.get('view') === 'levels';
const chaptersRequested = entryParameters.get('view') === 'chapters';
const requestedLevelId = Number(entryParameters.get('focus')) || undefined;
const requestedChapterId = Number(entryParameters.get('chapter')) || 1;

const app = document.querySelector<HTMLElement>('#app')!;
const loading = document.querySelector<HTMLElement>('#loading')!;
const progress = document.querySelector<HTMLProgressElement>('#loading-progress')!;
const loadingLabel = document.querySelector<HTMLElement>('#loading-label')!;
const loadingDetail = document.querySelector<HTMLElement>('#loading-detail')!;
const retry = document.querySelector<HTMLButtonElement>('#loading-retry')!;

installPointerFeedback(document);
installGameTouchGuard();
installGameViewport();

document.addEventListener(
  'keydown',
  (event) => {
    if (event.key === 'Tab') document.documentElement.dataset.focusMode = 'keyboard';
  },
  true,
);
document.addEventListener(
  'pointerdown',
  () => {
    delete document.documentElement.dataset.focusMode;
  },
  true,
);
let preferences: Preferences;
let playerProgress = createEmptyProgress();
let currentStarBalance: number | null = null;
let storageAvailable = true;
try {
  preferences = readPreferences(sessionStorage.getItem(storageKey));
  playerProgress = readProgress(localStorage.getItem(progressStorageKey));
} catch {
  preferences = readPreferences(null);
  storageAvailable = false;
}
let productionLevelCatalog = applyLevelProgress(levels, playerProgress);
let productionChapterCatalog = applyChapterProgress(
  chapters,
  productionLevelCatalog,
  playerProgress,
);

function savePreferences() {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(preferences));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  const warning = document.querySelector<HTMLElement>('.storage-warning');
  if (warning) warning.hidden = storageAvailable;
}

const activeSounds = new Set<HTMLAudioElement>();
function stopSounds() {
  activeSounds.forEach((audio) => audio.pause());
  activeSounds.clear();
}
function sound(name = 'click-a') {
  if (!preferences.sound || document.hidden) return;
  const src = audioSources.get(`assets/audio/${name}.ogg`);
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = 0.24;
  activeSounds.add(audio);
  audio.addEventListener('ended', () => activeSounds.delete(audio), { once: true });
  audio.addEventListener('error', () => activeSounds.delete(audio), { once: true });
  void audio.play().catch(() => activeSounds.delete(audio));
}

function renderIcons() {
  createIcons({
    icons: { House, LockKeyhole, Music, Play, Settings, Slash, Volume2, Zap },
    attrs: { 'aria-hidden': 'true' },
  });
}

const prepareLevelDocument = createLevelPreparer();

function prepareLevel(level: LevelSummary, force = false) {
  const url = getLevelUrl(level, location.href);
  if (!url) return Promise.reject(new Error('Level route is unavailable'));
  return prepareLevelDocument(url, level.id, force);
}

function mountMenu() {
  const menuSelectionFeedback = createSelectionFeedback();
  app.innerHTML =
    menuHtml +
    getChapterScreenMarkup() +
    levelLaunchHtml +
    `
    <dialog class="game-dialog" aria-labelledby="dialog-title">
      <button type="button" class="dialog-close" aria-label="Закрыть"><img src="./assets/menu/close.png" alt="" draggable="false" /></button>
      <h2 id="dialog-title"></h2><div class="dialog-content"></div>
      <div class="dialog-actions"><button type="button" class="game-button primary" data-action="close"><span class="button-label">В меню</span></button></div>
    </dialog>
    <p class="storage-warning" role="status" hidden>Настройки действуют, но браузер не разрешил их сохранить.</p>
    <audio id="menu-music" src="./assets/audio/one-step-at-a-time.mp3" preload="none" loop hidden></audio>`;
  renderIcons();
  const dialog = app.querySelector<HTMLDialogElement>('.game-dialog')!;
  const menuScreen = app.querySelector<HTMLElement>('.game-menu')!;
  const chapterScreen = app.querySelector<HTMLElement>('.chapter-screen')!;
  const levelLaunch = app.querySelector<HTMLDialogElement>('.level-launch')!;
  const levelLaunchTitle = levelLaunch.querySelector<HTMLElement>('#level-launch-title')!;
  const levelLaunchDetail = levelLaunch.querySelector<HTMLElement>('#level-launch-detail')!;
  const levelLaunchActions = levelLaunch.querySelector<HTMLElement>('.level-launch-actions')!;
  const levelLaunchRetry = levelLaunch.querySelector<HTMLButtonElement>(
    '[data-launch-action="retry"]',
  )!;
  const title = app.querySelector<HTMLElement>('#dialog-title')!;
  const content = app.querySelector<HTMLElement>('.dialog-content')!;
  const actions = app.querySelector<HTMLElement>('.dialog-actions')!;
  const scene = app.querySelector<HTMLElement>('.scene')!;
  const powerSwitch = app.querySelector<HTMLButtonElement>('.power-box')!;
  const sceneArt = app.querySelector<HTMLElement>('.scene-art')!;
  const conduit = app.querySelector<SVGSVGElement>('.menu-conduit')!;
  const powerBody = powerSwitch.querySelector<HTMLImageElement>('.box-body')!;
  const house = app.querySelector<HTMLElement>('.house-wrap')!;
  const powerPlinth = sceneArt.querySelector<HTMLElement>('.power-plinth')!;
  const drawMenuGarden = createMenuGarden(sceneArt);
  const sceneryReactions = createSceneryReactions(scene, () => preferences.sound);
  let returnFocus: HTMLElement | null = null;
  let musicStatus: MusicStatus = 'idle';
  let selectedLevelPage = 0;
  let selectedLevelId: number | undefined;
  const levelCatalog = levelsPreview ? createPreviewLevels() : productionLevelCatalog;
  const chapterCatalog = levelsPreview
    ? applyChapterProgress(chapters, levelCatalog)
    : productionChapterCatalog;
  const totalStars = getTotalStars(chapterCatalog);
  let selectedChapter =
    chapterCatalog.find(
      (chapter) =>
        chapter.id === requestedChapterId &&
        !chapter.comingSoon &&
        (levelsPreview || getChapterState(chapter, totalStars) !== 'locked'),
    ) ??
    getCurrentChapter(chapterCatalog, totalStars) ??
    chapterCatalog[0];
  let dialogReturnScreen: 'menu' | 'chapters' = 'menu';
  let pendingLevel: LevelSummary | null = null;
  let levelLaunchRequest = 0;
  let levelLaunchSlowTimer: number | undefined;

  function syncConduitGeometry() {
    const sceneHeight = `${scene.getBoundingClientRect().height}px`;
    if (scene.style.getPropertyValue('--menu-scene-height') !== sceneHeight)
      scene.style.setProperty('--menu-scene-height', sceneHeight);
    const artBox = sceneArt.getBoundingClientRect();
    const sourceBox = powerBody.getBoundingClientRect();
    // The Kenney house uses its original grounded CSS placement. Remove the
    // temporary receiver-era inline alignment before measuring its wall.
    house.style.removeProperty('top');
    house.style.removeProperty('bottom');
    const houseBox = house.getBoundingClientRect();
    if (!artBox.width || !artBox.height || !sourceBox.width || !houseBox.width) return;

    // All ground details follow the actual objects across the compact menu layouts.
    powerPlinth.style.left = `${sourceBox.left - artBox.left - sourceBox.width * 0.08}px`;
    powerPlinth.style.top = `${sourceBox.bottom - artBox.top - sourceBox.height * 0.015}px`;
    powerPlinth.style.width = `${sourceBox.width * 1.16}px`;
    powerPlinth.style.height = `${Math.max(4, sourceBox.width * 0.09)}px`;
    drawMenuGarden(houseBox, sourceBox, artBox);
    sceneryReactions.layout(
      [
        { kind: 'house', element: house },
        { kind: 'moon', element: sceneArt.querySelector('.moon')! },
        { kind: 'tree', element: sceneArt.querySelector('.tree-left')! },
        { kind: 'tree', element: sceneArt.querySelector('.tree-right')! },
      ],
      [powerSwitch],
    );

    const sourceInset = Math.max(8, Math.min(18, sourceBox.width * 0.16));
    const sourceX = sourceBox.right - artBox.left - sourceInset;
    const sourceY = sourceBox.top - artBox.top + sourceBox.height * 0.52;
    const goalX = houseBox.left - artBox.left + houseBox.width * 0.12;
    const wallTop = houseBox.top - artBox.top + houseBox.height * 0.73;
    const wallBottom = houseBox.bottom - artBox.top - houseBox.height * 0.08;
    const distance = goalX - sourceX;
    if (distance < 36) {
      return;
    }

    // Aim at the centre of the usable facade on every aspect ratio, never at
    // the roof triangle or the foundation edge.
    const goalY = (wallTop + wallBottom) / 2;
    const vertical = Math.abs(goalY - sourceY);
    const radius = Math.max(3, Math.min(12, vertical * 0.45, distance * 0.08));
    const direction = goalY < sourceY ? -1 : 1;
    const bendX = sourceX + distance * 0.42;
    const path = [
      `M${sourceX.toFixed(1)} ${sourceY.toFixed(1)}`,
      `H${(bendX - radius).toFixed(1)}`,
      `Q${bendX.toFixed(1)} ${sourceY.toFixed(1)} ${bendX.toFixed(1)} ${(sourceY + direction * radius).toFixed(1)}`,
      `V${(goalY - direction * radius).toFixed(1)}`,
      `Q${bendX.toFixed(1)} ${goalY.toFixed(1)} ${(bendX + radius).toFixed(1)} ${goalY.toFixed(1)}`,
      `H${goalX.toFixed(1)}`,
    ].join('');

    conduit.setAttribute('viewBox', `0 0 ${artBox.width} ${artBox.height}`);
    // One measured coordinate system for glass, light and mask, including older WebViews.
    const diameter = Math.max(17, Math.min(27, artBox.width * 0.0255));
    for (const [layer, width] of Object.entries({
      shadow: diameter + 2,
      rim: diameter,
      wall: diameter * 0.82,
      cavity: diameter * 0.6,
      halo: diameter * 0.47,
      core: diameter * 0.24,
      center: diameter * 0.12,
    }))
      conduit.style.setProperty(`--conduit-${layer}-width`, `${width}px`);
    for (const bounds of conduit.querySelectorAll('#menu-conduit-channel, #menu-energy-blur')) {
      bounds.setAttribute('width', String(artBox.width));
      bounds.setAttribute('height', String(artBox.height));
    }
    for (const segment of conduit.querySelectorAll<SVGPathElement>('[data-conduit-path]')) {
      segment.setAttribute('d', path);
    }
    conduit
      .querySelector('[data-conduit-collar="source"]')!
      .setAttribute(
        'transform',
        `translate(${(sourceX + distance * 0.2).toFixed(1)} ${sourceY.toFixed(1)}) rotate(90)`,
      );
    conduit
      .querySelector('[data-conduit-collar="goal"]')!
      .setAttribute(
        'transform',
        `translate(${(sourceX + distance * 0.72).toFixed(1)} ${goalY.toFixed(1)}) rotate(90)`,
      );
  }

  const conduitResize = new ResizeObserver(() => requestAnimationFrame(syncConduitGeometry));
  conduitResize.observe(sceneArt);
  conduitResize.observe(powerBody);
  conduitResize.observe(house);
  window.addEventListener('resize', () => requestAnimationFrame(syncConduitGeometry));
  powerBody.addEventListener('load', syncConduitGeometry, { once: true });
  house.querySelector('img.house')!.addEventListener('load', syncConduitGeometry, { once: true });
  requestAnimationFrame(syncConduitGeometry);

  function updateSettings() {
    for (const button of content.querySelectorAll<HTMLButtonElement>('[data-preference]')) {
      const key = button.dataset.preference as keyof Preferences;
      button.setAttribute('aria-pressed', String(preferences[key]));
      button.title = `${preferences[key] ? 'Выключить' : 'Включить'} ${key === 'sound' ? 'звук' : 'музыку'}`;
    }
    const status = content.querySelector<HTMLElement>('.music-status');
    if (status) {
      status.hidden = !preferences.music || !['error', 'blocked'].includes(musicStatus);
      status.textContent =
        musicStatus === 'error'
          ? 'Музыка не загрузилась. Нажмите на ноту, чтобы повторить.'
          : 'Нажмите на ноту, чтобы включить музыку.';
    }
  }

  const music = createMusicPlayer(
    app.querySelector<HTMLAudioElement>('#menu-music')!,
    preferences.music,
    (status) => {
      musicStatus = status;
      updateSettings();
    },
  );
  // Desktop browsers may start under the loader. Mobile Safari will keep this
  // request pending until the first permitted gesture, then the shared gesture
  // handlers retry it immediately.
  music.activate();
  const powerEffect = createPowerEffect(
    app.querySelector<HTMLElement>('.power-box')!,
    audioSources.get('assets/audio/electric-soft.mp3') ??
      new URL('./assets/audio/electric-soft.mp3', document.baseURI).href,
    preferences.sound,
  );
  function activateAudio() {
    music.activate();
    powerEffect.activate();
  }
  function syncSceneEffects() {
    const active =
      !app.hidden &&
      !app.inert &&
      !document.hidden &&
      !menuScreen.hidden &&
      !dialog.open &&
      !levelLaunch.open &&
      scene.dataset.lit === 'true';
    scene.dataset.flowing = String(active);
    powerEffect.setActive(active);
    sceneryReactions.setPaused(!active);
  }
  const syncVisibility = () => {
    const suspended = document.hidden;
    music.setSuspended(suspended);
    if (suspended) stopSounds();
    syncSceneEffects();
  };
  document.addEventListener('visibilitychange', syncVisibility);
  window.addEventListener('pagehide', () => {
    stopSounds();
    powerEffect.setActive(false);
    sceneryReactions.setPaused(true);
  });
  window.addEventListener('pageshow', syncVisibility);
  window.addEventListener('focus', syncVisibility);
  syncVisibility();

  function replaceRoute(view?: 'chapters' | 'levels', focusLevel?: number) {
    if (levelsPreview) return;
    const url = new URL(location.href);
    url.search = '';
    if (view) url.searchParams.set('view', view);
    if (view === 'levels') {
      url.searchParams.set('chapter', String(selectedChapter.id));
      if (focusLevel !== undefined) url.searchParams.set('focus', String(focusLevel));
    }
    history.replaceState(null, '', `${url.pathname}${url.search}`);
  }

  function setActiveScreen(screen: 'menu' | 'chapters') {
    const chaptersOpen = screen === 'chapters';
    const screenChanged = menuScreen.hidden !== chaptersOpen;
    menuScreen.hidden = chaptersOpen;
    menuScreen.inert = chaptersOpen;
    chapterScreen.hidden = !chaptersOpen;
    chapterScreen.inert = !chaptersOpen;
    if (screenChanged) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.title = chaptersOpen ? 'Карта света · Тёплый свет' : 'Тёплый свет';
    syncSceneEffects();
  }

  function showMenu(updateRoute = true) {
    setActiveScreen('menu');
    if (updateRoute) replaceRoute();
    menuScreen
      .querySelector<HTMLButtonElement>('[data-action="play"]')
      ?.focus({ preventScroll: true });
  }

  function showChapters(updateRoute = true, focusChapter = selectedChapter.id) {
    setActiveScreen('chapters');
    if (updateRoute) replaceRoute('chapters');
    chapterNavigation.focusChapter(focusChapter);
  }

  const chapterNavigation = mountChapterSelection(
    chapterScreen,
    chapterCatalog,
    totalStars,
    levelsPreview ? totalStars : currentStarBalance,
    (chapter, button) => {
      selectedChapter = chapter;
      returnFocus = button;
      dialogReturnScreen = 'chapters';
      openLevels(undefined, undefined, chapter, true);
    },
    () => showMenu(),
    () => {
      activateAudio();
      sound();
    },
    (button) => openStarStore(button),
  );
  if (!levelsPreview) {
    hintWallet.subscribe((wallet) => chapterNavigation.setAvailableStars(wallet.starBalance));
    const refreshChapterBalance = () => {
      if (document.hidden) return;
      void hintWallet
        .read()
        .then(({ wallet }) => chapterNavigation.setAvailableStars(wallet.starBalance))
        .catch(() => chapterNavigation.setAvailableStars(null));
    };
    window.addEventListener('focus', refreshChapterBalance);
    window.addEventListener('pageshow', refreshChapterBalance);
    document.addEventListener('visibilitychange', refreshChapterBalance);
  }
  renderIcons();

  function openStarStore(button: HTMLButtonElement) {
    returnFocus = button;
    dialogReturnScreen = 'chapters';
    dialog.dataset.view = 'stars';
    title.className = '';
    title.textContent = 'Пополнить звёзды';
    actions.hidden = true;
    const rewardedHost = (() => {
      try {
        return window.parent.warmRewardedHost;
      } catch {
        return undefined;
      }
    })();
    content.innerHTML = `
      <div class="star-store">
        <p class="star-store-balance"><img src="./assets/menu/star-filled.png" alt="" /> Доступно: <strong data-store-balance>—</strong></p>
        <button type="button" class="game-button primary star-store-ad" ${rewardedHost?.available ? '' : 'disabled'}><span class="button-label">Смотреть рекламу · +1 ★</span></button>
        <p class="star-store-ad-note">${rewardedHost?.available ? 'Звезда начисляется только после полного просмотра.' : 'Видео появится в версии для Яндекс Игр.'}</p>
        <div class="star-store-future" aria-label="Покупки за Яны пока недоступны">Покупка за Яны <span>позже</span></div>
        <p class="star-store-status" role="status" aria-live="polite"></p>
      </div>`;
    const balance = content.querySelector<HTMLElement>('[data-store-balance]')!;
    const ad = content.querySelector<HTMLButtonElement>('.star-store-ad')!;
    const status = content.querySelector<HTMLElement>('.star-store-status')!;
    const setBalance = (value: number | null) => {
      balance.textContent = value === null ? '—' : String(value);
    };
    setBalance(currentStarBalance);
    void hintWallet
      .read()
      .then(({ wallet }) => setBalance(wallet.starBalance))
      .catch(() => setBalance(null));
    ad.addEventListener('click', async () => {
      if (!rewardedHost?.available || ad.disabled) return;
      ad.disabled = true;
      status.textContent = 'Открываем видео…';
      try {
        const rewarded = await rewardedHost.showStarAd();
        if (!rewarded) {
          status.textContent = 'Просмотр не завершён. Звёзды не начислены.';
          return;
        }
        const result = await hintWallet.acceptRewardedStar(`star:${createHintId()}`);
        setBalance(result.wallet.starBalance);
        status.textContent = result.result ? 'Получена 1 звезда!' : 'Звезда уже получена.';
      } catch {
        status.textContent = 'Не удалось сохранить звезду. Попробуй позже.';
      } finally {
        ad.disabled = false;
      }
    });
    showDialog();
    ad.focus({ preventScroll: true });
  }

  function showDialog() {
    if (!dialog.open) dialog.showModal();
    else app.querySelector<HTMLButtonElement>('.dialog-close')!.focus({ preventScroll: true });
    syncSceneEffects();
  }

  function resetLevelLaunch(level?: LevelSummary) {
    levelLaunch.dataset.state = 'loading';
    levelLaunch.setAttribute('aria-busy', 'true');
    levelLaunchTitle.textContent = 'Зажигаем свет…';
    levelLaunchDetail.textContent = level
      ? `Готовим: ${level.name.toLocaleLowerCase('ru-RU')}`
      : 'Готовим уровень';
    levelLaunchActions.hidden = true;
    levelLaunchRetry.hidden = false;
  }

  function cancelLevelLaunch() {
    levelLaunchRequest++;
    window.clearTimeout(levelLaunchSlowTimer);
    pendingLevel = null;
    if (levelLaunch.open) levelLaunch.close();
    music.setSuspended(document.hidden);
    syncSceneEffects();
  }

  async function launchLevel(level: LevelSummary, force = false) {
    const url = getLevelUrl(level, location.href);
    if (!url) return;
    pendingLevel = level;
    const request = ++levelLaunchRequest;
    resetLevelLaunch(level);
    if (!levelLaunch.open) levelLaunch.showModal();
    music.setSuspended(document.hidden);
    syncSceneEffects();

    const started = performance.now();
    const startedAt = Date.now();
    levelLaunchSlowTimer = window.setTimeout(() => {
      if (request !== levelLaunchRequest || !levelLaunch.open) return;
      levelLaunch.dataset.state = 'slow';
      levelLaunchTitle.textContent = 'Ещё немного…';
      levelLaunchDetail.textContent = 'Загрузка идёт медленнее обычного';
      levelLaunchRetry.hidden = true;
      levelLaunchActions.hidden = false;
    }, 6000);

    try {
      await prepareLevel(level, force);
      await new Promise((resolve) =>
        window.setTimeout(resolve, Math.max(0, 450 - (performance.now() - started))),
      );
      if (request !== levelLaunchRequest) return;
      window.clearTimeout(levelLaunchSlowTimer);
      levelLaunchDetail.textContent = 'Открываем уровень';
      try {
        sessionStorage.setItem(
          'teply-svet.loading-transition',
          JSON.stringify({ target: new URL(url).pathname, startedAt }),
        );
      } catch {
        /* The destination still has its own minimum if storage is unavailable. */
      }
      if (window.parent.warmNavigationHost) window.parent.warmNavigationHost.navigate(url);
      else location.assign(url);
    } catch (error) {
      await new Promise((resolve) =>
        window.setTimeout(resolve, Math.max(0, 450 - (performance.now() - started))),
      );
      if (request !== levelLaunchRequest) return;
      window.clearTimeout(levelLaunchSlowTimer);
      levelLaunch.dataset.state = 'error';
      levelLaunch.setAttribute('aria-busy', 'false');
      levelLaunchTitle.textContent = 'Не удалось открыть уровень';
      levelLaunchDetail.textContent = 'Проверьте соединение и попробуйте ещё раз';
      levelLaunchRetry.hidden = false;
      levelLaunchActions.hidden = false;
      music.setSuspended(document.hidden);
      console.error('Level loading failed', error);
    }
  }

  levelLaunch.addEventListener('cancel', (event) => {
    event.preventDefault();
    if (levelLaunch.dataset.state !== 'loading') cancelLevelLaunch();
  });
  levelLaunch.querySelector('[data-launch-action="cancel"]')!.addEventListener('click', () => {
    activateAudio();
    sound();
    cancelLevelLaunch();
  });
  levelLaunchRetry.addEventListener('click', () => {
    if (!pendingLevel) return;
    activateAudio();
    sound();
    void launchLevel(pendingLevel, true);
  });

  function openLevel(level: LevelSummary, page?: number) {
    const url = getLevelUrl(level, location.href);
    if (url) {
      void launchLevel(level);
      return;
    }
    selectedLevelPage = page ?? 0;
    selectedLevelId = level.id;
    dialog.dataset.view = 'play';
    title.className = '';
    title.textContent = level.name;
    content.innerHTML = '<p></p>';
    content.querySelector('p')!.textContent = levelsPreview
      ? 'Это пример оформления. Игровое поле ещё готовится.'
      : 'Этот уровень ещё готовится.';
    actions.hidden = false;
    const back = actions.querySelector<HTMLButtonElement>('button')!;
    back.dataset.action = page === undefined ? 'close' : 'levels-back';
    back.querySelector('.button-label')!.textContent = page === undefined ? 'В меню' : 'К уровням';
    showDialog();
  }

  function openLevels(
    page?: number,
    focusLevel?: number,
    chapter = selectedChapter,
    updateRoute = false,
  ) {
    if (
      !levelsPreview &&
      ['locked', 'coming-soon'].includes(getChapterState(chapter, totalStars))
    ) {
      showChapters(updateRoute, chapter.id);
      return;
    }
    selectedChapter = chapter;
    if (!levelsPreview) {
      setActiveScreen('chapters');
      dialogReturnScreen = 'chapters';
      returnFocus = chapterScreen.querySelector<HTMLButtonElement>(
        `[data-chapter-id="${chapter.id}"]`,
      );
    } else {
      dialogReturnScreen = 'menu';
    }
    dialog.dataset.view = 'levels';
    title.replaceChildren();
    if (levelsPreview) {
      title.className = '';
      title.textContent = 'Уровни';
    } else {
      title.className = 'levels-dialog-heading';
      const chapterLabel = document.createElement('span');
      chapterLabel.className = 'levels-dialog-kicker';
      chapterLabel.textContent = `Глава ${chapter.id}`;
      const chapterTitle = document.createElement('span');
      chapterTitle.className = 'levels-dialog-title';
      chapterTitle.textContent = chapter.title;
      title.append(chapterLabel, chapterTitle);
    }
    actions.hidden = true;
    const chapterLevels = levelsPreview
      ? levelCatalog
      : levelCatalog.filter((level) => (level.chapter ?? Math.ceil(level.id / 12)) === chapter.id);
    mountLevelSelection(
      content,
      chapterLevels,
      openLevel,
      () => {
        activateAudio();
        sound();
      },
      page,
      focusLevel,
    );
    if (updateRoute) replaceRoute('levels', focusLevel);
    showDialog();
    if (focusLevel !== undefined) {
      content
        .querySelector<HTMLButtonElement>(`[data-level-id="${focusLevel}"]`)
        ?.focus({ preventScroll: true });
    }
  }

  function closeDialog() {
    activateAudio();
    sound();
    dialog.close();
  }
  dialog.addEventListener('close', () => {
    if (dialogReturnScreen === 'chapters') {
      setActiveScreen('chapters');
      replaceRoute('chapters');
    }
    returnFocus?.focus({ preventScroll: true });
    syncSceneEffects();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        closeDialog();
    }
  });
  app.querySelector('.dialog-close')!.addEventListener('click', closeDialog);

  app.addEventListener('dragstart', (event) => event.preventDefault());

  app.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const toggle = target.closest<HTMLButtonElement>('[data-preference]');
    if (toggle) {
      const key = toggle.dataset.preference;
      if (key !== 'sound' && key !== 'music') return;
      if (key === 'music' && preferences.music && ['error', 'blocked'].includes(musicStatus)) {
        activateAudio();
        return;
      }
      preferences[key] = !preferences[key];
      if (!preferences.sound) stopSounds();
      powerEffect.setSoundEnabled(preferences.sound);
      savePreferences();
      music.setEnabled(preferences.music);
      activateAudio();
      updateSettings();
      sound('switch-a');
      return;
    }
    const button = target.closest<HTMLButtonElement>('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action !== 'play') menuSelectionFeedback.cancel();
    activateAudio();
    if (action === 'close') {
      closeDialog();
      return;
    }
    if (action === 'light') {
      const lit = scene.dataset.lit !== 'true';
      scene.dataset.lit = String(lit);
      powerSwitch.setAttribute('aria-pressed', String(lit));
      powerSwitch.setAttribute(
        'aria-label',
        lit ? 'Трансформатор: выключить свет' : 'Трансформатор: включить свет',
      );
      sound('switch-a');
      syncSceneEffects();
      return;
    }
    if (action === 'play') {
      if (menuSelectionFeedback.run(button, () => showChapters())) {
        returnFocus = button;
        sound();
      }
      return;
    }
    sound();
    if (!dialog.open) returnFocus = button;
    if (action === 'levels-back') {
      openLevels(selectedLevelPage, selectedLevelId, selectedChapter);
      return;
    }
    dialog.dataset.view = action;
    actions.hidden = action === 'settings';
    if (action === 'settings') {
      dialogReturnScreen = 'menu';
      title.className = '';
      title.textContent = 'Настройки';
      content.innerHTML = settingsHtml;
      renderIcons();
      updateSettings();
    } else {
      return;
    }
    showDialog();
  });
  app.querySelector<HTMLElement>('.storage-warning')!.hidden = storageAvailable;
  return {
    openLevels,
    showChapters,
    syncSceneEffects,
    syncInitialVisualLayout: syncConduitGeometry,
  };
}

async function start() {
  try {
    await loadAssets((complete, total) => {
      progress.max = total;
      progress.value = complete;
      loadingDetail.textContent = `${Math.floor((complete / total) * 100)}%`;
    });
    prepareMenuAudio();
    if (!levelsPreview) {
      const saved = await hintWallet.read().catch(() => undefined);
      if (saved) {
        playerProgress = saved.wallet.progress;
        currentStarBalance = saved.wallet.starBalance;
      }
      productionLevelCatalog = applyLevelProgress(levels, playerProgress);
      productionChapterCatalog = applyChapterProgress(
        chapters,
        productionLevelCatalog,
        playerProgress,
      );
    }
    const menu = mountMenu();
    // Lay out and decode the real menu underneath the opaque loading screen.
    app.inert = true;
    app.hidden = false;
    await prepareMenuVisuals(app);
    menu.syncInitialVisualLayout();
    await waitForVisualPaint();
    progress.value = progress.max;
    loadingDetail.textContent = 'Готово';
    await new Promise((resolve) =>
      window.setTimeout(resolve, Math.max(0, 2000 - performance.now())),
    );
    app.removeAttribute('aria-busy');
    const loadingPreview = new URLSearchParams(location.search).get('preview') === 'loading';
    if (loadingPreview) {
      loadingLabel.textContent = 'Всё готово';
      loadingDetail.textContent =
        'Это просмотр оформления. В обычном запуске переход занимает не менее двух секунд.';
      retry.textContent = 'Открыть меню';
      retry.hidden = false;
      retry.onclick = () => {
        loading.hidden = true;
        app.inert = false;
        app.hidden = false;
        menu.syncSceneEffects();
        history.replaceState(null, '', location.pathname);
      };
    } else {
      loading.hidden = true;
      app.inert = false;
      app.hidden = false;
      if (levelsPreview) {
        document.title = 'Просмотр оформления уровней · Тёплый свет';
        menu.openLevels(undefined, requestedLevelId);
      } else if (levelsRequested) {
        const requestedChapter =
          productionChapterCatalog.find((chapter) => chapter.id === requestedChapterId) ??
          productionChapterCatalog[0];
        menu.showChapters(false, requestedChapter.id);
        menu.openLevels(undefined, requestedLevelId, requestedChapter);
      } else if (chaptersRequested) {
        menu.showChapters(false, requestedChapterId);
      }
      menu.syncSceneEffects();
    }
    if (!levelsPreview && canPrefetchLevel(navigator)) {
      const nextPlayable =
        productionLevelCatalog.find((level) => !level.completed && level.path) ??
        productionLevelCatalog.find((level) => level.path);
      if (nextPlayable) void prepareLevel(nextPlayable).catch(() => undefined);
    }
    window.dispatchEvent(new Event('menu-ready'));
  } catch (error) {
    app.hidden = true;
    loading.dataset.state = 'error';
    loadingLabel.textContent = 'Не удалось загрузить игру';
    loadingDetail.textContent = 'Проверьте подключение и попробуйте ещё раз.';
    retry.hidden = false;
    console.error('Menu loading failed', error);
  }
}
void start();
