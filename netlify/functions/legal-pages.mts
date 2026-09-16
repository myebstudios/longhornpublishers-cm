import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { validateLegalPage } from './_shared/cms-validation';
import { json, methodNotAllowed } from './_shared/http';
import { rebuildIfPublic } from './_shared/rebuild';

const db = getDatabase();

export default async function handler(req: Request) {
  const denied = await requireAdmin(); if (denied) return denied;
  if (req.method === 'GET') return json(await db.sql`SELECT * FROM legal_pages ORDER BY page`);
  if (req.method !== 'PUT') return methodNotAllowed('GET, PUT');
  const parsed = validateLegalPage(await req.json().catch(() => null));
  if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
  const value = parsed.value;
  const [before] = await db.sql`SELECT published FROM legal_pages WHERE page = ${value.page}`;
  const [saved] = await db.sql`
    INSERT INTO legal_pages (page, body_en, body_fr, published) VALUES (${value.page}, ${value.body_en}, ${value.body_fr}, ${value.published})
    ON CONFLICT (page) DO UPDATE SET body_en = EXCLUDED.body_en, body_fr = EXCLUDED.body_fr, published = EXCLUDED.published, updated_at = now()
    RETURNING *
  `;
  await rebuildIfPublic('update', { wasPublished: before?.published === true, isPublished: saved.published === true }, `${value.page} updated`);
  return json(saved);
}

export const config: Config = { path: '/api/legal-pages-admin' };
