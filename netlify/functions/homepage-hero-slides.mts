import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import {
  validateHomepageHeroReorder,
  validateHomepageHeroSlide,
  validateHomepageHeroSlidesState,
} from './_shared/cms-validation';
import { json, methodNotAllowed } from './_shared/http';
import { purgeMedia } from './_shared/media-cache';
import { purgeIfPublic } from './_shared/public-cache';

const db = getDatabase();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SlideState = { id: unknown; image_id: unknown; enabled: unknown };

async function homepagePublished(): Promise<boolean> {
  const [homepage] = await db.sql`SELECT published FROM homepage_content WHERE id = 'default'`;
  return homepage?.published === true;
}

async function purgeForSlide(
  kind: 'create' | 'update' | 'delete',
  published: boolean,
  beforeEnabled: boolean,
  afterEnabled: boolean,
): Promise<void> {
  await purgeIfPublic(kind, {
    wasPublished: published && beforeEnabled,
    isPublished: published && afterEnabled,
  }, 'homepage');
}

export default async function handler(req: Request) {
  const denied = await requireAdmin(); if (denied) return denied;
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (req.method === 'GET') {
    return json(await db.sql`
      SELECT * FROM homepage_hero_slides
      WHERE homepage_id = 'default'
      ORDER BY sort_order, created_at, id
    `);
  }
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return methodNotAllowed('GET, POST, PUT, DELETE');
  if (id && !UUID.test(id)) return json({ error: 'A valid hero slide id is required.' }, { status: 400 });

  const current = await db.sql`
    SELECT id, image_id, enabled FROM homepage_hero_slides
    WHERE homepage_id = 'default' ORDER BY sort_order, created_at, id
  ` as unknown as SlideState[];
  const published = await homepagePublished();

  if (req.method === 'DELETE') {
    if (!id) return json({ error: 'A hero slide id is required.' }, { status: 400 });
    const target = current.find((slide) => String(slide.id) === id);
    if (!target) return json({ error: 'Hero slide not found.' }, { status: 404 });
    const future = current.filter((slide) => String(slide.id) !== id);
    const state = validateHomepageHeroSlidesState(future, published);
    if (!state.ok) return json({ error: state.error }, { status: 400 });
    const [deleted] = await db.sql`
      DELETE FROM homepage_hero_slides WHERE id = ${id} AND homepage_id = 'default'
      RETURNING id, image_id, enabled
    `;
    if (!deleted) return json({ error: 'Hero slide not found.' }, { status: 404 });
    if (published && deleted.enabled === true) await purgeMedia(deleted.image_id);
    await purgeForSlide('delete', published, deleted.enabled === true, false);
    return json({ deleted: id });
  }

  const payload = await req.json().catch(() => null);
  if (req.method === 'PUT' && payload && typeof payload === 'object' && (payload as Record<string, unknown>).action === 'reorder') {
    const parsed = validateHomepageHeroReorder(payload);
    if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
    const ids = parsed.value;
    const currentIds = new Set(current.map((slide) => String(slide.id)));
    if (ids.length !== currentIds.size || ids.some((slideId) => !currentIds.has(slideId))) {
      return json({ error: 'Reorder ids must include every hero slide exactly once.' }, { status: 400 });
    }
    await db.sql`
      WITH ordered AS (
        SELECT slide_id::uuid AS id, (ordinality - 1)::integer AS sort_order
        FROM unnest(${ids}::text[]) WITH ORDINALITY AS input(slide_id, ordinality)
      )
      UPDATE homepage_hero_slides AS slides
      SET sort_order = ordered.sort_order, updated_at = now()
      FROM ordered
      WHERE slides.id = ordered.id AND slides.homepage_id = 'default'
    `;
    const hasPublicSlide = published && current.some((slide) => slide.enabled === true);
    if (hasPublicSlide) await purgeMedia(...current.filter((slide) => slide.enabled === true).map((slide) => slide.image_id as string | null));
    await purgeForSlide('update', published, hasPublicSlide, hasPublicSlide);
    return json({ reordered: ids });
  }

  if (req.method === 'PUT' && !id) return json({ error: 'A hero slide id is required.' }, { status: 400 });
  const parsed = validateHomepageHeroSlide(payload);
  if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
  const value = parsed.value;

  if (req.method === 'POST') {
    const state = validateHomepageHeroSlidesState([...current, { enabled: value.enabled }], published);
    if (!state.ok) return json({ error: state.error }, { status: 400 });
    const [created] = await db.sql`
      INSERT INTO homepage_hero_slides (
        homepage_id, sort_order, image_id, eyebrow_en, eyebrow_fr, headline_en, headline_fr,
        headline_accent_en, headline_accent_fr, subheadline_en, subheadline_fr,
        primary_cta_label_en, primary_cta_label_fr, primary_cta_href,
        secondary_cta_label_en, secondary_cta_label_fr, secondary_cta_href, enabled
      ) VALUES (
        'default', (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM homepage_hero_slides WHERE homepage_id = 'default'),
        ${value.image_id}, ${value.eyebrow_en}, ${value.eyebrow_fr}, ${value.headline_en}, ${value.headline_fr},
        ${value.headline_accent_en}, ${value.headline_accent_fr}, ${value.subheadline_en}, ${value.subheadline_fr},
        ${value.primary_cta_label_en}, ${value.primary_cta_label_fr}, ${value.primary_cta_href},
        ${value.secondary_cta_label_en}, ${value.secondary_cta_label_fr}, ${value.secondary_cta_href}, ${value.enabled}
      ) RETURNING *
    `;
    if (published && created.enabled === true) await purgeMedia(created.image_id);
    await purgeForSlide('create', published, false, created.enabled === true);
    return json(created, { status: 201 });
  }

  const before = current.find((slide) => String(slide.id) === id);
  if (!before) return json({ error: 'Hero slide not found.' }, { status: 404 });
  const future = current.map((slide) => String(slide.id) === id ? { ...slide, enabled: value.enabled } : slide);
  const state = validateHomepageHeroSlidesState(future, published);
  if (!state.ok) return json({ error: state.error }, { status: 400 });
  const [updated] = await db.sql`
    UPDATE homepage_hero_slides SET
      image_id = ${value.image_id}, eyebrow_en = ${value.eyebrow_en}, eyebrow_fr = ${value.eyebrow_fr},
      headline_en = ${value.headline_en}, headline_fr = ${value.headline_fr},
      headline_accent_en = ${value.headline_accent_en}, headline_accent_fr = ${value.headline_accent_fr},
      subheadline_en = ${value.subheadline_en}, subheadline_fr = ${value.subheadline_fr},
      primary_cta_label_en = ${value.primary_cta_label_en}, primary_cta_label_fr = ${value.primary_cta_label_fr},
      primary_cta_href = ${value.primary_cta_href}, secondary_cta_label_en = ${value.secondary_cta_label_en},
      secondary_cta_label_fr = ${value.secondary_cta_label_fr}, secondary_cta_href = ${value.secondary_cta_href},
      enabled = ${value.enabled}, updated_at = now()
    WHERE id = ${id} AND homepage_id = 'default'
    RETURNING *
  `;
  if (!updated) return json({ error: 'Hero slide not found.' }, { status: 404 });
  if (published && (before.enabled === true || updated.enabled === true)) await purgeMedia(before.image_id as string | null, updated.image_id);
  await purgeForSlide('update', published, before.enabled === true, updated.enabled === true);
  return json(updated);
}

export const config: Config = { path: '/api/homepage-hero-slides-admin' };
