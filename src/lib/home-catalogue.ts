/**
 * Homepage catalogue block selection. Pure so it can be tested without a database.
 */
interface HomeTitle {
  id: string;
  /** Non-null only when the cover is public (CLIENT-3 C15, enforced by the query). */
  cover_image_id: string | null;
}

/**
 * Picks what the homepage catalogue block shows. Titles selected in the
 * homepage editor come first; otherwise every published title in query order
 * (featured first, then newest).
 *
 * - `covers`: the cover showcase. Only cover-public titles; a selection cannot
 *   bypass C15.
 * - `text`: when no candidate has a public cover, up to four titles as
 *   text cards, so the block never renders an empty column.
 */
export function homeCatalogue<T extends HomeTitle>(published: T[], selectedIds: string[] = []) {
  const byId = new Map(published.map((title) => [title.id, title]));
  const selected = selectedIds
    .map((id) => byId.get(id))
    .filter((title): title is T => Boolean(title));
  const candidates = selected.length ? selected : published;
  const covers = candidates.filter((title) => title.cover_image_id).slice(0, 8);
  const text = covers.length ? [] : candidates.slice(0, 4);
  return { covers, text };
}
