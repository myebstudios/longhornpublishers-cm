/**
 * Assert approved copy on the LIVE site.
 *
 * WHY THIS EXISTS. Every check we ran inspected `dist/` — the build output with
 * an empty CMS. Production has not been in that configuration since migration
 * 007 shipped. So when 007 seeded `homepage_content.trust_stats` from
 * pre-approval dictionaries, the divergence was invisible: the copy was
 * corrected twice, verified in `dist/` both times, and production served the
 * wrong strings across four deploys. Nobody was careless; the checks described
 * a site that did not exist.
 *
 * Run it after any deploy that carries a content migration, and after content
 * changed outside the admin functions (which do not purge the CDN cache).
 *
 * WHAT IT DOES NOT COVER, stated plainly so it is not trusted further than it
 * earns:
 *   - Only strings listed below. It is a smoke check, not a full diff — there
 *     is no way to diff against production without a second source of truth.
 *   - Only content with an approved i18n counterpart. Catalogue titles, news
 *     and anything CMS-only have nothing to compare against.
 *   - It proves what the live HTML says, not what the database holds. A
 *     correct database behind a stale cached page fails here, which is the point.
 *
 * Expectations are read from src/i18n rather than hardcoded, so correcting the
 * approved copy updates this check automatically and the two cannot drift.
 *
 * Usage:  npm run verify:production
 *         SITE_URL=https://deploy-preview-42--site.netlify.app npm run verify:production
 */
const SITE_URL = (process.env.SITE_URL ?? 'https://longhornpublishers-cm.netlify.app').replace(/\/$/, '');

const { en } = await import('../src/i18n/en.ts');
const { fr } = await import('../src/i18n/fr.ts');

/**
 * Routes and the strings that must appear in them.
 *
 * The trust strip is the minimum required case: it is the descoped replacement
 * for the blocked partner-logo marquee, it is the largest institutional
 * conversion element on the homepage, and it is the copy that was wrong.
 */
const CHECKS = [
  { route: '/en/', label: 'homepage trust strip (EN)', expect: en.home.trust },
  { route: '/fr/', label: 'homepage trust strip (FR)', expect: fr.home.trust },
  { route: '/en/privacy-policy/', label: 'privacy policy last-updated (EN)', expect: [en.legal.lastUpdatedValue] },
  { route: '/fr/politique-de-confidentialite/', label: 'privacy policy last-updated (FR)', expect: [fr.legal.lastUpdatedValue] },
];

/** Compare against rendered HTML, which escapes `&` — so must the expectation. */
const escape = (value) => value.replace(/&/g, '&amp;');

console.log(`Production copy check — ${SITE_URL}\n`);

let failures = 0;
let checked = 0;

for (const { route, label, expect } of CHECKS) {
  // Cache-busted: a CDN copy would answer a question we are not asking.
  const target = `${SITE_URL}${route}?_cms_check=${Date.now()}`;
  let html;
  try {
    const response = await fetch(target, { headers: { 'Cache-Control': 'no-cache' } });
    if (!response.ok) {
      console.error(`  FAIL  ${label} — HTTP ${response.status} for ${route}`);
      failures++;
      continue;
    }
    html = await response.text();
  } catch (error) {
    console.error(`  FAIL  ${label} — request failed: ${error instanceof Error ? error.message : error}`);
    failures++;
    continue;
  }

  const missing = expect.filter((value) => !html.includes(escape(value)));
  checked += expect.length;
  if (!missing.length) {
    console.log(`  ok    ${label} — ${expect.length} string(s)`);
    continue;
  }
  failures++;
  console.error(`  FAIL  ${label} — ${missing.length} of ${expect.length} string(s) absent:`);
  for (const value of missing) console.error(`          ${JSON.stringify(value)}`);
}

if (!failures) {
  console.log(`\n  PASS — ${checked} approved strings present on the live site.\n`);
  process.exit(0);
}

console.error(`
  ${failures} check(s) failed.

  Most likely causes, in order:
    1. Content changed outside the admin functions (SQL, import, migration)
       and the CDN still holds the old page. Purge the affected cache tags
       with \`netlify api purgeCache\`, or wait five minutes and retry. See
       netlify/database/migrations/README.md.
    2. A CMS row diverges from the approved dictionaries. Fix with a new
       migration updating the row, never by editing the dictionaries to match
       and never by editing an already-applied migration.
    3. The approved copy changed and this check is simply reporting it. The
       expectations come from src/i18n, so that means the dictionaries moved
       and the CMS has not.
`);
process.exit(1);
