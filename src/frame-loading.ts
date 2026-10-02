declare global {
  interface Window {
    warmNavigationHost?: { navigate(url: string): void };
  }
}

// The persistent shell survives a failed iframe navigation and can offer recovery.
export function installFrameLoading(
  frame: HTMLIFrameElement,
  initialUrl: string,
  menuUrl: string,
  timeoutMs = 60_000,
) {
  const loading = document.querySelector<HTMLElement>('#loading')!;
  const title = document.querySelector<HTMLElement>('#loading-label')!;
  const detail = document.querySelector<HTMLElement>('#loading-detail')!;
  const retry = document.querySelector<HTMLButtonElement>('#loading-retry')!;
  const menu = document.createElement('button');
  menu.type = 'button';
  menu.className = 'loading-retry';
  menu.textContent = 'В меню';
  menu.hidden = true;
  retry.parentElement!.append(menu);
  retry.removeAttribute('onclick');
  let target = initialUrl;
  let pending = false;
  let cleanup = () => {};
  let clearTimers = () => {};

  function fail(storage = false) {
    if (!pending) return;
    clearTimers();
    loading.dataset.state = 'error';
    loading.setAttribute('aria-busy', 'false');
    title.textContent = 'Не удалось загрузить игру';
    detail.textContent = storage
      ? 'Не удалось открыть сохранение. Попробуйте ещё раз.'
      : 'Проверьте соединение и нажмите «Повторить».';
    retry.hidden = false;
    menu.hidden = false;
  }

  function ready() {
    if (!pending) return;
    pending = false;
    cleanup();
    loading.hidden = true;
    frame.inert = false;
    window.dispatchEvent(new Event('menu-ready'));
  }

  function navigate(url: string) {
    const destination = new URL(url, location.href);
    if (destination.origin !== location.origin) return;
    cleanup();
    target = destination.href;
    pending = true;
    loading.hidden = false;
    loading.dataset.state = 'loading';
    loading.setAttribute('aria-busy', 'true');
    title.textContent = 'Зажигаем свет…';
    detail.textContent = 'Готовим уютный вечер';
    retry.hidden = true;
    menu.hidden = true;
    frame.inert = true;
    const slow = window.setTimeout(() => {
      if (!pending) return;
      loading.dataset.state = 'slow';
      detail.textContent = navigator.onLine
        ? 'Связь медленная. Ещё немного…'
        : 'Нет связи. Ждём подключение…';
      menu.hidden = false;
    }, 6000);
    // This is a recoverable deadline: a late successful load still opens the game.
    const deadline = window.setTimeout(() => fail(), timeoutMs);
    clearTimers = () => {
      window.clearTimeout(slow);
      window.clearTimeout(deadline);
    };
    cleanup = clearTimers;
    frame.src = target;
  }

  frame.addEventListener('load', () => {
    if (!pending) return;
    try {
      const child = frame.contentWindow!;
      const doc = child.document;
      const expectedLevel = new URL(target).pathname.match(/\/levels\/(\d+)\/index\.html$/)?.[1];
      const root = doc.getElementById('warm-glass-level');
      const app = doc.getElementById('app');
      if (expectedLevel ? root?.dataset.levelId !== expectedLevel : !app) {
        fail();
        return;
      }
      const inspect = () => {
        const entry = doc.getElementById(expectedLevel ? 'level-entry' : 'loading');
        if (expectedLevel ? !entry : app && !app.hidden && !app.inert) ready();
        else if (entry?.dataset.state === 'error') fail(entry.dataset.failure === 'storage');
      };
      const observer = new MutationObserver(inspect);
      observer.observe(doc.body, { attributes: true, childList: true, subtree: true });
      const previousCleanup = cleanup;
      cleanup = () => {
        previousCleanup();
        observer.disconnect();
        child.removeEventListener('menu-ready', inspect);
        child.removeEventListener('warm-level-visible', inspect);
      };
      child.addEventListener('menu-ready', inspect);
      child.addEventListener('warm-level-visible', inspect);
      inspect();
    } catch {
      // Browser network-error documents can be inaccessible to the shell.
      fail();
    }
  });
  retry.addEventListener('click', () => navigate(target));
  menu.addEventListener('click', () => navigate(menuUrl));
  window.warmNavigationHost = { navigate };
  navigate(initialUrl);
}
