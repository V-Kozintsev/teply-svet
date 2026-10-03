import { createMusicPlayer, type MusicStatus } from './music';
import { readPreferences, storageKey } from './preferences';
import { installGameTouchGuard, installGameViewport } from './game-touch';
import { createYandexRewardedHost } from './yandex-rewarded';
import { installFrameLoading } from './frame-loading';
import { isYandexGameHost, loadYandexSdk } from './yandex-sdk';

let hosted = false;
try {
  hosted = window.parent !== window && !!window.parent.warmMusicHost;
} catch {
  /* Portal. */
}

if (hosted) {
  void import('./main');
} else {
  if (isYandexGameHost(location.hostname) || window.YaGames) {
    void loadYandexSdk(window)
      .then((sdk) => {
        window.warmLanguage?.setPlatformLanguage(sdk.environment?.i18n?.lang);
      })
      .catch(() => {});
  }
  installGameTouchGuard();
  installGameViewport();
  const base = new URL('./', location.href);
  const audio = document.createElement('audio');
  audio.id = 'game-music';
  audio.hidden = true;
  audio.src = new URL('assets/audio/one-step-at-a-time.mp3', base).href;
  document.body.append(audio);
  let preferences = readPreferences(null);
  try {
    preferences = readPreferences(sessionStorage.getItem(storageKey));
  } catch {
    /* Defaults. */
  }
  let status: MusicStatus = 'idle';
  let active: { notify(value: MusicStatus): void } | undefined;
  const player = createMusicPlayer(audio, preferences.music, (value) => {
    status = value;
    active?.notify(value);
  });
  window.warmRewardedHost = createYandexRewardedHost(window, (suspended) =>
    player.setSuspended(document.hidden || suspended),
  );
  window.warmMusicHost = {
    connect(notify) {
      const client = { notify };
      active = client;
      // Callers finish constructing their settings UI before receiving status.
      queueMicrotask(() => {
        if (active === client) notify(status);
      });
      return {
        activate() {
          if (active === client) player.activate();
        },
        setEnabled(value) {
          if (active === client) player.setEnabled(value);
        },
        // Document replacement is not a reason to pause the persistent soundtrack.
        setSuspended() {},
        disconnect() {
          if (active === client) active = undefined;
        },
      };
    },
  };
  const visibility = () =>
    player.setSuspended(document.hidden || !!window.warmRewardedHost?.active);
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', () => player.setSuspended(true));
  window.addEventListener('pageshow', visibility);
  document.addEventListener('pointerdown', () => player.activate(), { passive: true });
  document.addEventListener('keydown', () => player.activate());
  visibility();

  const frame = document.createElement('iframe');
  frame.id = 'game-view';
  frame.title = 'Тёплый свет';
  frame.allow = 'autoplay; fullscreen';
  Object.assign(frame.style, {
    position: 'fixed',
    left: '0',
    top: 'var(--game-top, 0px)',
    width: '100%',
    height: 'var(--game-height, 100dvh)',
    border: '0',
    background: '#0a2935',
  });
  const initial = new URL(location.href);
  const level = initial.searchParams.get('level');
  initial.searchParams.delete('level');
  if (level && /^(?:[1-9]|[1-3][0-9]|4[0-4])$/.test(level))
    initial.pathname = new URL(`levels/${level}/index.html`, base).pathname;
  function syncRoute() {
    const child = frame.contentWindow;
    if (!child) return;
    try {
      const url = new URL(child.location.href);
      if (url.origin !== location.origin) return;
      const match = url.pathname.match(/\/levels\/(\d+)\/index\.html$/);
      if (match) {
        url.pathname = base.pathname;
        url.searchParams.set('level', match[1]);
      }
      history.replaceState(null, '', url);
    } catch {
      /* Navigation may be in progress. */
    }
  }
  frame.addEventListener('load', () => {
    const child = frame.contentWindow;
    if (!child) return;
    try {
      if (
        !child.document.getElementById('app') &&
        !child.document.getElementById('warm-glass-level')
      )
        return;
      syncRoute();
      // Keep reload/share URLs in sync with the menu's own in-document navigation.
      child.document.addEventListener('pointerdown', () => player.activate(), { passive: true });
      child.document.addEventListener('keydown', () => player.activate());
      for (const method of ['replaceState', 'pushState'] as const) {
        const original = child.history[method].bind(child.history);
        child.history[method] = (data: unknown, unused: string, url?: string | URL | null) => {
          original(data, unused, url);
          syncRoute();
        };
      }
      child.addEventListener('popstate', syncRoute);
    } catch {
      /* The loading screen handles an inaccessible browser error document. */
    }
  });
  installFrameLoading(frame, initial.href, base.href);
  document.body.append(frame);
}
