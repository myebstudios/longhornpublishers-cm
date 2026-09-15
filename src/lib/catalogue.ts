/**
 * Build-time reads of published catalogue titles from Netlify DB.
 *
 * Mirrors src/lib/news.ts: Docs/technical_architecture.md §16 keeps the public
 * site static-rendered while reading published content from the database, so
 * these run during `astro build` and a newly published title appears on the
 * next deploy rather than instantly.
 */
import type { Locale } from '../i18n';
import { getBuildDatabase } from './build-database';
import { canRenderLocalDemoContent } from './demo-content';
import { failIfProductionDatabaseUnavailable } from './production-build';

export type Level = 'primary' | 'secondary';

/** One published catalogue title, as consumed by the public pages. */
export interface CatalogueTitle {
  id: string;
  /** Client-approved ISBN or internal product identifier. */
  product_code: string;
  slug: string;
  level: Level;
  /** Editions available, from the `languages` jsonb array. */
  languages: Locale[];
  featured: boolean;
  title_en: string;
  title_fr: string;
  description_en: string;
  description_fr: string;
  curriculum_alignment_en: string | null;
  curriculum_alignment_fr: string | null;
  /** Blob key for the cover image; null when none was uploaded. */
  cover_image_id: string | null;
  /** Joined from `subjects`; null when the title has no subject assigned. */
  subject_id: string | null;
  subject_en: string | null;
  subject_fr: string | null;
}

const pick = <T>(locale: Locale, en: T, fr: T): T => (locale === 'fr' ? fr : en);

export const titleText = (t: CatalogueTitle, l: Locale) => pick(l, t.title_en, t.title_fr);
export const description = (t: CatalogueTitle, l: Locale) => pick(l, t.description_en, t.description_fr);
export const curriculum = (t: CatalogueTitle, l: Locale) =>
  pick(l, t.curriculum_alignment_en, t.curriculum_alignment_fr);
export const subjectName = (t: CatalogueTitle, l: Locale) => pick(l, t.subject_en, t.subject_fr);

/**
 * Filter tags for a card, consumed by the `[data-filter-scope]` chips.
 *
 * Subject is tagged by id rather than by a fixed key, because subjects are rows
 * in the database rather than a hardcoded enum — see `subjectFilters`.
 */
export function filterTags(t: CatalogueTitle): string {
  return [t.level, t.subject_id ?? '', ...t.languages].filter(Boolean).join(' ');
}

/**
 * Subject filter options, derived from the titles actually returned.
 *
 * The chips cannot be hardcoded from `t.catalogue.subjects`: subjects live in
 * their own table and the admin can add more, so the only correct source is the
 * data. Titles with no subject assigned contribute no chip and are therefore
 * reachable only under "All" — see the unassigned-subject blocker in the task
 * notes.
 */
export function subjectFilters(titles: CatalogueTitle[], locale: Locale) {
  const seen = new Map<string, string>();
  for (const t of titles) {
    if (t.subject_id && !seen.has(t.subject_id)) {
      seen.set(t.subject_id, subjectName(t, locale) ?? '');
    }
  }
  return [...seen].map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}

/**
 * Responsive cover image for a title, or null when it has no upload.
 *
 * Covers are served by netlify/functions/media.mts, which only releases a blob
 * that published content references. Routing that through the Image CDN keeps
 * the origin function off the hot path for repeat views and gets AVIF/WebP
 * negotiation for free.
 */
export function coverImage(
  title: CatalogueTitle,
  widths: number[] = [240, 380, 560],
): { src: string; srcset: string } | null {
  if (!title.cover_image_id) return null;
  const source = `/api/media/${title.cover_image_id}`;
  // 3:4 portrait, matching .book-card__cover's aspect-ratio.
  const url = (w: number) =>
    `/.netlify/images?url=${encodeURIComponent(source)}&w=${w}&h=${Math.round(w * 4 / 3)}&fit=cover&q=78`;
  return {
    src: url(widths.at(-1) ?? 560),
    srcset: widths.map((w) => `${url(w)} ${w}w`).join(', '),
  };
}

/** Normalizes the `languages` jsonb column, which may arrive parsed or raw. */
function toLanguages(value: unknown): Locale[] {
  const raw = typeof value === 'string' ? safeParse(value) : value;
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is Locale => v === 'en' || v === 'fr');
}

function safeParse(value: string): unknown {
  try { return JSON.parse(value); } catch { return []; }
}

/**
 * Published titles, newest first, with subject names joined.
 *
 * Resolves to `[]` rather than throwing when the database is unreachable, so a
 * build without DATABASE_URL still produces a site and falls back to the
 * "nothing published yet" empty state.
 */
export async function getPublishedTitles(limit?: number): Promise<CatalogueTitle[]> {
  try {
    const db = getBuildDatabase();
    const selectPublished = canRenderLocalDemoContent()
      ? db.sql`
          SELECT c.id, c.product_code, c.slug, c.level, c.languages, c.featured, c.cover_image_id,
                 c.title_en, c.title_fr, c.description_en, c.description_fr,
                 c.curriculum_alignment_en, c.curriculum_alignment_fr,
                 c.subject_id, s.name_en AS subject_en, s.name_fr AS subject_fr
          FROM catalogue_titles c
          LEFT JOIN subjects s ON s.id = c.subject_id
          WHERE c.published = true
          ORDER BY c.featured DESC, c.created_at DESC
        `
      : db.sql`
          SELECT c.id, c.product_code, c.slug, c.level, c.languages, c.featured, c.cover_image_id,
                 c.title_en, c.title_fr, c.description_en, c.description_fr,
                 c.curriculum_alignment_en, c.curriculum_alignment_fr,
                 c.subject_id, s.name_en AS subject_en, s.name_fr AS subject_fr
          FROM catalogue_titles c
          LEFT JOIN subjects s ON s.id = c.subject_id
          WHERE c.published = true AND c.is_demo = false
          ORDER BY c.featured DESC, c.created_at DESC
        `;
    const rows = await selectPublished;
    const titles = (rows as unknown as CatalogueTitle[]).map((row) => ({
      ...row,
      languages: toLanguages((row as { languages: unknown }).languages),
    }));
    return typeof limit === 'number' ? titles.slice(0, limit) : titles;
  } catch (error) {
    failIfProductionDatabaseUnavailable('catalogue', error);
    console.warn(
      '[catalogue] Could not read published titles at build time; rendering the empty state instead.',
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}
