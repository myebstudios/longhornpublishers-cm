import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { validateContact } from './_shared/cms-validation';
import { json, methodNotAllowed } from './_shared/http';
import { rebuildIfPublic } from './_shared/rebuild';

const db = getDatabase();

export default async function handler(req: Request) {
  const denied = await requireAdmin(); if (denied) return denied;
  if (req.method === 'GET') {
    const [row] = await db.sql`SELECT * FROM contact_settings WHERE id = 'default'`;
    return json(row ?? null);
  }
  if (req.method !== 'PUT') return methodNotAllowed('GET, PUT');
  const parsed = validateContact(await req.json().catch(() => null));
  if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
  const value = parsed.value;
  const [before] = await db.sql`SELECT published FROM contact_settings WHERE id = 'default'`;
  const [saved] = await db.sql`
    INSERT INTO contact_settings (id, hero_copy_en, hero_copy_fr, project_type_options, map_lat, map_lng, published)
    VALUES ('default', ${value.hero_copy_en}, ${value.hero_copy_fr}, ${JSON.stringify(value.project_type_options)}, ${value.map_lat}, ${value.map_lng}, ${value.published})
    ON CONFLICT (id) DO UPDATE SET hero_copy_en = EXCLUDED.hero_copy_en, hero_copy_fr = EXCLUDED.hero_copy_fr,
      project_type_options = EXCLUDED.project_type_options, map_lat = EXCLUDED.map_lat, map_lng = EXCLUDED.map_lng, published = EXCLUDED.published, updated_at = now()
    RETURNING *
  `;
  await rebuildIfPublic('update', { wasPublished: before?.published === true, isPublished: saved.published === true }, 'contact settings updated');
  return json(saved);
}

export const config: Config = { path: '/api/contact-settings-admin' };
