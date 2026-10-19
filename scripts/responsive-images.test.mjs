import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { responsiveImages } from './responsive-images.mjs';
import { planningPhoto, serviceVisual } from '../content/visuals.mjs';
import { caseMedia } from './site-components.mjs';
import { portfolioCases } from '../content/portfolio-cases.mjs';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('assets/responsive/manifest.json', root), 'utf8'));

test('responsive candidates exist, keep dimensions, and reduce the original payload', async () => {
  for (const [src, image] of Object.entries(manifest)) {
    const original = await readFile(new URL(src.slice(1), root));
    let previousWidth = 0;
    for (const variant of image.variants) {
      assert.ok(variant.width > previousWidth && variant.width <= image.width, src);
      previousWidth = variant.width;
      const file = await readFile(new URL(variant.src.slice(1), root));
      const metadata = await sharp(file).metadata();
      assert.equal(metadata.width, variant.width, variant.src);
      assert.ok(Math.abs(metadata.height - image.height * variant.width / image.width) <= 1, variant.src);
      assert.ok(file.length <= original.length, variant.src);
    }
    assert.equal(previousWidth, image.width, `${src}: full resolution available`);
  }
});

test('full resolution screen captures and lecture materials retain every original pixel', async () => {
  for (const [src, image] of Object.entries(manifest).filter(([src]) => src.endsWith('.png') || src.startsWith('/assets/portfolio/'))) {
    const full = image.variants.at(-1);
    const original = await sharp(new URL(src.slice(1), root).pathname).ensureAlpha().raw().toBuffer();
    const optimized = await sharp(new URL(full.src.slice(1), root).pathname).ensureAlpha().raw().toBuffer();
    assert.deepEqual(optimized, original, src);
  }
});

test('photo variants keep high fidelity at the selected display resolution', async () => {
  for (const [src, image] of Object.entries(manifest).filter(([src]) => src.endsWith('.jpg'))) {
    for (const variant of image.variants.filter(variant => variant.src !== src)) {
      const original = await sharp(new URL(src.slice(1), root).pathname).resize({ width: variant.width }).removeAlpha().raw().toBuffer();
      const optimized = await sharp(new URL(variant.src.slice(1), root).pathname).removeAlpha().raw().toBuffer();
      assert.equal(optimized.length, original.length, variant.src);
      let squaredError = 0;
      for (let i = 0; i < original.length; i++) squaredError += (original[i] - optimized[i]) * (original[i] - optimized[i]);
      const psnr = 10 * Math.log10(255 * 255 / (squaredError / original.length));
      assert.ok(psnr >= 40, `${variant.src}: PSNR ${psnr.toFixed(2)} dB`);
    }
  }
});

test('priorities match the page context and enlarged images stay original', () => {
  assert.match(responsiveImages(planningPhoto()), /loading="eager" fetchpriority="high"/);
  assert.match(serviceVisual('software', true), /loading="eager" fetchpriority="high"/);
  assert.match(serviceVisual('software'), /loading="lazy"/);
  const item = portfolioCases.find(item => item.slug === 'aws-sbg');
  assert.match(responsiveImages(caseMedia(item, true)), /loading="eager" fetchpriority="high"/);
  assert.match(responsiveImages(caseMedia(item)), /sizes="auto,/);
  const gallery = '<img id="dialog-image" src="/assets/portfolio/aws-sbg-instagram-1.png" alt="확대 화면">';
  assert.equal(responsiveImages(gallery), gallery);
  const optimized = responsiveImages(planningPhoto());
  assert.equal(responsiveImages(optimized), optimized);
});
