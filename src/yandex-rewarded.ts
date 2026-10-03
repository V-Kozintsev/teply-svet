import { isYandexGameHost, loadYandexSdk } from './yandex-sdk.ts';
export { isYandexGameHost } from './yandex-sdk.ts';

declare global {
  interface Window {
    warmRewardedHost?: {
      available: boolean;
      readonly active: boolean;
      showHintAd(): Promise<boolean>;
      showStarAd(): Promise<boolean>;
    };
  }
}

export function createYandexRewardedHost(
  hostWindow: Window,
  suspendSound: (suspended: boolean) => void,
  { sdkTimeoutMs = 20_000, adStartTimeoutMs = 20_000 } = {},
) {
  let busy = false;
  const openAds = new Set<object>();
  const available = isYandexGameHost(hostWindow.location.hostname) || !!hostWindow.YaGames;

  const loadSdk = () => loadYandexSdk(hostWindow, sdkTimeoutMs);

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
