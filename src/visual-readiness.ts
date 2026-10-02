// Decode the mounted scene, including hidden dialog art and SVG image references.
// Embedded CSS art needs an explicit decode too: window.load only confirms bytes.
export async function decodeVisualImage(image: HTMLImageElement): Promise<void> {
  if (!image.complete) {
    await new Promise<void>((resolve, reject) => {
      const clean = () => {
        image.removeEventListener('load', loaded);
        image.removeEventListener('error', failed);
      };
      const loaded = () => {
        clean();
        resolve();
      };
      const failed = () => {
        clean();
        reject(new Error('Image could not be loaded'));
      };
      image.addEventListener('load', loaded, { once: true });
      image.addEventListener('error', failed, { once: true });
    });
  }
  if (!image.naturalWidth) throw new Error('Image has no renderable content');
  if (typeof image.decode !== 'function') return;
  const source = image.currentSrc || image.src;
  // Some engines reject decode() for an otherwise loaded SVG. Retry once, and
  // allow their normal paint path only if the exact image still loaded successfully.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await image.decode();
      return;
    } catch (error) {
      if (!image.complete || !image.naturalWidth || source !== (image.currentSrc || image.src))
        throw error;
    }
  }
}

export async function prepareVisualAssets(scope: ParentNode = document): Promise<void> {
  const images = [...scope.querySelectorAll<HTMLImageElement>('img[src]')];
  const sources = new Set(images.map((image) => image.currentSrc || image.src));
  const addImage = (source: string | null) => {
    if (!source || source.startsWith('#')) return;
    const url = new URL(source, document.baseURI).href;
    if (sources.has(url)) return;
    sources.add(url);
    const image = new Image();
    image.src = url;
    images.push(image);
  };
  for (const image of scope.querySelectorAll('svg image')) {
    addImage(image.getAttribute('href') || image.getAttribute('xlink:href'));
  }
  for (const style of scope.querySelectorAll('style')) {
    for (const match of (style.textContent || '').matchAll(
      /url\(\s*['"]?(data:image\/[^'"\s)]+)['"]?\s*\)/g,
    )) {
      addImage(match[1]);
    }
  }
  // Bound concurrent decodes on small devices. Keep references until the first paint.
  for (let start = 0; start < images.length; start += 6) {
    await Promise.all(images.slice(start, start + 6).map(decodeVisualImage));
  }
  await document.fonts.ready;
  await waitForVisualPaint();
}

export function waitForVisualPaint(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (document.hidden) return resolve();
    let frame = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibility);
      resolve();
    };
    const onVisibility = () => {
      if (document.hidden) finish();
    };
    document.addEventListener('visibilitychange', onVisibility);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(finish);
    });
  });
}
