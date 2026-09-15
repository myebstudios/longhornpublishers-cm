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
