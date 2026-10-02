import { assets } from './assets';
import { decodeVisualImage, prepareVisualAssets } from './visual-readiness';

export const audioSources = new Map<string, string>();
const pendingAudio = new Map<string, AbortController>();
let departed = false;
window.addEventListener('pagehide', () => {
  departed = true;
  pendingAudio.forEach((controller) => controller.abort());
  pendingAudio.clear();
});
window.addEventListener('pageshow', (event) => {
  departed = false;
  if (event.persisted) prepareMenuAudio();
});

export function prepareMenuVisuals(scope: ParentNode): Promise<void> {
  return withTimeout(prepareVisualAssets(scope), 'menu visuals');
}

function withTimeout<T>(task: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    task,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Timeout: ' + label)), 60000);
    }),
  ]).finally(() => clearTimeout(timer));
}

async function prepareAsset(file: string, signal?: AbortSignal): Promise<void> {
  const url = new URL('./' + file, document.baseURI).href;
  if (/\.(png|svg)$/.test(file)) {
    const image = new Image();
    image.src = url;
    await decodeVisualImage(image);
  } else if (file.endsWith('.woff2') || file.endsWith('.ttf')) {
    const digits = file.endsWith('.ttf');
    const text = digits ? '0123456789' : file.includes('cyrillic') ? 'Тёплый свет' : 'STORYSHELF';
    const faces = await document.fonts.load(`16px ${digits ? 'WarmDigits' : 'WarmMarmelad'}`, text);
    if (!faces.length) throw new Error('Font unavailable: ' + file);
  } else {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error('Asset unavailable: ' + file);
    audioSources.set(file, URL.createObjectURL(await response.blob()));
  }
}

export async function loadAssets(report: (complete: number, total: number) => void): Promise<void> {
  let complete = 0;
  let failed = false;
  // The last unit represents mounting and wiring the menu, not an artificial delay.
  const visuals = assets.filter((file) => !file.startsWith('assets/audio/'));
  const total = visuals.length + 1;
  report(complete, total);
  try {
    await Promise.all(
      visuals.map(async (file) => {
        await withTimeout(prepareAsset(file), file);
        if (!failed) report(++complete, total);
      }),
    );
  } catch (error) {
    failed = true;
    throw error;
  }
}

// Optional sound bytes load alongside the menu; a slow audio response cannot block play.
export function prepareMenuAudio(): void {
  // The initial visual load may resolve after navigation has already started.
  // Never start optional requests from that departing document.
  if (departed) return;
  for (const file of assets.filter((file) => file.startsWith('assets/audio/'))) {
    // Music streams in the persistent shell; do not fetch a second complete copy.
    if (file.endsWith('/one-step-at-a-time.mp3')) continue;
    if (audioSources.has(file) || pendingAudio.has(file)) continue;
    const controller = new AbortController();
    pendingAudio.set(file, controller);
    const timeout = setTimeout(() => controller.abort(), 20000);
    void prepareAsset(file, controller.signal)
      .catch(() => undefined)
      .finally(() => {
        clearTimeout(timeout);
        if (pendingAudio.get(file) === controller) pendingAudio.delete(file);
      });
  }
}
