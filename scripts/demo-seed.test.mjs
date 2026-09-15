import test from 'node:test';
import assert from 'node:assert/strict';
import { assertLocalSeedEnvironment, assertLoopbackConnection, demoSeedSql } from './demo-seed-lib.mjs';
import { canRenderLocalDemoContent } from '../src/lib/demo-content.ts';

const allowed = {
  NETLIFY_LOCAL: 'true',
  CONTEXT: 'dev',
  ALLOW_LOCAL_DEMO_SEED: 'yes',
};

test('accepts only an explicitly opted-in local dev environment', () => {
  assert.doesNotThrow(() => assertLocalSeedEnvironment(allowed));
});

test('renders demo rows only in the local dev runtime', () => {
  assert.equal(canRenderLocalDemoContent({ NETLIFY_LOCAL: 'true', CONTEXT: 'dev' }), true);
  for (const env of [
    { NETLIFY_LOCAL: 'true', CONTEXT: 'production' },
    { NETLIFY_LOCAL: 'true', CONTEXT: 'deploy-preview' },
    { NETLIFY_LOCAL: 'true', CONTEXT: 'branch-deploy' },
    { NETLIFY_LOCAL: 'true', CONTEXT: 'dev', NETLIFY: 'true' },
    { NETLIFY_LOCAL: 'true', CONTEXT: 'dev', CI: 'true' },
    { NETLIFY_LOCAL: 'true', CONTEXT: 'dev', DEPLOY_ID: 'deploy-id' },
    { CONTEXT: 'dev' },
  ]) {
    assert.equal(canRenderLocalDemoContent(env), false);
  }
});

for (const [name, env] of [
  ['missing opt-in', { ...allowed, ALLOW_LOCAL_DEMO_SEED: undefined }],
  ['production', { ...allowed, CONTEXT: 'production' }],
  ['deploy preview', { ...allowed, CONTEXT: 'deploy-preview' }],
  ['branch deploy', { ...allowed, CONTEXT: 'branch-deploy' }],
  ['Netlify CI', { ...allowed, NETLIFY: 'true', CI: 'true' }],
  ['generic CI', { ...allowed, CI: '1' }],
  ['deploy metadata', { ...allowed, DEPLOY_ID: 'deploy-id' }],
]) {
  test(`rejects ${name}`, () => {
    assert.throws(() => assertLocalSeedEnvironment(env), /Refusing demo seed/);
  });
}

test('requires the CLI to resolve a loopback dev database', () => {
  assert.doesNotThrow(() => assertLoopbackConnection('postgres://postgres@localhost:5432/postgres', 'dev'));
  assert.doesNotThrow(() => assertLoopbackConnection('postgres://postgres@127.0.0.2:5432/postgres', 'dev'));
  assert.throws(
    () => assertLoopbackConnection('postgres://user:secret@production.example.com/db', 'dev'),
    /not loopback/,
  );
  assert.throws(
    () => assertLoopbackConnection('postgres://postgres@localhost:5432/postgres', 'production'),
    /not dev/,
  );
});

test('seed is deterministic and product-code compatible', () => {
  const withoutProductCode = demoSeedSql(false);
  const withProductCode = demoSeedSql(true);
  assert.match(withoutProductCode, /ON CONFLICT \(id\) DO UPDATE/);
  assert.match(withoutProductCode, /00000000-0000-4000-8000-00000000e001/);
  assert.doesNotMatch(withoutProductCode, /DEMO-CAT-001/);
  assert.match(withProductCode, /product_code/);
  assert.match(withProductCode, /DEMO-CAT-001/);
  assert.match(withProductCode, /DEMO-CAT-002/);
});

test('news fixtures are emitted only when migration 004 is applied', () => {
  const withoutNews = demoSeedSql(true, false);
  const withNews = demoSeedSql(true, true);

  // Without the is_demo column the seed must not reference news at all,
  // otherwise it would fail against an un-migrated local database.
  assert.doesNotMatch(withoutNews, /news_articles/);

  assert.match(withNews, /INSERT INTO news_articles/);
  for (const id of ['f001', 'f002', 'f003']) {
    assert.match(withNews, new RegExp(`00000000-0000-4000-8000-00000000${id}`));
  }
  assert.match(withNews, /ON CONFLICT \(id\) DO UPDATE/);
  // Idempotent: repeated seeding may only ever touch rows already marked demo.
  assert.match(withNews, /WHERE news_articles\.is_demo = true/);
});

test('news fixtures exercise both publish states and stay inside the category constraint', () => {
  const sql = demoSeedSql(true, true);
  const newsBlock = sql.slice(sql.indexOf('INSERT INTO news_articles'));
  const allowed = ['company_news', 'new_titles', 'partnerships', 'events'];
  const used = [...newsBlock.matchAll(/'(company_news|new_titles|partnerships|events)'/g)].map((m) => m[1]);
  assert.ok(used.length >= 3, 'expected at least three categorised fixtures');
  for (const category of used) assert.ok(allowed.includes(category));

  // One fixture must stay unpublished so the published filter is proven, not assumed.
  const rows = newsBlock.split(/\n  \(\n/).slice(1);
  const unpublished = rows.filter((r) => /,\s*false,\s*true\s*\n\s*\)/.test(r));
  assert.strictEqual(unpublished.length, 1, 'expected exactly one unpublished news fixture');
  assert.match(newsBlock, /demo-unpublished-draft/);
});

test('every demo fixture is visibly labelled and marked is_demo', () => {
  const sql = demoSeedSql(true, true);
  // Nothing seeded may be mistaken for real client content in a screenshot.
  const headlines = [...sql.matchAll(/'(\[DEMO\]|\[DÉMO\])[^']*'/g)];
  assert.ok(headlines.length >= 10, `expected labelled fixtures, found ${headlines.length}`);
  assert.doesNotMatch(sql, /is_demo,?\s*\)?\s*VALUES[^;]*?,\s*false\s*\)\s*(,|\nON)/);
});

test('accepts the environment `netlify dev` actually produces', () => {
  // Captured from `netlify dev:exec` on this project. Rejecting DEPLOY_ID/DEPLOY_URL/
  // DEPLOY_PRIME_URL outright previously made the seed unrunnable by its own
  // supported path, which is why no demo content ever appeared on the dev server.
  assert.doesNotThrow(() => assertLocalSeedEnvironment({
    NETLIFY_LOCAL: 'true',
    CONTEXT: 'dev',
    ALLOW_LOCAL_DEMO_SEED: 'yes',
    DEPLOY_ID: '0',
    DEPLOY_URL: 'https://0--longhornpublishers-cm.netlify.app',
    DEPLOY_PRIME_URL: 'https://main--longhornpublishers-cm.netlify.app',
    BRANCH: 'main',
    URL: 'https://longhornpublishers-cm.netlify.app',
  }));
});

test('still rejects a real deploy id even when every other gate looks local', () => {
  assert.throws(() => assertLocalSeedEnvironment({
    NETLIFY_LOCAL: 'true',
    CONTEXT: 'dev',
    ALLOW_LOCAL_DEMO_SEED: 'yes',
    DEPLOY_ID: '6aa8e0ade8737c00089c144e',
  }), /indicates a real deploy/);
});

test('demo content renders under the environment `netlify dev` actually produces', () => {
  // netlify dev always sets DEPLOY_ID="0", DEPLOY_URL and DEPLOY_PRIME_URL.
  // Treating those as deploy evidence made this return false in the only
  // runtime permitted to render demo rows, so seeded content stayed invisible.
  assert.equal(canRenderLocalDemoContent({
    NETLIFY_LOCAL: 'true',
    CONTEXT: 'dev',
    DEPLOY_ID: '0',
    DEPLOY_URL: 'https://0--longhornpublishers-cm.netlify.app',
    DEPLOY_PRIME_URL: 'https://main--longhornpublishers-cm.netlify.app',
  }), true);
});

test('demo content stays hidden on every deployed runtime', () => {
  for (const env of [
    { NETLIFY_LOCAL: 'true', CONTEXT: 'production', DEPLOY_ID: '6aa8e0ade8737c00089c144e' },
    { NETLIFY_LOCAL: 'true', CONTEXT: 'deploy-preview', DEPLOY_ID: '6aa8e0ade8737c00089c144e' },
    { NETLIFY_LOCAL: 'true', CONTEXT: 'branch-deploy', DEPLOY_ID: '6aa8e0ade8737c00089c144e' },
    { NETLIFY_LOCAL: 'true', CONTEXT: 'dev', NETLIFY: 'true' },
    { NETLIFY_LOCAL: 'true', CONTEXT: 'dev', CI: 'true' },
    { NETLIFY_LOCAL: 'true', CONTEXT: 'dev', DEPLOY_ID: '6aa8e0ade8737c00089c144e' },
    { CONTEXT: 'dev' },
    {},
  ]) {
    assert.equal(canRenderLocalDemoContent(env), false, JSON.stringify(env));
  }
});

test('news fixtures cover every category and fill more than one grid row', () => {
  const sql = demoSeedSql(true, true);
  const newsBlock = sql.slice(sql.indexOf('INSERT INTO news_articles'));

  const categories = new Set(
    [...newsBlock.matchAll(/'(company_news|new_titles|partnerships|events)'/g)].map((m) => m[1]),
  );
  assert.deepStrictEqual(
    [...categories].sort(),
    ['company_news', 'events', 'new_titles', 'partnerships'],
    'every category drives a distinct pill label and card icon, so all four need a fixture',
  );

  // The news page is a three-column grid with no pagination; one row is not
  // enough to show wrapping.
  const published = [...newsBlock.matchAll(/,\s*(true|false),\s*true\s*\n\s*\)/g)].map((m) => m[1]);
  const publishedCount = published.filter((p) => p === 'true').length;
  assert.ok(publishedCount > 3, `expected more than one grid row, got ${publishedCount}`);
  assert.strictEqual(published.filter((p) => p === 'false').length, 1);
});

test('one published fixture has no publish date', () => {
  const sql = demoSeedSql(true, true);
  const newsBlock = sql.slice(sql.indexOf('INSERT INTO news_articles'));
  // publishedOn() returns '' for a null date and the card omits <time>;
  // ORDER BY ... NULLS LAST must still place the row.
  assert.match(newsBlock, /demo-undated-notice/);
  const nullDates = [...newsBlock.matchAll(/^\s*NULL,\s*$/gm)];
  assert.ok(nullDates.length >= 1, 'expected at least one NULL publish_date');
});

test('french apostrophes are escaped rather than breaking the statement', () => {
  const sql = demoSeedSql(true, true);
  // Every delimiter pair contributes two quotes and every escaped apostrophe
  // contributes two more, so a correctly escaped statement always has an even
  // count. A single unescaped apostrophe makes it odd and would terminate the
  // string early, so this catches the failure without parsing SQL.
  const quotes = (sql.match(/'/g) ?? []).length;
  assert.strictEqual(quotes % 2, 0, 'unbalanced single quotes in generated SQL');
  assert.match(sql, /d''actualit/, 'expected the straight apostrophe to be doubled');
});
