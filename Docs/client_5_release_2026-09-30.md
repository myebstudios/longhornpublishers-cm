# CLIENT-5A / 5B — local DB fix and approved hero set (for CLIENT-5D QA)

**Author:** SoSo · **Date:** 2026-09-30 · **Production:** unchanged. Nothing pushed; no production database or CMS write.

## CLIENT-5A — `npm run dev` 503 (`c.classification` missing)

- **Cause:** `npm run dev` → `astro dev` → the Netlify adapter serves `.netlify/db` (PGlite, ephemeral port, sets `NETLIFY_DB_URL`/`NETLIFY_DB_DRIVER`) but never applies migrations. That store stopped at `011`; the fixed-port Postgres on `54329` (`npm run db:migrate`) is a separate database and was current.
- **One-off repair (2026-09-29):** `012`–`017` applied to the running `.netlify/db`, recorded in `netlify.migrations`. Verified today: the ledger reads `011`–`017`.
- **Lasting fix:** `scripts/dev.mjs` applies pending repo migrations to `.netlify/db` with the adapter's own `@netlify/database-dev` before starting Astro. If another dev server holds the store, it skips with a warning instead of opening it twice.
- **Evidence (scratch worktree, store pinned at `011`):** `npm run dev` printed `Applied migrations to .netlify/db: 012 … 017`; `/en/`, `/fr/`, `/en/services/`, `/en/catalogue/`, `/fr/catalogue/` → 200. Restart printed `schema is up to date`; `/en/`, `/fr/` → 200. With a server already running, the launcher printed the skip warning and left the store alone. The user's running server kept returning 200 throughout.

## CLIENT-5B — four approved hero slides

- `scripts/hero-launch-set.mjs` now holds Z's exact CLIENT-5C fields (`Docs/client_5c_hero_final_review_2026-09-30.md`); the runbook table matches it.
- Images follow Z's pairing: 1 `lh-hero.jpg`, 2 `lh-print-inspection-wide.jpg`, 4 `lh-bilingual-editor-wide.jpg`. **Slide 3 (LoHo) has no image**; none is cleared, so it falls back to `lh-hero.jpg`. All three images are below 1920×1080. Runbook gate G2 is open.
- `npm run test:hero-launch` 7/7, including a new sweep: no Book List, approval/accreditation, preorder or availability wording, and slide 3 says Coming soon / Bientôt disponible in both locales.

### Local render (fixed-port DB via `npm run stage:hero-launch`, `CMS_DATABASE_URL`)

- `/en/`, `/fr/` → 200, slides in order 1–4, FR copy on `/fr/`. CTAs resolve to `/en|fr` routes: catalogue, services / services-edition, why-choose-us / pourquoi-nous-choisir, contact.
- Browser run, reduced motion, EN/FR × 320, 375, 414, 768, 820, 1024, 1280 px × 4 slides: no CTA intersects a carousel control; worst lede contrast **6.35:1** (FR, 375 px, slide 4) measured against the brightest pixel behind the text. Uploaded images were served by request interception, as in `hero_launch_evidence_2026-09-28.md` (the media function ignores `CMS_DATABASE_URL` under `astro dev`).
- Cosmetic, for Z: the FR slide 3 eyebrow pill wraps to two lines at 375 px; slide 4's landscape photo crops to mostly background on phones (the portrait art-direction item).
- `npm run build` passes; all 10 suites pass.

### Still to do before production

1. G2: user accepts or replaces each image and supplies/approves a slide 3 image.
2. Dell's CLIENT-5D local QA.
3. The admin swap in `Docs/hero_launch_runbook.md`: delete placeholders `0fd67f19…` and `78a5d57e…`, add the four slides disabled, enable in order, disable anchor `5ad099ec…`. Rollback: re-enable `5ad099ec…`, disable slides 1–4.
