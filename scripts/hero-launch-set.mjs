/**
 * HERO-7 launch hero slide set — the single source for local staging, the
 * validation test, and the production swap runbook
 * (Docs/hero_launch_runbook.md).
 *
 * The 2026-09-28 client corrections supersede Pack D's first-slide opening and
 * its unsupported approval claim. The four-slide launch still needs sign-off.
 *
 * CTA hrefs are locale-neutral English route slugs (`/services`, not
 * `/en/services/`). A slide has one href column shared by both locales, and
 * `localizeCmsHref` only maps a neutral slug to the visitor's locale; a
 * `/en/...` href would send French visitors to English pages.
 *
 * `image` names the Pack D source under public/img. `upload` is the optimised
 * master in Assets/hero-launch that an editor uploads in the admin.
 */
export const LAUNCH_SLIDES = [
  {
    image: 'lh-hero.jpg',
    upload: 'slide-1-lh-hero.jpg',
    eyebrow_en: 'Cameroon & Central Africa',
    eyebrow_fr: 'Cameroun & Afrique Centrale',
    headline_en: 'Expanding Minds',
    headline_fr: 'Éveiller les esprits',
    headline_accent_en: null,
    headline_accent_fr: null,
    subheadline_en: 'Enriching lives through knowledge',
    subheadline_fr: 'Enrichir des vies par la connaissance',
    primary_cta_label_en: 'Explore Our Services',
    primary_cta_label_fr: 'Découvrir nos services',
    primary_cta_href: '/services',
    secondary_cta_label_en: 'Partner With Us',
    secondary_cta_label_fr: 'Nous contacter',
    secondary_cta_href: '/contact',
  },
  {
    image: 'lh-catalogue-shelves.jpg',
    upload: 'slide-2-lh-catalogue-shelves.jpg',
    eyebrow_en: 'Learning materials',
    eyebrow_fr: 'Conforme aux Programmes Nationaux',
    headline_en: 'Curriculum-aligned learning materials,',
    headline_fr: 'Matériels pédagogiques,',
    headline_accent_en: 'built for success.',
    headline_accent_fr: 'conçus pour la réussite.',
    subheadline_en: 'Primary and secondary textbooks and teaching resources crafted specifically for the Cameroonian educational framework in both English and French.',
    subheadline_fr: 'Manuels scolaires du primaire et du secondaire développés selon le socle éducatif camerounais, disponibles en français et en anglais.',
    primary_cta_label_en: 'Browse Full Catalogue',
    primary_cta_label_fr: 'Consulter le catalogue',
    primary_cta_href: '/catalogue',
    secondary_cta_label_en: 'Why Choose Us',
    secondary_cta_label_fr: 'Pourquoi nous choisir',
    secondary_cta_href: '/why-choose-us',
  },
  {
    image: 'lh-bilingual-editor-wide.jpg',
    upload: 'slide-3-lh-bilingual-editor-wide.jpg',
    eyebrow_en: 'Yaoundé Editorial Hub',
    eyebrow_fr: 'Centre Éditorial de Yaoundé',
    headline_en: 'Native bilingual expertise,',
    headline_fr: 'Expertise éditoriale bilingue,',
    headline_accent_en: 'in English and French.',
    headline_accent_fr: 'en français et en anglais.',
    subheadline_en: 'Our in-house editorial team in Tsinga combines linguistic precision with deep cultural context to elevate every manuscript across both official languages.',
    subheadline_fr: 'Notre équipe éditoriale à Tsinga allie précision linguistique et ancrage culturel pour enrichir chaque manuscrit dans les deux langues officielles.',
    primary_cta_label_en: 'Learn About Our Team',
    primary_cta_label_fr: 'Découvrir notre équipe',
    primary_cta_href: '/about',
    secondary_cta_label_en: 'Get in Touch',
    secondary_cta_label_fr: 'Prendre contact',
    secondary_cta_href: '/contact',
  },
  {
    image: 'lh-print-inspection-wide.jpg',
    upload: 'slide-4-lh-print-inspection-wide.jpg',
    eyebrow_en: '60 Years of African Publishing Excellence',
    eyebrow_fr: "60 Ans d'Excellence Éditoriale en Afrique",
    headline_en: 'Rooted in Central Africa,',
    headline_fr: 'Ancré en Afrique centrale,',
    headline_accent_en: 'backed by six decades.',
    headline_accent_fr: 'fort de six décennies.',
    subheadline_en: 'Leveraging sixty years of continental publishing leadership from Longhorn Publishers PLC to deliver uncompromising quality, accuracy, and trust.',
    subheadline_fr: 'Forts de soixante ans de leadership éditorial continental au sein de Longhorn Publishers PLC, nous garantissons une qualité et une rigueur irréprochables.',
    primary_cta_label_en: 'Why Choose Longhorn',
    primary_cta_label_fr: 'Pourquoi choisir Longhorn',
    primary_cta_href: '/why-choose-us',
    secondary_cta_label_en: 'View Latest News',
    secondary_cta_label_fr: 'Toutes les actualités',
    secondary_cta_href: '/news',
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
