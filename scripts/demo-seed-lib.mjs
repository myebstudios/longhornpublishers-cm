import { isIP } from 'node:net';

const DEPLOY_CONTEXTS = new Set(['production', 'deploy-preview', 'branch-deploy']);

export function assertLocalSeedEnvironment(env) {
  const problems = [];
  if (env.NETLIFY_LOCAL !== 'true') problems.push('NETLIFY_LOCAL must equal true');
  if (env.CONTEXT !== 'dev') problems.push('CONTEXT must equal dev');
  if (env.ALLOW_LOCAL_DEMO_SEED !== 'yes') problems.push('ALLOW_LOCAL_DEMO_SEED must equal yes');
  if (env.NETLIFY === 'true') problems.push('NETLIFY must not equal true');
  if (env.CI) problems.push('CI must be unset');
  if (DEPLOY_CONTEXTS.has(env.CONTEXT ?? '')) problems.push(`deployment context ${env.CONTEXT} is forbidden`);
  for (const key of ['DEPLOY_ID', 'DEPLOY_URL', 'DEPLOY_PRIME_URL']) {
    if (env[key]) problems.push(`${key} must be unset`);
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
 * News fixtures. Two published rows exercise the list, both locales and the
 * detail route; the third stays unpublished so the `published` filter is
 * actually proven rather than assumed. Categories are spread across the
 * `news_articles` CHECK constraint values.
 */
const NEWS_DEMO_SQL = `
INSERT INTO news_articles (
  id, headline_en, headline_fr, category, publish_date, hero_image_id,
  body_en, body_fr, excerpt_en, excerpt_fr, slug, published, is_demo
)
VALUES
  (
    '00000000-0000-4000-8000-00000000f001',
    '[DEMO] Longhorn Cameroon opens its Yaounde editorial desk',
    '[DÉMO] Longhorn Cameroun ouvre son bureau éditorial de Yaoundé',
    'company_news', now() - interval '3 days', NULL,
    'Local-only fixture body used to verify the news detail route, bilingual typography and long-form layout. This text is synthetic and describes no real event.',
    'Corps de texte local servant uniquement à vérifier la page d''actualité, la typographie bilingue et la mise en page longue. Ce texte est fictif et ne décrit aucun événement réel.',
    'Synthetic fixture — not a real announcement.',
    'Donnée fictive — il ne s''agit pas d''une véritable annonce.',
    'demo-yaounde-editorial-desk', true, true
  ),
  (
    '00000000-0000-4000-8000-00000000f002',
    '[DEMO] Bilingual primary series enters production',
    '[DÉMO] La collection primaire bilingue entre en production',
    'new_titles', now() - interval '10 days', NULL,
    'Local-only fixture body used to verify list ordering by publish date and category labelling in both locales. This text is synthetic and describes no real title.',
    'Corps de texte local servant à vérifier le tri par date de publication et l''affichage des catégories dans les deux langues. Ce texte est fictif et ne décrit aucun ouvrage réel.',
    'Synthetic fixture — not a real title announcement.',
    'Donnée fictive — il ne s''agit pas d''une véritable parution.',
    'demo-bilingual-primary-series', true, true
  ),
  (
    '00000000-0000-4000-8000-00000000f003',
    '[DEMO] Unpublished draft that must never render',
    '[DÉMO] Brouillon non publié qui ne doit jamais s''afficher',
    'events', NULL, NULL,
    'Local-only fixture body. If this string appears on any rendered page, the published filter has regressed.',
    'Corps de texte local. Si ce texte apparaît sur une page, le filtre de publication est cassé.',
    'Draft fixture — must not appear in any list or detail route.',
    'Brouillon — ne doit apparaître dans aucune liste ni page de détail.',
    'demo-unpublished-draft', false, true
  )
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
