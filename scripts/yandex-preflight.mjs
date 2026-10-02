// Local, read-only source checks. This does not build, publish or contact Yandex.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const checks = [
  ['types', ['node_modules/typescript/bin/tsc', '--noEmit']],
  ['assets', ['scripts/assets.mjs']],
  ['generated-levels', ['resources/references/ui-review/build-glass.mjs', '--check']],
  [
    'public-inventory',
    [
      '--input-type=module',
      '-e',
      "import { checkPublic } from './scripts/check-production.mjs'; checkPublic();",
    ],
  ],
];
const results = checks.map(([name, args]) => {
  const run = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 4 * 1024 * 1024,
  });
  return {
    name,
    passed: run.status === 0 && !run.error,
    exitCode: run.status,
    output: `${run.stdout ?? ''}${run.stderr ?? ''}${run.error?.message ?? ''}`.trim(),
  };
});
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    'Local source consistency only; not SDK, moderation, license clearance or device acceptance.',
  passed: results.every((result) => result.passed),
  results,
};
const directory = path.join(root, 'outputs/yandex-preflight');
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, 'latest.json'), JSON.stringify(report, null, 2) + '\n');
for (const result of results) console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.name}`);
console.log('Report: outputs/yandex-preflight/latest.json');
process.exitCode = report.passed ? 0 : 1;
