type RewardedCallbacks = {
  onOpen: () => void;
  onRewarded: () => void;
  onClose: () => void;
  onError: () => void;
};

type YandexGames = {
  init(): Promise<{ adv: { showRewardedVideo(options: { callbacks: RewardedCallbacks }): void } }>;
};

declare global {
  interface Window {
    YaGames?: YandexGames;
    warmRewardedHost?: {
      available: boolean;
      readonly active: boolean;
      showHintAd(): Promise<boolean>;
      showStarAd(): Promise<boolean>;
    };
  }
}

export function isYandexGameHost(hostname: string): boolean {
  return /(^|\.)(yandex\.(ru|com|net)|ya\.ru)$/.test(hostname);
}

export function createYandexRewardedHost(
  hostWindow: Window,
  suspendSound: (suspended: boolean) => void,
  { sdkTimeoutMs = 20_000, adStartTimeoutMs = 20_000 } = {},
) {
  let sdk: Promise<Awaited<ReturnType<YandexGames['init']>>> | null = null;
  let busy = false;
  const openAds = new Set<object>();
  const available = isYandexGameHost(hostWindow.location.hostname) || !!hostWindow.YaGames;

  function loadSdk() {
    if (sdk) return sdk;
    let script: HTMLScriptElement | undefined;
    let timer: ReturnType<typeof setTimeout>;
    const initialization = new Promise<YandexGames>((resolve, reject) => {
      if (hostWindow.YaGames) return resolve(hostWindow.YaGames);
      script = hostWindow.document.createElement('script');
      script.src = '/sdk.js';
      script.async = true;
      script.onload = () =>
        hostWindow.YaGames ? resolve(hostWindow.YaGames) : reject(new Error('SDK unavailable'));
      script.onerror = () => reject(new Error('SDK unavailable'));
      hostWindow.document.head.append(script);
    }).then((games) => games.init());
    sdk = Promise.race([
      initialization,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('SDK loading timed out')), sdkTimeoutMs);
      }),
    ])
      .catch((error) => {
        script?.remove();
        sdk = null;
        throw error;
      })
      .finally(() => {
        clearTimeout(timer);
        if (script) script.onload = script.onerror = null;
      });
    return sdk;
  }

  // The portal expects the SDK to be initialized even before the first ad request.
  if (available) void loadSdk().catch(() => undefined);

  async function showRewardedAd(): Promise<boolean> {
    if (!available || busy || openAds.size) return false;
    busy = true;
    try {
      const platform = await loadSdk();
      return await new Promise<boolean>((resolve) => {
        let rewarded = false;
        let finished = false;
        let closed = false;
        const request = {};
        const timeout = setTimeout(() => finish(false), adStartTimeoutMs);
        const finish = (success = rewarded) => {
          if (finished) return;
          finished = true;
          clearTimeout(timeout);
          resolve(success);
        };
        const close = (success = rewarded) => {
          if (closed) return;
          closed = true;
          openAds.delete(request);
          suspendSound(openAds.size > 0);
          finish(success);
        };
        try {
          platform.adv.showRewardedVideo({
            callbacks: {
              onOpen: () => {
                if (closed) return;
                clearTimeout(timeout);
                // A video that appears after the waiting deadline still pauses play,
                // but its abandoned request cannot credit a reward.
                openAds.add(request);
                suspendSound(true);
              },
              onRewarded: () => {
                if (!finished && !closed) rewarded = true;
              },
              onClose: () => close(),
              onError: () => close(false),
            },
          });
        } catch {
          close(false);
        }
      });
    } catch {
      return false;
    } finally {
      busy = false;
    }
  }
  return {
    available,
    get active() {
      return openAds.size > 0;
    },
    showHintAd: showRewardedAd,
    showStarAd: showRewardedAd,
  };
}
