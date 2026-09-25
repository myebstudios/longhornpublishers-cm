import assert from 'node:assert/strict';
import test from 'node:test';
import { affectsPublicOutput, purgePublicWith } from '../netlify/functions/_shared/public-cache.ts';
import { cacheTagsForPath, CDN_CACHE_CONTROL } from '../src/lib/public-cache.ts';

test('draft churn does not invalidate public output', () => {
  assert.equal(affectsPublicOutput('create', { isPublished: false }), false);
  assert.equal(affectsPublicOutput('update', { wasPublished: false, isPublished: false }), false);
  assert.equal(affectsPublicOutput('delete', { wasPublished: false }), false);
  assert.equal(affectsPublicOutput('create', { isPublished: true }), true);
  assert.equal(affectsPublicOutput('update', { wasPublished: true, isPublished: false }), true);
  assert.equal(affectsPublicOutput('delete', { wasPublished: true }), true);
});

test('French and English pages carry the same content dependency tags', () => {
  assert.deepEqual(cacheTagsForPath('/en/'), ['site-settings', 'homepage', 'services', 'catalogue', 'news']);
  assert.deepEqual(cacheTagsForPath('/fr/'), cacheTagsForPath('/en/'));
  assert.deepEqual(cacheTagsForPath('/en/about/'), cacheTagsForPath('/fr/a-propos/'));
  assert.deepEqual(cacheTagsForPath('/en/news/story/'), cacheTagsForPath('/fr/actualites/story/'));
  assert.deepEqual(cacheTagsForPath('/sitemap.xml'), ['site-settings', 'catalogue', 'news']);
  assert.deepEqual(cacheTagsForPath('/admin/'), []);
  assert.deepEqual(cacheTagsForPath('/fr/unknown/'), []);
  assert.equal(CDN_CACHE_CONTROL, 'public, durable, max-age=300, stale-while-revalidate=604800');
});

test('an unavailable purge service does not fail a committed save', async () => {
  let calls = 0;
  const fail = async () => { calls += 1; throw new Error('unavailable'); };
  let sent;
  await purgePublicWith(['homepage', 'homepage', 'news'], async (options) => { sent = options.tags; });
  assert.deepEqual(sent, ['homepage', 'news']);
  const originalError = console.error;
  console.error = () => {};
  try {
    await assert.doesNotReject(purgePublicWith([], fail));
    assert.equal(calls, 0);
    await assert.doesNotReject(purgePublicWith(['homepage', 'homepage'], fail));
    assert.equal(calls, 1);
  } finally {
    console.error = originalError;
  }
});
