/**
 * Launch hero slide set — the single source for local staging, the
 * validation test, and the production swap runbook
 * (Docs/hero_launch_runbook.md).
 *
 * CLIENT-5B: the four CLIENT-4A concepts the user approved, with the exact
 * EN/FR fields from Docs/client_5c_hero_final_review_2026-09-30.md. They
 * replace the HERO-7 Pack D set.
 *
 * CTA hrefs are locale-neutral English route slugs (`/services`, not
 * `/en/services/`). A slide has one href column shared by both locales, and
 * `localizeCmsHref` only maps a neutral slug to the visitor's locale; a
 * `/en/...` href would send French visitors to English pages.
 *
 * `image` names the source under public/img. `upload` is the optimised master
 * in Assets/hero-launch that an editor uploads in the admin. Both are null
 * while a slide has no cleared image.
 */
export const LAUNCH_SLIDES = [
  {
    image: 'lh-hero.jpg',
    upload: 'slide-1-lh-hero.jpg',
    eyebrow_en: 'Educational Publishing',
    eyebrow_fr: 'Édition éducative',
    headline_en: 'Expanding Minds',
    headline_fr: 'Éveiller les esprits',
    headline_accent_en: null,
    headline_accent_fr: null,
    subheadline_en: 'Enriching lives through knowledge',
    subheadline_fr: 'Enrichir des vies par la connaissance',
    primary_cta_label_en: 'Explore Catalogue',
    primary_cta_label_fr: 'Consulter le catalogue',
    primary_cta_href: '/catalogue',
    secondary_cta_label_en: 'Partner With Us',
    secondary_cta_label_fr: 'Devenir partenaire',
    secondary_cta_href: '/contact',
  },
  {
    image: 'lh-print-inspection-wide.jpg',
    upload: 'slide-2-lh-print-inspection-wide.jpg',
    eyebrow_en: 'Publishing Services',
    eyebrow_fr: 'Services d’édition',
    headline_en: 'Every Stage.',
    headline_fr: 'À chaque étape.',
    headline_accent_en: 'Every Solution',
    headline_accent_fr: 'Chaque solution',
    subheadline_en: 'From manuscripts to refined publications, our editorial, design, translation and print services support each stage of your project.',
    subheadline_fr: 'Du manuscrit à la publication soignée, nos services de révision, de conception, de traduction et d’impression accompagnent chaque étape de votre projet.',
    primary_cta_label_en: 'Our Services',
    primary_cta_label_fr: 'Nos services',
    primary_cta_href: '/services',
    secondary_cta_label_en: 'Contact Our Team',
    secondary_cta_label_fr: 'Contacter notre équipe',
    secondary_cta_href: '/contact',
  },
  {
    // No cleared LoHo artwork exists yet (CLIENT-5C). Left empty rather than
    // borrowing an unrelated photo; the carousel falls back to lh-hero.jpg.
    image: null,
    upload: null,
    eyebrow_en: 'Digital Learning · Coming soon',
    eyebrow_fr: 'Apprentissage numérique · Bientôt disponible',
    headline_en: 'LoHo',
    headline_fr: 'LoHo',
    headline_accent_en: 'coming soon',
    headline_accent_fr: 'bientôt disponible',
    subheadline_en: 'An e-learning platform with interactive educational content is coming soon to Cameroon.',
    subheadline_fr: 'Une plateforme d’apprentissage numérique avec des contenus pédagogiques interactifs sera bientôt disponible au Cameroun.',
    primary_cta_label_en: 'Explore Services',
    primary_cta_label_fr: 'Explorer nos services',
    primary_cta_href: '/services',
    secondary_cta_label_en: 'Why Choose Us',
    secondary_cta_label_fr: 'Pourquoi nous choisir',
    secondary_cta_href: '/why-choose-us',
  },
  {
    image: 'lh-bilingual-editor-wide.jpg',
    upload: 'slide-4-lh-bilingual-editor-wide.jpg',
    eyebrow_en: 'Heritage & Proximity',
    eyebrow_fr: 'Héritage et proximité',
    headline_en: 'Continental experience,',
    headline_fr: 'Une expérience continentale,',
    headline_accent_en: 'close to you',
    headline_accent_fr: 'à vos côtés',
    subheadline_en: 'From Yaoundé, our team works in English and French, drawing on Longhorn Publishers PLC’s six decades of publishing experience.',
    subheadline_fr: 'Depuis Yaoundé, notre équipe travaille en anglais et en français, forte des six décennies d’expérience éditoriale de Longhorn Publishers PLC.',
    primary_cta_label_en: 'Why Choose Us',
    primary_cta_label_fr: 'Pourquoi nous choisir',
    primary_cta_href: '/why-choose-us',
    secondary_cta_label_en: 'Get in Touch',
    secondary_cta_label_fr: 'Nous contacter',
    secondary_cta_href: '/contact',
  },
];

/** Layout budget from Docs/hero_slide_copy.md §4. */
export const SUBHEADLINE_LIMIT = { en: 165, fr: 185 };

/** Fixed local-only ids and blob keys, so restaging updates rather than duplicates. */
export const LOCAL_SLIDE_IDS = LAUNCH_SLIDES.map((_, i) => `00000000-0000-4000-8000-0000000007a${i + 1}`);
export const LOCAL_IMAGE_KEYS = LAUNCH_SLIDES.map((_, i) => `uploads/00000000-0000-4000-8000-0000000007e${i + 1}.jpeg`);

/** The admin API payload for a slide: every field except the local file names. */
export function slidePayload(slide, imageId, enabled = true) {
  const { image, upload, ...fields } = slide;
  return { ...fields, image_id: imageId, enabled };
}
