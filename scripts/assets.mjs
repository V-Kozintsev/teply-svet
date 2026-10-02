import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import prettier from 'prettier';

const root = path.resolve(import.meta.dirname, '..');
const errors = [];
const writeMode = process.argv.includes('--write');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'resources/manifest.json'), 'utf8'));
const publicRoot = path.join(root, 'public');
const resolveInside = (base, relative) => {
  const target = path.resolve(base, relative);
  if (!target.startsWith(base + path.sep)) throw new Error(`Path outside ${base}: ${relative}`);
  return target;
};
const hash = (data) => crypto.createHash('sha256').update(data).digest('hex');

async function filesUnder(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(target) : [target];
    }),
  );
  return nested.flat();
}

const names = new Set();
for (const asset of manifest) {
  if (names.has(asset.file)) errors.push(`Duplicate manifest entry: ${asset.file}`);
  names.add(asset.file);
  try {
    const shipped = await fs.readFile(resolveInside(publicRoot, asset.file));
    const original = await fs.readFile(resolveInside(root, asset.source));
    await fs.access(resolveInside(root, asset.license));
    if (writeMode) {
      asset.bytes = shipped.length;
      asset.sha256 = hash(shipped);
    } else if (shipped.length !== asset.bytes || hash(shipped) !== asset.sha256) {
      errors.push(`File changed without a manifest update: ${asset.file}`);
    }
    if (hash(shipped) !== hash(original))
      errors.push(`Source differs from shipped asset: ${asset.file}`);
  } catch (error) {
    errors.push(`${asset.file}: ${error.message}`);
  }
}

for (const file of await filesUnder(path.join(publicRoot, 'assets'))) {
  const relative = path.relative(publicRoot, file).replaceAll(path.sep, '/');
  if (!names.has(relative)) errors.push(`Unregistered file in public/assets: ${relative}`);
}

const sourceFiles = [
  path.join(root, 'index.html'),
  ...(await filesUnder(path.join(root, 'src'))),
  path.join(root, 'resources/references/ui-review/build-glass.mjs'),
];
const references = new Set();
for (const file of sourceFiles) {
  if (file.endsWith(path.sep + 'assets.ts')) continue;
  const text = await fs.readFile(file, 'utf8');
  for (const match of text.matchAll(
    /assets\/[a-zA-Z0-9_./-]+\.(?:png|svg|webp|woff2|ttf|ogg|mp3)/g,
  )) {
    references.add(match[0]);
    if (!names.has(match[0]))
      errors.push(`Reference missing from manifest: ${match[0]} (${path.relative(root, file)})`);
  }
}
for (const asset of manifest) {
  // Audio is selected by its short name in the click handler; visuals and fonts use explicit URLs.
  if (!asset.file.startsWith('assets/audio/') && !references.has(asset.file)) {
    errors.push(`Asset is loaded but never referenced by the interface: ${asset.file}`);
  }
}

const generated = await prettier.format(
  '// Generated from resources/manifest.json. Run npm run assets:sync after editing the manifest.\n' +
    'export const assets = ' +
    JSON.stringify(manifest.filter((asset) => asset.preload !== false).map((asset) => asset.file)) +
    ' as const;\n',
  { ...(await prettier.resolveConfig(path.join(root, 'src/assets.ts'))), parser: 'typescript' },
);
const target = path.join(root, 'src/assets.ts');
if (writeMode && !errors.length) {
  await fs.writeFile(target, generated);
  await fs.writeFile(
    path.join(root, 'resources/manifest.json'),
    await prettier.format(JSON.stringify(manifest), { parser: 'json' }),
  );
} else if ((await fs.readFile(target, 'utf8')) !== generated)
  errors.push('Loader list is stale. Run npm run assets:sync.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `${manifest.length} assets checked: references, originals, hashes and licenses agree.`,
  );
}
