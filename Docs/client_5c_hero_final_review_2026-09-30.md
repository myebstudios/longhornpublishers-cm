# CLIENT-5C — corrected final hero review

**Approval source:** the user's “all approved” reply to Yv's later four-slide table, which supersedes the older CLIENT-4A concept order. The approved sequence is **1 brand promise → 2 catalogue → 3 publishing services → 4 LoHo preview**. There is no proximity slide. This is the EN/FR implementation handoff for SoSo; no CMS or production content was changed here.

The live EN/FR homepages still show one enabled “Expanding Minds / Éveiller les esprits” slide. Keep the client-requested heading and supporting line separate on slide 1. In the CMS, save the locale-neutral CTA destination shown below; `localizeCmsHref()` maps it to the EN/FR public routes in parentheses. Each approved concept has one primary CTA, so leave secondary CTA fields empty.

| Order | CMS field | English | Français |
| --- | --- | --- | --- |
| 1 — brand promise | Eyebrow | *(empty)* | *(vide)* |
|  | Headline | Expanding Minds | Éveiller les esprits |
|  | Accent | *(empty)* | *(vide)* |
|  | Subheadline | Enriching lives through knowledge | Enrichir des vies par la connaissance |
|  | Primary CTA | Explore our services → `/services` (`/en/services/`) | Découvrir nos services → `/services` (`/fr/services-edition/`) |
| 2 — catalogue | Eyebrow | Catalogue | Catalogue |
|  | Headline | Books for Cameroonian classrooms | Des livres pour les classes camerounaises |
|  | Accent | *(empty)* | *(vide)* |
|  | Subheadline | Explore learning and teaching materials | Découvrez nos matériels d’apprentissage et d’enseignement |
|  | Primary CTA | Browse catalogue → `/catalogue` (`/en/catalogue/`) | Consulter le catalogue → `/catalogue` (`/fr/catalogue/`) |
| 3 — publishing services | Eyebrow | Publishing services | Services d’édition |
|  | Headline | Every Stage. | À chaque étape. |
|  | Accent | Every Solution. | Chaque solution. |
|  | Subheadline | Editing, translation and print services for your publishing project | Révision, traduction et impression pour votre projet éditorial |
|  | Primary CTA | Explore services → `/services` (`/en/services/`) | Découvrir nos services → `/services` (`/fr/services-edition/`) |
| 4 — LoHo preview | Eyebrow | Digital learning | Apprentissage numérique |
|  | Headline | LoHo e-learning — | LoHo, apprentissage en ligne — |
|  | Accent | Coming soon | Bientôt disponible |
|  | Subheadline | Interactive educational content | Des contenus pédagogiques interactifs |
|  | Primary CTA | Explore services → `/services` (`/en/services/`) | Découvrir nos services → `/services` (`/fr/services-edition/`) |

**Claim boundaries.** Slide 2 invites browsing and does not say that any title is verified on the National Book List, government approved or accredited. It must not show recognizable book covers or spines without rights and title-level cover clearance. Slide 3 does not suggest ownership, location or capacity of a printing plant. Slide 4's **Coming soon / Bientôt disponible** is visible headline text, not just a badge; do not add availability, assessment, classroom deployment, early access, preorder or purchase language. The slide 1 services-first CTA follows Yv's later approved table and intentionally differs from the current live contact-first CTA.

## Image, crop and contrast handoff

| Slide | Current asset assessment | Image direction |
| --- | --- | --- |
| 1 | `public/img/lh-hero.jpg` is live and 1920×767: short of the 1920×1080 source requirement, with most of the group lost in a phone crop. | Rights-cleared people learning or working with books. Give desktop copy quiet space on the left; supply a separate portrait composition that retains the book interaction above mobile copy. Keep the current image only if its shortfall is explicitly accepted. |
| 2 | `public/img/lh-catalogue-shelves.jpg` is only 410×410 and cannot serve a full-width hero. | New rights-cleared books or classroom photograph at the required resolution, plus a portrait crop. Use generic books or exactly approved covers; avoid identifiable minors without consent. Do not visually imply National Book List status. |
| 3 | `public/img/lh-print-inspection-wide.jpg` is 1400×933; the person is right of centre and a tall crop loses the press. | Rights-cleared editing, proofing or print work in progress. For mobile, frame hands and manuscript/proof as the focal action; obtain a portrait variant if both person and work need to remain legible. |
| 4 | No suitable LoHo-specific image is in the current inventory. `public/img/lh-bilingual-editor-wide.jpg` depicts editorial work, and `Assets/LH hero.png` is a grayscale wireframe. | Approved LoHo artwork or a cleared neutral device-learning visual. No Kenya portal screenshot, Kenyan curriculum screen, fabricated app UI or scene implying a live Cameroon classroom rollout. |

Every current candidate needs replacement or documented acceptance of its shortfall against the 1920×1080 image rule; new media also needs usage rights. Art-direct phone imagery rather than enlarging desktop landscape files. At 320, 375 and 414 px, keep faces and focal objects above the lower headline/CTA area; inspect both languages after actual images load. Maintain a dark lower overlay and strengthen it beneath text over bright areas. Verify at least **4.5:1** for normal text and **3:1** for large text and visible control boundaries. Recheck 320–820 px CTA clearance against the carousel controls, French wrapping, keyboard focus, reduced motion and rotation CLS.

**Release gate:** build and inspect these four slides locally first. Dell should confirm EN/FR copy and destinations, image rights and mobile crops, contrast, rotation/CLS, and zero unsupported National Book List or LoHo claims before any production change.

## Generated-image review — 2026-09-30

The new `public/img/client5-catalogue.jpg` and `client5-loho.jpg` are 2048×1152 JPEGs, but both were enlarged from 1672×941 PNG originals in `Assets/hero-generated/`. The native image detail therefore remains below the 1920×1080 source rule; obtain acceptance of this shortfall or larger originals.

| Slide | Decision | Mobile and claim adjustment |
| --- | --- | --- |
| 2 catalogue | **Conditional desktop pass; mobile crop fails as centred.** Plain, unlabelled books avoid a National Book List or approved-cover visual claim. The dark left wall supports desktop copy. | A tall centre crop loses most of the book stack and right-hand writing action. Supply a separately composed portrait image; if using this JPEG temporarily, begin focal testing near 45% horizontal and verify 320/375/414 px with the real EN/FR text. Do not label the pictured books as approved titles. |
| 4 LoHo | **Conditional desktop pass as illustration; mobile crop fails as centred.** The abstract tablet screen is not evidence of a working LoHo interface. | A tall centre crop cuts away most of the tablet. Supply a portrait composition; if using this JPEG temporarily, begin focal testing near 80% horizontal. Keep “Coming soon / Bientôt disponible” in text and identify the image as illustrative if context could imply a product screenshot. |

Retain the dark text overlay, then measure normal-text contrast at 4.5:1 and visible controls at 3:1 on the actual mobile renders. These are visual checks, not production approval or image-rights clearance.
