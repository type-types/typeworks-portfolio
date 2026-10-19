import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { portfolioCases } from '../content/portfolio-cases.mjs';

const root = new URL('../', import.meta.url);
const sources = new Set([
  '/assets/visuals/planning-v5.jpg', '/assets/visuals/nfc-visit-v5.jpg', '/assets/founder-minseok.jpg',
  ...portfolioCases.flatMap(item => [item.visual, ...(item.screens || []).map(screen => screen.src),
    ...(item.screenGroups || []).flatMap(group => group.screens.map(screen => screen.src))]).filter(Boolean),
]);
const manifest = {};
await rm(new URL('assets/responsive/', root), { recursive: true, force: true });
await mkdir(new URL('assets/responsive/', root), { recursive: true });
for (const src of [...sources].sort()) {
  const input = await readFile(new URL(src.slice(1), root));
  const { width, height } = await sharp(input).metadata();
  const widths = [...new Set([480, 768, 1024, 1080, 1280, width].filter(value => value <= width))].sort((a, b) => a - b);
  const variants = [];
  for (const size of widths) {
    const output = await sharp(input).resize({ width: size, withoutEnlargement: true })
      .webp(src.endsWith('.png') || src.startsWith('/assets/portfolio/')
        ? { lossless: true, effort: 6 } : { quality: 95, effort: 6 }).toBuffer();
    if (output.length >= input.length) {
      if (size === width) variants.push({ src, width, bytes: input.length });
      continue;
    }
    const hash = createHash('sha256').update(output).digest('hex').slice(0, 12);
    const path = `/assets/responsive/${src.split('/').pop().replace(/\.[^.]+$/, '')}-${size}-${hash}.webp`;
    await writeFile(new URL(path.slice(1), root), output);
    variants.push({ src: path, width: size, bytes: output.length });
  }
  const selected = [];
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    if (variants.slice(i + 1).some(next => next.bytes <= variant.bytes)) {
      await rm(new URL(variant.src.slice(1), root));
    } else selected.push(variant);
  }
  manifest[src] = { width, height, originalBytes: input.length,
    originalHash: createHash('sha256').update(input).digest('hex'), variants: selected };
}
await writeFile(new URL('assets/responsive/manifest.json', root), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Prepared responsive images for ${sources.size} originals`);
