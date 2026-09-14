import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { json, methodNotAllowed } from './_shared/http';
import { rebuildIfPublic } from './_shared/rebuild';

const db = getDatabase();
const categories = new Set(['company_news', 'new_titles', 'partnerships', 'events']);

export default async function handler(req: Request) {
  const denied = await requireAdmin(); if (denied) return denied;
  const id = new URL(req.url).searchParams.get('id');
  if (req.method === 'GET') {
    return json(await db.sql`SELECT id, headline_en, headline_fr, category, publish_date, hero_image_id, body_en, body_fr, excerpt_en, excerpt_fr, slug, published, created_at, updated_at FROM news_articles ORDER BY publish_date DESC NULLS LAST, updated_at DESC`);
  }
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return methodNotAllowed();
  if (req.method !== 'POST' && !id) return json({ error: 'A news article id is required.' }, { status: 400 });
  if (req.method === 'DELETE') {
    const [deleted] = await db.sql`DELETE FROM news_articles WHERE id = ${id} RETURNING id, published`;
    if (!deleted) return json({ error: 'News article not found.' }, { status: 404 });
    await rebuildIfPublic('delete', { wasPublished: deleted.published }, 'news article deleted');
    return json({ deleted: id });
  }
  const body = await req.json();
  if (!body.headline_en || !body.headline_fr || !body.slug || !categories.has(body.category) || !body.body_en || !body.body_fr || !body.excerpt_en || !body.excerpt_fr) return json({ error: 'Provide headline, excerpt, and article body in both languages, plus a valid category and slug.' }, { status: 400 });
  const publishDate = body.publish_date || null;
  const imageId = body.hero_image_id || null;
  if (req.method === 'PUT') {
    const [before] = await db.sql`SELECT published FROM news_articles WHERE id = ${id}`;
    if (!before) return json({ error: 'News article not found.' }, { status: 404 });
    const [updated] = await db.sql`UPDATE news_articles SET headline_en = ${body.headline_en}, headline_fr = ${body.headline_fr}, category = ${body.category}, publish_date = ${publishDate}, hero_image_id = ${imageId}, body_en = ${body.body_en}, body_fr = ${body.body_fr}, excerpt_en = ${body.excerpt_en}, excerpt_fr = ${body.excerpt_fr}, slug = ${body.slug}, published = ${Boolean(body.published)}, updated_at = now() WHERE id = ${id} RETURNING *`;
    if (!updated) return json({ error: 'News article not found.' }, { status: 404 });
    await rebuildIfPublic('update', { wasPublished: before.published, isPublished: updated.published }, 'news article updated');
    return json(updated);
  }
  const [created] = await db.sql`INSERT INTO news_articles (headline_en, headline_fr, category, publish_date, hero_image_id, body_en, body_fr, excerpt_en, excerpt_fr, slug, published) VALUES (${body.headline_en}, ${body.headline_fr}, ${body.category}, ${publishDate}, ${imageId}, ${body.body_en}, ${body.body_fr}, ${body.excerpt_en}, ${body.excerpt_fr}, ${body.slug}, ${Boolean(body.published)}) RETURNING *`;
  await rebuildIfPublic('create', { isPublished: created.published }, 'news article created');
  return json(created, { status: 201 });
}

export const config: Config = { path: '/api/news-admin' };
