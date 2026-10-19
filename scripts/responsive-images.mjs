import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const images = JSON.parse(readFileSync(new URL('../assets/responsive/manifest.json', import.meta.url), 'utf8'));
for (const [src, image] of Object.entries(images)) {
  const original = readFileSync(new URL(`..${src}`, import.meta.url));
  if (createHash('sha256').update(original).digest('hex') !== image.originalHash) {
    throw new Error(`Responsive images need updating for ${src}. Run npm run images:optimize.`);
  }
}
const pageSize = '(max-width: 700px) calc(100vw - 48px), (max-width: 1280px) calc(100vw - 112px), 1192px';

export const responsiveImages = html => html.replace(/<img\b[^>]*>/g, tag => {
  if (/\bid="dialog-image"/.test(tag)) return tag;
  const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
  const image = images[src];
  if (!image || /\bsrcset=/.test(tag)) return tag;
  const srcset = image.variants.map(variant => `${variant.src} ${variant.width}w`).join(', ');
  let sizes = /loading="lazy"/.test(tag) ? `auto, ${pageSize}` : pageSize;
  if (src === '/assets/visuals/planning-v5.jpg') sizes = '(max-width: 700px) calc(100vw - 48px), (max-width: 900px) 400px, 560px';
  if (src === '/assets/founder-minseok.jpg') sizes = '(max-width: 700px) calc((100vw - 48px) * 1.7), 612px';
  return tag.replace(/\s*\/?>(?=$)/, ` srcset="${srcset}" sizes="${sizes}">`);
});
