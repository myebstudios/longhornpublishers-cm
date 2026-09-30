# Runbook — launch hero swap and rollback (CLIENT-5B, supersedes HERO-7 Pack D)

**Tasks:** CLIENT-5B (`e4786854-a4ba-4d25-ac50-265df0147511`), originally HERO-7 · **Author:** SoSo · **Updated:** 2026-09-30
**Copy source:** the four CLIENT-4A concepts the user approved, with the exact fields in `Docs/client_5c_hero_final_review_2026-09-30.md` (Z).
**Status:** Copy ready and rehearsed locally. **Image gate open** (below). Do not start the swap until it is closed.
**Operator:** a Netlify Identity `admin` user in `/admin/homepage/`. No deploy, push, or code change is needed; the swap is content-only.

## Gates

| # | Gate | Owner | State 2026-09-30 |
|---|---|---|---|
| G1 | Copy approval | User | **Closed.** All four CLIENT-4A concepts approved; Z's CLIENT-5C table is the final wording. Slide 1's catalogue-first CTA is an intentional change from the live contact-first order (Z); Yv to record it. |
| G2 | Every hero image meets **1920×1080**, or the user accepts the named shortfall in writing, and every image is cleared for use. **None passes today; slide 3 has no image.** | Yv → user | **Open** |
| G3 | Dell's CLIENT-5D local QA passes and the user approves the swap window | Dell, user via Yv | Open |

### G2 images

| Slide | File | Actual | Issue |
|---|---|---|---|
| 1 | `lh-hero.jpg` | 1920×767 | Height (−313 px). Live today. Wide group loses people in a phone crop. |
| 2 | `lh-print-inspection-wide.jpg` | 1400×933 | Both. Must not imply an owned local print plant. |
| 3 | *none* | — | **No cleared LoHo artwork.** Needs approved LoHo brand art or a cleared neutral device/learning image; no Kenya portal screenshot or invented interface. Saved without an image, the slide falls back to `lh-hero.jpg`, which repeats slide 1's photo. |
| 4 | `lh-bilingual-editor-wide.jpg` | 1400×933 | Both. Do not imply the pictured people are Cameroon staff without confirmation. |

To swap an image: drop the file in `public/img/`, set the slide's `image`/`upload` in `scripts/hero-launch-set.mjs`, run `node scripts/prepare-hero-launch-images.mjs` and `npm run test:hero-launch`. `Assets/hero-launch/manifest.json` flags every source below 1920×1080.

If the client changes any wording, update `scripts/hero-launch-set.mjs` first, run `npm run test:hero-launch`, and use the updated values below.

## What exists in production now

Read from live `/en/` on 2026-09-28; slide 1 copy updated by migration 015 (2026-09-29). Placeholders are disabled publicly but may still be saved. Only **enabled** slides are visible publicly, so step 1 recounts in the admin.

| Position | Id | Content | Action |
|---|---|---|---|
| 1 | `5ad099ec-d5e0-4bea-af7d-83aa829879ca` | "Expanding Minds" since migration 015 (backfilled; rollback anchor) | **Keep; disable last** |
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
   - All CTA links return 200, and each FR CTA lands on a French route (`/fr/catalogue/`, `/fr/services-edition/`, `/fr/pourquoi-nous-choisir/`, `/fr/contact/`).
   - Slide 3 visibly reads **Coming soon / Bientôt disponible**, and no slide mentions the National Book List or an approval.
   - `npm run verify:production` passes.
   - Hand over to Dell for QA-HERO-7 Phase 2.

## Slide values

Upload files live in `Assets/hero-launch/`. The source of truth is `scripts/hero-launch-set.mjs`; this table must match it. Leave **Accent** empty where shown as —.

| Field | Slide 1 | Slide 2 | Slide 3 | Slide 4 |
|---|---|---|---|---|
| Image file | `slide-1-lh-hero.jpg` ⚠ G2 | `slide-2-lh-print-inspection-wide.jpg` ⚠ G2 | *none* ⚠ G2 | `slide-4-lh-bilingual-editor-wide.jpg` ⚠ G2 |
| Eyebrow EN | Educational Publishing | Publishing Services | Digital Learning · Coming soon | Heritage & Proximity |
| Eyebrow FR | Édition éducative | Services d’édition | Apprentissage numérique · Bientôt disponible | Héritage et proximité |
| Headline EN | Expanding Minds | Every Stage. | LoHo | Continental experience, |
| Headline FR | Éveiller les esprits | À chaque étape. | LoHo | Une expérience continentale, |
| Accent EN | — | Every Solution | coming soon | close to you |
| Accent FR | — | Chaque solution | bientôt disponible | à vos côtés |
| Primary label EN / FR | Explore Catalogue / Consulter le catalogue | Our Services / Nos services | Explore Services / Explorer nos services | Why Choose Us / Pourquoi nous choisir |
| Primary destination | `/catalogue` | `/services` | `/services` | `/why-choose-us` |
| Secondary label EN / FR | Partner With Us / Devenir partenaire | Contact Our Team / Contacter notre équipe | Why Choose Us / Pourquoi nous choisir | Get in Touch / Nous contacter |
| Secondary destination | `/contact` | `/contact` | `/why-choose-us` | `/contact` |

Subheadlines: copy them verbatim from `scripts/hero-launch-set.mjs` (`subheadline_en` / `subheadline_fr`). Slide 2 and 4 use typographic apostrophes (’); retyping invites errors.

## Rollback

**Trigger:** any wrong copy, broken image, a failed CTA, or a client withdrawal. The rollback takes about 2 minutes and needs no reorder.

1. Open `5ad099ec…` → check **Enabled** → **Save slide**. It sits in position 1, so it immediately becomes the first slide again.
2. Open launch slides 1–4 in turn → uncheck **Enabled** → **Save slide**. Validation allows this because `5ad099ec` is enabled.
3. Verify `/en/` and `/fr/` show only `5ad099ec`.

The disabled launch slides stay saved, so a re-swap is steps 5–6 again. The placeholders are **not** restored; they were test content. If the whole CMS path fails, the documented fallback is still valid: with zero enabled slides on a published homepage, validation refuses the save, so the legacy static `Hero` is only reachable by unpublishing the homepage. Do not do that without the user.

## Local rehearsal (CLIENT-5B set rehearsed 2026-09-30; Pack D in `hero_launch_evidence_2026-09-28.md`)

```bash
node scripts/local-db.mjs start && node scripts/local-db.mjs migrate
npm run stage:hero-launch                 # disable existing slides, stage launch set at 0–3
npm run stage:hero-launch -- --rollback   # restore the snapshot in .netlify/hero-launch-snapshot.json
```

These scripts are local-only. They refuse non-loopback databases and deploy/CI contexts, and they never touch production.
