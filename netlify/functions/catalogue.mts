import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { json, methodNotAllowed } from './_shared/http';

const db = getDatabase();

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    const rows = await db.sql`SELECT id, title_en, title_fr, slug, level, subject_id, languages, cover_image_id, description_en, description_fr, curriculum_alignment_en, curriculum_alignment_fr, featured, published FROM catalogue_titles WHERE published = true ORDER BY created_at DESC`;
    return json(rows);
  }
  if (req.method !== 'POST') return methodNotAllowed();
  const denied = await requireAdmin(); if (denied) return denied;
  const body = await req.json();
  if (!body.title_en || !body.title_fr || !body.slug || !body.level || !body.description_en || !body.description_fr) return json({ error: 'Missing required bilingual title fields.' }, { status: 400 });
  const [created] = await db.sql`INSERT INTO catalogue_titles (title_en, title_fr, slug, level, subject_id, languages, cover_image_id, description_en, description_fr, curriculum_alignment_en, curriculum_alignment_fr, featured, published) VALUES (${body.title_en}, ${body.title_fr}, ${body.slug}, ${body.level}, ${body.subject_id ?? null}, ${JSON.stringify(body.languages ?? [])}, ${body.cover_image_id ?? null}, ${body.description_en}, ${body.description_fr}, ${body.curriculum_alignment_en ?? null}, ${body.curriculum_alignment_fr ?? null}, ${Boolean(body.featured)}, ${Boolean(body.published)}) RETURNING *`;
  return json(created, { status: 201 });
}

export const config: Config = { path: '/api/catalogue-admin' };
