/**
 * Build-time reads of published news from Netlify DB.
 *
 * Docs/technical_architecture.md §16 keeps the public site fully static-rendered
 * while reading published content from the database, so these run during
 * `astro build` and the result is baked into the HTML. A newly published
 * article therefore appears after the next deploy, not instantly — see the
 * deploy dependency noted in `getPublishedNews`.
 */
import { getDatabase } from '@netlify/database';
import { path, type Locale } from '../i18n';
import { failIfProductionDatabaseUnavailable } from './production-build';

/** Category values permitted by the news_articles CHECK constraint. */
export type NewsCategory = 'company_news' | 'new_titles' | 'partnerships' | 'events';

/** One published article, as consumed by the public pages. */
export interface NewsArticle {
  id: string;
  slug: string;
  category: NewsCategory;
  publish_date: string | null;
  headline_en: string;
  headline_fr: string;
  excerpt_en: string;
  excerpt_fr: string;
}

/** A published article plus its body, for the detail route. */
export interface NewsArticleDetail extends NewsArticle {
  body_en: string;
  body_fr: string;
}

/** Maps the database category values onto the `t.news.categories` keys. */
const CATEGORY_KEY: Record<NewsCategory, 'company' | 'titles' | 'partnerships' | 'events'> = {
  company_news: 'company',
  new_titles: 'titles',
  partnerships: 'partnerships',
  events: 'events',
};

/** Decorative icon per category, matching the names Icon.astro supports. */
const CATEGORY_ICON: Record<NewsCategory, string> = {
  company_news: 'news',
  new_titles: 'book',
  partnerships: 'users',
  events: 'cal',
};

export function categoryKey(category: NewsCategory) {
  return CATEGORY_KEY[category] ?? 'company';
}

export function categoryIcon(category: NewsCategory) {
  return CATEGORY_ICON[category] ?? 'news';
}

/** Headline in the requested locale. */
export function headline(article: NewsArticle, locale: Locale): string {
  return locale === 'fr' ? article.headline_fr : article.headline_en;
}

/** Excerpt in the requested locale. */
export function excerpt(article: NewsArticle, locale: Locale): string {
  return locale === 'fr' ? article.excerpt_fr : article.excerpt_en;
}

/**
 * Article body split into paragraphs for the requested locale.
 *
 * The admin panel captures the body in a plain `<textarea>`, so this is text
 * rather than markup — it is split on blank lines and rendered as text nodes,
 * never as HTML. Treating editor input as markup here would be a stored-XSS
 * route straight from the CMS into every visitor's page.
 */
export function bodyParagraphs(article: NewsArticleDetail, locale: Locale): string[] {
  const raw = locale === 'fr' ? article.body_fr : article.body_en;
  return raw.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

/**
 * Path to an article's detail page.
 *
 * Unlike the catalogue, the parent segment is localized (`news` / `actualites`),
 * so this composes from ROUTES rather than assuming a shared segment.
 */
export function articlePath(article: NewsArticle, locale: Locale): string {
  return `${path('news', locale)}${article.slug}/`;
}

/** Publish date rendered for the active locale; empty when unset. */
export function publishedOn(article: NewsArticle, locale: Locale): string {
  if (!article.publish_date) return '';
  const date = new Date(article.publish_date);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/**
 * Published articles, newest first.
 *
 * Filters on `published` alone — that checkbox is the editor's explicit
 * publish switch in the admin panel. `publish_date` is treated as display
 * metadata and deliberately not used to hide future-dated rows, because a
 * static build cannot later reveal them on its own; a post dated tomorrow would
 * silently vanish until someone happened to redeploy.
 *
 * Resolves to `[]` rather than throwing when the database is unreachable — a
 * build without DATABASE_URL (local checkouts, CI without the secret) must
 * still produce a site, falling back to the same empty state used before the
 * first article is written.
 */
export async function getPublishedNewsDetail(): Promise<NewsArticleDetail[]> {
  try {
    const db = getDatabase();
    const rows = await db.sql`
      SELECT id, slug, category, publish_date, headline_en, headline_fr,
             excerpt_en, excerpt_fr, body_en, body_fr
      FROM news_articles
      WHERE published = true
      ORDER BY publish_date DESC NULLS LAST, created_at DESC
    `;
    return rows as unknown as NewsArticleDetail[];
  } catch (error) {
    failIfProductionDatabaseUnavailable('news');
    console.warn(
      '[news] Could not read article bodies at build time; no detail routes will be generated.',
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export async function getPublishedNews(limit?: number): Promise<NewsArticle[]> {
  try {
    const db = getDatabase();
    const rows = await db.sql<NewsArticle>`
      SELECT id, slug, category, publish_date, headline_en, headline_fr, excerpt_en, excerpt_fr
      FROM news_articles
      WHERE published = true
      ORDER BY publish_date DESC NULLS LAST, created_at DESC
    `;
    const articles = rows as unknown as NewsArticle[];
    return typeof limit === 'number' ? articles.slice(0, limit) : articles;
  } catch (error) {
    failIfProductionDatabaseUnavailable('news');
    console.warn(
      '[news] Could not read published articles at build time; rendering the empty state instead.',
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}
