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

export function demoSeedSql(hasProductCode, hasNewsDemo = false) {
  const productColumn = hasProductCode ? ', product_code' : '';
  const productValue = (code) => hasProductCode ? `, '${code}'` : '';
  const productUpdate = hasProductCode ? ', product_code = EXCLUDED.product_code' : '';
  return `
BEGIN;

INSERT INTO subjects (id, name_en, name_fr, is_demo)
VALUES
  ('00000000-0000-4000-8000-00000000d001', '[DEMO] Mathematics', '[DÉMO] Mathématiques', true),
  ('00000000-0000-4000-8000-00000000d002', '[DEMO] Languages', '[DÉMO] Langues', true)
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
  (
    '00000000-0000-4000-8000-00000000e001',
    '[DEMO] Primary Mathematics Workbook',
    '[DÉMO] Cahier de mathématiques primaire',
    NULL, 'primary', '00000000-0000-4000-8000-00000000d001', '["en","fr"]'::jsonb,
    'Local-only fixture used to verify bilingual catalogue cards and detail routes.',
    'Donnée locale servant uniquement à vérifier les fiches et pages bilingues du catalogue.',
    'Synthetic demonstration metadata — not approved curriculum content.',
    'Métadonnées de démonstration fictives — contenu pédagogique non approuvé.',
    'demo-primary-mathematics-workbook', true, true, true${productValue('DEMO-CAT-001')}
  ),
  (
    '00000000-0000-4000-8000-00000000e002',
    '[DEMO] Bilingual Reading Practice',
    '[DÉMO] Exercices de lecture bilingue',
    NULL, 'secondary', '00000000-0000-4000-8000-00000000d002', '["en","fr"]'::jsonb,
    'Local-only fixture used to exercise catalogue filtering and localization.',
    'Donnée locale servant uniquement à tester le filtrage et la localisation du catalogue.',
    'Synthetic demonstration metadata — not approved curriculum content.',
    'Métadonnées de démonstration fictives — contenu pédagogique non approuvé.',
    'demo-bilingual-reading-practice', false, true, true${productValue('DEMO-CAT-002')}
  )
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
