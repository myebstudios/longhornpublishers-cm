/**
 * Localized slug map.
 *
 * French slugs are DRAFT pending client confirmation
 * (open item 2, Docs/README.md). Changing a value here updates the nav,
 * footer, language switcher and hreflang tags in one place.
 */
export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export type RouteKey =
  | 'home'
  | 'about'
  | 'services'
  | 'catalogue'
  | 'why'
  | 'contact'
  | 'news'
  | 'privacy'
  | 'terms';

export const ROUTES: Record<RouteKey, Record<Locale, string>> = {
  home:      { en: '',              fr: '' },
  about:     { en: 'about',         fr: 'a-propos' },
  services:  { en: 'services',      fr: 'services-edition' },
  catalogue: { en: 'catalogue',     fr: 'catalogue' },
  why:       { en: 'why-choose-us', fr: 'pourquoi-nous-choisir' },
  contact:   { en: 'contact',       fr: 'contact' },
  news:      { en: 'news',          fr: 'actualites' },
  privacy:   { en: 'privacy-policy', fr: 'politique-de-confidentialite' },
  terms:     { en: 'terms-of-use',   fr: 'conditions-utilisation' },
};

/** Absolute path for a route in a given locale, e.g. ('about','fr') -> '/fr/a-propos/' */
export function path(key: RouteKey, locale: Locale): string {
  const slug = ROUTES[key][locale];
  return slug ? `/${locale}/${slug}/` : `/${locale}/`;
}

/** The same page in the other locale — powers the language switcher. */
export function alternatePath(key: RouteKey, locale: Locale): string {
  return path(key, locale === 'en' ? 'fr' : 'en');
}

/** Primary header navigation, in order. News lives in the footer only. */
export const NAV_KEYS: Array<Exclude<RouteKey, 'privacy' | 'terms'>> = [
  'home',
  'about',
  'services',
  'catalogue',
  'why',
  'contact',
];
