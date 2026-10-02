import fs from 'node:fs';
const runtime = fs.readFileSync(
  new URL('./glass-first-energy-canvas.js', import.meta.url),
  'utf8',
);
// This adapter runs only after the first-chapter controller refinements.
export function refineFirstEnergyCanvas(fragment) {
  const replace = (from, to) => {
    if (!fragment.includes(from))
      throw new Error(`Missing energy canvas anchor: ${from}`);
    fragment = fragment.replace(from, to);
  };
  replace(
    'function createGlassEnergy(',
    runtime + '\nfunction createGlassEnergy(',
  );
  replace(
    '  function paint(dt) {',
    '  let firstEnergyCanvas=null;\n  function paint(dt) {\n    try {paintOriginal(dt);}finally{firstEnergyCanvas?.paint();}\n  }\n  function paintOriginal(dt) {',
  );
  replace(
    '    setExternalFeeds(feeds) { externalFeeds = feeds;',
    '    setExternalFeeds(feeds) { firstEnergyCanvas??=createFirstEnergyCanvas(root,svg,reducedMotion); externalFeeds = feeds;',
  );
  replace(
    '      reducedMotion = value;',
    '      reducedMotion = value;firstEnergyCanvas?.setReduced(value);',
  );
  replace(
    '    const dt = lastFrame === null ? 0 : Math.min(80, now - lastFrame);',
    '    firstEnergyCanvas?.observeFrame(now,lastFrame!==null);\n    const dt = lastFrame === null ? 0 : Math.min(80, now - lastFrame);',
  );
  return fragment;
}
