# CLIENT-4C — LoHo release and catalogue evidence record

**Task:** CLIENT-4C (`c3708c14-00a3-4e48-8f4a-7b0576c9a3d8`) · **By:** SoSo · **Date:** 2026-09-29 · **QA:** CLIENT-4D (Dell)

## 1. LoHo e-learning — released

- **Commit:** `92d51ee` (pushed `4f8089b..92d51ee`). **Deploys:** before `6abbe293dd1c9a00087e6e3b` (rollback target), after `6abbe5375298140008b34ccc`.
- **Change** (`src/data/offerings.ts`, static; no CMS or migration):
  - The label changes from "LoHo" to **"LoHo e-learning" / "LoHo, apprentissage en ligne"** (client, 2026-09-29: LoHo means e-learning).
  - A new summary reads **"An e-learning platform with interactive educational content." / "Une plateforme d'apprentissage en ligne aux contenus éducatifs interactifs."** It is grounded in Longhorn's official products page ([longhornpublishers.com/products-services](https://www.longhornpublishers.com/products-services/): "eLearning platform with interactive educational content…").
  - The status stays **Coming soon / Bientôt disponible**, now styled as its own label (`.card__status`).
- **Not claimed (Kenya-only per CLIENT-4A):** CBC/KICD curriculum or accreditation, Elimu Pepe, Swahili content, live availability, a launch date, or an LMS feature list.
- **Local QA:** EN/FR Home and Services at 1280 and 375 px. The card is a plain `<article>` with no link and no focus stop, and there is no mobile overflow. The production build passes, and all 10 suites pass.
- **Live QA (after deploy):**
  - The same checks pass on `/en/`, `/fr/`, `/en/services/` and `/fr/services-edition/` at both widths.
  - 0 hits for Kenya-only terms or DRC/Congo across 8 routes.
  - The catalogue is unchanged (4 × `other_developed`, 0 covers), and the three recorded cover keys still return 404.
  - `verify:production` PASS (10/10).
- **Rollback:** revert `92d51ee`, or publish deploy `6abbe293…`. That deploy includes the cover gate, so it is safe (see `client_3c_rollback_2026-09-29.md` §1).

## 2. Four-title National Book List classification — PAUSED (Yv)

Paused pending the client's source and year. No data was changed; all four remain `other_developed`, text-only.

| Slug | Cover matches edition | Official evidence found |
|---|---|---|
| `english-workbook-class-5` | Yes ("English Workbook, Class 5", LONGHORN) | MINEDUB *Liste officielle des manuels scolaires 2025/2026*, N° …1464/MINEDUB/CAB, 10 Apr 2025, p. 5, Class V English Language: "Workbook of English, Class 5 — LONGHORN — 1150". **This is the prior school year's list**; a 2026/27 MINEDUB list was not found. |
| `chemistry-form-1-students-book` | Yes ("Student's book, Form 1") | None found |
| `physics-form-2` | Yes ("Form 2") | None found |
| `mathematics-form-1-teachers-guide` | Yes ("Teacher's guide, Form 1") | None found. Official lists name pupil books, so the teacher's guide itself needs explicit confirmation. |

- **Secondary titles:** these come under MINESEC. Its site offers lists only up to 2023/24, with no anglophone list. The 2026/27 general-secondary list (N°02/26/MINESEC/CAB, 9 June 2026) is announced, but its contents were not reachable.
- **To release,** the client must supply the list page or decision lines for each title and year, plus cover-publication approval.
- **When released:** one forward migration covering only the four slugs, with the evidence reference, verifier and date. This satisfies `catalogue_titles_booklist_evidence_check`. It needs a live check of covers raw and via `/.netlify/images`.
- **Before any cover goes public,** a signed-in admin must confirm each production cover blob is the matching intake file (`Assets/Book covers/b1–b4.png`). Anonymous requests now 404 by design.

## 3. Hero

No new hero slides were created. Proposals (CLIENT-4A/4B) await user validation.
