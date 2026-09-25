import { path, type Locale } from '../i18n';

/** Local visual fixtures. The homepage uses these only in astro dev without CMS slides. */
export function getDevHeroSlides(locale: Locale) {
  const fr = locale === 'fr';
  return [
    {
      id: 'dev-services',
      image: '/img/lh-hero.jpg',
      eyebrow: null,
      headline: fr ? "Services d’édition professionnels," : 'Professional publishing services,',
      headline_accent: fr ? 'du début à la fin' : 'start to finish',
      subheadline: fr
        ? 'Révision, correction, traduction, graphisme, illustration et impression — des services bilingues réunis à Yaoundé.'
        : 'Editing, proofreading, translation, design, illustration and printing — delivered bilingually from Yaoundé.',
      primary_cta_label: fr ? 'Travaillons ensemble' : 'Partner With Us',
      primary_cta_href: path('contact', locale),
      secondary_cta_label: fr ? 'Découvrir nos services' : 'Explore our services',
      secondary_cta_href: path('services', locale),
    },
    {
      id: 'dev-catalogue',
      image: '/img/lh-catalogue-shelves.jpg',
      eyebrow: fr ? 'Notre catalogue' : 'Our catalogue',
      headline: fr ? 'Des livres pour apprendre,' : 'Books for learning,',
      headline_accent: fr ? 'à chaque étape' : 'at every stage',
      subheadline: fr
        ? 'Découvrez les manuels et ressources pédagogiques proposés pour les élèves, les enseignants et les établissements.'
        : 'Explore textbooks and learning resources for students, teachers and schools.',
      primary_cta_label: fr ? 'Voir le catalogue' : 'Browse the catalogue',
      primary_cta_href: path('catalogue', locale),
      secondary_cta_label: null,
      secondary_cta_href: null,
    },
    {
      id: 'dev-editorial',
      image: '/img/lh-bilingual-editor-wide.jpg',
      eyebrow: fr ? 'À Yaoundé' : 'Based in Yaoundé',
      headline: fr ? 'Une équipe éditoriale bilingue,' : 'A bilingual editorial team,',
      headline_accent: fr ? 'proche de vos lecteurs' : 'close to your readers',
      subheadline: fr
        ? 'Notre équipe travaille en français et en anglais, avec une attention particulière au contexte local de chaque projet.'
        : 'Our team works in English and French, with attention to the local context of every project.',
      primary_cta_label: fr ? 'Découvrir notre équipe' : 'Meet our team',
      primary_cta_href: path('about', locale),
      secondary_cta_label: fr ? 'Nous contacter' : 'Get in touch',
      secondary_cta_href: path('contact', locale),
    },
  ];
}
