-- Client corrections received 2026-09-28. Update published CMS values that
-- override the reviewed static copy; retain unrelated editor fields.

UPDATE site_settings
SET seo_default_description = 'Bilingual publishing services in Cameroon and Central Africa.'
WHERE id = 'default' AND seo_default_description ILIKE '%DRC%';

UPDATE homepage_content
SET hero_headline_en = 'Expanding Minds',
    hero_headline_fr = 'Éveiller les esprits',
    hero_headline_accent_en = '',
    hero_headline_accent_fr = '',
    hero_subheadline_en = 'Enriching lives through knowledge',
    hero_subheadline_fr = 'Enrichir des vies par la connaissance',
    who_we_are_copy_en = split_part(who_we_are_copy_en, E'\n\n', 1) || E'\n\n' ||
      $$From our office in Tsinga Yaoundé, we operate as content creators and platform business providers across the Central African Market. Our work spans the development of learning materials, educational content and professional publishing solutions in English and French, reflecting the country's bilingual education environment$$,
    who_we_are_copy_fr = split_part(who_we_are_copy_fr, E'\n\n', 1) || E'\n\n' ||
      'Depuis notre bureau de Tsinga à Yaoundé, nous intervenons en tant que créateurs de contenus et fournisseurs de solutions de plateforme sur le marché d’Afrique centrale. Nos activités couvrent le développement de matériels d’apprentissage, de contenus éducatifs et de solutions d’édition professionnelle en anglais et en français, reflétant l’environnement éducatif bilingue du pays.',
    trust_stats = (
      SELECT jsonb_agg(
        CASE WHEN item->>'label_en' ILIKE 'Local publishing team%'
          THEN jsonb_set(jsonb_set(item, '{label_en}', to_jsonb('Educational content creators and service providers'::text)), '{label_fr}', to_jsonb('Créateurs de contenus éducatifs et prestataires de services'::text))
          ELSE item END ORDER BY ord
      ) FROM jsonb_array_elements(trust_stats) WITH ORDINALITY AS items(item, ord)
    )
WHERE id = 'default';

-- The current published carousel is authoritative. Reconcile any old first
-- slide without enabling the separately staged HERO-7 launch set.
UPDATE homepage_hero_slides
SET headline_en = 'Expanding Minds', headline_fr = 'Éveiller les esprits',
    headline_accent_en = '', headline_accent_fr = '',
    subheadline_en = 'Enriching lives through knowledge',
    subheadline_fr = 'Enrichir des vies par la connaissance'
WHERE homepage_id = 'default'
  AND (headline_en ILIKE 'Professional publishing%' OR subheadline_en ILIKE '%DRC%');

UPDATE about_page
SET heritage_copy_en = split_part(heritage_copy_en, E'\n\n', 1) || E'\n\n' ||
    'What we add is proximity: a team working daily to serve the Cameroonian and Central African publishing ecosystem as a whole in both official languages.' || E'\n\n' || split_part(heritage_copy_en, E'\n\n', 3),
    heritage_copy_fr = split_part(heritage_copy_fr, E'\n\n', 1) || E'\n\n' ||
    'Ce que nous apportons en plus, c’est la proximité : une équipe travaillant quotidiennement au service de l’écosystème éditorial camerounais et d’Afrique centrale dans son ensemble, dans les deux langues officielles.' || E'\n\n' || split_part(heritage_copy_fr, E'\n\n', 3),
    purpose_en = 'To enrich lives through knowledge.',
    purpose_fr = 'Enrichir des vies par la connaissance.',
    vision_en = 'To be a trusted publishing partner for institutions across Cameroon and Central Africa.',
    vision_fr = 'Être un partenaire éditorial de confiance pour les institutions au Cameroun et en Afrique centrale.',
    mission_en = 'To develop and deliver high-quality learning and teaching materials that support learners, educators and institutions.',
    mission_fr = 'Développer et fournir des matériels d’apprentissage et d’enseignement de haute qualité qui soutiennent les apprenants, les éducateurs et les institutions.'
WHERE id = 'default';

UPDATE why_choose_us
SET local_presence_copy_en = split_part(local_presence_copy_en, E'\n\n', 1) || E'\n\n' ||
    'It also means working knowledge of the Cameroonian education context and the needs of local learners and educators.',
    local_presence_copy_fr = split_part(local_presence_copy_fr, E'\n\n', 1) || E'\n\n' ||
    'Cela signifie aussi une connaissance du contexte éducatif camerounais et des besoins des apprenants et des enseignants.'
WHERE id = 'default' AND local_presence_copy_en ILIKE '%DRC%';

UPDATE services
SET short_en = 'Language accuracy, clarity, flow and readability.',
    short_fr = 'Précision linguistique, clarté, fluidité et lisibilité.',
    description_en = $$Our editorial process spans different levels of editing, improving a manuscript's quality and usability without losing the author's intended message.$$
    ,description_fr = 'Notre processus éditorial couvre différents niveaux de révision, améliorant la qualité et la lisibilité d’un manuscrit sans perdre le message visé par l’auteur.'
WHERE slug = 'editing';

UPDATE services
SET short_en = 'English ↔ French and French ↔ English.',
    short_fr = 'Anglais ↔ Français et Français ↔ Anglais.',
    description_en = $$Our translation service supports organisations and content owners that need materials adapted between English and French, particularly where content must function effectively within bilingual educational and professional environments.

Our focus is not merely word-for-word conversion. It is about producing content that is clear, appropriate and fit for its intended audience.$$
    ,description_fr = 'Notre service de traduction accompagne les organisations et les détenteurs de contenus qui ont besoin d’adapter des documents entre l’anglais et le français, particulièrement lorsque les contenus doivent fonctionner efficacement dans des environnements éducatifs et professionnels bilingues.

Notre démarche ne se résume pas à une simple conversion mot à mot. Il s’agit de produire un contenu clair, approprié et adapté à son public cible.'
WHERE slug = 'translation';

-- No unverified curriculum or geographic claim survives in catalogue metadata.
UPDATE catalogue_titles
SET curriculum_alignment_en = NULL, curriculum_alignment_fr = NULL
WHERE curriculum_alignment_en ~* 'DRC|Congo' OR curriculum_alignment_fr ~* 'RDC|Congo';
