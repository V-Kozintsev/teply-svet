import fs from 'node:fs/promises';
import path from 'node:path';

// Build into a separate directory first. Keep existing hashed assets for open phone tabs.
const root = process.cwd();
if (!process.argv[2]) throw new Error('Provide the validated build directory.');
const source = path.resolve(root, process.argv[2]);
const target = path.resolve(root, process.argv[3] ?? 'dist');
if (
  !source.startsWith(root + path.sep) ||
  !target.startsWith(root + path.sep) ||
  source === target ||
  source.startsWith(target + path.sep) ||
  target.startsWith(source + path.sep)
) {
  throw new Error('The build and target must be separate directories inside this workspace.');
}
await fs.access(path.join(source, 'index.html'));
await fs.access(path.join(source, 'assets'));

async function collect(directory, relative = '') {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const name = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(path.join(directory, entry.name), name)));
    else if (entry.isFile()) files.push(name);
    else throw new Error('Preview builds may contain only regular files and directories.');
  }
  return files;
}

const files = await collect(source);
const priority = (file) => (file === 'index.html' ? 2 : file.endsWith('.html') ? 1 : 0);
files.sort((a, b) => priority(a) - priority(b) || a.localeCompare(b));
let updated = 0;
for (const file of files) {
  const bytes = await fs.readFile(path.join(source, file));
  const destination = path.join(target, file);
  const old = await fs.readFile(destination).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (old?.equals(bytes)) continue;
  await fs.mkdir(path.dirname(destination), { recursive: true });
  const temporary = path.join(
    path.dirname(destination),
    `.${path.basename(file)}.pending-${process.pid}`,
  );
  await fs.writeFile(temporary, bytes);
  // A request sees either the complete previous file or the complete new one.
  try {
    for (let attempt = 0; ; attempt++) {
      try {
        await fs.rename(temporary, destination);
        break;
      } catch (error) {
        // Windows can briefly hold the old file open while serving a phone request.
        if (!['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt >= 49) throw error;
        await new Promise((resolve) => setTimeout(resolve, Math.min(100, 20 + attempt * 3)));
      }
    }
  } finally {
    await fs.unlink(temporary).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
  updated++;
}
console.log(`Local preview updated: ${updated} files; older hashed assets retained.`);
