import { getStore } from "@netlify/blobs";
import { UPLOADED_IMAGE_KEY } from "../../../src/lib/page-image-slots";
/** Uploaded keys must exist in the same store used by /api/media. */
export async function uploadedImageExists(key: string): Promise<boolean> {
  return (
    UPLOADED_IMAGE_KEY.test(key) &&
    Boolean(
      await getStore({
        name: "longhorn-media",
        consistency: "strong",
      }).getMetadata(key),
    )
  );
}
