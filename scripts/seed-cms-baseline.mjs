/**
 * Populate the CMS with the copy that is ALREADY RENDERING on the public site.
 *
 * Why this exists
 * ---------------
 * Every public page falls back to the reviewed i18n copy when its CMS table is
 * empty, so the site is not blank — but the ADMIN PANEL is. An editor opening
 * /admin/about/ sees an empty form rather than the words currently on the live
 * page, cannot edit what they cannot see, and a naive partial save would
 * replace rich live copy with a half-filled record. Those seven tables have no
 * draft state, so such a save is instantly public.
 *
 * This script writes the fallback copy INTO the CMS so each admin screen opens
 * showing exactly what is live, as an editable baseline.
 *
 * The contract: seeding must not change one visible character of the public
 * site. Verify with scripts/capture-public-html.mjs before and after.
 *
 * This is NOT demo seeding. Nothing here is demo content, no is_demo row is
 * written, and the seed-demo path is deliberately not reused.
 *
 * Scope: Site Settings, Homepage (partial), About (partial), Why (partial),
 * Contact (partial). Catalogue, subjects and news are out of scope pending
 * approved client content. Legal Pages and Services/Process are HELD — the
 * schema cannot represent their live shape. See DELIBERATE OMISSIONS below.
 */
import { execFileSync } from 'node:child_process';

/**
 * Netlify CLI invocation.
 *
 * Pinned because `netlify database connect` does not exist before v27, and a
 * globally installed older CLI would fail with a confusing "unknown command"
 * rather than a clear version error. Override with NETLIFY_CLI_SPEC if the
 * project moves off this line.
 */
const CLI_SPEC = process.env.NETLIFY_CLI_SPEC ?? 'netlify@27.8.0';
const cli = (...args) => execFileSync('npx', ['-y', CLI_SPEC, ...args], {
  cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
});

const en = (await import('../src/i18n/en.ts')).en;
const fr = (await import('../src/i18n/fr.ts')).fr;

/** The renderer splits stored text on a blank line; join the same way. */
const joinParagraphs = (parts) => parts.join('\n\n');

/**
 * Site settings as rendered today.
 *
 * Source of truth is FALLBACK_SITE_SETTINGS in src/lib/cms-content.ts. It is
 * duplicated rather than imported because that module uses extensionless
 * specifiers that Node's ESM resolver cannot follow. The before/after HTML
 * diff is what actually guards the duplication: if these drift from the
 * fallback, the diff fails and this script is wrong.
 */
const SITE_SETTINGS = {
  company_name_en: 'Longhorn Publishers Cameroon Ltd',
  company_name_fr: 'Longhorn Publishers Cameroun Ltd',
  tagline_en: 'Content creators and platform business providers',
  tagline_fr: 'Créateurs de contenus et fournisseurs de solutions éditoriales',
  address: 'Total École de police, Tsinga — Yaoundé, Cameroon',
  phone_1: '+237 672 49 10 93',
  phone_2: '+237 657 51 92 03',
  email: 'longhorncameroon@longhornpublishers.com',
  social_links: [],
  footer_tagline_en:
    'Content creators and platform business providers for Central Africa — end-to-end publishing services from manuscript to printed book, in English and French.',
  footer_tagline_fr:
    'Créateurs de contenus et fournisseurs de solutions éditoriales pour l’Afrique centrale — services d’édition complets, du manuscrit au livre imprimé.',
  newsletter_copy_en: 'Your email for publishing insights',
  newsletter_copy_fr: 'Votre courriel pour nos actualités',
  parent_company_url: 'https://longhornpublishers.com',
  seo_default_title: 'Longhorn Publishers Cameroon',
  seo_default_description: 'Professional bilingual publishing services in Cameroon and the DRC.',
  og_image_id: null,
};

/**
 * i18n key -> CMS column, for every field this script writes.
 *
 * homepage_content
 *   who_we_are_copy_en/fr  <- home.whoWeAre.body        (joined on a blank line)
 *   one_partner_copy_en/fr <- home.endToEnd.lede
 *
 * about_page
 *   heritage_copy_en/fr    <- about.heritage.body       (joined on a blank line)
 *   purpose_en/fr          <- about.identity.items[0].body
 *   vision_en/fr           <- about.identity.items[1].body
 *   mission_en/fr          <- about.identity.items[2].body
 *   values_en/fr           <- about.identity.items[3].body
 *     The renderer overrides only `body`, positionally, keeping the i18n title
 *     and icon. The column order purpose/vision/mission/values must match the
 *     order of about.identity.items; asserted below.
 *
 * why_choose_us
 *   local_presence_copy_en/fr <- why.pillars[0].body    (joined on a blank line)
 *
 * contact_settings
 *   hero_copy_en/fr           <- contact.hero.lede
 *   project_type_options      <- contact.form.projectTypes, zipped EN/FR by index
 *
 * DELIBERATE OMISSIONS — these columns are left empty ON PURPOSE. Each merge is
 * `cms.length ? cms : i18n`, so an empty value preserves the live rendering and
 * a populated one destroys it. Leaving them empty is the correct result, not an
 * unfinished one.
 *
 *   about_page.team_capacity_blocks  — the column carries ONE `title`, but the
 *     live site renders "Editorial Team" in EN and "Équipe éditoriale" in FR.
 *     Seeding forces one language onto both locales. About.astro also drops
 *     `tags`, deleting three rows of pills.
 *   why_choose_us.quality_commitment_items — Why.astro sets titleAccent to ''
 *     and tags to undefined. Pillar headings are split titleLead + accented
 *     <em>; collapsing them into one title leaves an empty <em> and deletes
 *     pillar 2's five pills.
 *   contact_settings.map_lat / map_lng — Contact.astro prefers coordinates over
 *     the address string, changing the Maps embed src and link href.
 *   homepage_content.hero_headline/subheadline/cta — setting a headline makes
 *     index.astro pass titleAccent='' and swap the hero eyebrow, collapsing the
 *     split heading exactly as Why does.
 *   homepage_content.trust_stats — the fallback renders each stat with an EMPTY
 *     value, so <strong> is never emitted. Seeding real values adds elements.
 *   homepage_content.hero_image_id / who_we_are_image_id — mediaPath() would
 *     redirect these to /api/media/ instead of the bundled image.
 *   homepage_content.featured_catalogue_ids — catalogue is out of scope.
 */
const IDENTITY_ORDER = ['purpose', 'vision', 'mission', 'values'];

function assertMappingPreconditions() {
  const problems = [];
  if (en.about.identity.items.length !== IDENTITY_ORDER.length) {
    problems.push(`about.identity.items has ${en.about.identity.items.length} entries, expected ${IDENTITY_ORDER.length}`);
  }
  en.about.identity.items.forEach((item, index) => {
    const expected = IDENTITY_ORDER[index];
    if (item.title.toLowerCase() !== expected) {
      problems.push(`about.identity.items[${index}] is "${item.title}", expected "${expected}" — positional mapping would write the wrong column`);
    }
  });
  if (en.contact.form.projectTypes.length !== fr.contact.form.projectTypes.length) {
    problems.push('contact.form.projectTypes differs in length between EN and FR; the zip would drop or invent options');
  }
  if (!en.why.pillars.length || !fr.why.pillars.length) problems.push('why.pillars is empty');
  if (problems.length) {
    throw new Error(`Mapping preconditions failed:\n  - ${problems.join('\n  - ')}`);
  }
}

function netlifyQuery(sql) {
  return cli('database', 'connect', '--json', '--query', sql);
}

/**
 * Refuse to run against anything but a local database.
 *
 * Deliberately independent of the demo-seed guard: this script must not depend
 * on the demo path, and a safety check that can be disabled by editing an
 * unrelated module is not a safety check.
 */
function assertLocalDatabase() {
  const raw = cli('database', 'connect', '--json');
  const { connection_string: connectionString, context } = JSON.parse(raw);
  if (!connectionString) throw new Error('No database connection string returned.');
  const { hostname } = new URL(connectionString);
  const loopback = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  if (!loopback) {
    throw new Error(`Refusing to seed: database host "${hostname}" is not loopback. This script is dev-only; production seeding is a separate, separately authorised step.`);
  }
  if (context && context !== 'dev') {
    throw new Error(`Refusing to seed: Netlify context is "${context}", expected "dev".`);
  }
  return { hostname, context: context ?? 'dev' };
}

const quote = (value) => (value === null || value === undefined ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`);
const quoteJson = (value) => `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;

function buildStatements() {
  const projectTypeOptions = en.contact.form.projectTypes.map((label, index) => ({
    label_en: label,
    label_fr: fr.contact.form.projectTypes[index],
  }));

  const identity = Object.fromEntries(
    IDENTITY_ORDER.flatMap((key, index) => [
      [`${key}_en`, en.about.identity.items[index].body],
      [`${key}_fr`, fr.about.identity.items[index].body],
    ]),
  );

  return [
    {
      label: 'site_settings',
      sql: `INSERT INTO site_settings (id, company_name_en, company_name_fr, tagline_en, tagline_fr, address, phone_1, phone_2, email, social_links, footer_tagline_en, footer_tagline_fr, newsletter_copy_en, newsletter_copy_fr, parent_company_url, seo_default_title, seo_default_description, og_image_id)
VALUES ('default', ${quote(SITE_SETTINGS.company_name_en)}, ${quote(SITE_SETTINGS.company_name_fr)}, ${quote(SITE_SETTINGS.tagline_en)}, ${quote(SITE_SETTINGS.tagline_fr)}, ${quote(SITE_SETTINGS.address)}, ${quote(SITE_SETTINGS.phone_1)}, ${quote(SITE_SETTINGS.phone_2)}, ${quote(SITE_SETTINGS.email)}, ${quoteJson(SITE_SETTINGS.social_links)}, ${quote(SITE_SETTINGS.footer_tagline_en)}, ${quote(SITE_SETTINGS.footer_tagline_fr)}, ${quote(SITE_SETTINGS.newsletter_copy_en)}, ${quote(SITE_SETTINGS.newsletter_copy_fr)}, ${quote(SITE_SETTINGS.parent_company_url)}, ${quote(SITE_SETTINGS.seo_default_title)}, ${quote(SITE_SETTINGS.seo_default_description)}, NULL)
ON CONFLICT (id) DO UPDATE SET company_name_en = EXCLUDED.company_name_en, company_name_fr = EXCLUDED.company_name_fr, tagline_en = EXCLUDED.tagline_en, tagline_fr = EXCLUDED.tagline_fr, address = EXCLUDED.address, phone_1 = EXCLUDED.phone_1, phone_2 = EXCLUDED.phone_2, email = EXCLUDED.email, social_links = EXCLUDED.social_links, footer_tagline_en = EXCLUDED.footer_tagline_en, footer_tagline_fr = EXCLUDED.footer_tagline_fr, newsletter_copy_en = EXCLUDED.newsletter_copy_en, newsletter_copy_fr = EXCLUDED.newsletter_copy_fr, parent_company_url = EXCLUDED.parent_company_url, seo_default_title = EXCLUDED.seo_default_title, seo_default_description = EXCLUDED.seo_default_description, updated_at = now()`,
    },
    {
      label: 'homepage_content (who-we-are + one-partner only)',
      sql: `INSERT INTO homepage_content (id, who_we_are_copy_en, who_we_are_copy_fr, one_partner_copy_en, one_partner_copy_fr)
VALUES ('default', ${quote(joinParagraphs(en.home.whoWeAre.body))}, ${quote(joinParagraphs(fr.home.whoWeAre.body))}, ${quote(en.home.endToEnd.lede)}, ${quote(fr.home.endToEnd.lede)})
ON CONFLICT (id) DO UPDATE SET who_we_are_copy_en = EXCLUDED.who_we_are_copy_en, who_we_are_copy_fr = EXCLUDED.who_we_are_copy_fr, one_partner_copy_en = EXCLUDED.one_partner_copy_en, one_partner_copy_fr = EXCLUDED.one_partner_copy_fr, updated_at = now()`,
    },
    {
      label: 'about_page (heritage + identity; team blocks intentionally empty)',
      sql: `INSERT INTO about_page (id, heritage_copy_en, heritage_copy_fr, purpose_en, purpose_fr, vision_en, vision_fr, mission_en, mission_fr, values_en, values_fr, team_capacity_blocks)
VALUES ('default', ${quote(joinParagraphs(en.about.heritage.body))}, ${quote(joinParagraphs(fr.about.heritage.body))}, ${quote(identity.purpose_en)}, ${quote(identity.purpose_fr)}, ${quote(identity.vision_en)}, ${quote(identity.vision_fr)}, ${quote(identity.mission_en)}, ${quote(identity.mission_fr)}, ${quote(identity.values_en)}, ${quote(identity.values_fr)}, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET heritage_copy_en = EXCLUDED.heritage_copy_en, heritage_copy_fr = EXCLUDED.heritage_copy_fr, purpose_en = EXCLUDED.purpose_en, purpose_fr = EXCLUDED.purpose_fr, vision_en = EXCLUDED.vision_en, vision_fr = EXCLUDED.vision_fr, mission_en = EXCLUDED.mission_en, mission_fr = EXCLUDED.mission_fr, values_en = EXCLUDED.values_en, values_fr = EXCLUDED.values_fr, updated_at = now()`,
    },
    {
      label: 'why_choose_us (local presence; quality items intentionally empty)',
      sql: `INSERT INTO why_choose_us (id, local_presence_copy_en, local_presence_copy_fr, quality_commitment_items)
VALUES ('default', ${quote(joinParagraphs(en.why.pillars[0].body))}, ${quote(joinParagraphs(fr.why.pillars[0].body))}, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET local_presence_copy_en = EXCLUDED.local_presence_copy_en, local_presence_copy_fr = EXCLUDED.local_presence_copy_fr, updated_at = now()`,
    },
    {
      label: 'contact_settings (hero + project types; map coordinates intentionally null)',
      sql: `INSERT INTO contact_settings (id, hero_copy_en, hero_copy_fr, project_type_options, map_lat, map_lng)
VALUES ('default', ${quote(en.contact.hero.lede)}, ${quote(fr.contact.hero.lede)}, ${quoteJson(projectTypeOptions)}, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET hero_copy_en = EXCLUDED.hero_copy_en, hero_copy_fr = EXCLUDED.hero_copy_fr, project_type_options = EXCLUDED.project_type_options, updated_at = now()`,
    },
  ];
}

const dryRun = process.argv.includes('--dry-run');

assertMappingPreconditions();
const statements = buildStatements();

if (dryRun) {
  console.log('Dry run — no database connection opened.\n');
  for (const { label, sql } of statements) console.log(`-- ${label}\n${sql};\n`);
  console.log(`${statements.length} statements ready.`);
} else {
  const { hostname, context } = assertLocalDatabase();
  console.log(`Seeding CMS baseline against ${hostname} (context: ${context}).\n`);
  for (const { label, sql } of statements) {
    netlifyQuery(sql);
    console.log(`  ok  ${label}`);
  }
  console.log(`\n${statements.length} tables seeded. Rebuild and diff the public HTML to confirm nothing visible changed.`);
}
