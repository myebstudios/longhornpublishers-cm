/**
 * Image source audit — Docs/ui_ux_audit.md §10.
 *
 * Every photograph in `public/img/` is drawn into a known layout slot, and each
 * slot has a widest rendered CSS width. A source is "to spec" when it carries
 * enough real pixels to stay crisp at that width on a 2x display; anything less
 * is upscaled by the Image CDN and reads soft. Anything far above the slot's
 * need is dead weight the CDN has to downscale on every cold request.
 *
 * Run with `npm run audit:images`. Exits non-zero when a source is off spec, so
 * it can gate a build.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const IMG_DIR = 'public/img';

/**
 * Widest CSS pixel width each slot is drawn at, taken from global.css and the
 * `sizes` attributes the components emit. `dpr` is the display density the slot
 * has to stay crisp at — heroes and splits are large enough that a soft source
 * is obvious, so they are held to 2x.
 */
const SLOTS = {
  hero:    { label: 'Full-bleed hero (100vw)',       cssWidth: 1920, dpr: 1 },
  split:   { label: 'Split panel (562px column)',    cssWidth: 562,  dpr: 2 },
  card:    { label: 'Carousel card (390px max)',     cssWidth: 390,  dpr: 2 },
  map:     { label: 'Contact map band (1240px)',     cssWidth: 1240, dpr: 2 },
  og:      { label: 'Open Graph share card',         cssWidth: 1200, dpr: 1 },
};

/** Where each source is drawn. Mirrors the component and data-file references. */
const USAGE = {
  // Hero.astro, sizes="100vw"
  'lh-hero.jpg':                    'hero',
  'lh-editorial-team-wide.jpg':     'hero',
  'lh-reading-nook.jpg':            'hero',
  'lh-reading-discussion.jpg':      'hero',
  'lh-maths-classroom.jpg':         'hero',
  'lh-book-delivery.jpg':           'hero',
  'lh-library-reading.jpg':         'hero',
  // Split.astro, sizes="(min-width: 861px) 562px, calc(100vw - 2.5rem)"
  'lh-client-consultation.jpg':     'split',
  'lh-distribution.jpg':            'split',
  'lh-editorial-collaboration.jpg': 'split',
  'lh-catalogue-shelves.jpg':       'split',
  'lh-final-inspection.jpg':        'split',
  'lh-textbook-library.jpg':        'split',
  'lh-student-reading.jpg':         'split',
  'lh-print-quality.jpg':           'split',
  'lh-bilingual-editor-wide.jpg':   'split',
  'lh-creative-wall.jpg':           'split',
  'lh-illustration-studio.jpg':     'split',
  'lh-print-inspection-wide.jpg':   'split',
  // index.astro service carousel
  'lh-production-planning.jpg':     'card',
  'lh-proofreading.jpg':            'card',
  'lh-bilingual-review.jpg':        'card',
  'lh-book-design.jpg':             'card',
  'lh-science-workbook.jpg':        'card',
  'lh-print-workshop.jpg':          'card',
  // Contact.astro map band
  'lh-contact-map.jpg':             'map',
  // Layout.astro og:image
  'lh-share-card.jpg':              'og',
  // Retired sources kept for reference, drawn nowhere.
  'lh-editorial.jpg':               null,
  'lh-production.jpg':              null,
  'lh-offset-press.jpg':            null,
  'lh-office-exterior.jpg':         null,
  'lh-print-workshop-alt.jpg':      null,
  'lh-translation-desk.jpg':        null,
  'longhorn-logo.png':              null,
};

/** Above this multiple of the required width, a source is carrying dead pixels. */
const OVERSIZE_FACTOR = 1.3;

function dimensions(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], {
    encoding: 'utf8',
  });
  const w = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const h = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1]);
  return { w, h };
}

const files = fs.readdirSync(IMG_DIR).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
const rows = [];

for (const file of files) {
  const full = path.join(IMG_DIR, file);
  const { w, h } = dimensions(full);
  const kb = Math.round(fs.statSync(full).size / 1024);
  const slotKey = USAGE[file];

  if (slotKey === null) {
    rows.push({ file, w, h, kb, slot: 'unused', required: 0, status: 'UNUSED' });
    continue;
  }
  if (slotKey === undefined) {
    rows.push({ file, w, h, kb, slot: 'unknown', required: 0, status: 'UNMAPPED' });
    continue;
  }

  const slot = SLOTS[slotKey];
  const required = slot.cssWidth * slot.dpr;
  let status = 'OK';
  if (w < required) status = 'UNDERSIZED';
  else if (w > required * OVERSIZE_FACTOR) status = 'OVERSIZED';

  rows.push({ file, w, h, kb, slot: slotKey, required, status });
}

const order = { UNDERSIZED: 0, OVERSIZED: 1, UNMAPPED: 2, OK: 3, UNUSED: 4 };
rows.sort((a, b) => order[a.status] - order[b.status] || a.file.localeCompare(b.file));

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('SOURCE', 34) + pad('ACTUAL', 12) + pad('SLOT', 9) + pad('NEEDS', 8) + pad('SIZE', 8) + 'STATUS');
console.log('-'.repeat(82));
for (const r of rows) {
  console.log(
    pad(r.file, 34) + pad(`${r.w}x${r.h}`, 12) + pad(r.slot, 9) +
    pad(r.required ? `${r.required}w` : '—', 8) + pad(`${r.kb}KB`, 8) + r.status,
  );
}

const counts = rows.reduce((acc, r) => ((acc[r.status] = (acc[r.status] ?? 0) + 1), acc), {});
console.log('-'.repeat(82));
console.log(Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join('   '));

const failing = rows.filter((r) => r.status === 'UNDERSIZED' || r.status === 'OVERSIZED' || r.status === 'UNMAPPED');
process.exit(failing.length ? 1 : 0);
