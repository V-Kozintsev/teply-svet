import { isChapterOne } from './chapter-one-scope.mjs';
import fs from 'node:fs';
import ts from 'typescript';

const read = (name) => fs.readFileSync(new URL(name, import.meta.url), 'utf8');

// Companions are temporarily disabled. Keep the existing first-level scenery reactions.
export function withFirstScenery(fragment, id) {
  if (!isChapterOne(id)) return fragment;
  const replace = (from, to) => {
    if (!fragment.includes(from)) throw new Error(`Scenery anchor missing: ${from}`);
    fragment = fragment.replace(from, to);
  };
  const source = read('../../../src/garden-life.ts');
  const start = source.indexOf('export type SceneryTarget =');
  if (start < 0) throw new Error('Scenery source missing');
  const life = ts.transpileModule(source.slice(start), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText.replace(/^export /gm, '');
  replace('  <header class="level-header">',
    `  <style>${read('../../../src/styles/scenery-life.css')}</style>\n  <header class="level-header">`);
  replace('    (async () => {', `${life}\n${read('./glass-first-scenery.js')}\n    (async () => {`);
  replace('      installPointerFeedback(root);',
    '      const gardenScenery=createGlassScenery(root);\n      installPointerFeedback(root);');
  replace('root.dataset.paused=String(pause);',
    "root.dataset.paused=String(pause);gardenScenery.pause(pause||introPending||root.dataset.energyState==='ACTIVATING');");
  replace('meadow.draw();onboarding?.position();',
    'meadow.draw();gardenScenery.layout();onboarding?.position();');
  return fragment;
}
