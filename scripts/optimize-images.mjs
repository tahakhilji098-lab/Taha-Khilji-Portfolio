/*
  Optimizes large raster images into AVIF + WebP responsive variants.

  Output layout:  src/assets/optimized/<original-basename>-<width>.(avif|webp)

  Original files are never touched. Variants are never upscaled beyond the
  source dimensions. The runtime manifest in src/assets/optimized/images.ts
  discovers these files via import.meta.glob.
*/

import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'src', 'assets', 'optimized');

const WIDTHS = [480, 768, 1200, 1600];

/* Mockup images contain typography, UI screenshots and fine branding detail —
   they get a higher quality budget. Photos get a normal budget. */
const HIGH_DETAIL = [
  'taha-card-',
  'work-',
  'service-',
  'brand_mockup_',
  'packaging_mockup_',
];

const SOURCES = [
  ...[
    'public/images/work/work-01-aureli-brand-identity.png',
    'public/images/work/work-02-noma-social-campaign.png',
    'public/images/work/work-03-vertex-packaging.png',
    'public/images/work/work-04-mono-editorial.png',
    'public/images/work/work-05-northline-website.png',
    'public/images/work/work-06-clarity-advertising.png',
    'public/images/taha-card-01-brand-identity.png',
    'public/images/taha-card-02-packaging.png',
    'public/images/taha-card-03-editorial.png',
    'public/images/services/service-01-brand-identity-hover.png',
    'public/images/services/service-02-social-media-hover.png',
    'public/images/services/service-03-advertising-hover.png',
    'public/images/services/service-04-packaging-hover.png',
    'public/images/services/service-05-website-ui-hover.png',
    'public/images/services/service-06-print-marketing-hover.png',
    'src/assets/images/brand_mockup_1785252185476.jpg',
    'src/assets/images/packaging_mockup_1785252204708.jpg',
  ].map((file) => ({ file, highDetail: true })),
  ...[
    ['public/images/taha-hero-background.png', false],
    ['src/assets/images/taha.png', false],
  ].map(([file, highDetail]) => ({ file, highDetail })),
];

const isHighDetail = (file) =>
  HIGH_DETAIL.some((prefix) => path.basename(file).startsWith(prefix));

const qualityFor = (file) =>
  isHighDetail(file)
    ? { avif: 72, webp: 90 }
    : { avif: 68, webp: 86 };

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // Optional --clean: remove previous generated variants only (never sources).
  if (process.argv.includes('--clean')) {
    const { unlink } = await import('node:fs/promises');
    for (const entry of await readdir(OUT_DIR)) {
      if (/\.(avif|webp)$/.test(entry)) {
        await unlink(path.join(OUT_DIR, entry));
      }
    }
    console.log(`Cleaned ${OUT_DIR}`);
  }

  let written = 0;
  let inputBytes = 0;
  let outputBytes = 0;

  for (const { file, highDetail } of SOURCES) {
    const input = path.join(ROOT, file);
    const { width: sourceWidth, height: sourceHeight } = await sharp(input).metadata();
    if (!sourceWidth || !sourceHeight) {
      console.warn(`SKIP (no dimensions): ${file}`);
      continue;
    }

    // Never upscale: keep widths < source width, always include the source width.
    const widths = WIDTHS.filter((w) => w < sourceWidth);
    if (widths[widths.length - 1] !== sourceWidth) widths.push(sourceWidth);

    const stem = path.basename(file, path.extname(file));
    const q = highDetail ? { avif: 72, webp: 90 } : qualityFor(file);
    const inputStat = await stat(input);
    inputBytes += inputStat.size;

    for (const width of widths) {
      const pipeline = sharp(input).resize({ width, withoutEnlargement: true });
      await pipeline
        .clone()
        .avif({ quality: q.avif, effort: 5 })
        .toFile(path.join(OUT_DIR, `${stem}-${width}.avif`));
      await pipeline
        .clone()
        .webp({ quality: q.webp, effort: 4 })
        .toFile(path.join(OUT_DIR, `${stem}-${width}.webp`));
      written += 2;
    }

    const files = (await readdir(OUT_DIR)).filter(
      (f) => f.startsWith(`${stem}-`) && /\.(avif|webp)$/.test(f),
    );
    for (const f of files) {
      outputBytes += (await stat(path.join(OUT_DIR, f))).size;
    }
  }

  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);
  console.log(`\nSources: ${SOURCES.length}`);
  console.log(`Variants written: ${written}`);
  console.log(`Total source bytes: ${mb(inputBytes)} MB`);
  console.log(`Total variant bytes: ${mb(outputBytes)} MB (${Math.max(0, Math.round((1 - outputBytes / inputBytes) * 100))}% smaller when serving variants)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});