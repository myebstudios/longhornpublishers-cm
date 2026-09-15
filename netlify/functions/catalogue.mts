import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { isProductCodeConflict, parseProductCode } from './_shared/catalogue-product-code';
import { json, methodNotAllowed } from './_shared/http';
import { rebuildIfPublic } from './_shared/rebuild';

const db = getDatabase();

export default async function handler(req: Request) {
  const denied = await requireAdmin(); if (denied) return denied;
  const id = new URL(req.url).searchParams.get('id');
  if (req.method === 'GET') {
    const rows = await db.sql`SELECT id, product_code, title_en, title_fr, slug, level, subject_id, languages, cover_image_id, description_en, description_fr, curriculum_alignment_en, curriculum_alignment_fr, featured, published, created_at, updated_at FROM catalogue_titles ORDER BY updated_at DESC`;
    return json(rows);
  }
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return methodNotAllowed();
  if (req.method !== 'POST' && !id) return json({ error: 'A catalogue id is required.' }, { status: 400 });
  if (req.method === 'DELETE') {
    const [deleted] = await db.sql`DELETE FROM catalogue_titles WHERE id = ${id} RETURNING id, published`;
    if (!deleted) return json({ error: 'Catalogue title not found.' }, { status: 404 });
    await rebuildIfPublic('delete', { wasPublished: deleted.published }, 'catalogue title deleted');
    return json({ deleted: id });
  }
  const body = await req.json();
  if (!body.title_en || !body.title_fr || !body.slug || !['primary', 'secondary'].includes(body.level) || !body.description_en || !body.description_fr) return json({ error: 'Provide title, slug, level, and description in both languages.' }, { status: 400 });
  const productCode = parseProductCode(body.product_code);
  if (!productCode.ok) return json({ error: productCode.error }, { status: 400 });
  const languages = Array.isArray(body.languages) ? body.languages.filter((value: unknown) => value === 'en' || value === 'fr') : [];
  const subjectId = body.subject_id || null;
  const coverImageId = body.cover_image_id || null;
  const curriculumEn = body.curriculum_alignment_en || null;
  const curriculumFr = body.curriculum_alignment_fr || null;
  if (req.method === 'PUT') {
    const [before] = await db.sql`SELECT published FROM catalogue_titles WHERE id = ${id}`;
    if (!before) return json({ error: 'Catalogue title not found.' }, { status: 404 });
    let updated;
    try {
      [updated] = await db.sql`UPDATE catalogue_titles SET product_code = ${productCode.value}, title_en = ${body.title_en}, title_fr = ${body.title_fr}, slug = ${body.slug}, level = ${body.level}, subject_id = ${subjectId}, languages = ${JSON.stringify(languages)}, cover_image_id = ${coverImageId}, description_en = ${body.description_en}, description_fr = ${body.description_fr}, curriculum_alignment_en = ${curriculumEn}, curriculum_alignment_fr = ${curriculumFr}, featured = ${Boolean(body.featured)}, published = ${Boolean(body.published)}, updated_at = now() WHERE id = ${id} RETURNING *`;
    } catch (error) {
      if (isProductCodeConflict(error)) {
        return json({ error: 'That ISBN / product code is already assigned to another title.' }, { status: 409 });
      }
      throw error;
    }
    if (!updated) return json({ error: 'Catalogue title not found.' }, { status: 404 });
    await rebuildIfPublic('update', { wasPublished: before.published, isPublished: updated.published }, 'catalogue title updated');
    return json(updated);
  }
  let created;
  try {
    [created] = await db.sql`INSERT INTO catalogue_titles (product_code, title_en, title_fr, slug, level, subject_id, languages, cover_image_id, description_en, description_fr, curriculum_alignment_en, curriculum_alignment_fr, featured, published) VALUES (${productCode.value}, ${body.title_en}, ${body.title_fr}, ${body.slug}, ${body.level}, ${subjectId}, ${JSON.stringify(languages)}, ${coverImageId}, ${body.description_en}, ${body.description_fr}, ${curriculumEn}, ${curriculumFr}, ${Boolean(body.featured)}, ${Boolean(body.published)}) RETURNING *`;
  } catch (error) {
    if (isProductCodeConflict(error)) {
      return json({ error: 'That ISBN / product code is already assigned to another title.' }, { status: 409 });
    }
    throw error;
  }
  await rebuildIfPublic('create', { isPublished: created.published }, 'catalogue title created');
  return json(created, { status: 201 });
}

export const config: Config = { path: '/api/catalogue-admin' };
