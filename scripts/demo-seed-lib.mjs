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

/** Single-quote escaping for the demo fixtures' literal SQL. */
const q = (value) => `'${String(value).replace(/'/g, "''")}'`;

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

export function demoSeedSql(hasProductCode, hasNewsDemo = false, coverKeys = []) {
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
  curriculum_alignment_fr, slug, featured, published, is_demo${productColumn}
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
    '${r.slug}', ${r.featured}, true, true${productValue(r.code)}
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
  is_demo = true${productUpdate},
  updated_at = now()
WHERE catalogue_titles.is_demo = true;
${hasNewsDemo ? NEWS_DEMO_SQL : ''}
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
