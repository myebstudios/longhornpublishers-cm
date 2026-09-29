# Longhorn Publishers Cameroon — Client Website Corrections: Bilingual Copy Matrix & Claim Audit

**Document Owner:** Marty (Lead Marketer & Brand Strategist, Gerer Build Studio)  
**Task ID:** `03057fbd-24a0-48f7-843d-652c82f28929` (CLIENT-3A)  
**Source Document:** `Docs/CORRECTIONS TO BE MADE ON THE COMPANY WEBSITE.docx`  
**Target Path:** `Docs/client_corrections_copy_matrix_2026-09-28.md`  
**Date:** 29 September 2026 (Revised per QA & Executive Review)  
**Status:** In Review — Aligned with Live Code & Client Source Text  

---

## 1. Executive Summary & Purpose

This document provides a clean, factual, and strictly verified English/French copy matrix derived directly from the client's instructions in `Docs/CORRECTIONS TO BE MADE ON THE COMPANY WEBSITE.docx`.

All unsourced claims, embellished descriptions, speculative legal assertions, and unapproved marketing text have been completely eliminated. The matrix reflects exact client words and approved live French text in production (`src/i18n/en.ts` and `src/i18n/fr.ts`).

---

## 2. Global Mandate: Complete DRC / Congo Purge Matrix

Client instruction: *"Remove DRC or any statement related to Congo wherever you spot it."*

| Location | Layer | Current / Former Text | Approved English Replacement | Approved Native French Replacement |
|---|---|---|---|---|
| `src/layouts/Layout.astro` | JSON-LD Structured Data (`areaServed`) | `areaServed: ['Cameroon', 'Democratic Republic of the Congo']` | `areaServed: ['Cameroon']` | `areaServed: ['Cameroon']` |
| `src/lib/cms-content.ts` | Global SEO Meta Description | `Professional bilingual publishing services in Cameroon and the DRC.` | `Professional bilingual publishing services in Cameroon and Central Africa.` | `Services d'édition bilingues professionnels au Cameroun et en Afrique centrale.` |
| `src/i18n/en.ts` & `src/i18n/fr.ts` | Catalogue Meta Description | `...aligned to the national curricula of Cameroon and the DRC...` | `...aligned to national curricula...` | `...conformes aux programmes nationaux...` |
| `src/i18n/en.ts` & `src/i18n/fr.ts` | Homepage Hero Lede | `...across Cameroon and the DRC.` | `...across Cameroon and Central Africa.` | `...au Cameroun et en Afrique centrale.` |
| `src/i18n/en.ts` & `src/i18n/fr.ts` | Homepage Hero Stat Badge | `{ num: '2', label: 'Markets served — Cameroon & DRC' }` | Stat omitted (no replacement claim) | Statut omis (pas d'allégation de remplacement) |
| `src/i18n/en.ts` & `src/i18n/fr.ts` | Catalogue Preview Lede | `Titles aligned to the national curricula of Cameroon and the DRC...` | `Titles aligned to national curricula, published in both languages.` | `Des titres conformes aux programmes nationaux, publiés dans les deux langues.` |
| `src/i18n/en.ts` & `src/i18n/fr.ts` | About Us (Heritage Paragraph 2) | `...in the Cameroonian and Congolese education context...` | `...serving the Cameroonian and Central African publishing ecosystem as a whole...` | `...au service de l'écosystème éditorial camerounais et d'Afrique centrale dans son ensemble...` |
| `src/i18n/en.ts` & `src/i18n/fr.ts` | About Us (Core Vision) | `...publishing partner of choice in Cameroon and the DRC...` | `To be the publishing partner of choice for institutions that will not compromise on quality.` | `Devenir le partenaire éditorial de référence pour les institutions qui refusent tout compromis sur la qualité.` |
| `src/i18n/en.ts` & `src/i18n/fr.ts` | Catalogue Page Hero Lede | `...aligned to the national curricula of Cameroon and the DRC...` | `Primary and secondary titles aligned to national curricula — published in English and French.` | `Des titres du primaire et du secondaire conformes aux programmes nationaux — publiés en anglais et en français.` |
| `src/i18n/en.ts` & `src/i18n/fr.ts` | Why Us (Pillar 1 Body) | `...knowledge of both the Cameroonian and DRC national curricula...` | `...working knowledge of the Cameroonian national curriculum...` | `...connaissance pratique du programme national camerounais...` |
| `src/pages/admin/index.astro` | Admin Panel Notice | `...Cameroonian & DRC public sites.` | `...Cameroonian public site.` | `...site public camerounais.` |

---

## 3. Bilingual Copy Replacement Matrix (Section by Section)

### 3.1. Homepage: Hero Section & Trust Strip

#### A. Hero Opening Headlines (Separate Heading & Supporting Line)
- **Client Instruction:**  
  Change the opening sentence `‘Professional publishing…….’` to:  
  `‘Expanding Minds’`  
  `‘Enriching lives through knowledge’`  
- **Structure:** Per CLIENT-3B UX specifications, `Expanding Minds` is the standalone hero heading, and `Enriching lives through knowledge` is the separate supporting line. They are rendered as distinct elements, not joined into a single accent-tail headline.

| Element | Exact Client English Copy | Approved Native French Copy | Target |
|---|---|---|---|
| **Hero Heading** | `Expanding Minds` | `Éveiller les esprits` | `home.hero.heading` / Slide 1 title |
| **Supporting Line** | `Enriching lives through knowledge` | `Enrichir des vies par la connaissance` | `home.hero.subheadline` / Slide 1 subtitle |

#### B. Homepage Trust Strip Label
- **Client Instruction:** Replace `‘Local publishing team’` with `‘Educational content creators and service providers’`.  
- **Application Note:** Uses the client's exact label without any appended location text.

| Element | Exact Client English Copy | Approved Native French Copy | Target |
|---|---|---|---|
| **Trust Strip Item 2** | `Educational content creators and service providers` | `Créateurs de contenus éducatifs et prestataires de services` | `home.trust[1]` & `trust_stats` |

---

### 3.2. Homepage: Who We Are

- **Client Instruction:** Replace the second paragraph with:  
  `‘From our office in Tsinga Yaoundé, we operate as content creators and platform business providers across the Central African Market. Our work spans the development of learning materials, educational content and professional publishing solutions in English and French, reflecting the country's bilingual education environment’`

| Language | Copy Text |
|---|---|
| **English (Exact Client)** | *From our office in Tsinga Yaoundé, we operate as content creators and platform business providers across the Central African Market. Our work spans the development of learning materials, educational content and professional publishing solutions in English and French, reflecting the country's bilingual education environment.* |
| **French (Approved Native)** | *Depuis notre bureau de Tsinga à Yaoundé, nous intervenons en tant que créateurs de contenus et fournisseurs de solutions de plateforme sur le marché d'Afrique centrale. Nos activités couvrent le développement de matériels d'apprentissage, de contenus éducatifs et de solutions d'édition professionnelle en anglais et en français, reflétant l'environnement éducatif bilingue du pays.* |

---

### 3.3. About Us Page: Heritage, Team & Core Identity

#### A. Heritage & Proximity (Paragraph 2)
- **Client Instruction:** Take off the second paragraph and Congolese education and replace with:  
  `‘What we add is proximity: a team working daily to serve the Cameroonian and Central African publishing ecosystem as a whole in both official languages.’`

| Language | Copy Text |
|---|---|
| **English (Exact Client)** | *What we add is proximity: a team working daily to serve the Cameroonian and Central African publishing ecosystem as a whole in both official languages.* |
| **French (Approved Native)** | *Ce que nous apportons en plus, c'est la proximité : une équipe travaillant quotidiennement au service de l'écosystème éditorial camerounais et d'Afrique centrale dans son ensemble, dans les deux langues officielles.* |

#### B. Heritage Heading & Section Link
- **Client Instruction:** Change `‘Why partner choose us’` to `“Why choose us’` and take off `‘Local Judgement’`.
- **Advice on Heading:**  
  - *Option 1 (Current Live Clean String):* `Continental backing` (EN) / `L’appui d’un groupe continental` (FR) with empty accent, removing the bare trailing comma.  
  - *Option 2 (Balanced Split):* `Continental backing,` (Lead) + `local presence` (Accent) / `L’appui d’un groupe continental,` (Lead) + `une présence locale` (Accent).

| Element | Current Live Wording | Target |
|---|---|---|
| **Section Title Lead** | `Continental backing` / `L’appui d’un groupe continental` | `about.heritage.titleLead` |
| **Section Title Accent** | `""` (bare comma eliminated) | `about.heritage.titleAccent` |
| **Section CTA Link** | `Why choose us` / `Pourquoi nous choisir` | `about.heritage.link` |

#### C. Team Heading (Removal of "Three Disciplines")
- **Client Instruction:** The client asked to eliminate the "three disciplines" framing.
- **Advice on Team Heading:**  
  - *Option 1 (Current Live Approved):* `One team,` (Lead) + `one workflow` (Accent) / `Une équipe,` (Lead) + `un seul flux de travail` (Accent). This is plain, professional, and removes the "three disciplines" constraint.  
  - *Option 2:* `Our team,` (Lead) + `one workflow` (Accent) / `Notre équipe,` (Lead) + `un seul flux de travail` (Accent).

#### D. Core Identity (Purpose & Mission Kept Strictly Separate)
- **Client Instruction:**  
  `Core Identity`  
  `To enrich lives through knowledge.`  
  `To develop and deliver high-quality learning and teaching materials that support learners, educators and institutions.`

| Core Pillar | Approved English Copy | Approved Native French Copy |
|---|---|---|
| **Purpose** | `To enrich lives through knowledge.` | `Enrichir des vies par la connaissance.` |
| **Mission** | `To develop and deliver high-quality learning and teaching materials that support learners, educators and institutions.` | `Développer et fournir des matériels d'apprentissage et d'enseignement de haute qualité qui soutiennent les apprenants, les éducateurs et les institutions.` |
| **Vision** | `To be the publishing partner of choice for institutions that will not compromise on quality.` | `Devenir le partenaire éditorial de référence pour les institutions qui refusent tout compromis sur la qualité.` |
| **Values** | `Quality, cultural relevance, flexibility and accountability — held at every stage, not just at sign-off.` | `Qualité, pertinence culturelle, souplesse et responsabilité — à chaque étape, et pas seulement à la validation finale.` |

---

### 3.4. Services Page: Slogan & Structure

#### A. New Opening Slogan & Subtitle
- **Client Instruction:**  
  The new opening sentence for the services page to introduce all our services would be:  
  `‘’ Every Stage. Every Solution’’`  
  `From turning manuscripts into refined publications, to providing up-to-date Cambridge, tertiary, and reference materials — we serve every stage of your journey.`  
  *(The former one should be put under Publishing service)*

| Element | English Copy | Approved Native French Copy |
|---|---|---|
| **Hero Title Lead** | `Every Stage.` | `À chaque étape.` |
| **Hero Title Accent** | `Every Solution` | `Chaque solution` |
| **Hero Lede** | `From turning manuscripts into refined publications, to providing up-to-date Cambridge, tertiary, and reference materials — we serve every stage of your journey.` | `De la transformation des manuscrits en publications soignées à la fourniture de matériels Cambridge, universitaires et de référence actualisés — nous vous accompagnons à chaque étape de votre parcours.` |
| **Publishing Service Lede** *(Relocated former lede)* | `Editorial, creative and production services — available individually or as a single end-to-end engagement.` | `Services éditoriaux, créatifs et de production — disponibles individuellement ou dans le cadre d'un accompagnement complet de bout en bout.` |

#### B. Overview Header
- **Client Instruction:** Take off 3 disciplines and only allow `‘’six services’’`.

| Element | English Copy | Approved Native French Copy |
|---|---|---|
| **Overview Eyebrow** | `At a glance` | `En un coup d'œil` |
| **Overview Title** | `Six services` | `Six services` |

---

### 3.5. Services Segmentation (The Six Offerings)

- **Client Instruction:** Segment our different services:  
  1. *Publishing*  
  2. *Tertiary*  
  3. *Cambridge*  
  4. *Reference books (Bibles, Law Africa)*  
  5. *E-learning product LoHo (coming soon)* / *Elementary product LoHo (Coming soon)*  
  6. *E-Marketing (coming soon)*  
- **Governance Rule:** In alignment with the live site and Z plan, offering cards display **labels and status badges only**. No invented marketing summaries, accreditation claims, or audience profiles are added.

| # | Service Slug | English Title (Exact Client) | French Title (Approved Live) | Badge / Status | Destination |
|---|---|---|---|---|---|
| 1 | `publishing` | **Publishing** | **Édition** | Active | `#publishing` / detail section |
| 2 | `tertiary` | **Tertiary** | **Enseignement supérieur** | Active | `/contact` |
| 3 | `cambridge` | **Cambridge** | **Cambridge** | Active | `/contact` |
| 4 | `reference` | **Reference books (Bibles, Law Africa)** | **Ouvrages de référence (Bibles, Law Africa)** | Active | `/contact` |
| 5 | `loho` | **LoHo** | **LoHo** | Coming soon / Bientôt disponible | Non-clickable badge card |
| 6 | `emarketing` | **E-Marketing** | **E-Marketing** | Coming soon / Bientôt disponible | Non-clickable badge card |

---

### 3.6. Services Detail Sections: Editing, Translation & Printing

#### A. Editing
- **Client Instruction:**  
  `-Editing`  
  `Our editorial process spans different levels of editing, improving a manuscript's quality and usability without losing the author's intended message.`  
  `We assess:`  
  `*Language accuracy`  
  `*Clarity`  
  `*Flow`  
  `*Organisation`  
  `*Structure`  
  `*Consistency`  
  `*Overall readability`  
  `Our role`  
  `Preserve the author's voice. Strengthen the publication.`

| Section | English Copy (Exact Client) | Approved Native French Copy |
|---|---|---|
| **Process Intro** | *Our editorial process spans different levels of editing, improving a manuscript's quality and usability without losing the author's intended message.* | *Notre processus éditorial couvre différents niveaux de révision, améliorant la qualité et la lisibilité d'un manuscrit sans perdre le message visé par l'auteur.* |
| **Assessment Criteria** | • Language accuracy<br>• Clarity<br>• Flow<br>• Organisation<br>• Structure<br>• Consistency<br>• Overall readability | • Précision linguistique<br>• Clarté<br>• Fluidité<br>• Organisation<br>• Structure<br>• Cohérence<br>• Lisibilité globale |
| **Our Role** | **Preserve the author's voice. Strengthen the publication.** | **Préserver la voix de l'auteur. Renforcer la publication.** |

#### B. Translation
- **Client Instruction:**  
  `-Translation`  
  `English ↔ French`  
  `French ↔ English`  
  `Our translation service supports organisations and content owners that need materials adapted between English and French, particularly where content must function effectively within bilingual educational and professional environments.`  
  `Our focus is not merely word-for-word conversion.`  
  `It is about producing content that is clear, appropriate and fit for its intended audience.`

| Section | English Copy (Exact Client) | Approved Native French Copy |
|---|---|---|
| **Language Pairs** | **English ↔ French · French ↔ English** | **Anglais ↔ Français · Français ↔ Anglais** |
| **Service Description** | *Our translation service supports organisations and content owners that need materials adapted between English and French, particularly where content must function effectively within bilingual educational and professional environments.* | *Notre service de traduction accompagne les organisations et les détenteurs de contenus qui ont besoin d'adapter des documents entre l'anglais et le français, particulièrement lorsque les contenus doivent fonctionner efficacement dans des environnements éducatifs et professionnels bilingues.* |
| **Focus** | *Our focus is not merely word-for-word conversion. It is about producing content that is clear, appropriate and fit for its intended audience.* | *Notre démarche ne se résume pas à une simple conversion mot à mot. Il s'agit de produire un contenu clair, approprié et adapté à son public cible.* |

#### C. Printing
- **Client Instruction:** Take off the last paragraph `‘Because production sits…….’`.

| Status | Language | Printing Content |
|---|---|---|
| **RETAINED** | English | *Print production, binding and finishing at the volumes an institutional rollout requires, with stock specification and proofing agreed before the run.* |
| **RETAINED** | French | *Production d'impression, reliure et façonnage aux volumes requis par un déploiement institutionnel, avec spécification du papier et épreuves validées avant le tirage.* |
| **DELETED** | English | ~~*Because production sits in the same house as editorial, print problems get caught while they are still fixable.*~~ |
| **DELETED** | French | ~~*La production étant intégrée à la maison d’édition, les problèmes d’impression sont détectés tant qu’ils sont encore corrigeables.*~~ |

---

### 3.7. Catalogue: Segmentation & National Book List Rule

- **Client Instruction 1:** Segment catalogue under `‘Titles on the national booklist’` and `‘Other developed titles’`.
- **Client Instruction 2:** `Only allow covers of books on the National Book List.`

| Segment Key | English Filter Label (Exact Client) | Approved Native French Label | Cover Display Rule |
|---|---|---|---|
| `booklist` | **Titles on the national booklist** | **Titres au programme national** | Book covers permitted only when booklist status and rights are verified. |
| `other` | **Other developed titles** | **Autres titres développés** | No book covers displayed per client directive. |

---

## 4. Factual Claim Audit: National Book List Status

1. **Client Mandate:** The client explicitly instructed: *"Only allow covers of books on the National Book List."*
2. **Current Status:** Four book cover files were received (`b1.png`–`b4.png`), but title-specific official confirmation of which books are on the National Book List is not currently on file.
3. **Factual Rule:** No title may carry a National Book List classification, and no cover image may be rendered publicly, without title-specific official evidence on record. Unverified titles remain text-only or unclassified.

---

## 5. Concrete Ambiguities & Recommended Clarifications

1. **Ambiguity 1 — "Elementary product LoHo" vs "E-learning product LoHo":**  
   The client document refers to `E-learning product LoHo (coming soon)` in the text bullet, but writes `Elementary product LoHo (Coming soon)` in the grid diagram. Pending client ruling, the live platform safely renders the plain label: **"LoHo — Coming soon"** / **"LoHo — Bientôt disponible"**.
2. **Ambiguity 2 — Service Architecture (6 Services vs 3 Sub-Disciplines):**  
   The client defines 6 high-level services (*Publishing, Tertiary, Cambridge, Reference books, LoHo, E-Marketing*), but only details *Editing*, *Translation*, and *Printing* (sub-services of *Publishing*). In production, *Publishing* anchors the detailed subsections, while the 6 cards appear in the overview grid with routes or status badges.
3. **Ambiguity 3 — Book List Verification for Covers b1–b4:**  
   Title-specific confirmation from the client is required to establish which of the 4 received covers belong on the National Book List.

---

## 6. Engineering Alignment Checklist

- [x] **DRC / Congo Purge:** Fully applied across `src/i18n/`, `src/lib/cms-content.ts`, and `src/layouts/Layout.astro`.
- [x] **Trust Strip:** Set to exact client label `Educational content creators and service providers` with no location suffix.
- [x] **Hero Headline:** `Expanding Minds` heading and `Enriching lives through knowledge` supporting line kept strictly separate.
- [x] **Who We Are:** Paragraph 2 updated per Section 3.2.
- [x] **About Us:** Paragraph 2 updated per Section 3.3, link updated to `Why choose us`, `local judgement` removed, bare comma eliminated, and Team H2 updated to `One team, one workflow`.
- [x] **Core Identity:** Purpose and Mission distinctly mapped per Section 3.3.D.
- [x] **Services:** Opening slogan `Every Stage.` + `Every Solution` and lede applied. 6 offerings grid rendered with plain labels and badges (no unverified summaries).
- [x] **Editing, Translation, Printing:** Section 3.6 applied; final paragraph of Printing removed.
- [x] **Catalogue Cover Gating:** Enforced via `cover_image_id` masking; covers only render for verified booklist titles.
