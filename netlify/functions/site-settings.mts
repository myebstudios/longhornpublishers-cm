import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { validateSiteSettings } from './_shared/cms-validation';
import { json, methodNotAllowed } from './_shared/http';
import { purgeMedia } from './_shared/media-cache';
import { requestRebuild } from './_shared/rebuild';

const db = getDatabase();

export default async function handler(req: Request) {
  const denied = await requireAdmin(); if (denied) return denied;
  if (req.method === 'GET') {
    const [row] = await db.sql`SELECT * FROM site_settings WHERE id = 'default'`;
    return json(row ?? null);
  }
  if (req.method !== 'PUT') return methodNotAllowed('GET, PUT');
  const parsed = validateSiteSettings(await req.json().catch(() => null));
  if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
  const value = parsed.value;
  const [before] = await db.sql`SELECT * FROM site_settings WHERE id = 'default'`;
  const comparable = before ? { ...before, id: undefined, updated_at: undefined } : null;
  if (comparable && JSON.stringify(comparable) === JSON.stringify(value)) return json(before);
  const [saved] = await db.sql`
    INSERT INTO site_settings (
      id, company_name_en, company_name_fr, tagline_en, tagline_fr, address, phone_1, phone_2, email,
      social_links, footer_tagline_en, footer_tagline_fr, newsletter_copy_en, newsletter_copy_fr,
      parent_company_url, seo_default_title, seo_default_description, og_image_id
    ) VALUES (
      'default', ${value.company_name_en}, ${value.company_name_fr}, ${value.tagline_en}, ${value.tagline_fr},
      ${value.address}, ${value.phone_1}, ${value.phone_2}, ${value.email}, ${JSON.stringify(value.social_links)},
      ${value.footer_tagline_en}, ${value.footer_tagline_fr}, ${value.newsletter_copy_en}, ${value.newsletter_copy_fr},
      ${value.parent_company_url}, ${value.seo_default_title}, ${value.seo_default_description}, ${value.og_image_id}
    ) ON CONFLICT (id) DO UPDATE SET
      company_name_en = EXCLUDED.company_name_en, company_name_fr = EXCLUDED.company_name_fr,
      tagline_en = EXCLUDED.tagline_en, tagline_fr = EXCLUDED.tagline_fr, address = EXCLUDED.address,
      phone_1 = EXCLUDED.phone_1, phone_2 = EXCLUDED.phone_2, email = EXCLUDED.email,
      social_links = EXCLUDED.social_links, footer_tagline_en = EXCLUDED.footer_tagline_en,
      footer_tagline_fr = EXCLUDED.footer_tagline_fr, newsletter_copy_en = EXCLUDED.newsletter_copy_en,
      newsletter_copy_fr = EXCLUDED.newsletter_copy_fr, parent_company_url = EXCLUDED.parent_company_url,
      seo_default_title = EXCLUDED.seo_default_title, seo_default_description = EXCLUDED.seo_default_description,
      og_image_id = EXCLUDED.og_image_id, updated_at = now()
    RETURNING *
  `;
  await purgeMedia(before?.og_image_id, saved.og_image_id);
  await requestRebuild('site settings updated');
  return json(saved);
}

export const config: Config = { path: '/api/site-settings-admin' };
