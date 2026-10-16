import { getBuildDatabase } from "./build-database";
import { failIfProductionDatabaseUnavailable } from "./production-build";
import {
  pageImageSource,
  type ImagePage,
  type PageImageRow,
} from "./page-image-slots";

/** Public page image configuration is shared by EN/FR and takes effect on Save. */
export async function getPageImages(
  page: ImagePage,
): Promise<(slot: string) => string> {
  let rows: PageImageRow[] = [];
  try {
    rows = (await getBuildDatabase()
      .sql`SELECT key, image_id FROM page_images WHERE split_part(key, '.', 1) = ${page}`) as unknown as PageImageRow[];
  } catch (error) {
    failIfProductionDatabaseUnavailable("page images", error);
    console.warn(
      "[page images] Database unavailable; using reviewed static image fallbacks.",
    );
  }
  return (slot: string) => pageImageSource(page, slot, rows);
}
