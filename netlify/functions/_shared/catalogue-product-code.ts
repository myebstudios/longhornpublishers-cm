export const PRODUCT_CODE_MAX_LENGTH = 64;

export type ProductCodeResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

/** Validate and normalize the shared ISBN / internal product-code field. */
export function parseProductCode(value: unknown): ProductCodeResult {
  if (typeof value !== 'string') {
    return { ok: false, error: 'Provide an ISBN / product code.' };
  }

  const normalized = value.trim();
  if (!normalized) return { ok: false, error: 'Provide an ISBN / product code.' };
  if (normalized.length > PRODUCT_CODE_MAX_LENGTH) {
    return {
      ok: false,
      error: `ISBN / product code must be ${PRODUCT_CODE_MAX_LENGTH} characters or fewer.`,
    };
  }
  return { ok: true, value: normalized };
}

/** Only map the product-code index to 409; unrelated database errors must surface. */
export function isProductCodeConflict(error: unknown): boolean {
  return Boolean(
    error
    && typeof error === 'object'
    && (error as { code?: unknown }).code === '23505'
    && (error as { constraint?: unknown }).constraint === 'catalogue_titles_product_code_ci_idx',
  );
}
