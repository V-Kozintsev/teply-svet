import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const inventory = JSON.parse(
  fs.readFileSync(new URL('../resources/production-files.json', import.meta.url)),
);
const assets = JSON.parse(fs.readFileSync(new URL('../resources/manifest.json', import.meta.url)));
const publicFiles = [
  ...assets.map((asset) => asset.file),
  ...inventory.licenses,
  ...inventory.levels,
];

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink is not a release file: ${target}`);
    return entry.isDirectory() ? filesUnder(target) : [target];
  });
}

function checkInventory(directory, expected) {
  const actual = new Set(
    filesUnder(directory).map((file) => path.relative(directory, file).replaceAll(path.sep, '/')),
  );
  const allowed = new Set(expected);
  const extra = [...actual].filter((file) => !allowed.has(file));
  const missing = [...allowed].filter((file) => !actual.has(file));
  if (extra.length || missing.length) {
    throw new Error(
      `Release inventory mismatch in ${directory}\nUnexpected: ${extra.join(', ') || 'none'}\nMissing: ${missing.join(', ') || 'none'}`,
    );
  }
  return actual;
}

export function checkPublic() {
  checkInventory(path.join(root, 'public'), publicFiles);
}

export function checkProduction(directory, generatedFiles) {
  checkPublic();
  const absolute = path.resolve(directory);
  if (!generatedFiles) {
    generatedFiles = ['index.html'];
    const pending = ['index.html'];
    const seen = new Set(pending);
    while (pending.length) {
      const file = pending.shift();
      const text = fs.readFileSync(path.join(absolute, file), 'utf8');
      for (const match of text.matchAll(/["'`]([^"'`?#]+\.(?:js|css))["'`]/g)) {
        const raw = match[1];
        const referenced = raw.startsWith('/')
          ? raw.slice(1)
          : path.posix.normalize(path.posix.join(path.posix.dirname(file), raw));
        if (!referenced.startsWith('assets/')) continue;
        if (seen.has(referenced) || !fs.existsSync(path.join(absolute, referenced))) continue;
        seen.add(referenced);
        generatedFiles.push(referenced);
        if (referenced.endsWith('.js')) pending.push(referenced);
      }
    }
  }
  const actual = checkInventory(absolute, [...publicFiles, ...generatedFiles]);
  for (const file of publicFiles) {
    if (
      !fs
        .readFileSync(path.join(root, 'public', file))
        .equals(fs.readFileSync(path.join(absolute, file)))
    ) {
      throw new Error(`Release copy differs from public: ${file}`);
    }
  }
  const bytes = [...actual].reduce(
    (sum, file) => sum + fs.statSync(path.join(absolute, file)).size,
    0,
  );
  console.log(
    `Release checked: ${actual.size} files, ${(bytes / 1024 / 1024).toFixed(2)} MiB; only registered game files and licenses.`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkProduction(process.argv[2] ?? path.join(root, 'dist'));
}
