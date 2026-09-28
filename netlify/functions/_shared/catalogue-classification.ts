/**
 * Catalogue classification and cover eligibility (CLIENT-3, C05/C15).
 *
 * A title is public only when it is published AND classified. A cover is
 * public only when the title is a verified National Book List title AND its
 * cover rights are approved. Public SQL applies the same rule
 * (`PUBLIC_CLASSIFICATIONS`, `coverIsPublic`), so a renderer cannot leak a
 * cover by forgetting a check.
 */
export const CLASSIFICATIONS = ['national_book_list_verified', 'other_developed', 'unclassified'] as const;
export type Classification = (typeof CLASSIFICATIONS)[number];
export const PUBLIC_CLASSIFICATIONS: Classification[] = ['national_book_list_verified', 'other_developed'];

export interface ClassificationInput {
  classification: Classification;
  booklist_evidence_ref: string | null;
  booklist_verified_by: string | null;
  booklist_verified_at: string | null;
  cover_rights_approved: boolean;
}

export type ClassificationResult = { ok: true; value: ClassificationInput } | { ok: false; error: string };

const clean = (value: unknown, max: number): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
};

/** Validate the admin payload. `today` is injectable for tests (YYYY-MM-DD). */
export function parseClassification(body: Record<string, unknown>, today = new Date().toISOString().slice(0, 10)): ClassificationResult {
  const classification = body.classification ?? 'unclassified';
  if (typeof classification !== 'string' || !(CLASSIFICATIONS as readonly string[]).includes(classification)) {
    return { ok: false, error: 'Choose a catalogue classification.' };
  }
  if (body.cover_rights_approved !== undefined && typeof body.cover_rights_approved !== 'boolean') {
    return { ok: false, error: 'Cover rights approval must be true or false.' };
  }
  const value: ClassificationInput = {
    classification: classification as Classification,
    booklist_evidence_ref: clean(body.booklist_evidence_ref, 500),
    booklist_verified_by: clean(body.booklist_verified_by, 120),
    booklist_verified_at: clean(body.booklist_verified_at, 10),
    cover_rights_approved: body.cover_rights_approved === true,
  };
  if (value.classification !== 'national_book_list_verified') {
    // Evidence is kept only for verified membership; cover rights mean nothing without it.
    return { ok: true, value: { ...value, booklist_evidence_ref: null, booklist_verified_by: null, booklist_verified_at: null, cover_rights_approved: false } };
  }
  if (!value.booklist_evidence_ref || !value.booklist_verified_by || !value.booklist_verified_at) {
    return { ok: false, error: 'National Book List titles need an evidence reference, a reviewer and a verification date.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.booklist_verified_at) || Number.isNaN(Date.parse(`${value.booklist_verified_at}T00:00:00Z`))) {
    return { ok: false, error: 'Verification date must be a valid date (YYYY-MM-DD).' };
  }
  if (value.booklist_verified_at > today) {
    return { ok: false, error: 'Verification date cannot be in the future.' };
  }
  return { ok: true, value };
}

export function isPubliclyListed(title: { published: boolean; classification: string }): boolean {
  return title.published && (PUBLIC_CLASSIFICATIONS as string[]).includes(title.classification);
}

export function coverIsPublic(title: { published: boolean; classification: string; cover_rights_approved: boolean; cover_image_id: string | null }): boolean {
  return Boolean(title.cover_image_id) && title.published
    && title.classification === 'national_book_list_verified' && title.cover_rights_approved;
}
