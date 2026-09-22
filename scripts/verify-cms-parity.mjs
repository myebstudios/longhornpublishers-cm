/**
 * Does the CMS-backed site still render the approved copy?
 *
 * This guard exists because homepage_content.trust_stats once held stale copy
 * while fallback builds looked correct. It now enforces two invariants:
 *
 * 1. Every non-home public route, plus everything below the homepage hero,
 *    remains byte-identical between a CMS build and the reviewed fallback.
 * 2. Migration 010's slide 1 matches every legacy hero field and both reviewed
 *    CTA defaults. Carousel markup intentionally differs from Hero.astro, so
 *    comparing the two hero regions as HTML would reject the correct feature.
 *
 * The CMS build must also prove structurally that homepage_content and slide 1
 * rows were rendered. Build log wording is not evidence of a database read.
 *
 * Usage:
 *   npm run db:start && npm run db:migrate
 *   npm run verify:cms-parity
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { getDatabase } from '@netlify/database';
import {
  assertCmsHomepageEvidence,
  backfilledHeroMismatches,
  normalizePublicRoute,
} from './cms-parity-lib.mjs';
import { url } from './local-db.mjs';

const run = (command, args, env) =>
  execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env } });

/** Every built public HTML route, relative-path keyed. Admin routes render no CMS content. */
function snapshot(dir, base = dir, into = new Map()) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (path.relative(base, full).split(path.sep)[0] === 'admin') continue;
      snapshot(full, base, into);
    } else if (entry.endsWith('.html')) {
      into.set(path.relative(base, full), readFileSync(full, 'utf8'));
    }
  }
  return into;
}

function build(label, env) {
  process.stdout.write(`  building ${label}… `);
  rmSync('dist', { recursive: true, force: true });
  try {
    run('npm', ['run', 'build'], env);
  } catch (error) {
    console.log('FAILED');
    if (error?.stderr) process.stderr.write(String(error.stderr));
    throw error;
  }
  const captured = snapshot('dist');
  console.log(`${captured.size} routes`);
  return captured;
}

async function loadCmsEvidence() {
  try {
    const db = getDatabase({ connectionString: url });
    const [homepage] = await db.sql`
      SELECT id, published, hero_image_id, hero_eyebrow_en, hero_eyebrow_fr,
        hero_headline_en, hero_headline_fr, hero_headline_accent_en, hero_headline_accent_fr,
        hero_subheadline_en, hero_subheadline_fr, hero_cta_label_en, hero_cta_label_fr
      FROM homepage_content WHERE id = 'default'
    `;
    if (!homepage || homepage.published !== true) throw new Error('The published default homepage_content row is missing.');
    const [slide] = await db.sql`
      SELECT * FROM homepage_hero_slides
      WHERE homepage_id = 'default' AND sort_order = 0
      ORDER BY created_at, id LIMIT 1
    `;
    if (!slide) throw new Error('The backfilled slide 1 row is missing.');
    const mismatches = backfilledHeroMismatches(homepage, slide);
    if (mismatches.length) {
      const detail = mismatches
        .map(({ field, expected, actual }) => `    ${field}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
        .join('\n');
      throw new Error(`Backfilled slide 1 no longer matches the legacy hero:\n${detail}`);
    }
    return { slideId: String(slide.id) };
  } catch (error) {
    console.error('  FAILED — could not prove database-backed homepage parity.');
    console.error(`  ${error instanceof Error ? error.message : String(error)}`);
    console.error('  Run: npm run db:start && npm run db:migrate');
    process.exit(2);
  }
}

console.log('CMS parity check — proving database reads and building twice against the same commit\n');
const evidence = await loadCmsEvidence();
const cms = build('with CMS   ', { CMS_DATABASE_URL: url });
const fallback = build('with i18n  ', { CMS_DATABASE_URL: '' });

for (const route of ['en/index.html', 'fr/index.html']) {
  try {
    assertCmsHomepageEvidence(route, cms.get(route) ?? '', evidence.slideId);
  } catch (error) {
    console.error(`\n  FAILED — ${error instanceof Error ? error.message : String(error)}`);
    console.error('  The CMS build did not prove that it rendered database rows; refusing a fallback-vs-fallback pass.');
    process.exit(2);
  }
}

const routes = [...new Set([...cms.keys(), ...fallback.keys()])].sort();
const differing = routes.filter((route) =>
  normalizePublicRoute(route, cms.get(route) ?? '') !== normalizePublicRoute(route, fallback.get(route) ?? ''),
);

console.log(`\n  compared ${routes.length} public routes`);
if (!differing.length) {
  console.log('  PASS — database rows were rendered, slide 1 matches the legacy hero,');
  console.log('  and all approved copy outside the hero is byte-for-byte identical.\n');
  process.exit(0);
}

console.error(`\n  FAIL — ${differing.length} route(s) differ outside the homepage hero:\n`);
for (const route of differing) console.error(`    ${route}`);
console.error(`
  Each difference is one of:
    - a CMS row holding copy that diverges from the approved dictionaries
      (fix with a migration updating the row, not by editing the dictionaries), or
    - a reader that renders CMS content differently from its fallback.

  To see the text, capture both and diff:
    CMS_DATABASE_URL="$(npm run -s db:url)" npm run build && node scripts/capture-public-html.mjs dist /tmp/cms
    npm run build && node scripts/capture-public-html.mjs dist /tmp/fallback
    diff -r /tmp/cms /tmp/fallback
`);
process.exit(1);
