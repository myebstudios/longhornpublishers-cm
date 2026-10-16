import type { SqlDatabase } from "./sql-types.ts";

/**
 * Is this blob referenced by public content or saved page image configuration?
 *
 * This is the whole authorization model for reads. The blob store also holds
 * images attached to unpublished drafts, and images uploaded and then abandoned
 * when an editor changed their mind — serving the store by key would expose all
 * of them to anyone who guessed or obtained a key. Reachability is therefore
 * derived from published content and explicitly saved page image slots rather than from the object's existence.
 *
 * Unpublishing a title consequently revokes its cover, which is why the
 * response below is not cached immutably.
 */

export async function isPubliclyApproved(
  key: string,
  db: SqlDatabase,
  localDemo = false,
): Promise<boolean> {
  // Local development additionally releases covers attached to demo rows, which
  // would otherwise 404 on the only runtime allowed to render them. Deployed
  // runtimes keep the catalogue is_demo = false restriction.
  const [row] = localDemo
    ? await db.sql`
        SELECT 1 AS ok WHERE EXISTS (
          SELECT 1 FROM catalogue_titles WHERE published = true AND classification IN ('national_book_list_verified', 'other_developed') AND cover_image_id = ${key}
          UNION ALL
          SELECT 1 FROM page_images WHERE image_id = ${key}
          UNION ALL
          SELECT 1 FROM services WHERE published = true AND image_id = ${key}
          UNION ALL
          SELECT 1 FROM news_articles WHERE published = true AND hero_image_id = ${key}
          UNION ALL
          SELECT 1 FROM homepage_content WHERE id = 'default' AND (hero_image_id = ${key} OR who_we_are_image_id = ${key})
          UNION ALL
          SELECT 1 FROM homepage_hero_slides AS slides
          INNER JOIN homepage_content AS homepage ON homepage.id = slides.homepage_id
          WHERE homepage.published = true AND slides.enabled = true AND slides.image_id = ${key}
          UNION ALL
          SELECT 1 FROM site_settings WHERE id = 'default' AND og_image_id = ${key}
        )
      `
    : await db.sql`
        SELECT 1 AS ok WHERE EXISTS (
          SELECT 1 FROM catalogue_titles WHERE published = true AND is_demo = false AND classification IN ('national_book_list_verified', 'other_developed') AND cover_image_id = ${key}
          UNION ALL
          SELECT 1 FROM page_images WHERE image_id = ${key}
          UNION ALL
          SELECT 1 FROM services WHERE published = true AND image_id = ${key}
          UNION ALL
          SELECT 1 FROM news_articles WHERE published = true AND hero_image_id = ${key}
          UNION ALL
          SELECT 1 FROM homepage_content WHERE id = 'default' AND (hero_image_id = ${key} OR who_we_are_image_id = ${key})
          UNION ALL
          SELECT 1 FROM homepage_hero_slides AS slides
          INNER JOIN homepage_content AS homepage ON homepage.id = slides.homepage_id
          WHERE homepage.published = true AND slides.enabled = true
            AND slides.is_demo = false AND slides.image_id = ${key}
          UNION ALL
          SELECT 1 FROM site_settings WHERE id = 'default' AND og_image_id = ${key}
        )
      `;
  return Boolean(row);
}
