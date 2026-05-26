#!/usr/bin/env node
/** Lists icon files inside the packaged VSIX matching package.json version. */
import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = new URL('..', import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const expected = `${pkg.name}-${pkg.version}.vsix`;
const expectedPath = join(root, expected);

let vsixPath = expectedPath;
if (!existsSync(vsixPath)) {
  const all = readdirSync(root)
    .filter((f) => f.endsWith('.vsix'))
    .map((f) => ({ f, mtime: statSync(join(root, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (all.length === 0) {
    console.error('No .vsix found. Run: npm run package');
    process.exit(1);
  }
  vsixPath = join(root, all[0].f);
  console.warn(`[verify] Expected ${expected} — using newest: ${all[0].f}`);
}

const out = execSync(`unzip -l "${vsixPath}"`, { encoding: 'utf8' });
const icons = out.split('\n').filter((line) => line.includes('extension/media/'));
const required = [
  'activitybar-light.png',
  'activitybar-dark.png',
  'icon.png',
];
const missing = required.filter((name) => !icons.some((line) => line.includes(name)));

console.log(`[verify] ${vsixPath}\n${icons.join('\n') || '(no media files!)'}`);
if (missing.length > 0) {
  console.error(`[verify] MISSING: ${missing.join(', ')}`);
  process.exit(1);
}
console.log('[verify] OK — activity bar + marketplace icons present');
