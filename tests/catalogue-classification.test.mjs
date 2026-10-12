import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  coverIsPublic, isPubliclyListed, parseClassification,
} from '../netlify/functions/_shared/catalogue-classification.ts';

const TODAY = '2026-09-28';
const evidence = { booklist_evidence_ref: 'MINEDUB 2026-2027 p.4', booklist_verified_by: 'Yv', booklist_verified_at: '2026-09-20' };

test('classification defaults to unclassified and rejects unknown values', () => {
  assert.deepEqual(parseClassification({}, TODAY).value?.classification, 'unclassified');
  assert.equal(parseClassification({ classification: 'approved' }, TODAY).ok, false);
  assert.equal(parseClassification({ classification: 'other_developed', cover_rights_approved: 'yes' }, TODAY).ok, false);
});

test('National Book List membership requires private evidence, reviewer and a real past date', () => {
  const nbl = (extra) => parseClassification({ classification: 'national_book_list_verified', ...extra }, TODAY);
  assert.equal(nbl({}).ok, false);
  assert.equal(nbl({ ...evidence, booklist_evidence_ref: '  ' }).ok, false);
  assert.equal(nbl({ ...evidence, booklist_verified_at: '2026-13-01' }).ok, false);
  assert.equal(nbl({ ...evidence, booklist_verified_at: '2026-10-01' }).ok, false);
  const ok = nbl({ ...evidence, cover_rights_approved: true });
  assert.ok(ok.ok);
  assert.equal(ok.value.cover_rights_approved, true);
});

test('non-booklist classifications drop private evidence and legacy rights metadata', () => {
  const other = parseClassification({ classification: 'other_developed', ...evidence, cover_rights_approved: true }, TODAY);
  assert.ok(other.ok);
  assert.deepEqual(
    [other.value.booklist_evidence_ref, other.value.booklist_verified_by, other.value.booklist_verified_at, other.value.cover_rights_approved],
    [null, null, null, false],
  );
});

test('public covers default to visible for every listed title, while drafts and unclassified titles stay private', () => {
  const base = { published: true, cover_image_id: 'uploads/x.png', cover_rights_approved: true };
  assert.equal(isPubliclyListed({ ...base, classification: 'unclassified' }), false);
  assert.equal(isPubliclyListed({ ...base, published: false, classification: 'other_developed' }), false);
  assert.equal(isPubliclyListed({ ...base, classification: 'other_developed' }), true);
  assert.equal(coverIsPublic({ ...base, classification: 'national_book_list_verified' }), true);
  assert.equal(coverIsPublic({ ...base, classification: 'national_book_list_verified', cover_rights_approved: false }), true);
  assert.equal(coverIsPublic({ ...base, classification: 'other_developed' }), true);
  assert.equal(coverIsPublic({ ...base, classification: 'national_book_list_verified', published: false }), false);
  assert.equal(coverIsPublic({ ...base, classification: 'unclassified' }), false);
  assert.equal(coverIsPublic({ ...base, classification: 'other_developed', cover_image_id: null }), false);
});

test('public catalogue reads return covers without NBL or rights gates, retaining listing and demo boundaries', () => {
  const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
  for (const name of ['src/lib/catalogue.ts', 'src/pages/api/catalogue.ts']) {
    const source = read(name);
    assert.equal(source.match(/classification IN \('national_book_list_verified', 'other_developed'\)/g)?.length, 2);
    assert.doesNotMatch(source, /CASE WHEN|cover_rights_approved/);
    assert.match(source, /(?:c\.)?cover_image_id,/);
    assert.match(source, /is_demo = false/);
  }
  const media = read('netlify/functions/media.mts');
  assert.equal(media.match(/FROM catalogue_titles WHERE published = true[^\n]*classification IN \('national_book_list_verified', 'other_developed'\)/g)?.length, 2);
  assert.doesNotMatch(media, /cover_rights_approved/);
  assert.match(media, /published = true AND is_demo = false/);
});

test('migration 013 keeps existing published titles public as text-only Other developed titles', () => {
  const sql = fs.readFileSync(new URL('../netlify/database/migrations/013_catalogue_classification_backfill/migration.sql', import.meta.url), 'utf8')
    .replace(/--.*$/gm, '').replace(/\s+/g, ' ').trim();
  assert.match(sql, /^UPDATE catalogue_titles SET classification = 'other_developed', updated_at = now\(\) WHERE published = true AND is_demo = false AND classification = 'unclassified';$/);
  // It must never grant booklist status or cover rights.
  assert.doesNotMatch(sql, /national_book_list_verified|cover_rights_approved/);
});

test('updates must state classification (and cover rights for booklist titles) explicitly', () => {
  const put = (body) => parseClassification(body, TODAY, { requireExplicit: true });
  assert.equal(put({}).ok, false);
  assert.equal(put({ classification: 'national_book_list_verified', ...evidence }).ok, false);
  assert.ok(put({ classification: 'national_book_list_verified', ...evidence, cover_rights_approved: false }).ok);
  assert.ok(put({ classification: 'other_developed' }).ok);
  // Creation keeps the fail-closed default.
  assert.equal(parseClassification({}, TODAY).value.classification, 'unclassified');
});

test('the admin API requires explicit classification on update only', () => {
  const source = fs.readFileSync(new URL('../netlify/functions/catalogue.mts', import.meta.url), 'utf8');
  assert.match(source, /parseClassification\(body, undefined, \{ requireExplicit: req\.method === 'PUT' \}\)/);
});

test('homepage catalogue falls back to up to four text cards when no candidate has a public cover', async () => {
  const { homeCatalogue } = await import('../src/lib/home-catalogue.ts');
  const text = (id) => ({ id, cover_image_id: null });
  const live = ['a', 'b', 'c', 'd', 'e'].map(text);
  assert.deepEqual(homeCatalogue(live, []), { covers: [], text: live.slice(0, 4) });
  assert.deepEqual(homeCatalogue(live).text.map((t) => t.id), ['a', 'b', 'c', 'd']);
  assert.deepEqual(homeCatalogue(live, ['e', 'missing', 'b']).text.map((t) => t.id), ['e', 'b']);
  assert.deepEqual(homeCatalogue(live, ['missing']).text.length, 4);
  const withCover = [...live, { id: 'nbl', cover_image_id: 'uploads/nbl.png' }];
  assert.deepEqual(homeCatalogue(withCover), { covers: [withCover[5]], text: [] });
  assert.deepEqual(homeCatalogue(withCover, ['a']).text.map((t) => t.id), ['a']);
  assert.deepEqual(homeCatalogue([]), { covers: [], text: [] });
});

test('the homepage never renders the catalogue block without cards', () => {
  const page = fs.readFileSync(new URL('../src/pages/[lang]/index.astro', import.meta.url), 'utf8');
  assert.match(page, /homeCatalogue\(/);
  assert.doesNotMatch(page, /catalogueTextOnly/);
  assert.match(page, /catalogueTextTitles\.map/);
});
