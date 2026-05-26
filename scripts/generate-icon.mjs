#!/usr/bin/env node
/**
 * Builds media/icon.png (128×128) from media/icon.svg for vsce packaging.
 * vsce requires PNG for package.json "icon"; activity bar may use SVG.
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = join(root, 'media/icon.svg');
const png = join(root, 'media/icon.png');

function commandExists(cmd) {
  return spawnSync('which', [cmd], { encoding: 'utf8' }).status === 0;
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  return result.status === 0 && existsSync(png);
}

if (existsSync(png)) {
  console.log(`[icon] ${png} already exists`);
  process.exit(0);
}

const attempts = [
  ['rsvg-convert', ['-w', '128', '-h', '128', svg, '-o', png]],
  ['convert', [svg, '-resize', '128x128', png]],
  ['magick', ['convert', svg, '-resize', '128x128', png]],
  ['ffmpeg', ['-y', '-i', svg, '-vf', 'scale=128:128', png]],
];

for (const [cmd, args] of attempts) {
  if (!commandExists(cmd)) {
    continue;
  }
  if (run(cmd, args)) {
    console.log(`[icon] wrote ${png} via ${cmd}`);
    process.exit(0);
  }
}

console.error(
  '[icon] Could not create icon.png. Install one of: librsvg2-bin, imagemagick, ffmpeg\n' +
    '  Or commit media/icon.png and re-run npm run package'
);
process.exit(1);
