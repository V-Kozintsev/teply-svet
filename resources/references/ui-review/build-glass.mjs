import { isChapterOne } from './chapter-one-scope.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import {
  ArrowDown,
  ArrowRight,
  House,
  List,
  Music,
  RotateCcw,
  RotateCw,
  Settings,
  Slash,
  Volume2,
  Zap,
} from 'lucide';
import { glassLevels } from './glass-energy.js';
import { withMobileScene } from './build-mobile-scene.mjs';
import { withFirstScenery } from './build-first-scenery.mjs';


const root = fileURLToPath(new URL('../../../', import.meta.url));
const languageRuntime = '(()=>{\n' + ['translations.ts', 'language.ts'].map(file => ts.transpileModule(
  fs.readFileSync(path.join(root, 'src', file), 'utf8'),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, removeComments: true } },
).outputText.replace(/^import .*;$/gm, '').replace(/^export /gm, '')).join('\n') + '\ninstallLanguage(window);\n})();\n';
const loadingScreenStyles = fs.readFileSync(path.join(root, 'src/styles/loading-screen.css'), 'utf8')
  .replace('/assets/ui/loading-house.svg', `data:image/svg+xml;base64,${fs.readFileSync(path.join(root,'public/assets/ui/loading-house.svg')).toString('base64')}`);
const loadingPipeStyles = fs.readFileSync(path.join(root, 'src/styles/loading-pipe.css'), 'utf8');
const visualReadiness = ts.transpileModule(fs.readFileSync(path.join(root, 'src/visual-readiness.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText.replace(/^export /gm, '');
const gameTouch = ts.transpileModule(fs.readFileSync(path.join(root, 'src/game-touch.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText.replace(/^export /gm, '');
let html = fs.readFileSync(
  path.join(root, 'resources/references/ui-review/glass-level.template.html'),
  'utf8',
);
const chapterSource = fs.readFileSync(path.join(root, 'resources/references/ui-review/glass-chapter-one.js'), 'utf8')
  .replace("import { applyMiddleBoards } from './glass-middle-boards.js';", fs.readFileSync(path.join(root, 'resources/references/ui-review/glass-middle-boards.js'), 'utf8').replace(/^export /gm, ''))
  .replace("import { applyUndergroundBoards } from './glass-underground.js';", fs.readFileSync(path.join(root, 'resources/references/ui-review/glass-underground.js'), 'utf8').replace(/^export /gm, ''))
  .replace("import { applyLateBoards } from './glass-late-boards.js';", fs.readFileSync(path.join(root, 'resources/references/ui-review/glass-late-boards.js'), 'utf8').replace(/^export /gm, ''))
  .replace(/^export /gm, '');
html = html.replace(
  '__energy_effect__',
  fs
    .readFileSync(path.join(root, 'resources/references/ui-review/glass-energy.js'), 'utf8')
    .replace("import { redesignedLevels } from './glass-chapter-one.js';", chapterSource)
    .replace(/^export /gm, ''),
);
html = html.replace('__meadow_effect__', fs.readFileSync(path.join(root, 'resources/references/ui-review/glass-meadow.js'), 'utf8').replace(/^export /gm, ''));
html = html.replaceAll('__switch_art__', fs.readFileSync(path.join(root, 'resources/references/ui-review/linked-switch.svg'), 'utf8'));
html = html.replace('__onboarding_controller__', fs.readFileSync(path.join(root, 'resources/references/ui-review/glass-onboarding.js'), 'utf8').replace(/^export /gm, ''));
html = html.replace('__fuse_burn_controller__', fs.readFileSync(path.join(root, 'resources/references/ui-review/glass-fuse-burn.js'), 'utf8').replace(/^export /gm, ''));
html = html.replace('__hatch_art__', fs.readFileSync(path.join(root, 'resources/references/ui-review/glass-hatch-art.js'), 'utf8')
  .replace(/^export /gm, '').replace(/^[ \t]*\/\/[^\r\n]*(?:\r?\n|$)/gm, '').replace(/\r?\n[ \t]*/g, ''));
const notices = [
  'Noto Emoji light bulb, v2.047. Original image retained.',
  fs.readFileSync(path.join(root, 'resources/packs/noto-hint/LICENSE-IMAGES'), 'utf8'),
  fs.readFileSync(path.join(root, 'resources/packs/noto-hint/LICENSE'), 'utf8'),
  'Fluent Emoji star: original image retained.',
  fs.readFileSync(path.join(root, 'resources/packs/fluent-star/LICENSE'), 'utf8'),
  'Kenney Music Jingles: original jingles_STEEL10.ogg, CC0.',
  fs
    .readFileSync(path.join(root, 'resources/packs/music-jingles/License.txt'), 'utf8')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trimEnd(),
];
html = html.replace('  <style>', `  <!-- ${notices.join('\n')}\n  -->\n  <style>`);
let effect = ts
  .transpileModule(fs.readFileSync(path.join(root, 'src/power-effect.ts'), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  })
  .outputText.replace('export function', 'function');
for (const delay of [3000, 1400]) {
  const timer = `setTimeout(pulse, ${delay})`;
  if (!effect.includes(timer)) throw new Error('Menu timing changed; review the preview adapter');
  effect = effect.replace(timer, 'setTimeout(pulse, 1000)');
}
const menuDirections = /const directions = \[\s*\[-0\.42, -0\.24\],[\s\S]*?\[-0\.31, 0\.29\],\s*\];/;
if (!menuDirections.test(effect)) {
  throw new Error('Menu spark directions changed; review the preview adapter');
}
effect = effect.replace(
  menuDirections,
  `const directions = [
        [-0.58, -0.28],
        [-0.22, -0.58],
        [0.18, -0.62],
        [0.54, -0.38],
        [0.65, 0.02],
        [0.5, 0.38],
        [0.14, 0.62],
        [-0.34, 0.56],
        [-0.62, 0.18],
    ];`,
);
const loader = /fetch\(soundUrl\)\s*\.then\(\(response\) => response.arrayBuffer\(\)\)/;
if (!loader.test(effect)) throw new Error('Menu audio loader changed; review the preview adapter');
effect = effect.replace(
  loader,
  "Promise.resolve(Uint8Array.from(atob(soundUrl.split(',')[1]), char => char.charCodeAt(0)).buffer)",
);
html = html.replace('__power_effect__', effect);
const musicPlayer = ts
  .transpileModule(fs.readFileSync(path.join(root, 'src/music.ts'), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, removeComments: true },
  })
  .outputText.replace('export function', 'function');
html = html.replace('__music_player__', musicPlayer);
const pointerFeedback = ts
  .transpileModule(fs.readFileSync(path.join(root, 'src/pointer-feedback.ts'), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  })
  .outputText.replace('export function', 'function');
html = html.replace('__pointer_feedback__', pointerFeedback);
const progress = ts
  .transpileModule(fs.readFileSync(path.join(root, 'src/progress.ts'), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  })
  .outputText.replace(/^export /gm, '');
html = html.replace('__progress__', progress);
const hints = ts.transpileModule(fs.readFileSync(path.join(root, 'src/hints.ts'), 'utf8'), {
 compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, removeComments: true },
}).outputText.replace(/^export /gm, '').replace(/^import .*;$/gm, '').replace(/^[ \t]+$/gm, '');
html = html.replace('__hint_wallet__', hints.trim());
html = html.replaceAll('__life_fuse__', '../../../assets/ui/glass-fuse.png');
const assets = {
  font_cyr: ['public/assets/fonts/marmelad-cyrillic.woff2', 'font/woff2'],
  font_lat: ['public/assets/fonts/marmelad-latin.woff2', 'font/woff2'],
  power: ['public/assets/menu/power.svg', 'image/svg+xml'],
  beacon: ['public/assets/menu/beacon.svg', 'image/svg+xml'],
  hint_bulb: ['resources/packs/noto-hint/emoji_u1f4a1.svg', 'image/svg+xml'],
  toolbar_bulb: ['resources/references/ui-review/toolbar-bulb.svg', 'image/svg+xml'],
  toolbar_fuse: ['resources/references/ui-review/toolbar-fuse.svg', 'image/svg+xml'],
  hint_bubble: ['resources/packs/kenney-emotes/speech-bubble-warm.svg', 'image/svg+xml'],
  source_bubble: ['resources/packs/kenney-emotes/speech-bubble-warm.svg', 'image/svg+xml'],
  lesson_bubble: ['resources/packs/kenney-emotes/speech-bubble-warm.svg', 'image/svg+xml'],
  setting_teal: ['resources/references/ui-review/setting-teal.svg', 'image/svg+xml'],
  cursor_hand: ['public/assets/ui/cursor-hand.svg', 'image/svg+xml'],
  cursor_hand_active: ['public/assets/ui/cursor-hand-active.svg', 'image/svg+xml'],
  star_gem: ['resources/packs/fluent-star/star_3d.png', 'image/png'],
  house: ['public/assets/menu/house.png', 'image/png'],
  result_button: ['resources/references/ui-review/result-teal.svg', 'image/svg+xml'],
  dialog_action: ['public/assets/menu/dialog-action.png', 'image/png'],
  result_star: ['public/assets/menu/star-filled.png', 'image/png'],
  result_star_empty: ['public/assets/menu/star-empty.png', 'image/png'],
  switch_rail: ['resources/packs/ui-pack/Vector/Yellow/slide_vertical_color.svg', 'image/svg+xml'],
  switch_handle: ['resources/packs/ui-pack/Vector/Yellow/slide_hangle.svg', 'image/svg+xml'],
  pipe_turn: ['public/assets/audio/tap-a.ogg', 'audio/ogg'],
  hint_click: ['public/assets/audio/click-a.ogg', 'audio/ogg'],
  power_switch: ['public/assets/audio/switch-a.ogg', 'audio/ogg'],
  power_energy: ['public/assets/audio/electric-soft.mp3', 'audio/mpeg'],
  victory_jingle: ['public/assets/audio/victory-jingle.ogg', 'audio/ogg'],
};
for (const name of [
  'tree_pine',
  'tree_long',
  'bush',
  'moon',
  'spark',
  'panel_brown',
  'close',
]) {
  assets[name] = [`public/assets/menu/${name}.png`, 'image/png'];
}
for (const [name, [file, mime]] of Object.entries(assets)) {
  const original = fs.readFileSync(path.join(root, file));
  const content = ['lesson_bubble', 'source_bubble'].includes(name)
    ? Buffer.from(original.toString('utf8').replace('<svg ', '<svg preserveAspectRatio="none" '))
    : original;
  html = html.replaceAll(
    `__${name}__`,
    `data:${mime};base64,${content.toString('base64')}`,
  );
}
const icons = {
  'arrow-down': ArrowDown,
  'arrow-right': ArrowRight,
  house: House,
  list: List,
  music: Music,
  'rotate-ccw': RotateCcw,
  'rotate-cw': RotateCw,
  settings: Settings,
  slash: Slash,
  'volume-2': Volume2,
  zap: Zap,
};
const escapeAttribute = (value) =>
  String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const renderIcon = (name, icon, className = '') => {
  const children = icon
    .map(([tag, attributes]) => {
      const renderedAttributes = Object.entries(attributes)
        .map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
        .join(' ');
      return `<${tag} ${renderedAttributes}></${tag}>`;
    })
    .join('');
  const renderedClass = className ? ` class="${escapeAttribute(className)}"` : '';
  return `<svg${renderedClass} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-icon="${name}">${children}</svg>`;
};
html = html.replace(
  /<i([^>]*)data-lucide="([^"]+)"([^>]*)><\/i>/g,
  (match, before, name, after) => {
    const icon = icons[name];
    if (!icon) throw new Error(`Missing embedded icon: ${name}`);
    const attributes = `${before} ${after}`;
    const className = attributes.match(/class="([^"]*)"/)?.[1] ?? '';
    return renderIcon(name, icon, className);
  },
);
const levelDocuments = glassLevels.map((level) => ({
  id: level.id,
  number: level.displayNumber??level.id,
  hintsEnabled: level.hintsEnabled!==false,
  size: level.size,
  name: level.name,
  loadingDetail: `Готовим: ${level.name.toLocaleLowerCase('ru-RU')}`,
}));
const renderDocument = (level) => {
  const fragment = withFirstScenery(withMobileScene(html
    .replaceAll('__level_id__', String(level.id))
    .replaceAll('__level_number__', String(level.number))
    .replaceAll('__level_name__', level.name)
    .replaceAll('__board_size__', String(level.size))
    .replaceAll('__hints_enabled__', String(level.hintsEnabled))
    .replaceAll('__board_extent__', String(level.size * 100)), level.id), level.id);
  if (/__[a-z_]+__/.test(fragment)) throw new Error('Missing embedded resource');
  if (/\bfetch\s*\(/.test(fragment)) throw new Error('Preview must be API-free');
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
  <title>Тёплый свет — уровень ${level.number}</title>
  <script src="../../../game-language.js"></script>
  <script>
    // Normal deep links enter the persistent music shell; diagnostic pages stay isolated.
    (() => {
      if (!/[/]levels[/][0-9]+[/]index[.]html$/.test(location.pathname)) return;
      try { if (parent !== window && parent.warmMusicHost) return; } catch {}
      const target = new URL('../../', location.href);
      target.search = location.search;
      target.searchParams.set('level', '${level.id}');
      location.replace(target.href);
    })();
  </script>
  <style>
    ${loadingPipeStyles}
    html,body { margin:0; width:100%; min-height:100%; overflow:hidden; background:#0a222c; touch-action:pan-x pan-y; }
    body { min-height:100dvh; display:grid; place-items:center; }
    body>#warm-glass-level { width:min(100vw,calc(160dvh - 166px)); }
    ${loadingScreenStyles}
    #level-entry { --loading-font:GlassMarmelad; opacity:1; transition:opacity .18s ease; }
    #level-entry[data-state='ready'] { opacity:0; pointer-events:none; }
    @media(max-width:620px) { body>#warm-glass-level { width:min(100vw,calc(154dvh - 148px)); } }
    @media(max-width:700px) and (orientation:landscape) and (max-height:320px) { body>#warm-glass-level { width:min(100vw,calc(146dvh - 138px)); } }
    @media(prefers-reduced-motion:reduce) { #level-entry { transition:none; } }
  </style>
</head>
<body>
<div id="level-entry" class="loading-screen" data-state="loading" role="status" aria-busy="true" aria-labelledby="level-entry-title" aria-describedby="level-entry-detail">
  <section class="loading-card">
    <span class="loading-house" aria-hidden="true"></span>
    <h1 id="level-entry-title" class="loading-title">Зажигаем свет…</h1>
    <div class="loading-track loading-pipe" aria-hidden="true"><span class="loading-pipe-glass"><span class="loading-pipe-current"><span class="loading-pipe-wave"></span></span></span></div>
    <p id="level-entry-detail" class="loading-detail" aria-live="polite">${level.loadingDetail}</p>
    <div class="loading-actions"><button id="level-entry-retry" class="loading-retry" type="button" hidden>Повторить</button></div>
  </section>
</div>
<script>
  (()=>{
    ${gameTouch}
    installGameTouchGuard();installGameViewport();
    const entry=document.getElementById('level-entry'),title=document.getElementById('level-entry-title'),detail=document.getElementById('level-entry-detail'),retry=document.getElementById('level-entry-retry');
    let started=performance.now(),finished=false,assetsReady=false,controllerReady=false,finishing=false,fatal=false;
    try {
      const raw=sessionStorage.getItem('teply-svet.loading-transition');sessionStorage.removeItem('teply-svet.loading-transition');
      const handoff=raw?JSON.parse(raw):null,elapsed=handoff?Date.now()-handoff.startedAt:-1;
      if(handoff?.target===location.pathname&&elapsed>=0&&elapsed<30000)started-=elapsed;
    } catch {}
    const syncLoadingMotion=()=>document.documentElement.style.setProperty('--loading-motion',document.hidden?'paused':'running');
    document.addEventListener('visibilitychange',syncLoadingMotion);syncLoadingMotion();
    const blockCoveredKeys=event=>{if(!entry.contains(event.target)){event.preventDefault();event.stopImmediatePropagation();}};
    addEventListener('keydown',blockCoveredKeys,true);
    const slow=setTimeout(()=>{if(!finished)detail.textContent='Загрузка идёт медленнее обычного';},5000);
    const failure=setTimeout(()=>fail('timeout'),60000);
    function fail(kind){if(finished)return;fatal=fatal||kind!=='timeout';clearTimeout(slow);clearTimeout(failure);entry.dataset.state='error';entry.dataset.failure=kind==='storage'?'storage':kind==='timeout'?'timeout':'assets';entry.setAttribute('role','alert');entry.setAttribute('aria-busy','false');title.textContent='Не удалось подготовить уровень';detail.textContent=kind==='storage'?'Не удалось открыть сохранение. Попробуйте ещё раз':'Проверьте соединение и попробуйте ещё раз';retry.hidden=false;}
    addEventListener('warm-level-error',event=>fail(event.detail?.kind));
    const onError=${isChapterOne(level.id)?'event=>{if(event.target instanceof HTMLMediaElement)return;fail();}':'()=>fail()'};
    addEventListener('error',onError,true);addEventListener('unhandledrejection',onError);
    retry.addEventListener('click',()=>location.reload());
    function finishWhenReady(){
      if(fatal||!assetsReady||!controllerReady||finishing)return;
      finishing=true;
      const delay=Math.max(0,2000-(performance.now()-started));
      setTimeout(()=>{if(fatal)return;finished=true;clearTimeout(slow);clearTimeout(failure);removeEventListener('error',onError,true);removeEventListener('unhandledrejection',onError);entry.setAttribute('aria-busy','false');entry.dataset.state='ready';setTimeout(()=>{removeEventListener('keydown',blockCoveredKeys,true);entry.remove();dispatchEvent(new Event('warm-level-visible'));},190);},delay);
    }
    addEventListener('warm-level-ready',()=>{controllerReady=true;finishWhenReady();},{once:true});
    window.__finishWarmLevelEntry=async()=>{
      await document.fonts.ready;${isChapterOne(level.id)?"if(!controllerReady)await new Promise(resolve=>addEventListener('warm-level-ready',resolve,{once:true}));await prepareVisualAssets(document).catch(fail);if(fatal)return;window.__layoutWarmLevelVisuals?.();await waitForVisualPaint();":''}assetsReady=true;finishWhenReady();
    };${isChapterOne(level.id)?'\n'+visualReadiness:''}
  })();
</script>
${fragment}
<script>
  if(document.readyState==='complete')window.__finishWarmLevelEntry();
  else addEventListener('load',window.__finishWarmLevelEntry,{once:true});
</script>
</body>
</html>
`;
};
// CSS indentation is not needed in the standalone delivery. Keep the size gate.
const documents = new Map(levelDocuments.map((level) => [level.id, renderDocument(level).replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g,(_,open,css,close)=>open+css.replace(/^[ \t]+/gm,'')+close)]));
for (const [levelId, document] of documents) {
  if (Buffer.byteLength(document) > 1000000) throw new Error(`Level ${levelId} is too large (${Buffer.byteLength(document)} bytes)`);
}
const checkOnly = process.argv.includes('--check');
const extraOutput = process.argv.slice(2).find((argument) => argument !== '--check');
const productionDocument = (document) =>
  document
    .replaceAll('../../../assets/', '../../assets/')
    .replaceAll('../../../game-language.js', '../../game-language.js')
    .replace("new URL('../../../',location.href)", "new URL('../../',location.href)");
const outputs = [
  { file: path.join(root, 'public/game-language.js'), content: languageRuntime },
  {
    file: path.join(root, 'resources/references/ui-review/glass-level.html'),
    content: documents.get(31),
  },
  ...levelDocuments.map((level) => ({
    file: path.join(root, `public/levels/${level.id}/index.html`),
    content: productionDocument(documents.get(level.id)),
  })),
  // Old bookmarks lead to the retained outage board; no retired game is shipped.
  {
    file: path.join(root, 'public/levels/35/index.html'),
    content: '<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Тёплый свет</title><meta http-equiv="refresh" content="0;url=../36/index.html"><script>const target=new URL("../36/index.html",location.href);target.search=location.search;location.replace(target.href);</script><a href="../36/index.html">Перейти к уровню 5</a></html>\n',
  },
];
if (extraOutput) outputs.push({ file: path.resolve(extraOutput), content: documents.get(31) });

if (checkOnly) {
  const stale = outputs.filter(
    ({ file, content }) => !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content,
  );
  if (stale.length) {
    throw new Error(
      `Generated level is stale: ${stale.map(({ file }) => file).join(', ')}. Run npm run level:build.`,
    );
  }
} else {
  for (const { file, content } of outputs) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
}
console.log(
  `${checkOnly ? 'Checked' : 'Prepared'} ${documents.size} levels; ${Object.keys(assets).length} embedded assets.`,
);
