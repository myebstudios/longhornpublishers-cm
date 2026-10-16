import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";
import { requireAdmin } from "./_shared/auth";
import { uploadedImageExists } from "./_shared/uploaded-image";
import { purgeMedia } from "./_shared/media-cache";
import { purgePublic } from "./_shared/public-cache";
import { createPageImagesHandler } from "./_shared/page-images-handler";

export default createPageImagesHandler({
  db: getDatabase(),
  authorize: requireAdmin,
  imageExists: uploadedImageExists,
  purgeMedia,
  purgePublic,
});
export const config: Config = { path: "/api/page-images-admin" };
