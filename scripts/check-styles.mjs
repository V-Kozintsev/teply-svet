import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';

const root = path.resolve(import.meta.dirname, '..');
const errors = [];
const seen = new Set();
const loaded = new Set();

async function inspect(file) {
  if (loaded.has(file)) {
    errors.push(`Stylesheet imported twice: ${file}`);
    return;
  }
  loaded.add(file);
  const css = postcss.parse(await fs.readFile(file, 'utf8'), { from: file });
  for (const node of css.nodes) {
    if (node.type === 'atrule' && node.name === 'import') {
      const match = node.params.match(/^['"](.+)['"]$/);
      if (!match) errors.push(`Use a local stylesheet import: ${node.params}`);
      else await inspect(path.resolve(path.dirname(file), match[1]));
    }
  }
  css.walkRules((rule) => {
    const context = [];
    for (let parent = rule.parent; parent && parent.type !== 'root'; parent = parent.parent) {
      if (parent.type === 'atrule') context.unshift(`@${parent.name} ${parent.params}`);
    }
    const key = [...context, rule.selector.replace(/\s+/g, ' ').trim()].join(' | ');
    if (seen.has(key)) errors.push(`Duplicate selector in the same context: ${key}`);
    seen.add(key);
  });
}

await inspect(path.join(root, 'src/styles/loading.css'));
await inspect(path.join(root, 'src/styles/index.css'));
const stylesRoot = path.join(root, 'src/styles');
for (const relative of await fs.readdir(stylesRoot, { recursive: true })) {
  if (relative.endsWith('.css') && !loaded.has(path.resolve(stylesRoot, relative))) {
    errors.push(`Stylesheet exists but is not imported: ${relative}`);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `${loaded.size} stylesheets checked: all files are imported and selectors are not duplicated.`,
  );
