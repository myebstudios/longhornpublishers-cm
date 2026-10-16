import {
  isImagePage,
  validatePageImage,
} from "../../../src/lib/page-image-slots.ts";
import type { SqlDatabase } from "./sql-types.ts";
import { json, methodNotAllowed } from "./http.ts";

type Dependencies = {
  db: SqlDatabase;
  authorize: () => Promise<Response | null>;
  imageExists: (key: string) => Promise<boolean>;
  purgeMedia: (...keys: (string | null | undefined)[]) => Promise<void>;
  purgePublic: (...tags: string[]) => Promise<void>;
};
/** One slot per write: never replaces page copy or any sibling image. */
export function createPageImagesHandler({
  db,
  authorize,
  imageExists,
  purgeMedia,
  purgePublic,
}: Dependencies) {
  return async (req: Request): Promise<Response> => {
    const denied = await authorize();
    if (denied) return denied;
    if (req.method === "GET") {
      const page = new URL(req.url).searchParams.get("page");
      if (!isImagePage(page))
        return json({ error: "Choose a supported page." }, { status: 400 });
      return json(
        await db.sql`SELECT key, image_id, updated_at FROM page_images WHERE split_part(key, '.', 1) = ${page} ORDER BY key`,
      );
    }
    if (req.method !== "PUT") return methodNotAllowed("GET, PUT");
    const parsed = validatePageImage(await req.json().catch(() => null));
    if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
    const { key, image_id } = parsed.value;
    if (image_id && !(await imageExists(image_id)))
      return json(
        {
          error:
            "The image upload is unavailable. Upload the image again before saving.",
        },
        { status: 400 },
      );
    const [before] =
      await db.sql`SELECT image_id FROM page_images WHERE key = ${key}`;
    const [saved] = await db.sql`
      INSERT INTO page_images (key, image_id) VALUES (${key}, ${image_id})
      ON CONFLICT (key) DO UPDATE SET image_id = EXCLUDED.image_id, updated_at = now()
      RETURNING key, image_id, updated_at`;
    await purgeMedia(before?.image_id, image_id);
    await purgePublic(key.split(".")[0]);
    return json(saved);
  };
}
