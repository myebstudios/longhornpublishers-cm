/** Published news reads include the stored image; drafts stay behind /api/media authorization. */
export function newsImage(article: { hero_image_id: string | null }): string | null {
  return article.hero_image_id ? `/api/media/${article.hero_image_id}` : null;
}
