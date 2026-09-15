import type { Locale } from '../i18n';
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
  hero_headline_en: string | null;
  hero_headline_fr: string | null;
  hero_subheadline_en: string | null;
  hero_subheadline_fr: string | null;
  hero_image_id: string | null;
  hero_cta_label_en: string | null;
  hero_cta_label_fr: string | null;
  who_we_are_copy_en: string | null;
  who_we_are_copy_fr: string | null;
  who_we_are_image_id: string | null;
  trust_stats: Array<{ value: string; label_en: string; label_fr: string }>;
  one_partner_copy_en: string | null;
  one_partner_copy_fr: string | null;
  featured_catalogue_ids: string[];
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

export const localized = <T>(locale: Locale, en: T, fr: T): T => locale === 'fr' ? fr : en;
export const mediaPath = (id: string | null | undefined, fallback: string): string => id ? `/api/media/${id}` : fallback;
export const paragraphs = (value: string | null | undefined): string[] =>
  value?.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean) ?? [];
