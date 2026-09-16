import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { validateHomepage } from './_shared/cms-validation';
import { json, methodNotAllowed } from './_shared/http';
import { rebuildIfPublic } from './_shared/rebuild';

const db = getDatabase();

export default async function handler(req: Request) {
  const denied = await requireAdmin(); if (denied) return denied;
  if (req.method === 'GET') {
    const [content] = await db.sql`SELECT * FROM homepage_content WHERE id = 'default'`;
    const catalogue = await db.sql`
      SELECT id, product_code, title_en, title_fr, published
      FROM catalogue_titles WHERE is_demo = false ORDER BY title_en
    `;
    return json({ content: content ?? null, catalogue });
  }
  if (req.method !== 'PUT') return methodNotAllowed('GET, PUT');
  const parsed = validateHomepage(await req.json().catch(() => null));
  if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
  const value = parsed.value;
  if (value.featured_catalogue_ids.length) {
    const rows = await db.sql`
      SELECT id FROM catalogue_titles
      WHERE id = ANY(${value.featured_catalogue_ids}::uuid[]) AND published = true AND is_demo = false
    `;
    if (rows.length !== value.featured_catalogue_ids.length) {
      return json({ error: 'Every featured catalogue title must exist and be published.' }, { status: 400 });
    }
  }
  const [before] = await db.sql`SELECT published FROM homepage_content WHERE id = 'default'`;
  const [saved] = await db.sql`
    INSERT INTO homepage_content (
      id, hero_headline_en, hero_headline_fr, hero_subheadline_en, hero_subheadline_fr, hero_image_id,
      hero_cta_label_en, hero_cta_label_fr, who_we_are_copy_en, who_we_are_copy_fr, who_we_are_image_id,
      trust_stats, one_partner_copy_en, one_partner_copy_fr, featured_catalogue_ids, published
    ) VALUES (
      'default', ${value.hero_headline_en}, ${value.hero_headline_fr}, ${value.hero_subheadline_en},
      ${value.hero_subheadline_fr}, ${value.hero_image_id}, ${value.hero_cta_label_en}, ${value.hero_cta_label_fr},
      ${value.who_we_are_copy_en}, ${value.who_we_are_copy_fr}, ${value.who_we_are_image_id},
      ${JSON.stringify(value.trust_stats)}, ${value.one_partner_copy_en}, ${value.one_partner_copy_fr},
      ${JSON.stringify(value.featured_catalogue_ids)}, ${value.published}
    ) ON CONFLICT (id) DO UPDATE SET
      hero_headline_en = EXCLUDED.hero_headline_en, hero_headline_fr = EXCLUDED.hero_headline_fr,
      hero_subheadline_en = EXCLUDED.hero_subheadline_en, hero_subheadline_fr = EXCLUDED.hero_subheadline_fr,
      hero_image_id = EXCLUDED.hero_image_id, hero_cta_label_en = EXCLUDED.hero_cta_label_en,
      hero_cta_label_fr = EXCLUDED.hero_cta_label_fr, who_we_are_copy_en = EXCLUDED.who_we_are_copy_en,
      who_we_are_copy_fr = EXCLUDED.who_we_are_copy_fr, who_we_are_image_id = EXCLUDED.who_we_are_image_id,
      trust_stats = EXCLUDED.trust_stats, one_partner_copy_en = EXCLUDED.one_partner_copy_en,
      one_partner_copy_fr = EXCLUDED.one_partner_copy_fr, featured_catalogue_ids = EXCLUDED.featured_catalogue_ids,
      published = EXCLUDED.published, updated_at = now()
    RETURNING *
  `;
  await rebuildIfPublic('update', { wasPublished: before?.published === true, isPublished: saved.published === true }, 'homepage content updated');
  return json(saved);
}

export const config: Config = { path: '/api/homepage-admin' };
