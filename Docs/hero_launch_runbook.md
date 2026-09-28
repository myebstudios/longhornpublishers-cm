# Runbook — HERO-7 production hero swap and rollback

**Task:** HERO-7 (`e5e621ca-e4b3-40db-983f-5b679c82eecb`) · **Author:** SoSo · **Date:** 2026-09-28
**Status:** Ready, **gated.** Do not start until all three gates below are closed.
**Operator:** a Netlify Identity `admin` user in `/admin/homepage/`. No deploy, push, or code change is needed; the swap is content-only.

## Gates (all must be closed)

| # | Gate | Owner | State 2026-09-28 |
|---|---|---|---|
| G1 | Client signs Pack D (`client_approval_packet.md` §E) with an explicit ruling on each item in **G1 items** below. Signing "as written" must not be read as approving these silently. | Yv → client | Open. Follow-up drafted in `client_followup_2026-09-28.md`, not sent; it covers G1a only. |
| G2 | Every hero image meets the Pack D minimum of **1920×1080** (`hero_slide_copy.md:50,85,120,155`; `client_approval_packet.md:88`), or the client accepts the named shortfall in writing. **None of the four passes today** (see **G2 images**). | Yv → client | Open |

### G1 items: copy decisions the client must rule on

| Id | Slide | Issue | Options to put to the client |
|---|---|---|---|
| G1a | 2 | EN eyebrow "National Curriculum **Approved**" and FR headline "Matériels pédagogiques **agréés**" claim a regulatory approval that nothing on file evidences (QA P1). The FR eyebrow says *conforme* (aligned), so EN and FR also disagree. | Provide accreditation evidence, or approve "Curriculum-Aligned Learning Materials" / "Matériels pédagogiques conformes aux programmes nationaux". Both alternatives were verified to fit at every viewport. |
| G1b | 1 | EN secondary CTA "Partner With Us" vs FR "Nous contacter" ("Contact us"). The two locales carry different messages. The live approved slide uses "Devenir partenaire" for FR. | Keep "Partner With Us" / "Devenir partenaire" (matches live), or "Contact Us" / "Nous contacter". |
| G1c | 1 | CTA priority is swapped against the live approved hero `5ad099ec`. Live: **primary** "Partner With Us" / "Devenir partenaire" → `/contact`, secondary "Explore our services" / "Découvrir nos services" → `/services`. Pack D: **primary** "Explore Our Services" → `/services`, secondary "Partner With Us" → `/contact`. This moves the main conversion from lead capture to browsing. | Keep the live priority (contact primary), or confirm Pack D's services-first order intentionally. |

### G2 images: shortfall against 1920×1080

| Slide | File | Actual | Shortfall |
|---|---|---|---|
| 1 | `lh-hero.jpg` | 1920×767 | Height (−313 px). This is the image live today. |
| 2 | `lh-catalogue-shelves.jpg` | **410×410** | Both; a 4.7× upscale at 1920 wide. Cannot ship without a replacement. |
| 3 | `lh-bilingual-editor-wide.jpg` | 1400×933 | Both |
| 4 | `lh-print-inspection-wide.jpg` | 1400×933 | Both |

Slides 1, 3 and 4 render acceptably in the local run (≤1.4× upscale, under a dark overlay), but they still fall short of the stated requirement. They need Pack B replacements or written acceptance. `node scripts/prepare-hero-launch-images.mjs` flags every source below 1920×1080 in `Assets/hero-launch/manifest.json`.
| G3 | User approves the swap window after QA-HERO-7 Phase 1 passes | User via Yv | Open |

If the client changes any wording, update `scripts/hero-launch-set.mjs` first, run `npm run test:hero-launch`, and use the updated values below. If the image changes, drop the new file in `public/img/`, point the slide's `image` at it, and rerun `node scripts/prepare-hero-launch-images.mjs`.

## What exists in production now

Read from live `/en/` on 2026-09-28. Only **enabled** slides are visible publicly, so step 1 recounts in the admin.

| Position | Id | Content | Action |
|---|---|---|---|
| 1 | `5ad099ec-d5e0-4bea-af7d-83aa829879ca` | "Professional publishing services, start to finish" (backfilled; rollback anchor) | **Keep; disable last** |
| 2 | `0fd67f19-7a7d-4701-ad33-ace716af9b79` | "Heading test" placeholder | **Delete** |
| 3 | `78a5d57e-786d-42b2-bbb4-4f5c5bb72a51` | "Heading test 2" placeholder | **Delete** |

**The order is forced by the cap.** `MAX_HOMEPAGE_HERO_SLIDES = 5` counts *saved* slides, disabled ones included. 3 existing + 4 new = 7, so the placeholders must go before anything is created. 1 kept + 4 launch = 5 is exactly the cap. After the swap, **Add slide** is unavailable until a slide is deleted. That is expected.

**Reorder is deliberately not used.** Browser reorder is still unproven (HERO-4/HERO-6). New slides append after the kept slide, so disabling `5ad099ec` leaves the launch set in positions 1–4.

## Swap procedure

Allow about 20 minutes. Keep a second tab open on `/en/` and `/fr/` in a private window.

1. **Pre-check.** In `/admin/homepage/` → *Hero carousel slides*, count every slide. If there are more than the three above (disabled QA slides, for example), record their ids here and delete them in step 2 too. The total before step 3 must be **1**.
   Save a screenshot of the list as the rollback record.
2. **Delete the placeholders.** Open `0fd67f19…` → **Delete slide** → confirm. Repeat for `78a5d57e…`. Public pages now show only `5ad099ec`. That is valid content, so there is no visible breakage.
3. **Create the four launch slides, disabled.** For each row of the table below, in order 1→4: **+ Add slide** → fill every field → **Choose or replace image** → upload the file from `Assets/hero-launch/` → wait for "Image uploaded and attached" → leave **Enabled unchecked** → **Save slide**.
   A disabled save does not touch the live cache (admin note, `homepage.astro:15`).
4. **Proof in the admin.** Reopen each slide and compare it with the table. Check *Destination for both languages* in particular: it must be the neutral slug (`/services`), **not** `/en/services/`. A `/en/…` value would send French visitors to English pages, because `localizeCmsHref` only localises neutral slugs.
5. **Enable in order.** Open launch slide 1 → check **Enabled** → **Save slide**. Repeat for slides 2, 3 and 4. Each save purges the homepage. Between saves the public page shows `5ad099ec` plus the launch slides enabled so far. All of it is real copy.
6. **Disable the anchor.** Open `5ad099ec…` → uncheck **Enabled** → **Save slide**. **Do not delete it.** It is the one-click rollback.
7. **Verify live** (read-only, any browser):
   - `/en/` and `/fr/` show exactly 4 slides in order 1–4, with FR copy on `/fr/`.
   - View source: exactly one hero `<img>` with `loading="eager"` + `fetchpriority="high"`, and the `<link rel="preload" as="image">` points at slide 1's `/api/media/uploads/…` key.
   - All 12 CTA links return 200, and each FR CTA lands on a French route (`/fr/services-edition/`, `/fr/a-propos/`, `/fr/pourquoi-nous-choisir/`, `/fr/actualites/`, `/fr/catalogue/`, `/fr/contact/`).
   - `npm run verify:production` passes.
   - Hand over to Dell for QA-HERO-7 Phase 2.

## Slide values

Upload files live in `Assets/hero-launch/`. The source of truth is `scripts/hero-launch-set.mjs`; this table must match it.

| Field | Slide 1 | Slide 2 | Slide 3 | Slide 4 |
|---|---|---|---|---|
| Image file | `slide-1-lh-hero.jpg` ⚠ G2 | `slide-2-lh-catalogue-shelves.jpg` ⚠ G2 | `slide-3-lh-bilingual-editor-wide.jpg` ⚠ G2 | `slide-4-lh-print-inspection-wide.jpg` ⚠ G2 |
| Eyebrow EN | Cameroon & Central Africa | National Curriculum Approved ⚠ G1a | Yaoundé Editorial Hub | 60 Years of African Publishing Excellence |
| Eyebrow FR | Cameroun & Afrique Centrale | Conforme aux Programmes Nationaux | Centre Éditorial de Yaoundé | 60 Ans d'Excellence Éditoriale en Afrique |
| Headline EN | Professional publishing services, | Curriculum-aligned learning materials, | Native bilingual expertise, | Rooted in Central Africa, |
| Headline FR | Services d'édition professionnels, | Matériels pédagogiques agréés, ⚠ G1a | Expertise éditoriale bilingue, | Ancré en Afrique centrale, |
| Accent EN | start to finish. | built for success. | in English and French. | backed by six decades. |
| Accent FR | du début à la fin. | conçus pour la réussite. | en français et en anglais. | fort de six décennies. |
| Primary label EN / FR | Explore Our Services / Découvrir nos services ⚠ G1c | Browse Full Catalogue / Consulter le catalogue | Learn About Our Team / Découvrir notre équipe | Why Choose Longhorn / Pourquoi choisir Longhorn |
| Primary destination | `/services` ⚠ G1c | `/catalogue` | `/about` | `/why-choose-us` |
| Secondary label EN / FR | Partner With Us / Nous contacter ⚠ G1b, G1c | Why Choose Us / Pourquoi nous choisir | Get in Touch / Prendre contact | View Latest News / Toutes les actualités |
| Secondary destination | `/contact` ⚠ G1c | `/why-choose-us` | `/contact` | `/news` |

Subheadlines: copy them verbatim from `scripts/hero-launch-set.mjs` (`subheadline_en` / `subheadline_fr`). They are too long for this table, and retyping invites errors.

## Rollback

**Trigger:** any wrong copy, broken image, a failed CTA, or a client withdrawal. The rollback takes about 2 minutes and needs no reorder.

1. Open `5ad099ec…` → check **Enabled** → **Save slide**. It sits in position 1, so it immediately becomes the first slide again.
2. Open launch slides 1–4 in turn → uncheck **Enabled** → **Save slide**. Validation allows this because `5ad099ec` is enabled.
3. Verify `/en/` and `/fr/` show only `5ad099ec`.

The disabled launch slides stay saved, so a re-swap is steps 5–6 again. The placeholders are **not** restored; they were test content. If the whole CMS path fails, the documented fallback is still valid: with zero enabled slides on a published homepage, validation refuses the save, so the legacy static `Hero` is only reachable by unpublishing the homepage. Do not do that without the user.

## Local rehearsal (already done — see `hero_launch_evidence_2026-09-28.md`)

```bash
node scripts/local-db.mjs start && node scripts/local-db.mjs migrate
npm run stage:hero-launch                 # disable existing slides, stage launch set at 0–3
npm run stage:hero-launch -- --rollback   # restore the snapshot in .netlify/hero-launch-snapshot.json
```

These scripts are local-only. They refuse non-loopback databases and deploy/CI contexts, and they never touch production.
