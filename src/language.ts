import { english } from './translations.ts';

export type GameLanguage = 'ru' | 'en';
export const languageKey = 'teply-svet.language.v1';
export function resolveLanguage(
  manual: string | null,
  platform?: string,
  browser = 'en',
): GameLanguage {
  if (manual === 'ru' || manual === 'en') return manual;
  return (platform || browser).toLowerCase().split(/[-_]/)[0] === 'ru' ? 'ru' : 'en';
}
const escapePattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const phrases = { ...english };
for (const [key, value] of Object.entries(english)) {
  if (!(key.toLowerCase() in phrases)) phrases[key.toLowerCase()] = value;
}
const phrasePattern = new RegExp(
  `(^|[^\\p{L}\\p{N}])(${Object.keys(phrases)
    .sort((a, b) => b.length - a.length)
    .map(escapePattern)
    .join('|')})(?=$|[^\\p{L}\\p{N}])`,
  'gu',
);
export function translateText(text: string, language: GameLanguage): string {
  if (language === 'ru' || !/[А-Яа-яЁё]/.test(text)) return text;
  const normalized = text.trim().replace(/\s+/g, ' ');
  let translated = phrases[normalized];
  if (!translated) {
    translated = normalized
      .replace(/Купить 1 подсказку за (\d+) звёзд/g, 'Buy 1 hint for $1 stars')
      .replace(/Смотреть рекламу · \+(\d+) ★/g, 'Watch ad · +$1 ★')
      .replace(/Доступно звёзд: ([\d\s]+)\. Пополнить/g, 'Stars available: $1. Get more')
      .replace(/Бесплатные \+2 через (\d+) ч/g, '2 free in $1 h')
      .replace(/\+1 бесплатно через (\d+) мин/g, '+1 free in $1 min')
      .replace(/Предохранитель через (\d+) мин/g, 'Next fuse in $1 min')
      .replace(/Бесплатная через /g, 'Free in ')
      .replace(/(\d+) ч/g, '$1 h')
      .replace(/(\d+) мин/g, '$1 min')
      .replace(/Получено (\d+) ★!/g, 'Received $1 ★!')
      .replace(/Готовим: /g, 'Preparing: ')
      .replace(/(\d+) уровней/g, '$1 levels')
      .replace(phrasePattern, (_match, prefix: string, key: string) => prefix + phrases[key]);
  }
  const leading = text.match(/^\s*/)?.[0] ?? '';
  const trailing = text.match(/\s*$/)?.[0] ?? '';
  return leading + translated + trailing;
}

export interface LanguageHost {
  readonly current: GameLanguage;
  set(language: GameLanguage): void;
  setPlatformLanguage(language?: string): void;
  subscribe(listener: () => void): () => void;
  refresh(): void;
}
declare global {
  interface Window {
    warmLanguage?: LanguageHost;
  }
}

// Localize presentation only. Puzzle data and stable IDs stay untouched.
export function installLanguage(win: Window): LanguageHost {
  if (win.warmLanguage) return win.warmLanguage;
  let parentHost: LanguageHost | undefined;
  try {
    if (win.parent !== win) parentHost = win.parent.warmLanguage;
  } catch {
    /* External portal. */
  }
  let manual: string | null = null;
  try {
    manual = win.localStorage.getItem(languageKey);
  } catch {
    /* In-memory choice still works. */
  }
  let platform: string | undefined;
  let language = parentHost?.current ?? resolveLanguage(manual, platform, win.navigator.language);
  const listeners = new Set<() => void>();
  const doc = win.document;
  const originals = new WeakMap<Node, Map<string, { source: string; output: string }>>();
  const attributes = [
    'aria-label',
    'aria-description',
    'title',
    'alt',
    'placeholder',
    'data-label',
  ];
  let queued = false;
  let layoutPending = false;
  const pending = new Set<Node>();
  function localize(node: Node, key: string, value: string, write: (value: string) => void) {
    let slots = originals.get(node);
    if (!slots) {
      slots = new Map();
      originals.set(node, slots);
    }
    const previous = slots.get(key);
    const source = previous?.output === value ? previous.source : value;
    const output = translateText(source, language);
    slots.set(key, { source, output });
    if (output !== value) {
      write(output);
      if (
        previous?.output !== output &&
        node.parentElement?.closest('.lesson-card,.onboarding-card') &&
        !layoutPending
      ) {
        layoutPending = true;
        win.requestAnimationFrame(() => {
          layoutPending = false;
          win.dispatchEvent(new Event('resize'));
        });
      }
    }
  }
  function visit(node: Node) {
    const element = node.nodeType === 1 ? (node as Element) : node.parentElement;
    if (!element || element.closest('script,style,noscript,[data-i18n-skip]')) return;
    if (node.nodeType === 3) {
      localize(node, 'text', node.nodeValue ?? '', (value) => {
        node.nodeValue = value;
      });
      return;
    }
    if (node.nodeType !== 1) return;
    for (const attr of attributes) {
      const value = element.getAttribute(attr);
      if (value !== null)
        localize(element, attr, value, (next) => element.setAttribute(attr, next));
    }
    if (element.matches('[data-language-select]')) (element as HTMLSelectElement).value = language;
    if (element.matches('[data-language-toggle]')) {
      element.textContent = `🌐 ${language.toUpperCase()}`;
      element.setAttribute(
        'aria-label',
        language === 'ru' ? 'Switch to English' : 'Переключить на русский',
      );
    }
    for (const child of element.childNodes) visit(child);
  }
  const observer = new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === 'childList') for (const node of change.addedNodes) pending.add(node);
      else pending.add(change.target);
    }
    if (!queued) {
      queued = true;
      queueMicrotask(flush);
    }
  });
  function watch() {
    observer.observe(doc.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: attributes,
    });
  }
  function flush() {
    queued = false;
    // Include records queued since the observer callback, before disconnecting.
    for (const change of observer.takeRecords()) {
      if (change.type === 'childList') for (const node of change.addedNodes) pending.add(node);
      else pending.add(change.target);
    }
    observer.disconnect();
    for (const node of pending) if (node.isConnected) visit(node);
    pending.clear();
    doc.documentElement.lang = language;
    watch();
  }
  function refresh() {
    pending.add(doc.documentElement);
    flush();
  }
  function update() {
    const next = parentHost?.current ?? resolveLanguage(manual, platform, win.navigator.language);
    if (next === language) return;
    language = next;
    refresh();
    for (const listener of listeners) listener();
    win.dispatchEvent(new Event('warm-language-change'));
    // Reposition open tutorial bubbles using the newly measured translated text.
    win.dispatchEvent(new Event('resize'));
  }
  const host: LanguageHost = {
    get current() {
      return language;
    },
    set(value) {
      if (value !== 'ru' && value !== 'en') return;
      if (parentHost) {
        parentHost.set(value);
        return;
      }
      manual = value;
      try {
        win.localStorage.setItem(languageKey, value);
      } catch {
        /* Keep session choice. */
      }
      update();
    },
    setPlatformLanguage(value) {
      platform = value;
      update();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    refresh,
  };
  win.warmLanguage = host;
  let unsubscribe = parentHost?.subscribe(update);
  win.addEventListener('pagehide', () => {
    unsubscribe?.();
    unsubscribe = undefined;
  });
  win.addEventListener('pageshow', () => {
    if (parentHost && !unsubscribe) unsubscribe = parentHost.subscribe(update);
    update();
  });
  win.addEventListener('storage', (event) => {
    if (event.key !== languageKey) return;
    manual = event.newValue;
    update();
  });
  doc.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (target?.closest('[data-language-toggle]')) host.set(language === 'ru' ? 'en' : 'ru');
  });
  doc.addEventListener('change', (event) => {
    const target = event.target as HTMLSelectElement | null;
    if (target?.matches('[data-language-select]')) host.set(target.value as GameLanguage);
  });
  const style = doc.createElement('style');
  style.textContent = `
    .language-choice{display:flex;align-items:center;justify-content:center;gap:12px;margin:14px 0 0;color:#ffe4a1;font:inherit}
    .language-choice select,.menu-language{min-height:44px;border:1px solid #c6a16a;border-radius:12px;background:#173e46;color:#ffe4a1;font:inherit;padding:8px 12px;cursor:pointer;touch-action:manipulation}
    .menu-language{position:absolute;z-index:8;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));font-size:16px}
    .language-choice select:focus-visible,.menu-language:focus-visible{outline:2px solid #ffe4a1;outline-offset:3px}
    .menu-language:hover{background:#27505a}.menu-language:active{transform:translateY(1px)}
    html[lang=en] #app .chapter-coming-soon{font-size:clamp(28px,7vw,74px)}
  `;
  doc.head.append(style);
  refresh();
  return host;
}
