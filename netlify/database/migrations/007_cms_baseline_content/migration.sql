-- CMS baseline content for production.
--
-- Every admin form on the live site opened EMPTY. The cause was not the schema
-- and not the seed script: scripts/seed-cms-baseline.mjs refuses to run against
-- anything but loopback, so it only ever populated a developer's machine. No
-- content row has ever existed in the production database.
--
-- Netlify applies migrations to production on publish, so a DML migration is
-- the only path that reaches it. This file is GENERATED from the approved
-- bilingual copy in src/i18n by scripts/gen-cms-seed-migration.mjs — do not
-- hand-edit it; change the copy or the generator and regenerate.
--
-- The contract: seeding must not change one visible character of the public
-- site. Every page already renders this exact copy via its i18n fallback; this
-- moves it into the CMS so an editor can see and change it. Verified by a
-- before/after HTML diff across all 20 public routes.
--
-- Rows are written published = true because they reproduce copy that is
-- ALREADY live. Writing them as drafts would blank the public pages.
--
-- Idempotent: safe to re-run, and safe if an editor has already saved content
-- (ON CONFLICT DO NOTHING / NOT EXISTS guards never overwrite editor work).

-- Columns required to represent what the public site actually renders.
-- Without these the hero heading collapses to one flat line, every service
-- loses its photograph and its overview-card summary, and the seed below
-- would be a visible regression rather than a faithful copy.
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS hero_headline_accent_en text;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS hero_headline_accent_fr text;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS hero_eyebrow_en text;
ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS hero_eyebrow_fr text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_en text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_fr text;
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_key ON services (slug) WHERE slug IS NOT NULL;

-- Site settings: global identity, contact block, footer and SEO defaults.
INSERT INTO site_settings (
  id, company_name_en, company_name_fr, tagline_en, tagline_fr, address, phone_1, phone_2, email,
  social_links, footer_tagline_en, footer_tagline_fr, newsletter_copy_en, newsletter_copy_fr,
  parent_company_url, seo_default_title, seo_default_description, og_image_id
) VALUES (
  'default',
  'Longhorn Publishers Cameroon Ltd', 'Longhorn Publishers Cameroun Ltd',
  'Content creators and platform business providers',
  'Créateurs de contenus et fournisseurs de solutions éditoriales',
  'Total École de police, Tsinga — Yaoundé, Cameroon',
  '+237 672 49 10 93', '+237 657 51 92 03',
  'longhorncameroon@longhornpublishers.com',
  '[]'::jsonb,
  'Content creators and platform business providers for Central Africa — end-to-end publishing services from manuscript to printed book, in English and French.',
  'Créateurs de contenus et fournisseurs de solutions éditoriales pour l’Afrique centrale — services d’édition complets, du manuscrit au livre imprimé.',
  'Your email for publishing insights', 'Votre courriel pour nos actualités',
  'https://longhornpublishers.com',
  'Longhorn Publishers Cameroon',
  'Professional bilingual publishing services in Cameroon and the DRC.',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Homepage. hero_eyebrow stays NULL: the live hero renders no eyebrow line,
-- and inventing one here would add an element the page does not have.
-- trust_stats values are blank on purpose — the live trust bar is label-only.
INSERT INTO homepage_content (
  id, hero_headline_en, hero_headline_fr, hero_headline_accent_en, hero_headline_accent_fr,
  hero_eyebrow_en, hero_eyebrow_fr, hero_subheadline_en, hero_subheadline_fr,
  hero_cta_label_en, hero_cta_label_fr, who_we_are_copy_en, who_we_are_copy_fr,
  trust_stats, one_partner_copy_en, one_partner_copy_fr, featured_catalogue_ids, published
) VALUES (
  'default',
  'Professional publishing services,', 'Services d’édition professionnels,',
  'start to finish', 'du début à la fin',
  NULL, NULL,
  'Editing, proofreading, translation, design, illustration and printing — delivered bilingually from Yaoundé for publishers, institutions and organisations across Cameroon and the DRC.', 'Révision, correction d’épreuves, traduction, conception, illustration et impression — livrés en deux langues depuis Yaoundé pour les éditeurs, institutions et organisations du Cameroun et de la RDC.',
  'Partner With Us', 'Devenir partenaire',
  'Longhorn Publishers Cameroon Ltd is the Central African arm of Longhorn Publishers PLC — a publishing house with sixty years of experience creating educational and general-interest content across the continent.

From our office in Tsinga, Yaoundé, we operate as content creators and platform business providers: an editorial, creative and production team working in both official languages, close enough to the market to get the cultural detail right.', 'Longhorn Publishers Cameroun Ltd est la filiale pour l’Afrique centrale de Longhorn Publishers PLC — une maison d’édition forte de soixante ans d’expérience dans la création de contenus éducatifs et généralistes sur le continent.

Depuis notre bureau de Tsinga, à Yaoundé, nous sommes créateurs de contenus et fournisseurs de solutions éditoriales : une équipe éditoriale, créative et de production travaillant dans les deux langues officielles, assez proche du marché pour en saisir les nuances culturelles.',
  '[{"value":"","label_en":"Backed by Longhorn Publishers PLC","label_fr":"Soutenu par Longhorn Publishers PLC"},{"value":"","label_en":"Aligned to national curricula","label_fr":"Conforme aux programmes nationaux"},{"value":"","label_en":"Fully bilingual English & French","label_fr":"Entièrement bilingue anglais et français"},{"value":"","label_en":"One partner, manuscript to delivery","label_fr":"Un seul partenaire, du manuscrit à la livraison"}]'::jsonb,
  'Most publishing projects stall in the handovers. We remove them.', 'La plupart des projets d’édition s’enlisent dans les transitions. Nous les supprimons.',
  '[]'::jsonb, true
) ON CONFLICT (id) DO NOTHING;

-- About page. Team blocks carry a bilingual title and their pill tags; a single
-- title column would have shown the English team names to French visitors.
INSERT INTO about_page (
  id, heritage_copy_en, heritage_copy_fr, purpose_en, purpose_fr, vision_en, vision_fr,
  mission_en, mission_fr, values_en, values_fr, team_capacity_blocks, published
) VALUES (
  'default',
  'Longhorn Publishers Cameroon Ltd is a subsidiary of Longhorn Publishers PLC, a group with roughly six decades of experience publishing educational and general-interest titles across Africa.

That heritage gives us editorial standards, production capacity and institutional relationships that a new entrant simply cannot assemble. What we add is proximity: a team based in Tsinga, Yaoundé, working daily in the Cameroonian and Congolese education context, in both official languages.

We describe ourselves as content creators and platform business providers — we make the content, and we run the process that gets it into learners’ hands.', 'Longhorn Publishers Cameroun Ltd est une filiale de Longhorn Publishers PLC, un groupe fort de près de six décennies d’expérience dans l’édition d’ouvrages éducatifs et généralistes à travers l’Afrique.

Cet héritage nous apporte des exigences éditoriales, une capacité de production et des relations institutionnelles qu’un nouvel entrant ne peut tout simplement pas réunir. Ce que nous y ajoutons, c’est la proximité : une équipe basée à Tsinga, à Yaoundé, immergée quotidiennement dans le contexte éducatif camerounais et congolais, dans les deux langues officielles.

Nous nous définissons comme créateurs de contenus et fournisseurs de solutions éditoriales — nous produisons le contenu et nous pilotons le processus qui le met entre les mains des élèves.',
  'To expand minds — creating content that makes learning accessible, accurate and relevant across Central Africa.', 'Élargir les esprits — créer des contenus qui rendent l’apprentissage accessible, exact et pertinent en Afrique centrale.',
  'To be the publishing partner of choice in Cameroon and the DRC for institutions that will not compromise on quality.', 'Devenir le partenaire éditorial de référence au Cameroun et en RDC pour les institutions qui refusent tout compromis sur la qualité.',
  'To deliver end-to-end publishing — editorial, creative and production — bilingually, on schedule, at a fair price.', 'Assurer une édition de bout en bout — éditoriale, créative et production — en deux langues, dans les délais et à un prix juste.',
  'Quality, cultural relevance, flexibility and accountability — held at every stage, not just at sign-off.', 'Qualité, pertinence culturelle, souplesse et responsabilité — à chaque étape, et pas seulement à la validation finale.',
  '[{"title":"Editorial Team","title_en":"Editorial Team","title_fr":"Équipe éditoriale","icon":"pen","description_en":"Editors, proofreaders and translators working across English and French, with subject specialists for curriculum-aligned material.","description_fr":"Réviseurs, correcteurs et traducteurs travaillant en anglais et en français, avec des spécialistes par matière pour les contenus conformes aux programmes.","tags_en":["Editing","Proofreading","Translation"],"tags_fr":["Révision","Correction","Traduction"]},{"title":"Design & Production Team","title_en":"Design & Production Team","title_fr":"Équipe création et production","icon":"brush","description_en":"Designers, illustrators and typesetters who take a manuscript through layout, artwork and print-ready files.","description_fr":"Graphistes, illustrateurs et metteurs en page qui conduisent un manuscrit jusqu’aux fichiers prêts pour l’impression.","tags_en":["Designing","Illustration","Printing"],"tags_fr":["Conception","Illustration","Impression"]},{"title":"Project Management","title_en":"Project Management","title_fr":"Gestion de projet","icon":"users","description_en":"A named lead per project owning the schedule, the language tracks and the client relationship end to end.","description_fr":"Un responsable désigné par projet, garant du calendrier, des deux versions linguistiques et de la relation client de bout en bout.","tags_en":["Scheduling","Quality gates","Reporting"],"tags_fr":["Planification","Points de contrôle","Reporting"]}]'::jsonb, true
) ON CONFLICT (id) DO NOTHING;

-- Why Choose Us. Pillar 1 is the local-presence copy columns; pillars 2+ are
-- the jsonb list, carrying their split heading, numbered eyebrow and pills so
-- the rendered page is unchanged.
INSERT INTO why_choose_us (id, local_presence_copy_en, local_presence_copy_fr, quality_commitment_items, published)
VALUES ('default', 'Our team is in Tsinga, Yaoundé. That means site visits, in-person reviews and a schedule that runs on local realities rather than a distant head office calendar.

It also means working knowledge of both the Cameroonian and DRC national curricula — the structure, the terminology and the approval expectations — rather than a generic African education template.', 'Notre équipe est à Tsinga, Yaoundé. Cela signifie des visites sur site, des relectures en personne et un calendrier qui suit les réalités locales plutôt que l’agenda d’un siège lointain.

Cela signifie aussi une connaissance pratique des programmes nationaux camerounais et congolais — leur structure, leur terminologie et les attentes en matière d’agrément — plutôt qu’un modèle éducatif africain générique.', '[{"icon":null,"title_en":"A review stage that actually blocks","title_fr":"Une phase de contrôle qui bloque réellement","description_en":"Quality Review is step four of five, and it has the authority to stop a project going to print. Proofreading, factual checks and curriculum alignment are verified against the original brief.\n\nBacked by six decades of group publishing standards — inherited process, not improvised.","description_fr":"Le contrôle qualité est la quatrième des cinq étapes, et il a autorité pour empêcher un projet de partir à l’impression. Correction d’épreuves, vérification des faits et conformité au programme sont contrôlées au regard du cahier des charges initial.\n\nAdossé à six décennies d’exigences éditoriales de groupe — un processus hérité, non improvisé.","eyebrow_en":"02 — Quality commitment","eyebrow_fr":"02 — Engagement qualité","title_lead_en":"A review stage that","title_lead_fr":"Une phase de contrôle qui","title_accent_en":"actually blocks","title_accent_fr":"bloque réellement","tags_en":["Structural edit","Line edit","Proofread","Curriculum check","Print proof"],"tags_fr":["Révision structurelle","Révision de style","Correction","Contrôle programme","Bon à tirer"]},{"icon":null,"title_en":"Two languages, one standard","title_fr":"Deux langues, une seule exigence","description_en":"In a bilingual country, a French edition that reads like a translation is a liability. Our translators work in the education context daily and localise rather than transpose — examples, names, currency, idiom and classroom register all adjusted.\n\nBoth language tracks are planned and scheduled together from day one, so neither edition becomes the afterthought that ships late.","description_fr":"Dans un pays bilingue, une édition française qui sent la traduction est un handicap. Nos traducteurs évoluent quotidiennement dans le contexte éducatif et localisent plutôt qu’ils ne transposent — exemples, noms, monnaie, expressions et registre de classe sont tous adaptés.\n\nLes deux versions linguistiques sont planifiées ensemble dès le premier jour : aucune ne devient l’édition secondaire livrée en retard.","eyebrow_en":"03 — Bilingual capability & cultural relevance","eyebrow_fr":"03 — Capacité bilingue et pertinence culturelle","title_lead_en":"Two languages,","title_lead_fr":"Deux langues,","title_accent_en":"one standard","title_accent_fr":"une seule exigence","tags_en":null,"tags_fr":null}]'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- Contact. map_lat/map_lng stay NULL: Contact.astro prefers coordinates over
-- the address string, so setting them would change the embedded map's source.
INSERT INTO contact_settings (id, hero_copy_en, hero_copy_fr, project_type_options, map_lat, map_lng, published)
VALUES ('default', 'Tell us the scope, the level and the languages. We will come back with a plan, a schedule and a price.', 'Indiquez-nous le périmètre, le niveau et les langues. Nous reviendrons avec un plan, un calendrier et un prix.', '[{"label_en":"Educational material","label_fr":"Support pédagogique"},{"label_en":"Training resource","label_fr":"Ressource de formation"},{"label_en":"Report or publication","label_fr":"Rapport ou publication"},{"label_en":"Translation only","label_fr":"Traduction uniquement"},{"label_en":"Design or illustration only","label_fr":"Conception ou illustration uniquement"},{"label_en":"Print run only","label_fr":"Impression uniquement"},{"label_en":"Other","label_fr":"Autre"}]'::jsonb, NULL, NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Legal pages. Section headings survive as "## " lines, which Legal.astro
-- renders as <h2>. updated_at is pinned to the date the published documents
-- state; letting it default to now() would restate a client-facing legal
-- document as revised today.
INSERT INTO legal_pages (page, body_en, body_fr, updated_at, published)
SELECT 'privacy_policy', '## 1. Information We Collect
We collect personal information that you voluntarily provide when submitting inquiry or subscription forms on this website. This includes your name, organisation, email address, phone number, and project details provided via our Contact form, as well as your email address when subscribing to publishing insights in the footer.

## 2. How We Use Your Information
Information collected through form submissions is used strictly to respond to your publishing or curriculum inquiries, provide requested project proposals, and send institutional updates or publishing insights. We do not sell, rent, or trade your personal information to third parties.

## 3. Data Submission & Storage
Website forms are submitted securely via Netlify Forms and routed to designated Longhorn Publishers Cameroon Ltd personnel at our Yaoundé office. Data is retained only as long as necessary to process your request and manage ongoing professional correspondence.

## 4. Cookies & Browser Preferences
Our website uses essential browser storage solely to remember your preferred display language (English or French). We do not deploy third-party advertising cookies or cross-site tracking scripts.

## 5. Your Rights & Contact Information
You may request access to, correction of, or deletion of your contact details at any time by contacting our Yaoundé office at longhorncameroon@longhornpublishers.com or calling +(237) 672 49 10 93 / +(237) 657 51 92 03.', '## 1. Informations collectées
Nous collectons les données personnelles que vous fournissez volontairement en remplissant nos formulaires sur ce site. Cela comprend votre nom, organisation, adresse e-mail, numéro de téléphone et détails de votre projet soumis via notre formulaire de Contact, ainsi que votre adresse e-mail lors de l’inscription à nos actualités éditoriales.

## 2. Utilisation de vos informations
Les données collectées sont utilisées exclusivement pour répondre à vos demandes de renseignements ou de devis d’édition, et pour vous adresser des mises à jour institutionnelles ou actualités. Nous ne vendons, ne louons et ne partageons vos données personnelles avec aucun tiers à des fins commerciales.

## 3. Transmission et conservation des données
Les formulaires sont transmis de manière sécurisée via Netlify Forms et acheminés vers le personnel habilité de Longhorn Publishers Cameroun Ltd à notre bureau de Yaoundé. Les données sont conservées uniquement le temps nécessaire au traitement de votre demande et à la gestion de nos échanges professionnels.

## 4. Cookies et préférences de navigation
Notre site web utilise les fonctionnalités de stockage du navigateur uniquement pour mémoriser votre langue d’affichage préférée (anglais ou français). Aucun cookie publicitaire tiers ou script de suivi comportemental n’est déposé.

## 5. Vos droits et contacts
Vous pouvez à tout moment demander l’accès, la rectification ou la suppression de vos données personnelles en contactant notre bureau de Yaoundé à longhorncameroon@longhornpublishers.com ou par téléphone au +(237) 672 49 10 93 / +(237) 657 51 92 03.', timestamptz '2026-09-01 00:00:00+00', true
WHERE NOT EXISTS (SELECT 1 FROM legal_pages WHERE page = 'privacy_policy');
INSERT INTO legal_pages (page, body_en, body_fr, updated_at, published)
SELECT 'terms_of_use', '## 1. Acceptance of Terms
By accessing or using this website, you agree to comply with and be bound by these Terms of Use. If you do not agree, please refrain from using the site.

## 2. Intellectual Property Rights
All content on this website—including text, graphics, book covers, design layouts, logos, and trademarks—is the property of Longhorn Publishers Cameroon Ltd or Longhorn Publishers PLC and is protected by applicable copyright laws. Unauthorized reproduction or distribution is strictly prohibited.

## 3. Website Content & Educational Materials
Catalogue listings, curriculum descriptions, and service details provided on this site are for informational and B2B inquiry purposes. Formal publishing service agreements and book orders are governed by separate written contracts.

## 4. Acceptable Use
You agree to use our contact and subscription forms only for legitimate inquiries. Submitting false details, unsolicited commercial spam, or malicious code is strictly prohibited.

## 5. Governing Law & Location
These terms are governed by the laws of the Republic of Cameroon. For inquiries regarding these terms, contact Longhorn Publishers Cameroon Ltd, Total École de police, Tsinga, Yaoundé, Cameroon.', '## 1. Acceptation des conditions
En accédant à ce site web et en l’utilisant, vous acceptez d’être lié par les présentes conditions d’utilisation. Si vous n’acceptez pas ces conditions, veuillez ne pas utiliser ce site.

## 2. Droits de propriété intellectuelle
L’ensemble des contenus de ce site web (textes, graphismes, couvertures d’ouvrages, mises en page, logos et marques) est la propriété de Longhorn Publishers Cameroun Ltd ou de Longhorn Publishers PLC. Toute reproduction ou distribution non autorisée est strictement interdite.

## 3. Contenus du site et offres de services
Les fiches du catalogue, les descriptions de programmes et les détails des services présentés sur ce site le sont à titre informatif. Les contrats d’édition et commandes d’ouvrages font l’objet de conventions écrites distinctes.

## 4. Utilisation acceptable
Vous vous engagez à utiliser nos formulaires uniquement pour des demandes légitimes. La soumission de fausses informations, de spams commercial non sollicité ou de code malveillant est strictement interdite.

## 5. Loi applicable et contact
Ces conditions sont régies par les lois de la République du Cameroun. Pour toute question concernant ces conditions, contactez Longhorn Publishers Cameroun Ltd, Total École de police, Tsinga, Yaoundé, Cameroun.', timestamptz '2026-09-01 00:00:00+00', true
WHERE NOT EXISTS (SELECT 1 FROM legal_pages WHERE page = 'terms_of_use');

-- Publishing process steps.
INSERT INTO process_steps (step_number, title_en, title_fr, description_en, description_fr, published)
SELECT 1, 'Consultation', 'Consultation', 'Scope, audience, curriculum requirements, languages and budget mapped before anything is quoted.', 'Périmètre, public, exigences du programme, langues et budget définis avant toute proposition chiffrée.', true
WHERE NOT EXISTS (SELECT 1 FROM process_steps WHERE step_number = 1);
INSERT INTO process_steps (step_number, title_en, title_fr, description_en, description_fr, published)
SELECT 2, 'Planning', 'Planification', 'Schedule, milestones and team allocation agreed in writing, with both language tracks planned in parallel.', 'Calendrier, jalons et affectation des équipes convenus par écrit, les deux versions linguistiques planifiées en parallèle.', true
WHERE NOT EXISTS (SELECT 1 FROM process_steps WHERE step_number = 2);
INSERT INTO process_steps (step_number, title_en, title_fr, description_en, description_fr, published)
SELECT 3, 'Execution', 'Exécution', 'Editorial, design and illustration run against the agreed brief, with progress visible at each milestone.', 'Révision, conception et illustration menées selon le cahier des charges, avec un suivi visible à chaque jalon.', true
WHERE NOT EXISTS (SELECT 1 FROM process_steps WHERE step_number = 3);
INSERT INTO process_steps (step_number, title_en, title_fr, description_en, description_fr, published)
SELECT 4, 'Quality Review', 'Contrôle qualité', 'Proofreading, factual verification and curriculum alignment. This stage can and does block a release.', 'Correction d’épreuves, vérification des faits et conformité au programme. Cette étape peut bloquer — et bloque — une parution.', true
WHERE NOT EXISTS (SELECT 1 FROM process_steps WHERE step_number = 4);
INSERT INTO process_steps (step_number, title_en, title_fr, description_en, description_fr, published)
SELECT 5, 'Delivery', 'Livraison', 'Print, finishing and distribution to the schedule set at planning — plus files archived for future editions.', 'Impression, façonnage et distribution selon le calendrier fixé — et archivage des fichiers pour les éditions futures.', true
WHERE NOT EXISTS (SELECT 1 FROM process_steps WHERE step_number = 5);

-- Services. slug keys the detail photograph and the on-page anchor; short_* is
-- the overview-card line, which differs from the first body paragraph on every
-- service and would otherwise be replaced by it.
INSERT INTO services (slug, name_en, name_fr, category, short_en, short_fr, description_en, description_fr, icon, sort_order, published)
SELECT 'editing', 'Editing', 'Révision', 'editorial', 'Structure, argument, accuracy and readability.', 'Structure, argumentation, exactitude et lisibilité.', 'We work at two levels. Structural editing addresses whether the material does its job — sequence, coverage, pitch and curriculum fit. Line editing then tightens the prose itself for clarity and register.

For educational titles this includes checking that the level of language matches the intended year group.', 'Nous intervenons à deux niveaux. La révision structurelle vérifie que le contenu remplit sa fonction : progression, couverture, niveau et conformité au programme. La révision de style resserre ensuite l’écriture pour la clarté et le registre.

Pour les ouvrages scolaires, cela comprend la vérification que le niveau de langue correspond bien à la classe visée.', 'pen', 0, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'editing');
INSERT INTO services (slug, name_en, name_fr, category, short_en, short_fr, description_en, description_fr, icon, sort_order, published)
SELECT 'proofreading', 'Proofreading', 'Correction d’épreuves', 'editorial', 'The final gate before anything goes to print.', 'Le dernier contrôle avant l’impression.', 'The last check before print: grammar, spelling, punctuation, consistency of style and terminology, running heads, captions, cross-references, and typographic detail such as bad breaks and widows.

Handled as a distinct stage by someone who did not do the editing — a second pair of eyes, by design.', 'L’ultime vérification avant impression : grammaire, orthographe, ponctuation, cohérence du style et de la terminologie, titres courants, légendes, renvois, et détails typographiques tels que les coupures fautives et les lignes creuses.

Cette étape distincte est confiée à une personne qui n’a pas assuré la révision — un second regard, par principe.', 'check', 1, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'proofreading');
INSERT INTO services (slug, name_en, name_fr, category, short_en, short_fr, description_en, description_fr, icon, sort_order, published)
SELECT 'translation', 'Translation', 'Traduction', 'editorial', 'English and French, localised not transposed.', 'Anglais et français, localisés et non transposés.', 'English to French and French to English, by translators working in the Cameroonian education context. We localise: examples, names, places, currency, measurement and classroom register are all adapted so the target edition reads as though it were written in that language.

Both editions are scheduled together, so neither becomes the version that ships late.', 'De l’anglais vers le français et inversement, par des traducteurs qui travaillent quotidiennement dans le contexte éducatif camerounais. Nous localisons : exemples, noms, lieux, monnaie, unités de mesure et registre de classe sont adaptés afin que l’édition cible se lise comme si elle avait été écrite dans cette langue.

Les deux éditions sont planifiées ensemble : aucune ne devient la version livrée en retard.', 'globe', 2, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'translation');
INSERT INTO services (slug, name_en, name_fr, category, short_en, short_fr, description_en, description_fr, icon, sort_order, published)
SELECT 'designing', 'Designing', 'Conception graphique', 'creative', 'Covers, interiors, typesetting and layout.', 'Couvertures, intérieurs, composition et mise en page.', 'Cover design, interior layout, typesetting and grid systems built for the way the material is actually used — a textbook read at a desk has different demands from a report read on screen.

Delivered as print-ready files, with the layout held consistent across both language editions.', 'Conception de couverture, mise en page intérieure, composition et systèmes de grilles pensés pour l’usage réel du support — un manuel lu à une table n’a pas les mêmes exigences qu’un rapport lu à l’écran.

Livraison en fichiers prêts pour l’impression, avec une mise en page cohérente entre les deux éditions linguistiques.', 'layout', 3, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'designing');
INSERT INTO services (slug, name_en, name_fr, category, short_en, short_fr, description_en, description_fr, icon, sort_order, published)
SELECT 'illustration', 'Illustration', 'Illustration', 'creative', 'Original artwork, diagrams and visual explanation.', 'Illustrations originales, schémas et explication visuelle.', 'Original artwork, character work, maps, diagrams and technical illustration — commissioned rather than licensed from a stock library, so the imagery belongs to the title.

Cultural relevance is treated as an editorial requirement: learners should recognise the people, places and situations they are looking at.', 'Illustrations originales, personnages, cartes, schémas et illustration technique — commandés plutôt que tirés d’une banque d’images, afin que l’iconographie appartienne à l’ouvrage.

La pertinence culturelle est traitée comme une exigence éditoriale : les élèves doivent reconnaître les personnes, les lieux et les situations qu’ils regardent.', 'brush', 4, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'illustration');
INSERT INTO services (slug, name_en, name_fr, category, short_en, short_fr, description_en, description_fr, icon, sort_order, published)
SELECT 'printing', 'Printing', 'Impression', 'production', 'Production, finishing and delivery at volume.', 'Production, façonnage et livraison en volume.', 'Print production, binding and finishing at the volumes an institutional rollout requires, with stock specification and proofing agreed before the run.

Because production sits in the same house as editorial, print problems get caught while they are still fixable.', 'Production, reliure et façonnage aux volumes qu’exige un déploiement institutionnel, avec spécification du papier et bon à tirer validés avant le lancement.

La production étant intégrée à la maison d’édition, les problèmes d’impression sont détectés tant qu’ils sont encore corrigeables.', 'print', 5, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'printing');

-- Catalogue: four client titles as DRAFTS (published = false), so they appear
-- in the admin for review and stay 404 on the public catalogue until approved.
INSERT INTO subjects (name_en, name_fr) VALUES ('Chemistry', 'Chimie') ON CONFLICT (name_en) DO UPDATE SET name_fr = EXCLUDED.name_fr;
INSERT INTO subjects (name_en, name_fr) VALUES ('Physics', 'Physique') ON CONFLICT (name_en) DO UPDATE SET name_fr = EXCLUDED.name_fr;
INSERT INTO subjects (name_en, name_fr) VALUES ('Mathematics', 'Mathématiques') ON CONFLICT (name_en) DO UPDATE SET name_fr = EXCLUDED.name_fr;
INSERT INTO subjects (name_en, name_fr) VALUES ('English', 'Anglais') ON CONFLICT (name_en) DO UPDATE SET name_fr = EXCLUDED.name_fr;
INSERT INTO catalogue_titles (
  product_code, title_en, title_fr, slug, level, subject_id, languages,
  cover_image_id, description_en, description_fr,
  curriculum_alignment_en, curriculum_alignment_fr, featured, published, is_demo
) VALUES (
  'LHC-CHEM-F1-SB', 'Chemistry for Secondary schools in Cameroon', 'Chemistry for Secondary schools in Cameroon', 'chemistry-form-1-students-book', 'secondary',
  (SELECT id FROM subjects WHERE name_en = 'Chemistry' AND is_demo = false),
  '["en"]'::jsonb, NULL, 'Chemistry Student''s book for Form 1, for Secondary schools in Cameroon. By Fuhnwi Julius.', 'Chemistry Student''s book for Form 1, for Secondary schools in Cameroon. By Fuhnwi Julius.',
  NULL, NULL, false, false, false
) ON CONFLICT (slug) DO UPDATE SET
  product_code = EXCLUDED.product_code, title_en = EXCLUDED.title_en, title_fr = EXCLUDED.title_fr,
  level = EXCLUDED.level, subject_id = EXCLUDED.subject_id, languages = EXCLUDED.languages,
  cover_image_id = EXCLUDED.cover_image_id, description_en = EXCLUDED.description_en,
  description_fr = EXCLUDED.description_fr, updated_at = now();
INSERT INTO catalogue_titles (
  product_code, title_en, title_fr, slug, level, subject_id, languages,
  cover_image_id, description_en, description_fr,
  curriculum_alignment_en, curriculum_alignment_fr, featured, published, is_demo
) VALUES (
  'LHC-PHYS-F2', 'Physics for Secondary schools in Cameroon', 'Physics for Secondary schools in Cameroon', 'physics-form-2', 'secondary',
  (SELECT id FROM subjects WHERE name_en = 'Physics' AND is_demo = false),
  '["en"]'::jsonb, NULL, 'Physics for Form 2, for Secondary schools in Cameroon. By Clinton Ojong.', 'Physics for Form 2, for Secondary schools in Cameroon. By Clinton Ojong.',
  NULL, NULL, false, false, false
) ON CONFLICT (slug) DO UPDATE SET
  product_code = EXCLUDED.product_code, title_en = EXCLUDED.title_en, title_fr = EXCLUDED.title_fr,
  level = EXCLUDED.level, subject_id = EXCLUDED.subject_id, languages = EXCLUDED.languages,
  cover_image_id = EXCLUDED.cover_image_id, description_en = EXCLUDED.description_en,
  description_fr = EXCLUDED.description_fr, updated_at = now();
INSERT INTO catalogue_titles (
  product_code, title_en, title_fr, slug, level, subject_id, languages,
  cover_image_id, description_en, description_fr,
  curriculum_alignment_en, curriculum_alignment_fr, featured, published, is_demo
) VALUES (
  'LHC-MATH-F1-TG', 'Mathematics for secondary schools in Cameroon', 'Mathematics for secondary schools in Cameroon', 'mathematics-form-1-teachers-guide', 'secondary',
  (SELECT id FROM subjects WHERE name_en = 'Mathematics' AND is_demo = false),
  '["en"]'::jsonb, NULL, 'Mathematics Teacher''s guide for Form 1, for secondary schools in Cameroon. By Ebenezer T. Fombin and N.L. Ebissouleye Nyamssi.', 'Mathematics Teacher''s guide for Form 1, for secondary schools in Cameroon. By Ebenezer T. Fombin and N.L. Ebissouleye Nyamssi.',
  NULL, NULL, false, false, false
) ON CONFLICT (slug) DO UPDATE SET
  product_code = EXCLUDED.product_code, title_en = EXCLUDED.title_en, title_fr = EXCLUDED.title_fr,
  level = EXCLUDED.level, subject_id = EXCLUDED.subject_id, languages = EXCLUDED.languages,
  cover_image_id = EXCLUDED.cover_image_id, description_en = EXCLUDED.description_en,
  description_fr = EXCLUDED.description_fr, updated_at = now();
INSERT INTO catalogue_titles (
  product_code, title_en, title_fr, slug, level, subject_id, languages,
  cover_image_id, description_en, description_fr,
  curriculum_alignment_en, curriculum_alignment_fr, featured, published, is_demo
) VALUES (
  'LHC-ENG-C5-WB', 'English Workbook', 'English Workbook', 'english-workbook-class-5', 'primary',
  (SELECT id FROM subjects WHERE name_en = 'English' AND is_demo = false),
  '["en"]'::jsonb, NULL, 'English Workbook for Class 5.', 'English Workbook for Class 5.',
  NULL, NULL, false, false, false
) ON CONFLICT (slug) DO UPDATE SET
  product_code = EXCLUDED.product_code, title_en = EXCLUDED.title_en, title_fr = EXCLUDED.title_fr,
  level = EXCLUDED.level, subject_id = EXCLUDED.subject_id, languages = EXCLUDED.languages,
  cover_image_id = EXCLUDED.cover_image_id, description_en = EXCLUDED.description_en,
  description_fr = EXCLUDED.description_fr, updated_at = now();
