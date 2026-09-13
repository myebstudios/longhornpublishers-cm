/**
 * Presentation-only lookups shared by the homepage, catalogue and services pages.
 * Kept out of site.ts because none of it is content — it is how content is drawn.
 */
import type { Locale } from '../i18n';

/** Photograph per service, used on the homepage carousel. */
export const SERVICE_IMG: Record<string, string> = {
  editing: 'lh-production-planning.jpg',
  proofreading: 'lh-proofreading.jpg',
  translation: 'lh-bilingual-review.jpg',
  designing: 'lh-book-design.jpg',
  illustration: 'lh-science-workbook.jpg',
  printing: 'lh-print-workshop.jpg',
};

/** Photograph per service, used on the services page detail splits. */
export const SERVICE_DETAIL_IMG: Record<string, string> = {
  editing: 'lh-student-reading.jpg',
  proofreading: 'lh-print-quality.jpg',
  translation: 'lh-bilingual-editor-wide.jpg',
  designing: 'lh-creative-wall.jpg',
  illustration: 'lh-illustration-studio.jpg',
  printing: 'lh-print-inspection-wide.jpg',
};

/** Stand-in cover art while the catalogue has no supplied artwork. */
export const COVER_GRADIENTS: Record<string, string> = {
  maths: 'linear-gradient(140deg, #184e38 0%, #0d281d 100%)',
  science: 'linear-gradient(140deg, #37184e 0%, #1c0d28 100%)',
  french: 'linear-gradient(140deg, #571728 0%, #2b0b14 100%)',
  english: 'linear-gradient(140deg, #173757 0%, #0b1c2b 100%)',
  social: 'linear-gradient(140deg, #573e17 0%, #2b1f0b 100%)',
};

export const DEFAULT_COVER_GRADIENT = 'linear-gradient(140deg, #571728 0%, #2b0b14 100%)';

export const SUBJECT_ICON: Record<string, string> = {
  maths: 'book',
  science: 'target',
  french: 'pen',
  english: 'globe',
  social: 'shield',
};

const DISCIPLINE: Record<string, Record<Locale, string>> = {
  editorial: { en: 'Editorial', fr: 'Éditorial' },
  creative: { en: 'Creative', fr: 'Créatif' },
  production: { en: 'Production', fr: 'Production' },
};

export const disciplineLabel = (discipline: string, locale: Locale): string =>
  DISCIPLINE[discipline]?.[locale] ?? discipline;

/** Accent class per discipline, so a service reads the same colour everywhere. */
export const DISCIPLINE_ACCENT: Record<string, string> = {
  editorial: '',
  creative: 'card--accent-mustard',
  production: 'card--accent-purple',
};
