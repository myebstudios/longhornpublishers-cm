import { SERVICE_DETAIL_IMG } from "../data/presentation.ts";
import { UPLOADED_IMAGE_KEY } from "./page-image-slots.ts";
const CATEGORY_IMAGE: Record<string, string> = {
  editorial: "lh-student-reading.jpg",
  creative: "lh-creative-wall.jpg",
  production: "lh-print-inspection-wide.jpg",
};
/** The public split and admin preview use the same existing fallback photograph. */
export function serviceImageSource(service: {
  id?: string;
  slug?: string | null;
  category?: string;
  discipline?: string;
  image_id?: unknown;
}): string {
  if (
    typeof service.image_id === "string" &&
    UPLOADED_IMAGE_KEY.test(service.image_id)
  )
    return `/api/media/${service.image_id}`;
  return `/img/${SERVICE_DETAIL_IMG[service.slug ?? service.id ?? ""] ?? CATEGORY_IMAGE[service.category ?? service.discipline ?? "editorial"] ?? CATEGORY_IMAGE.editorial}`;
}
