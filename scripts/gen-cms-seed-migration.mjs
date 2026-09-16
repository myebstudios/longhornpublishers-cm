/**
 * Generate the CMS baseline seed migration from the approved bilingual copy.
 *
 * Why a migration and not a script: scripts/seed-cms-baseline.mjs is hard-guarded
 * to loopback, so it has never touched production — which is exactly why every
 * admin form on the live site opened empty. Netlify applies migrations to
 * production on publish, so a DML migration is the only sanctioned path for
 * production content.
 *
 * Generated rather than hand-written so the SQL cannot drift from src/i18n.
 * Re-run with: node scripts/gen-cms-seed-migration.mjs
 */
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const en = (await import('../src/i18n/en.ts')).en;
const fr = (await import('../src/i18n/fr.ts')).fr;
const { SERVICES, PROCESS } = await import('../src/data/site.ts');

const q = (v) => (v === null || v === undefined || v === '' ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const j = (v) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
const join = (parts) => parts.join('\n\n');

/* ---- preconditions: positional mappings must still hold ---- */
const IDENTITY = ['purpose', 'vision', 'mission', 'values'];
const fail = [];
en.about.identity.items.forEach((it, i) => {
  if (it.title.toLowerCase() !== IDENTITY[i]) fail.push(`about.identity.items[${i}] is "${it.title}", expected "${IDENTITY[i]}"`);
});
if (en.why.pillars.length !== fr.why.pillars.length) fail.push('why.pillars differ in length between EN and FR');
if (en.about.team.items.length !== fr.about.team.items.length) fail.push('about.team.items differ in length between EN and FR');
if (en.contact.form.projectTypes.length !== fr.contact.form.projectTypes.length) fail.push('contact.form.projectTypes differ in length');
if (en.home.trust.length !== fr.home.trust.length) fail.push('home.trust differs in length');
if (SERVICES.some((s) => !s.id)) fail.push('a service has no id to use as its slug');
if (fail.length) throw new Error(`Mapping preconditions failed:\n  - ${fail.join('\n  - ')}`);

const L = [];
const w = (...lines) => L.push(...lines);

w(`-- CMS baseline content for production.
--
-- Every admin form on the live site opened EMPTY. The cause was not the schema
-- and not the seed script: scripts/seed-cms-baseline.mjs refuses to run against
-- anything but loopback, so it only ever populated a developer's machine. No
-- content row has ever existed in the production database.
--
-- Netlify applies migrations to production on publish, so a DML migration is
-- the only path that reaches it. This file is GENERATED from the approved
-- bilingual copy in src/i18n by scripts/gen-cms-seed-migration.mjs — do not
-- hand-edit it; change the copy or the generator and regenerate.
--
-- The contract: seeding must not change one visible character of the public
-- site. Every page already renders this exact copy via its i18n fallback; this
-- moves it into the CMS so an editor can see and change it. Verified by a
-- before/after HTML diff across all 20 public routes.
--
-- Rows are written published = true because they reproduce copy that is
-- ALREADY live. Writing them as drafts would blank the public pages.
--
-- Idempotent: safe to re-run, and safe if an editor has already saved content
-- (ON CONFLICT DO NOTHING / NOT EXISTS guards never overwrite editor work).`);

/* ---- DDL: columns the live rendering needs and the schema lacked ---- */
w(`
-- Columns required to represent what the public site actually renders.
-- Without these the hero heading collapses to one flat line, every service
-- loses its photograph and its overview-card summary, and the seed below
-- would be a visible regression rather than a faithful copy.
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS hero_headline_accent_en text;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS hero_headline_accent_fr text;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS hero_eyebrow_en text;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS hero_eyebrow_fr text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_en text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_fr text;
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_key ON services (slug) WHERE slug IS NOT NULL;`);

/* ---- site_settings ---- */
w(`
-- Site settings: global identity, contact block, footer and SEO defaults.
INSERT INTO site_settings (
  id, company_name_en, company_name_fr, tagline_en, tagline_fr, address, phone_1, phone_2, email,
  social_links, footer_tagline_en, footer_tagline_fr, newsletter_copy_en, newsletter_copy_fr,
  parent_company_url, seo_default_title, seo_default_description, og_image_id
) VALUES (
  'default',
  ${q('Longhorn Publishers Cameroon Ltd')}, ${q('Longhorn Publishers Cameroun Ltd')},
  ${q('Content creators and platform business providers')},
  ${q('Créateurs de contenus et fournisseurs de solutions éditoriales')},
  ${q('Total École de police, Tsinga — Yaoundé, Cameroon')},
  ${q('+237 672 49 10 93')}, ${q('+237 657 51 92 03')},
  ${q('longhorncameroon@longhornpublishers.com')},
  ${j([])},
  ${q('Content creators and platform business providers for Central Africa — end-to-end publishing services from manuscript to printed book, in English and French.')},
  ${q('Créateurs de contenus et fournisseurs de solutions éditoriales pour l’Afrique centrale — services d’édition complets, du manuscrit au livre imprimé.')},
  ${q('Your email for publishing insights')}, ${q('Votre courriel pour nos actualités')},
  ${q('https://longhornpublishers.com')},
  ${q('Longhorn Publishers Cameroon')},
  ${q('Professional bilingual publishing services in Cameroon and the DRC.')},
  NULL
) ON CONFLICT (id) DO NOTHING;`);

/* ---- homepage ---- */
const trust = en.home.trust.map((label, i) => ({ value: '', label_en: label, label_fr: fr.home.trust[i] }));
w(`
-- Homepage. hero_eyebrow stays NULL: the live hero renders no eyebrow line,
-- and inventing one here would add an element the page does not have.
-- trust_stats values are blank on purpose — the live trust bar is label-only.
INSERT INTO homepage_content (
  id, hero_headline_en, hero_headline_fr, hero_headline_accent_en, hero_headline_accent_fr,
  hero_eyebrow_en, hero_eyebrow_fr, hero_subheadline_en, hero_subheadline_fr,
  hero_cta_label_en, hero_cta_label_fr, who_we_are_copy_en, who_we_are_copy_fr,
  trust_stats, one_partner_copy_en, one_partner_copy_fr, featured_catalogue_ids, published
) VALUES (
  'default',
  ${q(en.home.hero.titleLead)}, ${q(fr.home.hero.titleLead)},
  ${q(en.home.hero.titleAccent)}, ${q(fr.home.hero.titleAccent)},
  NULL, NULL,
  ${q(en.home.hero.lede)}, ${q(fr.home.hero.lede)},
  ${q(en.common.partnerWithUs)}, ${q(fr.common.partnerWithUs)},
  ${q(join(en.home.whoWeAre.body))}, ${q(join(fr.home.whoWeAre.body))},
  ${j(trust)},
  ${q(en.home.endToEnd.lede)}, ${q(fr.home.endToEnd.lede)},
  ${j([])}, true
) ON CONFLICT (id) DO NOTHING;`);

/* ---- about ---- */
const team = en.about.team.items.map((item, i) => ({
  title: item.title,
  title_en: item.title,
  title_fr: fr.about.team.items[i].title,
  icon: item.icon ?? null,
  description_en: item.body,
  description_fr: fr.about.team.items[i].body,
  tags_en: item.tags ?? null,
  tags_fr: fr.about.team.items[i].tags ?? null,
}));
const id = (k, i) => [en.about.identity.items[i].body, fr.about.identity.items[i].body];
w(`
-- About page. Team blocks carry a bilingual title and their pill tags; a single
-- title column would have shown the English team names to French visitors.
INSERT INTO about_page (
  id, heritage_copy_en, heritage_copy_fr, purpose_en, purpose_fr, vision_en, vision_fr,
  mission_en, mission_fr, values_en, values_fr, team_capacity_blocks, published
) VALUES (
  'default',
  ${q(join(en.about.heritage.body))}, ${q(join(fr.about.heritage.body))},
  ${q(id('purpose', 0)[0])}, ${q(id('purpose', 0)[1])},
  ${q(id('vision', 1)[0])}, ${q(id('vision', 1)[1])},
  ${q(id('mission', 2)[0])}, ${q(id('mission', 2)[1])},
  ${q(id('values', 3)[0])}, ${q(id('values', 3)[1])},
  ${j(team)}, true
) ON CONFLICT (id) DO NOTHING;`);

/* ---- why ---- */
const pillars = en.why.pillars.slice(1).map((p, i) => {
  const f = fr.why.pillars[i + 1];
  return {
    icon: null,
    title_en: `${p.titleLead} ${p.titleAccent}`.trim(),
    title_fr: `${f.titleLead} ${f.titleAccent}`.trim(),
    description_en: join(p.body),
    description_fr: join(f.body),
    eyebrow_en: p.eyebrow ?? null,
    eyebrow_fr: f.eyebrow ?? null,
    title_lead_en: p.titleLead ?? null,
    title_lead_fr: f.titleLead ?? null,
    title_accent_en: p.titleAccent ?? null,
    title_accent_fr: f.titleAccent ?? null,
    tags_en: p.tags ?? null,
    tags_fr: f.tags ?? null,
  };
});
w(`
-- Why Choose Us. Pillar 1 is the local-presence copy columns; pillars 2+ are
-- the jsonb list, carrying their split heading, numbered eyebrow and pills so
-- the rendered page is unchanged.
INSERT INTO why_choose_us (id, local_presence_copy_en, local_presence_copy_fr, quality_commitment_items, published)
VALUES ('default', ${q(join(en.why.pillars[0].body))}, ${q(join(fr.why.pillars[0].body))}, ${j(pillars)}, true)
ON CONFLICT (id) DO NOTHING;`);

/* ---- contact ---- */
const projectTypes = en.contact.form.projectTypes.map((label, i) => ({ label_en: label, label_fr: fr.contact.form.projectTypes[i] }));
w(`
-- Contact. map_lat/map_lng stay NULL: Contact.astro prefers coordinates over
-- the address string, so setting them would change the embedded map's source.
INSERT INTO contact_settings (id, hero_copy_en, hero_copy_fr, project_type_options, map_lat, map_lng, published)
VALUES ('default', ${q(en.contact.hero.lede)}, ${q(fr.contact.hero.lede)}, ${j(projectTypes)}, NULL, NULL, true)
ON CONFLICT (id) DO NOTHING;`);

/* ---- legal ---- */
const legalBody = (sections) => join(sections.map((s) => `## ${s.title}\n${s.content}`));
w(`
-- Legal pages. Section headings survive as "## " lines, which Legal.astro
-- renders as <h2>. updated_at is pinned to the date the published documents
-- state; letting it default to now() would restate a client-facing legal
-- document as revised today.`);
for (const [page, key] of [['privacy_policy', 'privacy'], ['terms_of_use', 'terms']]) {
  w(`INSERT INTO legal_pages (page, body_en, body_fr, updated_at, published)
SELECT ${q(page)}, ${q(legalBody(en.legal[key].sections))}, ${q(legalBody(fr.legal[key].sections))}, timestamptz '2026-09-01 00:00:00+00', true
WHERE NOT EXISTS (SELECT 1 FROM legal_pages WHERE page = ${q(page)});`);
}

/* ---- process ---- */
w(`
-- Publishing process steps.`);
for (const step of PROCESS) {
  w(`INSERT INTO process_steps (step_number, title_en, title_fr, description_en, description_fr, published)
SELECT ${Number(step.num)}, ${q(step.en.title)}, ${q(step.fr.title)}, ${q(step.en.body)}, ${q(step.fr.body)}, true
WHERE NOT EXISTS (SELECT 1 FROM process_steps WHERE step_number = ${Number(step.num)});`);
}

/* ---- services ---- */
w(`
-- Services. slug keys the detail photograph and the on-page anchor; short_* is
-- the overview-card line, which differs from the first body paragraph on every
-- service and would otherwise be replaced by it.`);
SERVICES.forEach((s, i) => {
  w(`INSERT INTO services (slug, name_en, name_fr, category, short_en, short_fr, description_en, description_fr, icon, sort_order, published)
SELECT ${q(s.id)}, ${q(s.en.name)}, ${q(s.fr.name)}, ${q(s.discipline)}, ${q(s.en.short)}, ${q(s.fr.short)}, ${q(join(s.en.body))}, ${q(join(s.fr.body))}, ${q(s.icon)}, ${i}, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = ${q(s.id)});`);
});

/* ---- catalogue: the four client titles, as drafts ----
 *
 * Reuses the vetted definitions in scripts/seed-catalogue-titles.mjs rather
 * than restating them, with one change: cover_image_id is NULL. The covers live
 * in Netlify Blobs, which a SQL migration cannot write, and a row pointing at a
 * blob key that does not exist would render a broken image in the admin and 404
 * on /api/media. Covers are attached through the admin upload field; until then
 * these open as complete, editable drafts with no artwork.
 */
const catalogue = execFileSync('node', ['scripts/seed-catalogue-titles.mjs', '--dry-run'], { encoding: 'utf8' })
  .split('\n\n').slice(1).map((block) => block.trim()).filter(Boolean);
if (catalogue.length !== 8) throw new Error(`Expected 4 subjects + 4 titles from the catalogue seed, got ${catalogue.length}`);
w(`
-- Catalogue: four client titles as DRAFTS (published = false), so they appear
-- in the admin for review and stay 404 on the public catalogue until approved.`);
for (const block of catalogue) {
  const withoutCovers = block.replace(/'uploads\/[0-9a-f-]+\.png'/g, 'NULL');
  if (withoutCovers.includes('uploads/')) throw new Error('A cover blob key survived removal; refusing to reference a blob that production does not have.');
  w(`${withoutCovers}${withoutCovers.endsWith(';') ? '' : ';'}`);
}

writeFileSync('netlify/database/migrations/007_cms_baseline_content/migration.sql', L.join('\n') + '\n');
console.log(`Wrote 007_cms_baseline_content/migration.sql (${L.join('\n').length} bytes)`);
