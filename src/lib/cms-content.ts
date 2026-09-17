import type { Locale } from '../i18n';
import { PROCESS as FALLBACK_PROCESS, SERVICES as FALLBACK_SERVICES, type Service, type Step } from '../data/site';
import { getBuildDatabase } from './build-database';
import { failIfProductionDatabaseUnavailable } from './production-build';

export interface SiteSettings {
  company_name_en: string;
  company_name_fr: string;
  tagline_en: string | null;
  tagline_fr: string | null;
  address: string | null;
  phone_1: string | null;
  phone_2: string | null;
  email: string | null;
  social_links: Array<{ platform: string; url: string }>;
  footer_tagline_en: string | null;
  footer_tagline_fr: string | null;
  newsletter_copy_en: string | null;
  newsletter_copy_fr: string | null;
  parent_company_url: string | null;
  seo_default_title: string | null;
  seo_default_description: string | null;
  og_image_id: string | null;
}

export interface HomepageContent {
  /**
   * The hero heading is rendered as `{lead} <em class="accent">{accent}</em>`.
   * Storing only the lead collapsed it into one flat heading and emitted an
   * empty <em>, which is why the hero was left unseeded before now.
   */
  hero_headline_en: string | null;
  hero_headline_fr: string | null;
  hero_headline_accent_en: string | null;
  hero_headline_accent_fr: string | null;
  hero_eyebrow_en: string | null;
  hero_eyebrow_fr: string | null;
  hero_subheadline_en: string | null;
  hero_subheadline_fr: string | null;
  hero_image_id: string | null;
  hero_cta_label_en: string | null;
  hero_cta_label_fr: string | null;
  who_we_are_copy_en: string | null;
  who_we_are_copy_fr: string | null;
  who_we_are_image_id: string | null;
  /** `value` is optional: the live trust bar is label-only and emits no <strong>. */
  trust_stats: Array<{ value: string; label_en: string; label_fr: string }>;
  one_partner_copy_en: string | null;
  one_partner_copy_fr: string | null;
  featured_catalogue_ids: string[];
}

export interface AboutContent {
  heritage_copy_en: string;
  heritage_copy_fr: string;
  purpose_en: string;
  purpose_fr: string;
  vision_en: string;
  vision_fr: string;
  mission_en: string;
  mission_fr: string;
  values_en: string;
  values_fr: string;
  /**
   * `title` is the legacy single-language field, kept so existing rows keep
   * rendering. `title_en`/`title_fr` supersede it — the live site shows
   * "Editorial Team" in EN and "Équipe éditoriale" in FR, which one column
   * cannot represent.
   */
  team_capacity_blocks: Array<{
    title: string;
    title_en?: string | null;
    title_fr?: string | null;
    icon: string | null;
    description_en: string;
    description_fr: string;
    tags_en?: string[] | null;
    tags_fr?: string[] | null;
  }>;
}

export interface WhyContent {
  local_presence_copy_en: string;
  local_presence_copy_fr: string;
  /**
   * `title_en`/`title_fr` remain the flat heading. The optional fields below
   * reproduce what the page actually renders: a split heading with an accented
   * second half, a numbered eyebrow, and pill tags.
   */
  quality_commitment_items: Array<{
    icon: string | null;
    title_en: string;
    title_fr: string;
    description_en: string;
    description_fr: string;
    eyebrow_en?: string | null;
    eyebrow_fr?: string | null;
    title_lead_en?: string | null;
    title_lead_fr?: string | null;
    title_accent_en?: string | null;
    title_accent_fr?: string | null;
    tags_en?: string[] | null;
    tags_fr?: string[] | null;
  }>;
}

export interface ContactContent {
  hero_copy_en: string | null;
  hero_copy_fr: string | null;
  project_type_options: Array<{ label_en: string; label_fr: string }>;
  map_lat: number | null;
  map_lng: number | null;
}

export interface LegalPageContent {
  page: 'privacy_policy' | 'terms_of_use';
  body_en: string;
  body_fr: string;
  /**
   * The date the document's SUBSTANCE last changed, as stated by an editor.
   * Null when nobody has stated one — distinct from `updated_at`, which moves
   * on every save including a typo fix.
   */
  content_updated_at: string | Date | null;
  updated_at: string;
}

const FALLBACK_SITE_SETTINGS: SiteSettings = {
  company_name_en: 'Longhorn Publishers Cameroon Ltd',
  company_name_fr: 'Longhorn Publishers Cameroun Ltd',
  tagline_en: 'Content creators and platform business providers',
  tagline_fr: 'Créateurs de contenus et fournisseurs de solutions éditoriales',
  address: 'Total École de police, Tsinga — Yaoundé, Cameroon',
  phone_1: '+237 672 49 10 93',
  phone_2: '+237 657 51 92 03',
  email: 'longhorncameroon@longhornpublishers.com',
  social_links: [],
  footer_tagline_en: 'Content creators and platform business providers for Central Africa — end-to-end publishing services from manuscript to printed book, in English and French.',
  footer_tagline_fr: 'Créateurs de contenus et fournisseurs de solutions éditoriales pour l’Afrique centrale — services d’édition complets, du manuscrit au livre imprimé.',
  newsletter_copy_en: 'Your email for publishing insights',
  newsletter_copy_fr: 'Votre courriel pour nos actualités',
  parent_company_url: 'https://longhornpublishers.com',
  seo_default_title: 'Longhorn Publishers Cameroon',
  seo_default_description: 'Professional bilingual publishing services in Cameroon and the DRC.',
  og_image_id: null,
};

const parseArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string') {
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed as T[] : []; } catch { return []; }
  }
  return [];
};

let settingsPromise: Promise<SiteSettings> | undefined;
export function getSiteSettings(): Promise<SiteSettings> {
  settingsPromise ??= (async () => {
    try {
      const [row] = await getBuildDatabase().sql`SELECT * FROM site_settings WHERE id = 'default'`;
      if (!row) return FALLBACK_SITE_SETTINGS;
      return {
        ...FALLBACK_SITE_SETTINGS,
        ...(row as unknown as Partial<SiteSettings>),
        social_links: parseArray<{ platform: string; url: string }>((row as { social_links?: unknown }).social_links),
      };
    } catch (error) {
      failIfProductionDatabaseUnavailable('site settings', error);
      console.warn('[site settings] Database unavailable; using reviewed static fallback.');
      return FALLBACK_SITE_SETTINGS;
    }
  })();
  return settingsPromise;
}

/**
 * The managed-content readers below do NOT yet filter on `published`.
 *
 * Migrations 005/006 add draft state to these six tables, but Netlify applies
 * migrations to production immediately BEFORE PUBLISH — after the build has
 * already run. Prerendering happens inside that build, so a reader that
 * filters on `published` in the same deploy that introduces the column queries
 * a column the production database does not have yet, and the build dies with
 * `column "published" does not exist`. The deploy then never publishes, so the
 * migration never applies: the two failed deploys of 2026-09-16 were that
 * deadlock, and no additional migration can break it.
 *
 * So this is the EXPAND half of expand-and-contract. This deploy ships the
 * columns and builds without reading them; the migration applies at publish.
 * The follow-up deploy restores `AND published = true` here — by then the
 * column exists at build time and the filter is safe.
 *
 * Behaviour is unchanged for visitors either way: every row on production
 * predates draft state and the migration backfills it to published = true.
 *
 * services is untouched — it has had `published` since migration 001.
 * site_settings is deliberately never filtered: it has no draft state, because
 * unpublishing global configuration would silently revert company details and
 * SEO across every page.
 */
let homepagePromise: Promise<HomepageContent | null> | undefined;
export function getHomepageContent(): Promise<HomepageContent | null> {
  homepagePromise ??= (async () => {
    try {
      const [row] = await getBuildDatabase().sql`SELECT * FROM homepage_content WHERE id = 'default'`;
      if (!row) return null;
      return {
        ...(row as unknown as HomepageContent),
        trust_stats: parseArray<HomepageContent['trust_stats'][number]>((row as { trust_stats?: unknown }).trust_stats),
        featured_catalogue_ids: parseArray<string>((row as { featured_catalogue_ids?: unknown }).featured_catalogue_ids),
      };
    } catch (error) {
      failIfProductionDatabaseUnavailable('homepage content', error);
      console.warn('[homepage content] Database unavailable; using reviewed static fallback.');
      return null;
    }
  })();
  return homepagePromise;
}

let aboutPromise: Promise<AboutContent | null> | undefined;
export function getAboutContent(): Promise<AboutContent | null> {
  aboutPromise ??= (async () => {
    try {
      const [row] = await getBuildDatabase().sql`SELECT * FROM about_page WHERE id = 'default'`;
      if (!row) return null;
      return {
        ...(row as unknown as AboutContent),
        team_capacity_blocks: parseArray<AboutContent['team_capacity_blocks'][number]>((row as { team_capacity_blocks?: unknown }).team_capacity_blocks),
      };
    } catch (error) {
      failIfProductionDatabaseUnavailable('about page', error);
      console.warn('[about page] Database unavailable; using reviewed static fallback.');
      return null;
    }
  })();
  return aboutPromise;
}

let whyPromise: Promise<WhyContent | null> | undefined;
export function getWhyContent(): Promise<WhyContent | null> {
  whyPromise ??= (async () => {
    try {
      const [row] = await getBuildDatabase().sql`SELECT * FROM why_choose_us WHERE id = 'default'`;
      if (!row) return null;
      return {
        ...(row as unknown as WhyContent),
        quality_commitment_items: parseArray<WhyContent['quality_commitment_items'][number]>((row as { quality_commitment_items?: unknown }).quality_commitment_items),
      };
    } catch (error) {
      failIfProductionDatabaseUnavailable('why choose us', error);
      console.warn('[why choose us] Database unavailable; using reviewed static fallback.');
      return null;
    }
  })();
  return whyPromise;
}

let publishingPromise: Promise<{ services: Service[]; process: Step[] }> | undefined;
export function getPublishingContent(): Promise<{ services: Service[]; process: Step[] }> {
  publishingPromise ??= (async () => {
    try {
      const db = getBuildDatabase();
      const serviceRows = await db.sql`SELECT * FROM services WHERE published = true ORDER BY sort_order, created_at`;
      const processRows = await db.sql`SELECT * FROM process_steps ORDER BY step_number`;
      const services: Service[] = serviceRows.map((row) => {
        const enBody = paragraphs(String(row.description_en ?? ''));
        const frBody = paragraphs(String(row.description_fr ?? ''));
        return {
          // The slug, not the uuid: SERVICE_DETAIL_IMG and the on-page
          // anchors are both keyed by it, so a uuid here silently swaps every
          // service photograph for its category default.
          id: String(row.slug ?? row.id), icon: String(row.icon ?? 'check'), discipline: row.category as Service['discipline'], img: String(row.category),
          // `short` is the overview-card line and is NOT the first paragraph of
          // the detail body — on the live site they differ for every service.
          en: { name: String(row.name_en), short: String(row.short_en ?? '') || enBody[0] || String(row.description_en), body: enBody },
          fr: { name: String(row.name_fr), short: String(row.short_fr ?? '') || frBody[0] || String(row.description_fr), body: frBody },
        };
      });
      const process: Step[] = processRows.map((row) => ({
        num: String(row.step_number).padStart(2, '0'),
        en: { title: String(row.title_en), body: String(row.description_en) },
        fr: { title: String(row.title_fr), body: String(row.description_fr) },
      }));
      /**
       * An EMPTY table falls back, exactly as a missing single row does.
       *
       * Every other reader here treats "no CMS content" as "render the reviewed
       * static copy". This one did not: it returned the empty arrays straight
       * through, so an empty `services` table rendered the Services overview
       * with no cards, an empty marquee, and an "Our Process" heading above
       * nothing. That is what a visitor saw on the live site.
       *
       * It is not hypothetical or transient. Netlify applies migrations on
       * publish, AFTER the build, so the deploy that first seeds these tables
       * always prerenders against them while they are still empty — the blank
       * sections ship every time. Deleting the last service would do the same.
       *
       * Falling back per-list, not together: services and process are separate
       * sections and an editor may legitimately manage one and not the other.
       */
      return {
        services: services.length ? services : FALLBACK_SERVICES,
        process: process.length ? process : FALLBACK_PROCESS,
      };
    } catch (error) {
      failIfProductionDatabaseUnavailable('publishing services and process', error);
      console.warn('[publishing services] Database unavailable; using reviewed static fallback.');
      return { services: FALLBACK_SERVICES, process: FALLBACK_PROCESS };
    }
  })();
  return publishingPromise;
}

let contactPromise: Promise<ContactContent | null> | undefined;
export function getContactContent(): Promise<ContactContent | null> {
  contactPromise ??= (async () => {
    try {
      const [row] = await getBuildDatabase().sql`SELECT * FROM contact_settings WHERE id = 'default'`;
      if (!row) return null;
      return {
        ...(row as unknown as ContactContent),
        map_lat: row.map_lat === null ? null : Number(row.map_lat),
        map_lng: row.map_lng === null ? null : Number(row.map_lng),
        project_type_options: parseArray<ContactContent['project_type_options'][number]>((row as { project_type_options?: unknown }).project_type_options),
      };
    } catch (error) {
      failIfProductionDatabaseUnavailable('contact page', error);
      console.warn('[contact page] Database unavailable; using reviewed static fallback.');
      return null;
    }
  })();
  return contactPromise;
}

const legalPromises = new Map<LegalPageContent['page'], Promise<LegalPageContent | null>>();
export function getLegalPage(page: LegalPageContent['page']): Promise<LegalPageContent | null> {
  let pending = legalPromises.get(page);
  if (!pending) {
    pending = (async () => {
      try {
        const [row] = await getBuildDatabase().sql`SELECT * FROM legal_pages WHERE page = ${page}`;
        return row ? row as unknown as LegalPageContent : null;
      } catch (error) {
        failIfProductionDatabaseUnavailable(`legal page: ${page}`, error);
        console.warn(`[legal page: ${page}] Database unavailable; using reviewed static fallback.`);
        return null;
      }
    })();
    legalPromises.set(page, pending);
  }
  return pending;
}

export const localized = <T>(locale: Locale, en: T, fr: T): T => locale === 'fr' ? fr : en;
export const mediaPath = (id: string | null | undefined, fallback: string): string => id ? `/api/media/${id}` : fallback;
export const paragraphs = (value: string | null | undefined): string[] =>
  value?.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean) ?? [];

/**
 * Split a legal body into headed sections.
 *
 * The legal templates render `<h2>` section titles, but the CMS stores one flat
 * text column — so seeding the live policies into it used to drop every
 * heading. A line beginning `## ` marks a heading, which is Markdown's own
 * convention, types cleanly into a textarea, and leaves bodies with no headings
 * rendering exactly as they did before (one untitled section of paragraphs).
 */
export const legalSections = (
  value: string | null | undefined,
): Array<{ title: string | null; body: string[] }> => {
  const sections: Array<{ title: string | null; body: string[] }> = [];
  for (const block of paragraphs(value)) {
    const heading = /^##\s+(.*)$/.exec(block.split('\n')[0]!);
    if (heading) {
      const rest = block.split('\n').slice(1).join('\n').trim();
      sections.push({ title: heading[1]!.trim(), body: rest ? [rest] : [] });
      continue;
    }
    const current = sections.at(-1);
    if (current) current.body.push(block);
    else sections.push({ title: null, body: [block] });
  }
  return sections.filter((section) => section.title || section.body.length);
};
