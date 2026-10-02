import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { checkPublic, checkProduction } from './scripts/check-production.mjs';

const bootStyleMarker = '<!-- critical-boot-styles -->';
const inlineBootStyle = '<style data-critical-boot>';
const indexSource = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
if (!indexSource.includes(bootStyleMarker) || !indexSource.includes('loading-house')) {
  throw new Error('Critical boot markers are missing from index.html');
}
const asDataUrl = (path: string, mime: string) =>
  `data:${mime};base64,${readFileSync(new URL(path, import.meta.url)).toString('base64')}`;
const cursorStyles = readFileSync(new URL('./src/styles/cursor.css', import.meta.url), 'utf8')
  .replace(
    '/assets/ui/cursor-hand.svg',
    asDataUrl('./public/assets/ui/cursor-hand.svg', 'image/svg+xml'),
  )
  .replace(
    '/assets/ui/cursor-hand-active.svg',
    asDataUrl('./public/assets/ui/cursor-hand-active.svg', 'image/svg+xml'),
  );
const getBootStyles = () =>
  readFileSync(new URL('./src/styles/loading.css', import.meta.url), 'utf8')
    .replace(
      "@import './loading-screen.css';",
      readFileSync(new URL('./src/styles/loading-screen.css', import.meta.url), 'utf8'),
    )
    .replace("@import './cursor.css';", cursorStyles)
    .replace(
      "@import './loading-pipe.css';",
      readFileSync(new URL('./src/styles/loading-pipe.css', import.meta.url), 'utf8'),
    )
    .replace(
      '/assets/fonts/marmelad-cyrillic.woff2',
      asDataUrl('./public/assets/fonts/marmelad-cyrillic.woff2', 'font/woff2'),
    )
    .replace(
      '/assets/menu/panel_brown.png',
      asDataUrl('./public/assets/menu/panel_brown.png', 'image/png'),
    )
    .replace(
      '/assets/ui/loading-house.svg',
      asDataUrl('./public/assets/ui/loading-house.svg', 'image/svg+xml'),
    )
    .replace(
      '/assets/menu/dialog-action.png',
      asDataUrl('./public/assets/menu/dialog-action.png', 'image/png'),
    );

export default defineConfig({
  base: './',
  server: {
    allowedHosts: ['.trycloudflare.com'],
  },
  preview: {
    allowedHosts: ['.trycloudflare.com'],
  },
  plugins: [
    {
      name: 'production-inventory',
      apply: 'build',
      buildStart() {
        checkPublic();
      },
      writeBundle(options, bundle) {
        if (!options.dir) throw new Error('Release directory is missing');
        checkProduction(options.dir, Object.keys(bundle));
      },
    },
    {
      name: 'inline-critical-boot-styles',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          if (!html.includes(bootStyleMarker)) return html;
          return html.replace(bootStyleMarker, `${inlineBootStyle}${getBootStyles()}</style>`);
        },
      },
    },
  ],
});
