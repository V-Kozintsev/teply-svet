export type RewardedCallbacks = {
  onOpen(): void;
  onRewarded(): void;
  onClose(): void;
  onError(): void;
};

export type YandexPlatform = {
  environment?: { i18n?: { lang?: string } };
  adv: { showRewardedVideo(options: { callbacks: RewardedCallbacks }): void };
};

declare global {
  interface Window {
    YaGames?: { init(): Promise<YandexPlatform> };
  }
}

export function isYandexGameHost(hostname: string): boolean {
  return /(^|\.)(yandex\.(ru|com|net)|ya\.ru)$/.test(hostname);
}

const pending = new WeakMap<Window, Promise<YandexPlatform>>();

export function loadYandexSdk(hostWindow: Window, timeoutMs = 20_000): Promise<YandexPlatform> {
  const existing = pending.get(hostWindow);
  if (existing) return existing;
  let script: HTMLScriptElement | undefined;
  let timer: ReturnType<typeof setTimeout>;
  const initialization = new Promise<NonNullable<Window['YaGames']>>((resolve, reject) => {
    if (hostWindow.YaGames) return resolve(hostWindow.YaGames);
    script = hostWindow.document.createElement('script');
    script.src = '/sdk.js';
    script.async = true;
    script.onload = () =>
      hostWindow.YaGames ? resolve(hostWindow.YaGames) : reject(new Error('SDK unavailable'));
    script.onerror = () => reject(new Error('SDK unavailable'));
    hostWindow.document.head.append(script);
  }).then((games) => games.init());
  const result = Promise.race([
    initialization,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('SDK loading timed out')), timeoutMs);
    }),
  ])
    .catch((error) => {
      script?.remove();
      pending.delete(hostWindow);
      throw error;
    })
    .finally(() => {
      clearTimeout(timer);
      if (script) script.onload = script.onerror = null;
    });
  pending.set(hostWindow, result);
  return result;
}
