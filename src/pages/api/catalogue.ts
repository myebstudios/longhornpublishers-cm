import type { APIRoute } from 'astro';
import { getDatabase } from '@netlify/database';
import { canRenderLocalDemoContent } from '../../lib/demo-content';

export const prerender = false;

export const GET: APIRoute = async () => {
  const db = getDatabase();
  const rows = canRenderLocalDemoContent()
    ? await db.sql`SELECT id, product_code, title_en, title_fr, slug, level, subject_id, languages, classification, CASE WHEN classification = 'national_book_list_verified' AND cover_rights_approved THEN cover_image_id END AS cover_image_id, description_en, description_fr, curriculum_alignment_en, curriculum_alignment_fr, featured, published FROM catalogue_titles WHERE published = true AND classification IN ('national_book_list_verified', 'other_developed') ORDER BY created_at DESC`
    : await db.sql`SELECT id, product_code, title_en, title_fr, slug, level, subject_id, languages, classification, CASE WHEN classification = 'national_book_list_verified' AND cover_rights_approved THEN cover_image_id END AS cover_image_id, description_en, description_fr, curriculum_alignment_en, curriculum_alignment_fr, featured, published FROM catalogue_titles WHERE published = true AND is_demo = false AND classification IN ('national_book_list_verified', 'other_developed') ORDER BY created_at DESC`;
  return Response.json(rows, { headers: { 'Cache-Control': 'no-store' } });
};
