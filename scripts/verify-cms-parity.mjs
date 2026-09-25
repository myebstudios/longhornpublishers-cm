/** Compare reviewed fallback copy with database-backed on-demand pages. */
import { execFileSync, spawn } from 'node:child_process';
import { getDatabase } from '@netlify/database';
import {
  assertCmsHomepageEvidence, backfilledHeroMismatches, normalizePublicRoute,
} from './cms-parity-lib.mjs';
import { url } from './local-db.mjs';

const routes = [
  '/404.html',
  '/en/', '/en/about/', '/en/services/', '/en/catalogue/', '/en/why-choose-us/',
  '/en/contact/', '/en/news/', '/en/privacy-policy/', '/en/terms-of-use/',
  '/fr/', '/fr/a-propos/', '/fr/services-edition/', '/fr/catalogue/',
  '/fr/pourquoi-nous-choisir/', '/fr/contact/', '/fr/actualites/',
  '/fr/politique-de-confidentialite/', '/fr/conditions-utilisation/',
];

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
      throw new Error('Backfilled slide 1 no longer matches the legacy hero:\n' +
        mismatches.map(({ field, expected, actual }) =>
          `    ${field}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`).join('\n'));
    }
    return String(slide.id);
  } catch (error) {
    console.error('FAILED — could not prove database-backed homepage parity.');
    console.error(error instanceof Error ? error.message : String(error));
    console.error('Run: npm run db:start && npm run db:migrate');
    process.exit(2);
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const astroBin = new URL('../node_modules/astro/bin/astro.mjs', import.meta.url).pathname;
let startedServer = false;
async function startServer(port, env) {
  const child = spawn(process.execPath, [astroBin, 'dev', '--host', '127.0.0.1', '--port', String(port)], {
    env: { ...process.env, CONTEXT: 'dev', ...env }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    try { const response = await fetch(base + '/en/'); if (response.status === 200) { startedServer = true; return base; } } catch {}
    if (child.exitCode && child.exitCode !== 0) break;
    await delay(300);
  }
  throw new Error(`Could not start parity server on ${port}: ${output.slice(-1500)}`);
}
function stopServer() {
  if (!startedServer) return;
  execFileSync(process.execPath, [astroBin, 'dev', 'stop'], { stdio: 'ignore' });
  startedServer = false;
}
async function snapshot(base) {
  const results = new Map();
  for (const route of routes) {
    const response = await fetch(base + route);
    if (response.status !== 200 && !(route === '/404.html' && response.status === 404)) {
      throw new Error(`${base}${route} returned ${response.status}`);
    }
    results.set(route, await response.text());
  }
  return results;
}

console.log('CMS parity check — comparing on-demand pages against approved fallback copy');
const slideId = await loadCmsEvidence();
try {
  const cmsBase = await startServer(4361, { CMS_DATABASE_URL: url, CMS_PARITY_FALLBACK: '' });
  const cms = await snapshot(cmsBase);
  stopServer();
  const fallbackBase = await startServer(4362, { CMS_DATABASE_URL: '', CMS_PARITY_FALLBACK: '1' });
  const fallback = await snapshot(fallbackBase);
  for (const route of ['/en/', '/fr/']) {
    assertCmsHomepageEvidence(route, cms.get(route) ?? '', slideId);
  }
  const differing = routes.filter((route) => {
    const key = route === '/404.html' ? '404.html' : route.slice(1) + 'index.html';
    return normalizePublicRoute(key, cms.get(route) ?? '') !==
      normalizePublicRoute(key, fallback.get(route) ?? '');
  });
  console.log(`Compared ${routes.length} public routes.`);
  if (differing.length) throw new Error(`Approved copy differs outside the homepage hero:\n${differing.join('\n')}`);
  console.log('PASS — database rows rendered, slide 1 matches the legacy hero, and approved copy is unchanged.');
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  stopServer();
}
