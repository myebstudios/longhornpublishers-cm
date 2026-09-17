/**
 * Does the CMS-backed site still render the approved copy?
 *
 * THE DEFECT THIS EXISTS TO CATCH, in its real form:
 *
 * homepage_content.trust_stats was seeded by migration 007, generated from the
 * i18n dictionaries before commit e2f2e44 corrected item 4. A populated CMS row
 * overrides the dictionaries, so production served pre-approval trust-strip
 * copy across four deploys. The copy was corrected twice and verified in
 * `dist/` every time — but every check inspected the FALLBACK build, where the
 * copy was always right. Nothing compared the CMS-backed render to it.
 *
 * That is the blind spot: our checks verify what the site renders when the CMS
 * is empty, and the live site never is.
 *
 * The check is a comparison, not an assertion about content. Build twice
 * against the same commit — once reading the CMS, once falling back to i18n —
 * and diff every public route. The CMS is supposed to hold the approved copy,
 * so any difference is either a copy divergence or a reader bug. Both are
 * defects; neither is visible any other way.
 *
 * Usage:
 *   npm run db:start && npm run db:migrate
 *   npm run verify:cms-parity
 *
 * Exits non-zero and names the differing routes. Requires the fixed-port local
 * cluster from scripts/local-db.mjs, because both builds must read the SAME
 * database at a STABLE address.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
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
  const output = run('npm', ['run', 'build'], env);
  // A build that silently fell back is not a CMS build, and comparing two
  // fallback builds would pass while proving nothing.
  const fellBack = /Could not read|Database unavailable/i.test(output);
  if (env.CMS_DATABASE_URL && fellBack) {
    console.log('FAILED');
    console.error('\n  The CMS build could not reach the database, so it fell back to i18n.');
    console.error('  Comparing two fallback builds would pass while proving nothing.');
    console.error('  Run: npm run db:start && npm run db:migrate');
    process.exit(2);
  }
  const captured = snapshot('dist');
  console.log(`${captured.size} routes`);
  return captured;
}

console.log('CMS parity check — building twice against the same commit\n');
const cms = build('with CMS   ', { CMS_DATABASE_URL: url });
const fallback = build('with i18n  ', { CMS_DATABASE_URL: '' });

const routes = [...new Set([...cms.keys(), ...fallback.keys()])].sort();
const differing = routes.filter((route) => cms.get(route) !== fallback.get(route));

console.log(`\n  compared ${routes.length} public routes`);
if (!differing.length) {
  console.log('  PASS — the CMS renders the approved copy byte-for-byte.\n');
  process.exit(0);
}

console.error(`\n  FAIL — ${differing.length} route(s) differ between the CMS and the approved copy:\n`);
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
