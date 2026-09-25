/** Integration coverage for on-demand route validation and the real 404 page. */
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { getDatabase } from '@netlify/database';
import { url } from './local-db.mjs';

const astroBin = new URL('../node_modules/astro/bin/astro.mjs', import.meta.url).pathname;
const base = 'http://127.0.0.1:4364';
const run = (bin, args, options = {}) => execFileSync(bin, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startServer() {
  const status = run(process.execPath, [astroBin, 'dev', 'status']);
  if (!status.includes('No dev server is running')) {
    throw new Error('Stop the existing Astro dev server before running the on-demand routing integration test.');
  }
  const child = spawn(process.execPath, [astroBin, 'dev', '--host', '127.0.0.1', '--port', '4364'], {
    env: { ...process.env, CMS_DATABASE_URL: url, CONTEXT: 'dev', NETLIFY_LOCAL: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  for (let i = 0; i < 100; i++) {
    try {
      const response = await fetch(base + '/en/about/');
      if (response.status === 200) return;
    } catch {}
    if (child.exitCode && child.exitCode !== 0) break;
    await delay(300);
  }
  throw new Error(`Could not start Astro dev server: ${output.slice(-1500)}`);
}

async function assertSite404(route) {
  const response = await fetch(base + route);
  const body = await response.text();
  assert.equal(response.status, 404, route);
  assert.match(body, /This page could not be found/, route);
  assert.match(body, /Cette page est introuvable/, route);
  assert.match(body, /Page not found — Page introuvable/, route);
  assert.equal(response.headers.get('cache-control'), 'no-store', route);
  assert.equal(response.headers.get('netlify-cdn-cache-control'), null, route);
  assert.equal(response.headers.get('netlify-cache-tag'), null, route);
}

test('invalid and unpublished on-demand routes show the uncached bilingual 404', async (t) => {
  const wasRunning = run(process.execPath, ['scripts/local-db.mjs', 'status']).includes('Running on port');
  if (!wasRunning) run(process.execPath, ['scripts/local-db.mjs', 'start']);
  run(process.execPath, ['scripts/local-db.mjs', 'migrate']);
  const db = getDatabase({ connectionString: url });
  let serverStarted = false;
  let insertedId;
  try {
    await startServer();
    serverStarted = true;
    const slug = `odr-unpublished-${randomUUID()}`;
    const productCode = `ODR-${randomUUID()}`;
    const [draft] = await db.sql`
      INSERT INTO catalogue_titles (product_code, slug, level, title_en, title_fr,
        description_en, description_fr, published)
      VALUES (${productCode}, ${slug}, 'primary', 'Hidden test title', 'Titre masqué',
        'Not published', 'Non publié', false)
      RETURNING id
    `;
    insertedId = draft.id;
    const [proof] = await db.sql`SELECT published FROM catalogue_titles WHERE id = ${insertedId}`;
    assert.equal(proof.published, false);

    for (const route of [
      '/fr/about/', '/en/a-propos/', '/fr/unknown-slug/',
      '/en/catalogue/does-not-exist/', `/en/catalogue/${slug}/`, `/fr/catalogue/${slug}/`,
    ]) {
      await t.test(route, () => assertSite404(route));
    }
  } finally {
    if (insertedId) await db.sql`DELETE FROM catalogue_titles WHERE id = ${insertedId}`;
    if (serverStarted) run(process.execPath, [astroBin, 'dev', 'stop']);
    if (!wasRunning) run(process.execPath, ['scripts/local-db.mjs', 'stop']);
  }
});
