/**
 * Optimise the HERO-7 launch images into upload masters under Assets/hero-launch.
 *
 * The admin media upload accepts JPEG/PNG/WebP up to 8 MB, and production
 * serves every slide image through Netlify Image CDN (`responsive()` in
 * src/lib/images.ts), which negotiates AVIF or WebP from the browser's Accept
 * header and falls back to the JPEG. The master is therefore a progressive
 * mozjpeg, capped at 1920 px (the widest srcset candidate) and never upscaled.
 * AVIF/WebP sizes are measured and recorded only as evidence of the CDN output.
 *
 *   node scripts/prepare-hero-launch-images.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { LAUNCH_SLIDES } from './hero-launch-set.mjs';

const MAX_WIDTH = 1920;
// Pack D / client_approval_packet.md minimum for every hero photograph.
const MIN_HERO = { width: 1920, height: 1080 };
const outDir = path.resolve('Assets/hero-launch');
await fs.mkdir(outDir, { recursive: true });

const manifest = [];
for (const [index, slide] of LAUNCH_SLIDES.entries()) {
  const source = path.resolve('public/img', slide.image);
  const input = sharp(source).rotate();
  const { width, height } = await input.metadata();
  const resized = input.clone().resize({ width: Math.min(width, MAX_WIDTH), withoutEnlargement: true });

  const jpeg = await resized.clone().jpeg({ quality: 80, progressive: true, mozjpeg: true }).toBuffer();
  const webp = await resized.clone().webp({ quality: 75 }).toBuffer();
  const avif = await resized.clone().avif({ quality: 50 }).toBuffer();
  const out = await sharp(jpeg).metadata();
  await fs.writeFile(path.join(outDir, slide.upload), jpeg);

  const sourceBytes = (await fs.stat(source)).size;
  manifest.push({
    slide: index + 1,
    source: `public/img/${slide.image}`,
    upload: `Assets/hero-launch/${slide.upload}`,
    width: out.width,
    height: out.height,
    bytes: { source: sourceBytes, jpeg: jpeg.length, webp: webp.length, avif: avif.length },
    warning: width < MIN_HERO.width || height < MIN_HERO.height
      ? `Source is ${width}x${height}; Pack D requires >= ${MIN_HERO.width}x${MIN_HERO.height}. Replace, or record client acceptance.`
      : null,
  });
}

await fs.writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.table(manifest.map(({ slide, width, height, bytes, warning }) => ({
  slide, size: `${width}x${height}`, sourceKB: Math.round(bytes.source / 1024), jpegKB: Math.round(bytes.jpeg / 1024),
  webpKB: Math.round(bytes.webp / 1024), avifKB: Math.round(bytes.avif / 1024), warning: warning ? 'BELOW 1920x1080' : '',
})));
