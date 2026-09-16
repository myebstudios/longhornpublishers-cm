import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { validateAbout } from './_shared/cms-validation';
import { json, methodNotAllowed } from './_shared/http';
import { rebuildIfPublic } from './_shared/rebuild';

const db = getDatabase();

export default async function handler(req: Request) {
  const denied = await requireAdmin(); if (denied) return denied;
  if (req.method === 'GET') {
    const [row] = await db.sql`SELECT * FROM about_page WHERE id = 'default'`;
    return json(row ?? null);
  }
  if (req.method !== 'PUT') return methodNotAllowed('GET, PUT');
  const parsed = validateAbout(await req.json().catch(() => null));
  if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
  const value = parsed.value;
  const [before] = await db.sql`SELECT published FROM about_page WHERE id = 'default'`;
  const [saved] = await db.sql`
    INSERT INTO about_page (
      id, heritage_copy_en, heritage_copy_fr, purpose_en, purpose_fr, vision_en, vision_fr,
      mission_en, mission_fr, values_en, values_fr, team_capacity_blocks, published
    ) VALUES (
      'default', ${value.heritage_copy_en}, ${value.heritage_copy_fr}, ${value.purpose_en}, ${value.purpose_fr},
      ${value.vision_en}, ${value.vision_fr}, ${value.mission_en}, ${value.mission_fr},
      ${value.values_en}, ${value.values_fr}, ${JSON.stringify(value.team_capacity_blocks)}, ${value.published}
    ) ON CONFLICT (id) DO UPDATE SET
      heritage_copy_en = EXCLUDED.heritage_copy_en, heritage_copy_fr = EXCLUDED.heritage_copy_fr,
      purpose_en = EXCLUDED.purpose_en, purpose_fr = EXCLUDED.purpose_fr,
      vision_en = EXCLUDED.vision_en, vision_fr = EXCLUDED.vision_fr,
      mission_en = EXCLUDED.mission_en, mission_fr = EXCLUDED.mission_fr,
      values_en = EXCLUDED.values_en, values_fr = EXCLUDED.values_fr,
      team_capacity_blocks = EXCLUDED.team_capacity_blocks, published = EXCLUDED.published, updated_at = now()
    RETURNING *
  `;
  await rebuildIfPublic('update', { wasPublished: before?.published === true, isPublished: saved.published === true }, 'about page updated');
  return json(saved);
}

export const config: Config = { path: '/api/about-admin' };
