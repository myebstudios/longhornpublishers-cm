import {
  coverIsPublic,
  isPubliclyListed,
} from "../../netlify/functions/_shared/catalogue-classification.ts";
export type RecordData = Record<string, any>;
export const cloneRecord = <T>(record: T): T => structuredClone(record);
export function fingerprint(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(fingerprint).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => `${JSON.stringify(key)}:${fingerprint(v)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "undefined";
}
export function mergeOwned(
  record: RecordData,
  edits: RecordData,
  fields: readonly string[],
): RecordData {
  const result = cloneRecord(record);
  for (const field of fields)
    if (Object.hasOwn(edits, field)) result[field] = cloneRecord(edits[field]);
  return result;
}
export function mergeArrayItem(
  record: RecordData,
  field: string,
  index: number | null,
  edits: RecordData,
): RecordData {
  const result = cloneRecord(record),
    rows = result[field] ?? [];
  result[field] = rows;
  if (index === null) rows.push(cloneRecord(edits));
  else {
    if (index < 0 || index >= rows.length)
      throw new Error("That item no longer exists.");
    rows[index] = { ...rows[index], ...cloneRecord(edits) };
  }
  return result;
}
export function secondsToMilliseconds(value: number, original: number): number {
  if (value === original / 1000) return original;
  if (
    !Number.isFinite(value) ||
    value < 3 ||
    value > 30 ||
    Math.abs(value * 2 - Math.round(value * 2)) > 1e-8
  )
    throw new Error("Use 3–30 seconds in half-second increments.");
  return Math.round(value * 1000);
}
export const countLabel = (
  n: number,
  singular: string,
  plural = `${singular}s`,
) => `${n} ${n === 1 ? singular : plural}`;
export function catalogueBadges(record: RecordData) {
  const title = {
    published: record.published === true,
    classification: String(record.classification),
    cover_image_id: record.cover_image_id ?? null,
    cover_rights_approved: record.cover_rights_approved === true,
  };
  const labels: Record<string, string> = {
    national_book_list_verified: "National Book List · verified",
    other_developed: "Other developed",
    unclassified: "Unclassified",
  };
  const reasons = [
    !title.published ? "draft" : "",
    !isPubliclyListed(title) && title.published ? "title not publicly listed" : "",
  ].filter(Boolean);
  return {
    labels: [
      !title.published
        ? "Draft"
        : isPubliclyListed(title)
          ? "Published · Text eligible"
          : "Published · Listing withheld",
      record.featured ? "Catalogue featured" : "Not featured",
      labels[title.classification] ?? "Unknown classification",
      !title.cover_image_id
        ? "No cover added"
        : coverIsPublic(title)
          ? "Cover · Public eligible"
          : "Cover · Not published",
    ],
    coverReason:
      title.cover_image_id && !coverIsPublic(title) ? reasons.join(", ") : "",
  };
}
export function sortedRecords(
  rows: RecordData[],
  sort: string,
  title: (row: RecordData) => string,
) {
  const validDate = (v: unknown) =>
    typeof v === "string" && Number.isFinite(Date.parse(v)) ? Date.parse(v) : 0;
  return [...rows].sort((a, b) => {
    let result = 0;
    if (sort === "updated")
      result = validDate(b.updated_at) - validDate(a.updated_at);
    else if (sort === "date")
      result = validDate(b.publish_date) - validDate(a.publish_date);
    else if (sort === "assigned")
      result = Number(b.title_count) - Number(a.title_count);
    else if (sort === "order")
      result =
        Number(a.sort_order ?? a.step_number ?? 0) -
        Number(b.sort_order ?? b.step_number ?? 0);
    if (result) return result;
    result = title(a).localeCompare(title(b));
    if (sort === "za") result = -result;
    return (
      result ||
      String(a.id ?? a.page ?? "").localeCompare(String(b.id ?? b.page ?? ""))
    );
  });
}
export function pageRecords(rows: RecordData[], page: number, size = 24) {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(pages, Math.max(1, page));
  return {
    rows: rows.slice((current - 1) * size, current * size),
    page: current,
    pages,
  };
}
/** Extra presentation controls (icon samples/pickers) have no stored key. */
export function mergeRowControls(
  original: RecordData,
  controls: { key?: string; value: string; initial: unknown }[],
  legacyTitle = false,
) {
  const result = cloneRecord(original);
  for (const control of controls) {
    const key = control.key;
    if (!key) continue;
    if (control.value === control.initial && Object.hasOwn(original, key))
      continue;
    result[key] = key.startsWith("tags_")
      ? control.value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : control.value;
    if (legacyTitle && key === "title_en") result.title = control.value;
  }
  return result;
}
/** Hero rows on Homepage still belong to the independent slide endpoint. */
export const isSingletonEditor = (
  pageHasSingleton: boolean,
  page: string,
  kind: string,
) => pageHasSingleton && page === kind;
/** Same safe block grammar as cms-content.ts legalSections, with no HTML evaluation. */
export function legalPreviewSections(
  value: string | null | undefined,
): { title: string | null; body: string[] }[] {
  const result: { title: string | null; body: string[] }[] = [];
  for (const block of value
    ?.split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean) ?? []) {
    const heading = /^##\s+(.*)$/.exec(block.split("\n")[0]!);
    if (heading) {
      const rest = block.split("\n").slice(1).join("\n").trim();
      result.push({ title: heading[1]!.trim(), body: rest ? [rest] : [] });
      continue;
    }
    const current = result.at(-1);
    if (current) current.body.push(block);
    else result.push({ title: null, body: [block] });
  }
  return result.filter((section) => section.title || section.body.length);
}
export function heroSlotState(rows: RecordData[]) {
  const saved = rows.length,
    enabled = rows.filter((row) => row.enabled === true).length;
  return { saved, enabled, disabled: saved - enabled, canAdd: saved < 5 };
}
export interface OperationField {
  type?: string;
  value: string;
  checked?: boolean;
  readOnly?: boolean;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}
/** Block user edits during an operation without disabling the focused control. */
export function operationFieldLock(fields: OperationField[]) {
  const original = new Map(
    fields.map((field) => [
      field,
      { value: field.value, checked: field.checked, readOnly: field.readOnly },
    ]),
  );
  fields.forEach((field) => {
    field.setAttribute("aria-disabled", "true");
    if (field.readOnly !== undefined) field.readOnly = true;
  });
  return {
    rollback(field: OperationField) {
      const state = original.get(field);
      if (!state) return;
      field.value = field.type === "file" ? "" : state.value;
      if (state.checked !== undefined) field.checked = state.checked;
    },
    release() {
      for (const [field, state] of original) {
        field.removeAttribute("aria-disabled");
        if (state.readOnly !== undefined) field.readOnly = state.readOnly;
      }
    },
  };
}
/** A partial GET must never become an editable form populated with blank defaults. */
export function assertReadFields(record: RecordData, keys: readonly string[]) {
  const malformed =
    !record ||
    typeof record !== "object" ||
    Array.isArray(record) ||
    keys.some((key) => !Object.hasOwn(record, key));
  const badBoolean =
    record &&
    [
      "published",
      "featured",
      "enabled",
      "hero_autoplay_enabled",
      "cover_rights_approved",
    ].some(
      (key) => Object.hasOwn(record, key) && typeof record[key] !== "boolean",
    );
  const badArray =
    record &&
    [
      "languages",
      "trust_stats",
      "team_capacity_blocks",
      "quality_commitment_items",
      "project_type_options",
      "social_links",
      "featured_catalogue_ids",
      "tags_en",
      "tags_fr",
    ].some((key) => record[key] != null && !Array.isArray(record[key]));
  if (malformed || badBoolean || badArray)
    throw new Error(
      "The server returned incomplete saved content. Retry the read before editing.",
    );
}
/** Form defaults must not alter the baseline used to detect a new singleton row. */
export function editorBaseline(
  record: RecordData | null,
  singleton: boolean,
  defaults: RecordData = {},
): RecordData {
  return cloneRecord(record ?? (singleton ? {} : defaults));
}
export function hydrateEditorField(
  field: { type: string; value: string; checked?: boolean },
  saved: unknown,
) {
  if (field.type === "checkbox") {
    if (saved !== undefined) field.checked = saved === true;
    return;
  }
  if (saved !== undefined)
    field.value =
      field.type === "date" && saved
        ? String(saved).slice(0, 10)
        : String(saved ?? "");
}
/** Keep stored calendar days compatible with the existing date-input/API format. */
export function calendarDateForPayload(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)
    ? value.slice(0, 10)
    : value;
}
