export type MusicStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'blocked' | 'error';

const playbackKey = 'teply-svet.music-position.v1';

export type MusicConnection = {
  activate(): void;
  setEnabled(value: boolean): void;
  setSuspended(value: boolean): void;
  disconnect(): void;
};
declare global {
  interface Window {
    warmMusicHost?: { connect(status: (value: MusicStatus) => void): MusicConnection };
  }
}

export function createMusicPlayer(
  audio: HTMLAudioElement,
  enabled: boolean,
  onStatus: (status: MusicStatus) => void,
) {
  // Only a same-origin game shell can own playback for this document.
  let host;
  try {
    if (typeof window !== 'undefined' && window.parent !== window)
      host = window.parent.warmMusicHost;
  } catch {
    /* An embedding portal is not our music host. */
  }
  if (host) {
    audio.pause();
    audio.removeAttribute('src');
    audio.preload = 'none';
    const connection = host.connect(onStatus);
    window.addEventListener('pagehide', () => connection.disconnect(), { once: true });
    return connection;
  }
  let suspended = false;
  let pending = false;
  let request = 0;
  let failed = false;

  audio.preload = 'auto';
  audio.loop = true;
  // Keep the soundtrack behind interaction sounds even when system volume is at 100%.
  audio.volume = 0.063;

  const readPosition = () => {
    try {
      const value = Number(sessionStorage.getItem(playbackKey));
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch {
      return 0;
    }
  };
  const restorePosition = () => {
    const position = readPosition();
    if (!position) return;
    try {
      audio.currentTime =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? position % audio.duration
          : position;
    } catch {
      /* Metadata may not be ready yet; loadedmetadata retries below. */
    }
  };
  const savePosition = () => {
    if (!Number.isFinite(audio.currentTime) || audio.currentTime < 0) return;
    try {
      sessionStorage.setItem(playbackKey, String(audio.currentTime));
    } catch {
      /* Music continuity is optional when session storage is unavailable. */
    }
  };
  restorePosition();
  audio.addEventListener('loadedmetadata', restorePosition);
  globalThis.addEventListener?.('pagehide', savePosition);

  // Visibility starts playback immediately; gestures retry a browser autoplay denial.
  const shouldPlay = () => enabled && !suspended;
  const pause = () => {
    savePosition();
    request++;
    pending = false;
    audio.pause();
    onStatus('paused');
  };

  function sync() {
    if (!shouldPlay()) {
      pause();
      return;
    }
    if (pending || (!audio.paused && !audio.error)) return;
    if (failed) {
      audio.load();
      failed = false;
    }
    const current = ++request;
    pending = true;
    onStatus('loading');
    void audio.play().then(
      () => {
        if (current !== request) return;
        pending = false;
        if (!shouldPlay()) pause();
        else onStatus('playing');
      },
      (error: unknown) => {
        if (current !== request) return;
        pending = false;
        const name = error instanceof Error ? error.name : '';
        if (name === 'AbortError') return;
        failed = name !== 'NotAllowedError';
        onStatus(failed ? 'error' : 'blocked');
      },
    );
  }

  audio.addEventListener('error', () => {
    request++;
    pending = false;
    failed = true;
    if (shouldPlay()) onStatus('error');
  });
  audio.addEventListener('waiting', () => {
    if (shouldPlay()) onStatus('loading');
  });
  audio.addEventListener('playing', () => {
    if (!shouldPlay()) pause();
    else onStatus('playing');
  });
  audio.addEventListener('ended', () => {
    if (!shouldPlay()) return;
    audio.currentTime = 0;
    sync();
  });
  // Some WebKit media backends pause while the native loop seeks back to zero.
  // Resume only that loop boundary; explicit mute/visibility pauses stay authoritative.
  audio.addEventListener('seeked', () => {
    if (audio.loop && audio.paused && audio.currentTime < 0.25 && shouldPlay()) sync();
  });

  return {
    activate() {
      sync();
    },
    setEnabled(value: boolean) {
      enabled = value;
      sync();
    },
    setSuspended(value: boolean) {
      suspended = value;
      sync();
    },
  };
}
