/** Fixed image slots shared by public templates, admin UI and API validation. */
export const PAGE_IMAGE_SLOTS = {
  about: [
    { slot: "hero", label: "Hero", fallback: "lh-editorial-team-wide.jpg" },
    {
      slot: "heritage",
      label: "Heritage",
      fallback: "lh-client-consultation.jpg",
    },
    {
      slot: "quality",
      label: "Quality and distribution",
      fallback: "lh-distribution.jpg",
    },
    {
      slot: "capacity_editorial",
      label: "Editorial capacity illustration",
      fallback: "capacity-editorial.svg",
    },
    {
      slot: "capacity_design",
      label: "Design capacity illustration",
      fallback: "capacity-design.svg",
    },
    {
      slot: "capacity_production",
      label: "Production capacity illustration",
      fallback: "capacity-production.svg",
    },
  ],
  services: [
    { slot: "hero", label: "Hero", fallback: "lh-library-reading.jpg" },
  ],
  why: [
    { slot: "hero", label: "Hero", fallback: "lh-reading-discussion.jpg" },
    {
      slot: "pillar_1",
      label: "Local presence",
      fallback: "lh-catalogue-shelves.jpg",
    },
    {
      slot: "pillar_2",
      label: "Quality commitment",
      fallback: "lh-final-inspection.jpg",
    },
    {
      slot: "pillar_3",
      label: "Bilingual capability",
      fallback: "lh-textbook-library.jpg",
    },
  ],
  catalogue: [
    { slot: "hero", label: "Hero", fallback: "lh-maths-classroom.jpg" },
  ],
  news: [{ slot: "hero", label: "Hero", fallback: "lh-book-delivery.jpg" }],
  contact: [{ slot: "hero", label: "Hero", fallback: "lh-reading-nook.jpg" }],
} as const;
export type ImagePage = keyof typeof PAGE_IMAGE_SLOTS;
export const isImagePage = (page: unknown): page is ImagePage =>
  typeof page === "string" && Object.hasOwn(PAGE_IMAGE_SLOTS, page);
export const PAGE_IMAGE_KEYS: string[] = Object.entries(
  PAGE_IMAGE_SLOTS,
).flatMap(([page, slots]) => slots.map(({ slot }) => `${page}.${slot}`));
export const UPLOADED_IMAGE_KEY =
  /^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpeg|png|webp)$/;
export type PageImageRow = {
  key: string;
  image_id: string | null;
  updated_at?: string;
};
export function pageImageSource(
  page: ImagePage,
  slot: string,
  rows: PageImageRow[],
): string {
  const definition = PAGE_IMAGE_SLOTS[page].find((item) => item.slot === slot);
  if (!definition) throw new Error(`Unknown image slot: ${page}.${slot}`);
  const id = rows.find((row) => row.key === `${page}.${slot}`)?.image_id;
  return id && UPLOADED_IMAGE_KEY.test(id)
    ? `/api/media/${id}`
    : `/img/${definition.fallback}`;
}
export function validatePageImage(
  value: unknown,
):
  | { ok: true; value: { key: string; image_id: string | null } }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { ok: false, error: "Provide an image slot and image." };
  const body = value as Record<string, unknown>;
  if (Object.keys(body).some((key) => !["key", "image_id"].includes(key)))
    return {
      ok: false,
      error: "Only the image slot and image may be changed.",
    };
  if (typeof body.key !== "string" || !PAGE_IMAGE_KEYS.includes(body.key))
    return { ok: false, error: "Choose a supported page image slot." };
  if (
    body.image_id !== null &&
    (typeof body.image_id !== "string" ||
      !UPLOADED_IMAGE_KEY.test(body.image_id))
  )
    return {
      ok: false,
      error:
        "Choose an uploaded JPEG, PNG or WebP image, or remove the custom image.",
    };
  return {
    ok: true,
    value: { key: body.key, image_id: body.image_id as string | null },
  };
}
