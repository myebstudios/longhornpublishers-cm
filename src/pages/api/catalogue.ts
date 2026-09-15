import type { APIRoute } from 'astro';
import { getDatabase } from '@netlify/database';

export const prerender = false;

export const GET: APIRoute = async () => {
  const db = getDatabase();
  const rows = await db.sql`SELECT id, product_code, title_en, title_fr, slug, level, subject_id, languages, cover_image_id, description_en, description_fr, curriculum_alignment_en, curriculum_alignment_fr, featured, published FROM catalogue_titles WHERE published = true ORDER BY created_at DESC`;
  return Response.json(rows, { headers: { 'Cache-Control': 'no-store' } });
};
