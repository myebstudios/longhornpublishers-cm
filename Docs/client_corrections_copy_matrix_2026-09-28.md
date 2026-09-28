# Longhorn Publishers Cameroon — Client Website Corrections: Bilingual Copy Matrix & Claim Audit

**Document Owner:** Marty (Lead Marketer & Brand Strategist, Gerer Build Studio)  
**Task ID:** `03057fbd-24a0-48f7-843d-652c82f28929` (CLIENT-3A)  
**Source Document:** `Docs/CORRECTIONS TO BE MADE ON THE COMPANY WEBSITE.docx`  
**Target Path:** `Docs/client_corrections_copy_matrix_2026-09-28.md`  
**Date:** 28 September 2026  
**Status:** In Review — Hand-off to SoSo (CLIENT-3C) & Executive Review (Yv)  

---

## 1. Executive Summary & Purpose

This document provides a clean, safe, and factual English/French copy matrix directly derived from the client's instructions in `Docs/CORRECTIONS TO BE MADE ON THE COMPANY WEBSITE.docx`. It maps every client directive to exact English copy and matching native French translations, removing all unsourced claims or embellished descriptions.

---

## 2. Global Mandate: Complete DRC / Congo Purge Matrix

Client instruction: *"Remove DRC or any statement related to Congo wherever you spot it."*

| Location | Layer | Current Text | Proposed English Replacement | Proposed Native French Replacement |
|---|---|---|---|---|
| `src/layouts/Layout.astro` (Line 56) | JSON-LD Structured Data (`areaServed`) | `areaServed: ['Cameroon', 'Democratic Republic of the Congo']` | `areaServed: ['Cameroon', 'Central Africa']` | `areaServed: ['Cameroun', 'Afrique centrale']` |
| `src/lib/cms-content.ts` (Line 162) | Global SEO Meta Description | `Professional bilingual publishing services in Cameroon and the DRC.` | `Professional bilingual publishing services in Cameroon and Central Africa.` | `Services d'édition bilingues professionnels au Cameroun et en Afrique centrale.` |
| `src/i18n/en.ts` (Line 42) & `src/i18n/fr.ts` (Line 47) | Catalogue Meta Description | `...aligned to the national curricula of Cameroon and the DRC...` | `...aligned to the national curriculum of Cameroon...` | `...conformes au programme national du Cameroun...` |
| `src/i18n/en.ts` (Line 165) & `src/i18n/fr.ts` (Line 170) | Homepage Hero Lede | `...across Cameroon and the DRC.` | `...across Cameroon and Central Africa.` | `...au Cameroun et en Afrique centrale.` |
| `src/i18n/en.ts` (Line 167) & `src/i18n/fr.ts` (Line 172) | Homepage Hero Stat Badge | `{ num: '2', label: 'Markets served — Cameroon & DRC' }` | Omit DRC badge | Omettre le badge RDC |
| `src/i18n/en.ts` (Line 198) & `src/i18n/fr.ts` (Line 203) | Catalogue Preview Lede | `Titles aligned to the national curricula of Cameroon and the DRC...` | `Titles aligned to national curricula, published in both languages.` | `Des titres conformes aux programmes nationaux, publiés dans les deux langues.` |
| `src/i18n/en.ts` (Line 254) & `src/i18n/fr.ts` (Line 259) | About Us (Heritage Paragraph 2) | `...in the Cameroonian and Congolese education context...` | `...serving the Cameroonian and Central African publishing ecosystem as a whole...` | `...au service de l'écosystème éditorial camerounais et d'Afrique centrale dans son ensemble...` |
| `src/i18n/en.ts` (Line 266) & `src/i18n/fr.ts` (Line 271) | About Us (Core Vision) | `...publishing partner of choice in Cameroon and the DRC...` | `...publishing partner of choice in Cameroon and Central Africa...` | `...partenaire éditorial de référence au Cameroun et en Afrique centrale...` |
| `src/i18n/en.ts` (Line 352) & `src/i18n/fr.ts` (Line 357) | Catalogue Page Hero Lede | `...aligned to the national curricula of Cameroon and the DRC...` | `Primary and secondary titles aligned to national curricula — published in English and French.` | `Des titres du primaire et du secondaire conformes aux programmes nationaux — publiés en anglais et en français.` |
| `src/i18n/en.ts` (Line 401) & `src/i18n/fr.ts` (Line 407) | Why Us (Pillar 1 Body) | `...knowledge of both the Cameroonian and DRC national curricula...` | `...working knowledge of the Cameroonian national curriculum...` | `...connaissance pratique du programme national camerounais...` |
| `src/pages/admin/index.astro` (Line 79) | Admin Panel Notice | `...Cameroonian & DRC public sites.` | `...Cameroonian public site.` | `...site public camerounais.` |

---

## 3. Bilingual Copy Replacement Matrix (Section by Section)

### 3.1. Homepage: Hero Section & Trust Strip

#### A. Hero Opening Headlines (Separate Heading & Supporting Line)
- **Client Instruction:**  
  Change the opening sentence `‘Professional publishing…….’` to:  
  `‘Expanding Minds’`  
  `‘Enriching lives through knowledge’`  
- **Structure:** Per CLIENT-3B UX specifications, `Expanding Minds` is the standalone hero heading, and `Enriching lives through knowledge` is the separate supporting line. They are not combined into a single headline string.

| Element | Exact Client English Copy | Proposed Native French Copy | Target |
|---|---|---|---|
| **Hero Heading** | `Expanding Minds` | `Éveiller les esprits` | `home.hero.heading` / Slide 1 title |
| **Supporting Line** | `Enriching lives through knowledge` | `Enrichir des vies par la connaissance` | `home.hero.subheadline` / Slide 1 subtitle |

#### B. Homepage Trust Strip Label
- **Client Instruction:** Replace `‘Local publishing team’` with `‘Educational content creators and service providers’`.  
- **Application Note:** Use the client's exact label without attaching an extraneous location string.

| Element | Exact Client English Copy | Proposed Native French Copy | Target |
|---|---|---|---|
| **Trust Strip Item 2** | `Educational content creators and service providers` | `Créateurs de contenus éducatifs et prestataires de services` | `home.trust[1]` & `trust_stats` |

---

### 3.2. Homepage: Who We Are

- **Client Instruction:** Replace the second paragraph with:  
  `‘From our office in Tsinga Yaoundé, we operate as content creators and platform business providers across the Central African Market. Our work spans the development of learning materials, educational content and professional publishing solutions in English and French, reflecting the country's bilingual education environment’`

| Language | Copy Text |
|---|---|
| **English (Exact Client)** | *From our office in Tsinga Yaoundé, we operate as content creators and platform business providers across the Central African Market. Our work spans the development of learning materials, educational content and professional publishing solutions in English and French, reflecting the country's bilingual education environment* |
| **French (Proposed Native)** | *Depuis notre bureau de Tsinga à Yaoundé, nous intervenons en tant que créateurs de contenus et fournisseurs de solutions de plateforme sur le marché d'Afrique centrale. Nos activités couvrent le développement de matériels d'apprentissage, de contenus éducatifs et de solutions d'édition professionnelle en anglais et en français, reflétant l'environnement éducatif bilingue du pays.* |

---

### 3.3. About Us Page: Heritage & Core Identity

#### A. Heritage & Proximity (Paragraph 2)
- **Client Instruction:** Take off the second paragraph and Congolese education and replace with:  
  `‘What we add is proximity: a team working daily to serve the Cameroonian and Central African publishing ecosystem as a whole in both official languages.’`

| Language | Copy Text |
|---|---|
| **English (Exact Client)** | *What we add is proximity: a team working daily to serve the Cameroonian and Central African publishing ecosystem as a whole in both official languages.* |
| **French (Proposed Native)** | *Ce que nous apportons en plus, c'est la proximité : une équipe travaillant quotidiennement au service de l'écosystème éditorial camerounais et d'Afrique centrale dans son ensemble, dans les deux langues officielles.* |

#### B. Headline & Link Adjustments
- **Client Instruction:** Change `‘Why partner choose us’` to `“Why choose us’` and take off `‘Local Judgement’`.

| Element | Current Copy | Proposed English Replacement | Proposed Native French Replacement | Target |
|---|---|---|---|---|
| **Section Title Accent** | `local judgement` | Remove `local judgement` | Supprimer `local judgement` | `about.heritage.titleAccent` |
| **Section CTA Link** | `Why partners choose us` | `Why choose us` | `Pourquoi nous choisir` | `about.heritage.link` |

#### C. Core Identity (Purpose & Mission Kept Separate)
- **Client Instruction:**  
  `Core Identity`  
  `To enrich lives through knowledge.`  
  `To develop and deliver high-quality learning and teaching materials that support learners, educators and institutions.`

| Core Pillar | Proposed English Copy | Proposed Native French Copy |
|---|---|---|
| **Purpose** | `To enrich lives through knowledge.` | `Enrichir des vies par la connaissance.` |
| **Mission** | `To develop and deliver high-quality learning and teaching materials that support learners, educators and institutions.` | `Développer et fournir des matériels d'apprentissage et d'enseignement de haute qualité qui soutiennent les apprenants, les éducateurs et les institutions.` |

---

### 3.4. Services Page: Slogan & Structure

#### A. New Opening Slogan & Subtitle
- **Client Instruction:**  
  The new opening sentence for the services page to introduce all our services would be:  
  `‘’ Every Stage. Every Solution’’`  
  `From turning manuscripts into refined publications, to providing up-to-date Cambridge, tertiary, and reference materials — we serve every stage of your journey.`  
  *(The former one should be put under Publishing service)*

| Element | English Copy | Proposed Native French Copy |
|---|---|---|
| **Hero Title** | `Every Stage. Every Solution` | `À chaque étape. Chaque solution.` |
| **Hero Lede** | `From turning manuscripts into refined publications, to providing up-to-date Cambridge, tertiary, and reference materials — we serve every stage of your journey.` | `De la transformation des manuscrits en publications soignées à la fourniture de matériels Cambridge, universitaires et de référence actualisés — nous vous accompagnons à chaque étape de votre parcours.` |
| **Publishing Service Lede** *(Relocated former lede)* | `Editorial, creative and production services — available individually or as a single end-to-end engagement.` | `Services éditoriaux, créatifs et de production — disponibles individuellement ou dans le cadre d'un accompagnement complet de bout en bout.` |

#### B. Overview Header
- **Client Instruction:** Take off 3 disciplines and only allow `‘’six services’’`.

| Element | English Copy | Proposed Native French Copy |
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
- **Note for Implementation:** Only client-supplied titles and tags are listed. No invented descriptions are added.

| # | Service Slug | English Title (Exact Client) | French Title (Proposed) | Badge / Status |
|---|---|---|---|---|
| 1 | `publishing` | **Publishing** | **Édition** | Active |
| 2 | `tertiary` | **Tertiary** | **Enseignement supérieur** | Active |
| 3 | `cambridge` | **Cambridge** | **Cambridge** | Active |
| 4 | `reference` | **Reference books (Bibles, Law Africa)** | **Ouvrages de référence (Bibles, Law Africa)** | Active |
| 5 | `loho` | **E-learning product LoHo** *(or Elementary)* | **Produit e-learning LoHo** *(ou Élémentaire)* | Coming soon / Bientôt disponible |
| 6 | `emarketing` | **E-Marketing** | **E-Marketing** | Coming soon / Bientôt disponible |

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

| Section | English Copy (Exact Client) | Proposed Native French Copy |
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

| Section | English Copy (Exact Client) | Proposed Native French Copy |
|---|---|---|
| **Language Pairs** | **English ↔ French**<br>**French ↔ English** | **Anglais ↔ Français**<br>**Français ↔ Anglais** |
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

| Segment Key | English Filter Label (Exact Client) | Proposed Native French Label | Cover Display Rule |
|---|---|---|---|
| `booklist` | **Titles on the national booklist** | **Titres inscrits sur la liste officielle** | Book covers permitted only when booklist status is verified. |
| `other` | **Other developed titles** | **Autres titres développés** | No book covers displayed per client directive. |

---

## 4. Factual Claim Audit: National Book List Status

1. **Client Constraint:** The client explicitly instructed: *"Only allow covers of books on the National Book List."*
2. **Current Asset Status:** Four book cover graphics were received (`b1.png`–`b4.png`), but neither the client nor project records currently provide written confirmation of which titles are officially gazetted on the National Book List.
3. **Safe Implementation Rule for SoSo:**  
   - Do not display covers for any title until the client identifies which specific titles are on the National Book List.
   - Do not publish unverified National Book List claims.

---

## 5. Concrete Ambiguities & Clarifications

1. **Ambiguity 1 — "Elementary product LoHo" vs "E-learning product LoHo":**  
   The client document writes `E-learning product LoHo (coming soon)` in the bullet list, but writes `Elementary product LoHo (Coming soon)` in the table below it. We flag this for client clarification.
2. **Ambiguity 2 — Service Architecture (6 Services vs 3 Sub-Disciplines):**  
   The client defines 6 high-level services (*Publishing, Tertiary, Cambridge, Reference books, LoHo, E-Marketing*), but only provides detail text for *Editing*, *Translation*, and *Printing* (sub-services of *Publishing*). SoSo should maintain *Publishing* with its sub-sections and present the 6 items in the overview grid without inventing placeholder body copy.
3. **Ambiguity 3 — National Book List Verification for Covers b1–b4:**  
   Written confirmation is needed to verify which of the four received covers are officially on the National Book List.

---

## 6. Implementation Checklist for SoSo (CLIENT-3C)

- [ ] **DRC / Congo Purge:** Update 11 locations listed in Section 2.
- [ ] **Trust Strip:** Set Item 2 to `Educational content creators and service providers` (no location attached).
- [ ] **Hero Headline:** Set heading to `Expanding Minds` and separate supporting line to `Enriching lives through knowledge`.
- [ ] **Who We Are:** Update paragraph 2 with Section 3.2 copy.
- [ ] **About Us:** Update paragraph 2 with Section 3.3 copy, change link to `Why choose us`, remove `local judgement`.
- [ ] **Core Identity:** Set Purpose to `To enrich lives through knowledge.` and Mission to `To develop and deliver high-quality learning and teaching materials that support learners, educators and institutions.`
- [ ] **Services:** Update opening slogan to `Every Stage. Every Solution` and lede per Section 3.4. Update 6 services grid per Section 3.5.
- [ ] **Editing, Translation, Printing:** Apply Section 3.6 copy; remove the second paragraph of Printing.
- [ ] **Catalogue:** Segment into `Titles on the national booklist` and `Other developed titles`. Do not display covers for unverified titles.
