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

test('non-booklist classifications drop evidence and can never approve a cover', () => {
  const other = parseClassification({ classification: 'other_developed', ...evidence, cover_rights_approved: true }, TODAY);
  assert.ok(other.ok);
  assert.deepEqual(
    [other.value.booklist_evidence_ref, other.value.booklist_verified_by, other.value.booklist_verified_at, other.value.cover_rights_approved],
    [null, null, null, false],
  );
});

test('public listing and cover eligibility are fail-closed', () => {
  const base = { published: true, cover_image_id: 'uploads/x.png', cover_rights_approved: true };
  assert.equal(isPubliclyListed({ ...base, classification: 'unclassified' }), false);
  assert.equal(isPubliclyListed({ ...base, published: false, classification: 'other_developed' }), false);
  assert.equal(isPubliclyListed({ ...base, classification: 'other_developed' }), true);
  assert.equal(coverIsPublic({ ...base, classification: 'national_book_list_verified' }), true);
  assert.equal(coverIsPublic({ ...base, classification: 'national_book_list_verified', cover_rights_approved: false }), false);
  assert.equal(coverIsPublic({ ...base, classification: 'other_developed' }), false);
  assert.equal(coverIsPublic({ ...base, classification: 'national_book_list_verified', published: false }), false);
});

test('every public catalogue read path applies the classification and cover gate', () => {
  const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
  const lib = read('src/lib/catalogue.ts');
  const api = read('src/pages/api/catalogue.ts');
  const media = read('netlify/functions/media.mts');
  for (const [name, source, queries] of [['catalogue.ts', lib, 2], ['api/catalogue.ts', api, 2]]) {
    assert.equal(source.match(/classification IN \('national_book_list_verified', 'other_developed'\)/g)?.length, queries, `${name} listing gate`);
    assert.equal(source.match(/CASE WHEN c?\.?classification = 'national_book_list_verified' AND c?\.?cover_rights_approved\s+THEN c?\.?cover_image_id END AS cover_image_id/g)?.length, queries, `${name} cover gate`);
    assert.doesNotMatch(source, /(?<!AS |THEN )\b(?:c\.)?cover_image_id,/, `${name} must not select cover_image_id ungated`);
  }
  assert.equal(media.match(/FROM catalogue_titles WHERE published = true[^\n]*classification = 'national_book_list_verified' AND cover_rights_approved = true/g)?.length, 2, 'media.mts cover gate');
});
