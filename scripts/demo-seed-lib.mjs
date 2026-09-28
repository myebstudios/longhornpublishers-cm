import { isIP } from 'node:net';

const DEPLOY_CONTEXTS = new Set(['production', 'deploy-preview', 'branch-deploy']);

/** `netlify dev` reports this sentinel deploy id; a real deploy never does. */
const LOCAL_DEPLOY_ID = '0';

export function assertLocalSeedEnvironment(env) {
  const problems = [];
  if (env.NETLIFY_LOCAL !== 'true') problems.push('NETLIFY_LOCAL must equal true');
  if (env.CONTEXT !== 'dev') problems.push('CONTEXT must equal dev');
  if (env.ALLOW_LOCAL_DEMO_SEED !== 'yes') problems.push('ALLOW_LOCAL_DEMO_SEED must equal yes');
  if (env.NETLIFY === 'true') problems.push('NETLIFY must not equal true');
  if (env.CI) problems.push('CI must be unset');
  if (DEPLOY_CONTEXTS.has(env.CONTEXT ?? '')) problems.push(`deployment context ${env.CONTEXT} is forbidden`);

  // `netlify dev` populates DEPLOY_ID/DEPLOY_URL/DEPLOY_PRIME_URL locally too, using
  // the literal deploy id "0" and URLs derived from it. Rejecting them outright made
  // this seed unrunnable by its own supported path. Only a real deploy id is evidence
  // of a deploy; the URLs carry no signal locally and are not tested. The decisive
  // guarantee is assertLoopbackConnection, which refuses any non-loopback database.
  if (env.DEPLOY_ID !== undefined && env.DEPLOY_ID !== '' && env.DEPLOY_ID !== LOCAL_DEPLOY_ID) {
    problems.push(`DEPLOY_ID ${env.DEPLOY_ID} indicates a real deploy`);
  }
  if (problems.length) {
    throw new Error(`Refusing demo seed: ${problems.join('; ')}.`);
  }
}

export function assertLoopbackConnection(connectionString, context) {
  if (context !== 'dev') throw new Error(`Refusing demo seed: database context is ${context || 'unknown'}, not dev.`);
  let url;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error('Refusing demo seed: Netlify CLI returned an invalid database connection.');
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const loopback = hostname === 'localhost'
    || hostname === '::1'
    || (isIP(hostname) === 4 && hostname.startsWith('127.'));
  if (!loopback) {
    throw new Error(`Refusing demo seed: database host ${hostname || 'unknown'} is not loopback.`);
  }
}


/**
 * Demo cover blobs.
 *
 * Keys are fixed and UUID-shaped because netlify/functions/media.mts only serves
 * keys matching `uploads/<uuid>.<ext>`; a friendlier name would be rejected
 * before the store is touched. Fixed values also keep reseeding idempotent.
 *
 * The source files live in `Assets/Book covers/` and are deliberately NOT in the
 * repository: they are client artwork awaiting approval, and committing them
 * would make them deployable. A checkout without that folder still seeds — it
 * just leaves cover_image_id NULL and renders the title-text fallback.
 */
export const DEMO_COVERS = [
  { file: 'b1.png', key: 'uploads/00000000-0000-4000-8000-0000000000c1.png' },
  { file: 'b2.png', key: 'uploads/00000000-0000-4000-8000-0000000000c2.png' },
  { file: 'b3.png', key: 'uploads/00000000-0000-4000-8000-0000000000c3.png' },
  { file: 'b4.png', key: 'uploads/00000000-0000-4000-8000-0000000000c4.png' },
];

/** Local-only carousel images, copied from committed launch assets. */
export const DEMO_HERO_IMAGES = [
  { file: 'lh-hero.jpg', key: 'uploads/00000000-0000-4000-8000-0000000000d1.jpeg' },
  { file: 'lh-catalogue-shelves.jpg', key: 'uploads/00000000-0000-4000-8000-0000000000d2.jpeg' },
  { file: 'lh-bilingual-editor-wide.jpg', key: 'uploads/00000000-0000-4000-8000-0000000000d3.jpeg' },
  { file: 'lh-print-inspection-wide.jpg', key: 'uploads/00000000-0000-4000-8000-0000000000d4.jpeg' },
];


/**
 * Catalogue fixtures, one per demo cover. Levels, subjects, language mixes and
 * the featured flag vary so the filter chips and the featured-first ordering
 * have something to act on.
 */
const CATALOGUE_DEMO_ROWS = [
  {
    id: 'e001', slug: 'demo-primary-mathematics-workbook', code: 'DEMO-CAT-001',
    level: 'primary', subject: 'd001', languages: ['en', 'fr'], featured: true,
    en: 'Primary Mathematics Workbook', fr: 'Cahier de mathématiques primaire',
    descEn: 'Local-only fixture used to verify bilingual catalogue cards and detail routes.',
    descFr: 'Donnée locale servant uniquement à vérifier les fiches et pages bilingues du catalogue.',
  },
  {
    id: 'e002', slug: 'demo-bilingual-reading-practice', code: 'DEMO-CAT-002',
    level: 'secondary', subject: 'd002', languages: ['en', 'fr'], featured: false,
    en: 'Bilingual Reading Practice', fr: 'Exercices de lecture bilingue',
    descEn: 'Local-only fixture used to exercise catalogue filtering and localization.',
    descFr: 'Donnée locale servant uniquement à tester le filtrage et la localisation du catalogue.',
  },
  {
    id: 'e003', slug: 'demo-secondary-science-companion', code: 'DEMO-CAT-003',
    level: 'secondary', subject: 'd003', languages: ['en'], featured: false,
    en: 'Secondary Science Companion', fr: 'Guide de sciences du secondaire',
    descEn: 'Local-only fixture with a single language edition, so the language filter has a negative case.',
    descFr: 'Donnée locale disponible en une seule langue, afin que le filtre linguistique ait un cas négatif.',
  },
  {
    id: 'e004', slug: 'demo-primary-reading-anthology', code: 'DEMO-CAT-004',
    level: 'primary', subject: 'd002', languages: ['fr'], featured: true,
    en: 'Primary Reading Anthology', fr: 'Anthologie de lecture primaire',
    descEn: 'Local-only fixture that is featured and French-only, covering the second featured slot.',
    descFr: 'Donnée locale mise en avant et uniquement en français, couvrant le second emplacement vedette.',
  },
];

/**
 * One demo title per public classification state (CLIENT-3 C05/C15), so the
 * catalogue groups and the cover gate are all visible locally:
 * verified + cover rights (cover shown), verified without rights (cover hidden),
 * other developed (text only), unclassified (not public at all).
 */
const DEMO_CLASSIFICATION = {
  e001: { classification: 'national_book_list_verified', coverRights: true },
  e002: { classification: 'other_developed' },
  e003: { classification: 'unclassified' },
  e004: { classification: 'national_book_list_verified', coverRights: false },
};

/** Single-quote escaping for the demo fixtures' literal SQL. */
const q = (value) => `'${String(value).replace(/'/g, "''")}'`;

const HERO_DEMO_ROWS = [
  {
    id: 'a101', image: 0,
    eyebrowEn: '[DEMO] Cameroon & Central Africa', eyebrowFr: '[DÉMO] Cameroun & Afrique Centrale',
    headlineEn: 'Professional publishing services,', headlineFr: "Services d'édition professionnels,",
    accentEn: 'start to finish.', accentFr: 'du début à la fin.',
    subheadlineEn: 'Editing, proofreading, translation, design, illustration, and printing — delivered under one roof from Yaoundé for authors, institutions, and partners.',
    subheadlineFr: 'Révision, correction, traduction, graphisme, illustration et impression — pris en charge sous un même toit à Yaoundé pour auteurs, institutions et partenaires.',
    primaryEn: 'Explore Our Services', primaryFr: 'Découvrir nos services', primaryHref: '/services',
    secondaryEn: 'Partner With Us', secondaryFr: 'Nous contacter', secondaryHref: '/contact',
  },
  {
    id: 'a102', image: 1,
    eyebrowEn: '[DEMO] National Curriculum Approved', eyebrowFr: '[DÉMO] Conforme aux Programmes Nationaux',
    headlineEn: 'Curriculum-aligned learning materials,', headlineFr: 'Matériels pédagogiques agréés,',
    accentEn: 'built for success.', accentFr: 'conçus pour la réussite.',
    subheadlineEn: 'Primary and secondary textbooks and teaching resources crafted specifically for the Cameroonian educational framework in both English and French.',
    subheadlineFr: 'Manuels scolaires du primaire et du secondaire développés selon le socle éducatif camerounais, disponibles en français et en anglais.',
    primaryEn: 'Browse Full Catalogue', primaryFr: 'Consulter le catalogue', primaryHref: '/catalogue',
    secondaryEn: 'Why Choose Us', secondaryFr: 'Pourquoi nous choisir', secondaryHref: '/why-choose-us',
  },
  {
    id: 'a103', image: 2,
    eyebrowEn: '[DEMO] Yaoundé Editorial Hub', eyebrowFr: '[DÉMO] Centre Éditorial de Yaoundé',
    headlineEn: 'Native bilingual expertise,', headlineFr: 'Expertise éditoriale bilingue,',
    accentEn: 'in English and French.', accentFr: 'en français et en anglais.',
    subheadlineEn: 'Our in-house editorial team in Tsinga combines linguistic precision with deep cultural context to elevate every manuscript across both official languages.',
    subheadlineFr: 'Notre équipe éditoriale à Tsinga allie précision linguistique et ancrage culturel pour enrichir chaque manuscrit dans les deux langues officielles.',
    primaryEn: 'Learn About Our Team', primaryFr: 'Découvrir notre équipe', primaryHref: '/about',
    secondaryEn: 'Get in Touch', secondaryFr: 'Prendre contact', secondaryHref: '/contact',
  },
  {
    id: 'a104', image: 3,
    eyebrowEn: '[DEMO] 60 Years of African Publishing Excellence', eyebrowFr: "[DÉMO] 60 Ans d'Excellence Éditoriale en Afrique",
    headlineEn: 'Rooted in Central Africa,', headlineFr: 'Ancré en Afrique centrale,',
    accentEn: 'backed by six decades.', accentFr: 'fort de six décennies.',
    subheadlineEn: 'Leveraging sixty years of continental publishing leadership from Longhorn Publishers PLC to deliver uncompromising quality, accuracy, and trust.',
    subheadlineFr: 'Forts de soixante ans de leadership éditorial continental au sein de Longhorn Publishers PLC, nous garantissons une qualité et une rigueur irréprochables.',
    primaryEn: 'Why Choose Longhorn', primaryFr: 'Pourquoi choisir Longhorn', primaryHref: '/why-choose-us',
    secondaryEn: 'View Latest News', secondaryFr: 'Toutes les actualités', secondaryHref: '/news',
  },
];

function heroDemoSql(imageKeys) {
  return `
INSERT INTO homepage_hero_slides (
  id, homepage_id, sort_order, image_id,
  eyebrow_en, eyebrow_fr, headline_en, headline_fr,
  headline_accent_en, headline_accent_fr, subheadline_en, subheadline_fr,
  primary_cta_label_en, primary_cta_label_fr, primary_cta_href,
  secondary_cta_label_en, secondary_cta_label_fr, secondary_cta_href,
  enabled, is_demo
)
VALUES
${HERO_DEMO_ROWS.map((row, index) => `  (
    '00000000-0000-4000-8000-00000000${row.id}', 'default', ${100 + index},
    ${imageKeys[row.image] ? q(imageKeys[row.image]) : 'NULL'},
    ${q(row.eyebrowEn)}, ${q(row.eyebrowFr)},
    ${q(row.headlineEn)}, ${q(row.headlineFr)},
    ${q(row.accentEn)}, ${q(row.accentFr)},
    ${q(row.subheadlineEn)}, ${q(row.subheadlineFr)},
    ${q(row.primaryEn)}, ${q(row.primaryFr)}, ${q(row.primaryHref)},
    ${q(row.secondaryEn)}, ${q(row.secondaryFr)}, ${q(row.secondaryHref)},
    true, true
  )`).join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  image_id = EXCLUDED.image_id,
  eyebrow_en = EXCLUDED.eyebrow_en,
  eyebrow_fr = EXCLUDED.eyebrow_fr,
  headline_en = EXCLUDED.headline_en,
  headline_fr = EXCLUDED.headline_fr,
  headline_accent_en = EXCLUDED.headline_accent_en,
  headline_accent_fr = EXCLUDED.headline_accent_fr,
  subheadline_en = EXCLUDED.subheadline_en,
  subheadline_fr = EXCLUDED.subheadline_fr,
  primary_cta_label_en = EXCLUDED.primary_cta_label_en,
  primary_cta_label_fr = EXCLUDED.primary_cta_label_fr,
  primary_cta_href = EXCLUDED.primary_cta_href,
  secondary_cta_label_en = EXCLUDED.secondary_cta_label_en,
  secondary_cta_label_fr = EXCLUDED.secondary_cta_label_fr,
  secondary_cta_href = EXCLUDED.secondary_cta_href,
  enabled = true,
  is_demo = true,
  updated_at = now()
WHERE homepage_hero_slides.is_demo = true;
`;
}

/**
 * News fixtures.
 *
 * The news page is a plain three-column grid with no pagination, so the set is
 * sized to fill more than one row and to cover all four values of the
 * `news_articles` category CHECK constraint, which drives the pill label and
 * the card icon. One row deliberately has a NULL publish_date to exercise the
 * conditional <time> element and the `NULLS LAST` ordering, and one stays
 * unpublished so the `published` filter is proven rather than assumed.
 */
const NEWS_DEMO_ROWS = [
  {
    id: 'f001', slug: 'demo-yaounde-editorial-desk', category: 'company_news', published: true, days: 3,
    en: 'Longhorn Cameroon opens its Yaounde editorial desk',
    fr: 'Longhorn Cameroun ouvre son bureau éditorial de Yaoundé',
    excerptEn: 'Synthetic fixture — not a real announcement.',
    excerptFr: "Donnée fictive — il ne s'agit pas d'une véritable annonce.",
  },
  {
    id: 'f002', slug: 'demo-bilingual-primary-series', category: 'new_titles', published: true, days: 10,
    en: 'Bilingual primary series enters production',
    fr: 'La collection primaire bilingue entre en production',
    excerptEn: 'Synthetic fixture — not a real title announcement.',
    excerptFr: "Donnée fictive — il ne s'agit pas d'une véritable parution.",
  },
  {
    id: 'f003', slug: 'demo-unpublished-draft', category: 'events', published: false, days: null,
    en: 'Unpublished draft that must never render',
    fr: "Brouillon non publié qui ne doit jamais s'afficher",
    excerptEn: 'Draft fixture — must not appear in any list or detail route.',
    excerptFr: 'Brouillon — ne doit apparaître dans aucune liste ni page de détail.',
  },
  {
    id: 'f004', slug: 'demo-ministry-curriculum-partnership', category: 'partnerships', published: true, days: 17,
    en: 'Curriculum partnership expands across the Centre region',
    fr: 'Le partenariat pédagogique s’étend dans la région du Centre',
    excerptEn: 'Synthetic fixture — no real partnership is described.',
    excerptFr: 'Donnée fictive — aucun partenariat réel n’est décrit.',
  },
  {
    id: 'f005', slug: 'demo-teacher-workshop-douala', category: 'events', published: true, days: 24,
    en: 'Teacher workshop series scheduled in Douala',
    fr: 'Série d’ateliers pour enseignants prévue à Douala',
    excerptEn: 'Synthetic fixture — no real event is scheduled.',
    excerptFr: 'Donnée fictive — aucun événement réel n’est programmé.',
  },
  {
    id: 'f006', slug: 'demo-secondary-science-catalogue', category: 'new_titles', published: true, days: 38,
    en: 'Secondary science catalogue enters second printing',
    fr: 'Le catalogue de sciences du secondaire est réimprimé',
    excerptEn: 'Synthetic fixture — no real print run is described.',
    excerptFr: 'Donnée fictive — aucun tirage réel n’est décrit.',
  },
  {
    id: 'f007', slug: 'demo-distribution-network', category: 'company_news', published: true, days: 52,
    en: 'Distribution network reaches additional regional depots',
    fr: 'Le réseau de distribution atteint de nouveaux dépôts régionaux',
    excerptEn: 'Synthetic fixture — no real distribution claim is made.',
    excerptFr: 'Donnée fictive — aucune affirmation réelle sur la distribution.',
  },
  {
    id: 'f008', slug: 'demo-illustration-studio-collaboration', category: 'partnerships', published: true, days: 71,
    en: 'Illustration studio collaboration enters its second year',
    fr: 'La collaboration avec le studio d’illustration entre dans sa deuxième année',
    excerptEn: 'Synthetic fixture — no real collaboration is described.',
    excerptFr: 'Donnée fictive — aucune collaboration réelle n’est décrite.',
  },
  {
    // Undated on purpose: `publishedOn` returns '' and the card omits <time>,
    // and `ORDER BY publish_date DESC NULLS LAST` must sort it to the end.
    id: 'f009', slug: 'demo-undated-notice', category: 'company_news', published: true, days: null,
    en: 'Undated notice used to check missing publish dates',
    fr: 'Avis sans date servant à vérifier les dates de publication manquantes',
    excerptEn: 'Synthetic fixture with no publish date.',
    excerptFr: 'Donnée fictive sans date de publication.',
  },
];

const NEWS_DEMO_SQL = `
INSERT INTO news_articles (
  id, headline_en, headline_fr, category, publish_date, hero_image_id,
  body_en, body_fr, excerpt_en, excerpt_fr, slug, published, is_demo
)
VALUES
${NEWS_DEMO_ROWS.map((r) => `  (
    '00000000-0000-4000-8000-00000000${r.id}',
    ${q(`[DEMO] ${r.en}`)},
    ${q(`[DÉMO] ${r.fr}`)},
    '${r.category}',
    ${r.days === null ? 'NULL' : `now() - interval '${r.days} days'`},
    NULL,
    ${q(`Local-only fixture body for "${r.en}". Used to verify the news detail route, bilingual typography and long-form layout. This text is synthetic and describes no real event.`)},
    ${q(`Corps de texte local pour « ${r.fr} ». Sert à vérifier la page d'actualité, la typographie bilingue et la mise en page longue. Ce texte est fictif et ne décrit aucun événement réel.`)},
    ${q(r.excerptEn)},
    ${q(r.excerptFr)},
    '${r.slug}', ${r.published}, true
  )`).join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  headline_en = EXCLUDED.headline_en,
  headline_fr = EXCLUDED.headline_fr,
  category = EXCLUDED.category,
  publish_date = EXCLUDED.publish_date,
  hero_image_id = EXCLUDED.hero_image_id,
  body_en = EXCLUDED.body_en,
  body_fr = EXCLUDED.body_fr,
  excerpt_en = EXCLUDED.excerpt_en,
  excerpt_fr = EXCLUDED.excerpt_fr,
  slug = EXCLUDED.slug,
  published = EXCLUDED.published,
  is_demo = true,
  updated_at = now()
WHERE news_articles.is_demo = true;
`;

export function demoSeedSql(
  hasProductCode,
  hasNewsDemo = false,
  coverKeys = [],
  hasHeroDemo = false,
  heroImageKeys = [],
  hasClassification = false,
) {
  const classColumns = hasClassification
    ? ', classification, booklist_evidence_ref, booklist_verified_by, booklist_verified_at, cover_rights_approved' : '';
  const classValues = (r) => {
    if (!hasClassification) return '';
    const c = DEMO_CLASSIFICATION[r.id];
    return c.classification === 'national_book_list_verified'
      ? `, 'national_book_list_verified', '[DEMO] synthetic fixture — not real booklist evidence', '[DEMO] seed', DATE '2026-01-01', ${c.coverRights}`
      : `, '${c.classification}', NULL, NULL, NULL, false`;
  };
  const classUpdate = hasClassification
    ? `,\n  classification = EXCLUDED.classification,\n  booklist_evidence_ref = EXCLUDED.booklist_evidence_ref,\n  booklist_verified_by = EXCLUDED.booklist_verified_by,\n  booklist_verified_at = EXCLUDED.booklist_verified_at,\n  cover_rights_approved = EXCLUDED.cover_rights_approved` : '';
  const productColumn = hasProductCode ? ', product_code' : '';
  const productValue = (code) => hasProductCode ? `, '${code}'` : '';
  const productUpdate = hasProductCode ? ', product_code = EXCLUDED.product_code' : '';
  return `
BEGIN;

INSERT INTO subjects (id, name_en, name_fr, is_demo)
VALUES
  ('00000000-0000-4000-8000-00000000d001', '[DEMO] Mathematics', '[DÉMO] Mathématiques', true),
  ('00000000-0000-4000-8000-00000000d002', '[DEMO] Languages', '[DÉMO] Langues', true),
  ('00000000-0000-4000-8000-00000000d003', '[DEMO] Science', '[DÉMO] Sciences', true)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_fr = EXCLUDED.name_fr,
  is_demo = true
WHERE subjects.is_demo = true;

INSERT INTO catalogue_titles (
  id, title_en, title_fr, cover_image_id, level, subject_id, languages,
  description_en, description_fr, curriculum_alignment_en,
  curriculum_alignment_fr, slug, featured, published, is_demo${productColumn}${classColumns}
)
VALUES
${CATALOGUE_DEMO_ROWS.map((r, i) => `  (
    '00000000-0000-4000-8000-00000000${r.id}',
    ${q(`[DEMO] ${r.en}`)},
    ${q(`[DÉMO] ${r.fr}`)},
    ${coverKeys[i] ? q(coverKeys[i]) : 'NULL'},
    '${r.level}', '00000000-0000-4000-8000-00000000${r.subject}', '${JSON.stringify(r.languages)}'::jsonb,
    ${q(r.descEn)},
    ${q(r.descFr)},
    'Synthetic demonstration metadata — not approved curriculum content.',
    'Métadonnées de démonstration fictives — contenu pédagogique non approuvé.',
    '${r.slug}', ${r.featured}, true, true${productValue(r.code)}${classValues(r)}
  )`).join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_fr = EXCLUDED.title_fr,
  cover_image_id = EXCLUDED.cover_image_id,
  level = EXCLUDED.level,
  subject_id = EXCLUDED.subject_id,
  languages = EXCLUDED.languages,
  description_en = EXCLUDED.description_en,
  description_fr = EXCLUDED.description_fr,
  curriculum_alignment_en = EXCLUDED.curriculum_alignment_en,
  curriculum_alignment_fr = EXCLUDED.curriculum_alignment_fr,
  slug = EXCLUDED.slug,
  featured = EXCLUDED.featured,
  published = EXCLUDED.published,
  is_demo = true${productUpdate}${classUpdate},
  updated_at = now()
WHERE catalogue_titles.is_demo = true;
${hasNewsDemo ? NEWS_DEMO_SQL : ''}
${hasHeroDemo ? heroDemoSql(heroImageKeys) : ''}
COMMIT;
`;
}

/**
 * Copies the demo covers into the local Netlify Blobs store.
 *
 * Deliberately a filesystem write rather than `netlify blobs:set`: that command
 * has no local/production switch and, with no dev server running, targets the
 * real site's store. Writing under `.netlify/blobs-serve` cannot reach
 * production at all, which is the property that matters for unapproved client
 * artwork.
 *
 * Layout mirrors @netlify/blobs' local server. Site-scoped stores — what
 * `getStore({ name })` returns, and what media.mts uses — live under a
 * `site:`-prefixed directory; the bare name is a different namespace the
 * function will never read:
 *   <dir>/entries/<siteID>/site:<store>/<key>    file contents
 *   <dir>/metadata/<siteID>/site:<store>/<key>   JSON, matching an admin upload
 *
 * Returns the keys actually written, so a checkout without the source folder
 * seeds with NULL covers instead of pointing at blobs that do not exist.
 */
export async function writeLocalDemoCovers({ fs, path, projectRoot, sourceDir, siteId, store = 'longhorn-media' }) {
  const blobsRoot = path.join(projectRoot, '.netlify', 'blobs-serve');
  const storeDir = `site:${store}`;
  const written = [];

  for (const { file, key } of DEMO_COVERS) {
    const source = path.join(sourceDir, file);
    let data;
    try {
      data = await fs.readFile(source);
    } catch {
      written.push(null);
      continue;
    }

    const dataPath = path.join(blobsRoot, 'entries', siteId, storeDir, ...key.split('/'));
    const metadataPath = path.join(blobsRoot, 'metadata', siteId, storeDir, ...key.split('/'));

    // Refuse to write anywhere outside the local store, however sourceDir or
    // siteId were supplied.
    if (!path.resolve(dataPath).startsWith(path.resolve(blobsRoot) + path.sep)) {
      throw new Error(`Refusing demo seed: cover path ${dataPath} escapes the local blob store.`);
    }

    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, data);
    await fs.mkdir(path.dirname(metadataPath), { recursive: true });
    await fs.writeFile(metadataPath, JSON.stringify({
      contentType: 'image/png',
      originalName: file,
      uploadedAt: new Date().toISOString(),
    }));
    written.push(key);
  }

  return written;
}

/** Copy committed hero assets into the local media store used by /api/media. */
export async function writeLocalDemoHeroImages({ fs, path, projectRoot, sourceDir, siteId, store = 'longhorn-media' }) {
  const blobsRoot = path.join(projectRoot, '.netlify', 'blobs-serve');
  const storeDir = `site:${store}`;
  const written = [];

  for (const { file, key } of DEMO_HERO_IMAGES) {
    const source = path.join(sourceDir, file);
    let data;
    try {
      data = await fs.readFile(source);
    } catch {
      written.push(null);
      continue;
    }

    const dataPath = path.join(blobsRoot, 'entries', siteId, storeDir, ...key.split('/'));
    const metadataPath = path.join(blobsRoot, 'metadata', siteId, storeDir, ...key.split('/'));
    if (!path.resolve(dataPath).startsWith(path.resolve(blobsRoot) + path.sep)) {
      throw new Error(`Refusing demo seed: hero image path ${dataPath} escapes the local blob store.`);
    }

    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, data);
    await fs.mkdir(path.dirname(metadataPath), { recursive: true });
    await fs.writeFile(metadataPath, JSON.stringify({
      contentType: 'image/jpeg',
      originalName: file,
      uploadedAt: new Date().toISOString(),
    }));
    written.push(key);
  }

  return written;
}
