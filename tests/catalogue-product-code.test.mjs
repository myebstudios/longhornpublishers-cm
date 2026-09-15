import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PRODUCT_CODE_MAX_LENGTH,
  isProductCodeConflict,
  parseProductCode,
} from '../netlify/functions/_shared/catalogue-product-code.ts';

test('product code is required and must be a string', () => {
  assert.deepEqual(parseProductCode(undefined), {
    ok: false,
    error: 'Provide an ISBN / product code.',
  });
  assert.deepEqual(parseProductCode('   '), {
    ok: false,
    error: 'Provide an ISBN / product code.',
  });
  assert.equal(parseProductCode(9780000000000).ok, false);
});

test('product code is trimmed and keeps meaningful punctuation', () => {
  assert.deepEqual(parseProductCode('  978-1-4028-9462-6  '), {
    ok: true,
    value: '978-1-4028-9462-6',
  });
  assert.deepEqual(parseProductCode('LH-CM/P4-001'), {
    ok: true,
    value: 'LH-CM/P4-001',
  });
});

test('product code enforces the database length boundary', () => {
  assert.equal(parseProductCode('x'.repeat(PRODUCT_CODE_MAX_LENGTH)).ok, true);
  assert.deepEqual(parseProductCode('x'.repeat(PRODUCT_CODE_MAX_LENGTH + 1)), {
    ok: false,
    error: `ISBN / product code must be ${PRODUCT_CODE_MAX_LENGTH} characters or fewer.`,
  });
});

test('only the product-code unique index is mapped to a conflict response', () => {
  assert.equal(isProductCodeConflict({ code: '23505', constraint: 'catalogue_titles_product_code_ci_idx' }), true);
  assert.equal(isProductCodeConflict({ code: '23505', constraint: 'catalogue_titles_slug_key' }), false);
  assert.equal(isProductCodeConflict(new Error('database unavailable')), false);
});
