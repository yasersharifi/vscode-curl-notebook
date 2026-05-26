#!/usr/bin/env node
/**
 * Builds PNG icons for vsce (marketplace) and the activity bar (24×24).
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function commandExists(cmd) {
  return spawnSync('which', [cmd], { encoding: 'utf8' }).status === 0;
}

function svgToPng(svgPath, pngPath, size) {
  if (!existsSync(svgPath)) {
    console.error(`[icon] missing ${svgPath}`);
    return false;
  }

  const attempts = [
    ['rsvg-convert', ['-w', String(size), '-h', String(size), svgPath, '-o', pngPath]],
    ['convert', [svgPath, '-resize', `${size}x${size}`, pngPath]],
    ['magick', ['convert', svgPath, '-resize', `${size}x${size}`, pngPath]],
    ['ffmpeg', ['-y', '-i', svgPath, '-vf', `scale=${size}:${size}`, pngPath]],
  ];

  for (const [cmd, args] of attempts) {
    if (!commandExists(cmd)) {
      continue;
    }
    const result = spawnSync(cmd, args, { stdio: 'inherit' });
    if (result.status === 0 && existsSync(pngPath)) {
      console.log(`[icon] ${pngPath} (${size}px) via ${cmd}`);
      return true;
    }
  }

  return false;
}

const jobs = [
  { svg: 'media/icon.svg', png: 'media/icon.png', size: 128 },
  { svg: 'media/activitybar-light.svg', png: 'media/activitybar-light.png', size: 24 },
  { svg: 'media/activitybar-dark.svg', png: 'media/activitybar-dark.png', size: 24 },
];

let failed = false;
for (const { svg, png, size } of jobs) {
  if (!svgToPng(join(root, svg), join(root, png), size)) {
    console.error(`[icon] failed: ${png}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
