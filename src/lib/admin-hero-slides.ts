export interface HeroSlideDraft {
  image_id?: string | null;
  eyebrow_en?: string | null;
  eyebrow_fr?: string | null;
  headline_en?: string | null;
  headline_fr?: string | null;
  headline_accent_en?: string | null;
  headline_accent_fr?: string | null;
  subheadline_en?: string | null;
  subheadline_fr?: string | null;
  primary_cta_label_en?: string | null;
  primary_cta_label_fr?: string | null;
  primary_cta_href?: string | null;
  secondary_cta_label_en?: string | null;
  secondary_cta_label_fr?: string | null;
  secondary_cta_href?: string | null;
  enabled?: boolean;
}

export type HeroSlideFieldErrors = Record<string, string>;

const value = (input: unknown) => typeof input === 'string' ? input.trim() : '';

function pairErrors(
  draft: HeroSlideDraft,
  stem: 'eyebrow' | 'headline' | 'headline_accent' | 'subheadline' | 'primary_cta_label' | 'secondary_cta_label',
  label: string,
  required: boolean,
  errors: HeroSlideFieldErrors,
): void {
  const enKey = `${stem}_en` as keyof HeroSlideDraft;
  const frKey = `${stem}_fr` as keyof HeroSlideDraft;
  const en = value(draft[enKey]);
  const fr = value(draft[frKey]);
  if (required && !en) errors[String(enKey)] = `${label} is required in English.`;
  if (required && !fr) errors[String(frKey)] = `${label} is required in French.`;
  if (!required && en && !fr) errors[String(frKey)] = `Add the French ${label.toLowerCase()}, or clear the English one.`;
  if (!required && fr && !en) errors[String(enKey)] = `Add the English ${label.toLowerCase()}, or clear the French one.`;
}

function validHref(candidate: string): boolean {
  if ((candidate.startsWith('/') && !candidate.startsWith('//')) || candidate.startsWith('#')) return true;
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Client-side mirror of the HERO-2 contract, used for field-level guidance. */
export function validateHeroSlideDraft(draft: HeroSlideDraft): HeroSlideFieldErrors {
  const errors: HeroSlideFieldErrors = {};
  pairErrors(draft, 'eyebrow', 'Eyebrow', false, errors);
  pairErrors(draft, 'headline', 'Headline', true, errors);
  pairErrors(draft, 'headline_accent', 'Headline accent', false, errors);
  pairErrors(draft, 'subheadline', 'Subheadline', true, errors);
  pairErrors(draft, 'primary_cta_label', 'Primary CTA label', true, errors);
  pairErrors(draft, 'secondary_cta_label', 'Secondary CTA label', false, errors);

  const primaryHref = value(draft.primary_cta_href);
  if (!primaryHref) errors.primary_cta_href = 'Every primary CTA label needs a link.';
  else if (!validHref(primaryHref)) errors.primary_cta_href = 'Use a site path, page fragment, or http(s) URL.';

  const secondaryEn = value(draft.secondary_cta_label_en);
  const secondaryFr = value(draft.secondary_cta_label_fr);
  const secondaryHref = value(draft.secondary_cta_href);
  if ((secondaryEn || secondaryFr) && !secondaryHref) {
    errors.secondary_cta_href = 'Every secondary CTA label needs a link.';
  } else if (secondaryHref && !secondaryEn && !secondaryFr) {
    errors.secondary_cta_label_en = 'Add both CTA labels, or clear the link.';
    errors.secondary_cta_label_fr = 'Add both CTA labels, or clear the link.';
  } else if (secondaryHref && !validHref(secondaryHref)) {
    errors.secondary_cta_href = 'Use a site path, page fragment, or http(s) URL.';
  }
  return errors;
}

/** Locate a HERO-2 server error beside the fields an editor can fix. */
export function fieldsForHeroSlideError(message: string): string[] {
  const text = message.toLowerCase();
  if (text.includes('headline accent')) return ['headline_accent_en', 'headline_accent_fr'];
  if (text.includes('headline')) return ['headline_en', 'headline_fr'];
  if (text.includes('subheadline')) return ['subheadline_en', 'subheadline_fr'];
  if (text.includes('eyebrow')) return ['eyebrow_en', 'eyebrow_fr'];
  if (text.includes('primary cta') && text.includes('label') && text.includes('href')) {
    return ['primary_cta_label_en', 'primary_cta_label_fr', 'primary_cta_href'];
  }
  if (text.includes('primary cta label')) return ['primary_cta_label_en', 'primary_cta_label_fr'];
  if (text.includes('primary cta href')) return ['primary_cta_href'];
  if (text.includes('primary cta')) return ['primary_cta_label_en', 'primary_cta_label_fr', 'primary_cta_href'];
  if (text.includes('secondary cta') && text.includes('label') && text.includes('href')) {
    return ['secondary_cta_label_en', 'secondary_cta_label_fr', 'secondary_cta_href'];
  }
  if (text.includes('secondary cta label')) return ['secondary_cta_label_en', 'secondary_cta_label_fr'];
  if (text.includes('secondary cta href')) return ['secondary_cta_href'];
  if (text.includes('secondary cta')) return ['secondary_cta_label_en', 'secondary_cta_label_fr', 'secondary_cta_href'];
  if (text.includes('image')) return ['image_id'];
  if (text.includes('enabled')) return ['enabled'];
  return [];
}
