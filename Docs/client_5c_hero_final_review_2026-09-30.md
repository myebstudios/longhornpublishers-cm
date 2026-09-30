# CLIENT-5C — final UX and copy review of four hero concepts

**Basis:** user approval of all four CLIENT-4A concepts; `Docs/client_4a_loho_and_hero_copy_2026-09-29.md`, CLIENT-3B positioning, current EN/FR site, `src/i18n/routes.ts`, and the image files inspected 2026-09-30. This is a SoSo implementation handoff, not a CMS or production change.

The live site still has one enabled slide in both locales: **Expanding Minds / Éveiller les esprits**. The four concepts below are ordered to move from mission, to current services, to upcoming product, to local trust. Keep the client-requested opening as a two-level heading and supporting line; do not turn “enriching lives” into the heading accent.

## Exact bilingual fields and destinations

Store locale-neutral CTA paths in the CMS. `localizeCmsHref()` maps them to the route shown in parentheses. Use an empty `headline_accent` for slide 1.

| Slide | Field | English | Français |
| --- | --- | --- | --- |
| 1 — mission | Eyebrow | Educational Publishing | Édition éducative |
|  | Headline | Expanding Minds | Éveiller les esprits |
|  | Accent | *(empty)* | *(vide)* |
|  | Subheadline | Enriching lives through knowledge | Enrichir des vies par la connaissance |
|  | Primary CTA | Explore Catalogue → `/catalogue` (`/en/catalogue/`) | Consulter le catalogue → `/catalogue` (`/fr/catalogue/`) |
|  | Secondary CTA | Partner With Us → `/contact` (`/en/contact/`) | Devenir partenaire → `/contact` (`/fr/contact/`) |
| 2 — publishing | Eyebrow | Publishing Services | Services d’édition |
|  | Headline | Every Stage. | À chaque étape. |
|  | Accent | Every Solution | Chaque solution |
|  | Subheadline | From manuscripts to refined publications, our editorial, design, translation and print services support each stage of your project. | Du manuscrit à la publication soignée, nos services de révision, de conception, de traduction et d’impression accompagnent chaque étape de votre projet. |
|  | Primary CTA | Our Services → `/services` (`/en/services/`) | Nos services → `/services` (`/fr/services-edition/`) |
|  | Secondary CTA | Contact Our Team → `/contact` (`/en/contact/`) | Contacter notre équipe → `/contact` (`/fr/contact/`) |
| 3 — LoHo | Eyebrow | Digital Learning · Coming soon | Apprentissage numérique · Bientôt disponible |
|  | Headline | LoHo | LoHo |
|  | Accent | coming soon | bientôt disponible |
|  | Subheadline | An e-learning platform with interactive educational content is coming soon to Cameroon. | Une plateforme d’apprentissage numérique avec des contenus pédagogiques interactifs sera bientôt disponible au Cameroun. |
|  | Primary CTA | Explore Services → `/services` (`/en/services/`) | Explorer nos services → `/services` (`/fr/services-edition/`) |
|  | Secondary CTA | Why Choose Us → `/why-choose-us` (`/en/why-choose-us/`) | Pourquoi nous choisir → `/why-choose-us` (`/fr/pourquoi-nous-choisir/`) |
| 4 — proximity | Eyebrow | Heritage & Proximity | Héritage et proximité |
|  | Headline | Continental experience, | Une expérience continentale, |
|  | Accent | close to you | à vos côtés |
|  | Subheadline | From Yaoundé, our team works in English and French, drawing on Longhorn Publishers PLC’s six decades of publishing experience. | Depuis Yaoundé, notre équipe travaille en anglais et en français, forte des six décennies d’expérience éditoriale de Longhorn Publishers PLC. |
|  | Primary CTA | Why Choose Us → `/why-choose-us` (`/en/why-choose-us/`) | Pourquoi nous choisir → `/why-choose-us` (`/fr/pourquoi-nous-choisir/`) |
|  | Secondary CTA | Get in Touch → `/contact` (`/en/contact/`) | Nous contacter → `/contact` (`/fr/contact/`) |

Slide 1's catalogue-first CTA follows the approved CLIENT-4A concept but changes the live contact-first priority. Keep the secondary contact action clearly visible; Yv should record this as an intentional conversion choice. Neither slide 1 nor any other slide may say a title is on the **National Book List**, officially approved/accredited, or available with an approved cover without exact-title evidence. Slide 3 must retain the visible **Coming soon / Bientôt disponible** text; no classroom deployment, assessments, early access, purchase or preorder language. Slide 2 says nothing about ownership, location or capacity of a printing plant.

## Image and mobile direction

| Slide | Current candidate and problem | Direction |
| --- | --- | --- |
| 1 | `public/img/lh-hero.jpg`, 1920×767. Live image; below the 1920×1080 image requirement. Its very wide group composition loses people in a phone crop. | Keep provisionally only with explicit acceptance. Prefer a cleared 1920×1080+ landscape plus a portrait composition showing a person and books above the lower text block. Preserve quiet space for desktop text on the left. |
| 2 | `public/img/lh-print-inspection-wide.jpg`, 1400×933. Subject is right of centre; tall crop drops the press. | A cleared close view of proofing/finishing or a coordinated landscape and portrait pair. Avoid visual implication of an owned local plant unless documented. |
| 3 | No suitable LoHo-specific image among the current candidates. `Assets/LH hero.png` is a grayscale wireframe. | Obtain approved LoHo brand artwork or a cleared neutral device/learning image. No Kenya portal screenshot, Kenyan curriculum screen, classroom deployment scene or invented app interface. |
| 4 | `public/img/lh-bilingual-editor-wide.jpg`, 1400×933. Window is bright at left; editor is to the right. | Portrait crop around the editor and work surface, retaining face and hands clear of the lower copy. Do not imply that photographed staff are actual Cameroon employees without consent/confirmation. |

`lh-catalogue-shelves.jpg` is 410×410 and unsuitable as a full-screen hero. All named candidates need replacement or documented acceptance against the 1920×1080 source rule; any new public image also needs usage rights. On phones, art-direct portrait images rather than merely enlarging the landscape files. Start mobile focal positioning per image, then inspect the actual 320, 375 and 414 px EN/FR rendering; keep text and CTAs away from faces. Maintain the existing dark lower gradient, strengthen it where bright windows meet copy, and verify at least **4.5:1** for ordinary text and **3:1** for large text and control boundaries. Confirm no CTA overlaps the bottom carousel controls at 320–820 px, including the longest French slide; check reduced-motion and keyboard states after population.

**Release gate:** implement locally after the approved copy and imagery decision, then have Dell verify both CMS and fallback states, all four slides in EN/FR, CTA destinations, 320–1024 px crop/contrast, rotation CLS and the cover/Book List claim sweep before any production change.
