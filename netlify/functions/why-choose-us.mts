import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { validateWhy } from './_shared/cms-validation';
import { json, methodNotAllowed } from './_shared/http';
import { rebuildIfPublic } from './_shared/rebuild';

const db = getDatabase();

export default async function handler(req: Request) {
  const denied = await requireAdmin(); if (denied) return denied;
  if (req.method === 'GET') {
    const [row] = await db.sql`SELECT * FROM why_choose_us WHERE id = 'default'`;
    return json(row ?? null);
  }
  if (req.method !== 'PUT') return methodNotAllowed('GET, PUT');
  const parsed = validateWhy(await req.json().catch(() => null));
  if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
  const value = parsed.value;
  const [before] = await db.sql`SELECT published FROM why_choose_us WHERE id = 'default'`;
  const [saved] = await db.sql`
    INSERT INTO why_choose_us (id, local_presence_copy_en, local_presence_copy_fr, quality_commitment_items, published)
    VALUES ('default', ${value.local_presence_copy_en}, ${value.local_presence_copy_fr}, ${JSON.stringify(value.quality_commitment_items)}, ${value.published})
    ON CONFLICT (id) DO UPDATE SET
      local_presence_copy_en = EXCLUDED.local_presence_copy_en,
      local_presence_copy_fr = EXCLUDED.local_presence_copy_fr,
      quality_commitment_items = EXCLUDED.quality_commitment_items,
      published = EXCLUDED.published,
      updated_at = now()
    RETURNING *
  `;
  await rebuildIfPublic('update', { wasPublished: before?.published === true, isPublished: saved.published === true }, 'why choose us page updated');
  return json(saved);
}

export const config: Config = { path: '/api/why-choose-us-admin' };
