# Evidence — HERO-7 launch hero set, local verification

**Date:** 2026-09-28 · **By:** SoSo · **Base:** `c8bfb6e` + this commit · **Runbook:** `hero_launch_runbook.md`
**Scope limits:** no production writes and no push. The only production traffic was anonymous read-only GETs.

## Result

The four Pack D slides render locally in EN and FR from the CMS path, with the production query filter (`is_demo = false`). Slide 1 is the LCP candidate, and rotation CLS is 0. One layout defect surfaced and was fixed here (F1). Two content blockers remain for the client (G1/G2 in the runbook).

## How it was run

- Data: `npm run stage:hero-launch` on the fixed-port local DB (`54329`). This disabled the one backfilled slide (`443c73d4…`), wrote the 4 launch rows at positions 0–3 with fixed ids `…07a1`–`…07a4`, and put the upload masters in the local blob store.
- Server: `astro dev` on `127.0.0.1:4380` with `CMS_DATABASE_URL` at that DB. It ran from a temporary worktree, because Astro allows one dev server per project and the existing servers on 4321/4322 were not mine. Both were left running and untouched.
- Browser: headless Chromium (Playwright). Viewports 320, 375, 414, 761, 768, 820, 1024, 1280 and 1440, each in EN and FR, every slide activated.
- **Limitation:** under `astro dev`, the media function ignores `CMS_DATABASE_URL`, because the Netlify runtime pins its own database. `/api/media` therefore returned 500 for the staged keys. The browser run served those four URLs with the exact bytes of `Assets/hero-launch/*.jpg` via request interception. Media authorisation is HERO-2 scope and is covered by its tests, not by this run.

## Checks

| Check | Result |
|---|---|
| 4 slides, correct order, EN + FR | **Pass**: ids `…07a1`–`…07a4` in order on `/en/` and `/fr/` |
| Clipping: every eyebrow, h1, lede and CTA, all slides, all viewports, both locales | **Pass**. No element is cut off or leaves the viewport. P3: at FR 320, "professionnels," (slide 1) is 5 px wider than the h1 box, so the right gutter is ~13 px against 19 px on the left. It stays fully visible. |
| Longest FR variant, including the safe G1 wording "Matériels pédagogiques conformes aux programmes nationaux," and the EN eyebrow "Curriculum-Aligned Learning Materials" | **Pass** at every viewport |
| CTA vs carousel controls | **Failed, then fixed (F1)**. Minimum horizontal gap after the fix: 35 px (EN 768) |
| LCP | Slide 1 is the LCP surface at every viewport: its `<img>`, or its h1/lede when text paints larger on narrow screens. Exactly one `eager` + `fetchpriority="high"` image; slides 2–4 are `lazy`. The preload follows `heroSlides[0].image` (`/api/media/uploads/…07e1.jpeg`). |
| Rotation CLS (autoplay, no input, 13.5 s, 3 slides shown) | **0.000**, zero layout-shift entries (EN/FR × 375/1280) |
| Stack height is constant across slides | The grid stack is sized by the tallest slide, e.g. 786 px at 768 and 943 px at FR 375 |
| Local rollback rehearsal | **Pass**: `--rollback` restored `443c73d4…` to enabled/position 0, identical to the pre-stage dump. Restaging twice is idempotent (5 rows, 4 enabled). |
| `CONTEXT=production npm run build` | Exit 0 |
| Suites | `test:hero-launch` 6/6 (new). `test:product-code` 4, `test:cms` 19, `test:hero` 4, `test:hero-admin` 5, `test:cms-parity` 3, `test:public-cache` 4, `test:demo-seed` 28, all passing |

## Images

The masters come from `node scripts/prepare-hero-launch-images.mjs`: progressive mozjpeg q80, capped at 1920 px, never upscaled. Full numbers are in `Assets/hero-launch/manifest.json`. ⚠ = below the Pack D minimum of 1920×1080; all four sources fall short (runbook G2).

| Slide | Size | Source | JPEG master | WebP (ref) | AVIF (ref) |
|---|---|---|---|---|---|
| 1 `lh-hero.jpg` | 1920×767 ⚠ | 293 KB | 163 KB | 96 KB | 61 KB |
| 2 `lh-catalogue-shelves.jpg` | **410×410** ⚠ | 98 KB | 44 KB | 36 KB | 21 KB |
| 3 `lh-bilingual-editor-wide.jpg` | 1400×933 ⚠ | 253 KB | 140 KB | 91 KB | 57 KB |
| 4 `lh-print-inspection-wide.jpg` | 1400×933 ⚠ | 257 KB | 144 KB | 81 KB | 55 KB |

**WebP/AVIF delivery is the CDN's job, not a file we upload.** `responsive()` wraps `/api/media/…` in `/.netlify/images` with a 640–1920 srcset. A live read-only probe of an existing uploaded media key returned `image/webp` (31 KB) for `Accept: image/avif,image/webp` and the original format (589 KB) for `Accept: image/jpeg`. Netlify served WebP even when AVIF was offered, so the AVIF column is reference only.

**`Assets/LH hero.png` was not used.** It is a greyscale layout wireframe (1728×1117, flat blocks), not photography, so optimising it into a hero background would have shipped the wireframe. Slide 1 uses `lh-hero.jpg`, as Pack D names.

## Findings

| Id | Severity | Finding | Action |
|---|---|---|---|
| F1 | P1, **fixed** | Between 761 and ~900 px the CTA row shares a line with the carousel toolbar and nothing reserved its width. With launch copy, "Toutes les actualités" (FR slide 4) ran under the Previous button, overlapping by up to 65 px; FR slides 2–3 and EN slide 4 were also affected. The production placeholders were too short to show it. | `HeroCarousel.astro` now reserves `20rem` at the end of the CTA row whenever the controls are visible, and resets that to 0 at ≤760 px, where the controls drop below. Layout at ≥1024 px is unchanged. |
| F2 | P1 (content) | Slide 2 "Approved"/"agréés" claim | Runbook gate G1 (already in the client follow-up draft) |
| F3 | P1 (content) | Slide 2 image is 410×410; slides 1, 3 and 4 are also below the 1920×1080 Pack D minimum | Runbook gate G2 |
| F5 | P2 (content) | Slide 1 EN secondary "Partner With Us" vs FR "Nous contacter"; CTA priority swapped against the live approved hero (live: contact primary) | Runbook gates G1b/G1c, for client ruling |
| F4 | Info, pre-existing | At 1024/1280, off-screen card carousels below the hero give `scrollWidth` > viewport by 73/18 px. Production shows the same 73 px. `html { overflow-x: clip }` means there is no visible scroll. | None for HERO-7 |

## Environment left behind

- **Local DB `54329` keeps the launch set staged** (4 enabled launch slides; `443c73d4…` disabled) for QA-HERO-7 Phase 1. Undo with `npm run stage:hero-launch -- --rollback`.
- The snapshot is in `.netlify/hero-launch-snapshot.json`. Local blobs `…07e1`–`…07e4` are in `.netlify/blobs-serve`. Both paths are gitignored.
- Screenshots and raw metrics are in `tmp/hero7/` (gitignored). My dev server is stopped and the temporary worktree removed.

## Addendum — a11y fixes and mobile image assessment (2026-09-28, `fbaad0e`)

### Fixed: QA P2 region focus ring, QA P3 dot-group label (UX-2 "fix code" items)

- **Focus ring.** The region's own `outline` paints *beneath* the z-indexed slides. Chrome draws an element's outline before its positive-z-index children, so a computed-style check passes while nothing is visible (confirmed by screenshot). The ring is now a `:focus-visible::after` overlay: inset 6 px, `z-index: 4` (above the slides and controls), 3 px `--green`. It is visible in EN/FR at 1280×800 (`tmp/hero7/{en,fr}-region-focus.png`).
- **Dot group.** The accessible tree is now region "Main hero" → group "Choose a slide", and region "En-tête principal" → group "Choisir une diapositive".
- `test:hero` 5/5 (new source-contract test). `test:hero-admin` 5, `test:cms` 19 and `test:hero-launch` 6 pass. `CONTEXT=production npm run build` exits 0.

### Assessed, not changed: QA P2 "mobile hero image soft and not LCP"

Measured locally at 375 px @2x, serving slide 1 through request interception:

| Image served | Viewport | Image box | LCP element |
|---|---|---|---|
| `w=960` (960×384, the current prod choice) | 375×812 | 375×896, covers viewport | H1 (45 080) |
| `w=960` | 375×1000 | 375×896, smaller than viewport | **IMG** (343 500) |
| Native portrait crop 333×767 | 375×812 | covers viewport | H1 (45 080) |
| Native portrait crop 333×767 | 375×1000 | smaller than viewport | **IMG** (255 411) |

1. **"Not LCP" is not caused by resolution.** Chrome excludes an image that covers the whole viewport from LCP, treating it as a background. The hero is taller than a phone screen, so the H1 is the LCP on phones whatever image is served. The same rule explains the desktop runs: at 1280×800 (hero 821 px) the H1 is LCP, and at 1440×900 (hero 853 px) the IMG is. A text LCP is not a defect; it paints earlier than the image. No code change is recommended for this part.
2. **The softness is real, and a code-only change helps but cannot cure it.** Today a phone gets `w=960` (384 px tall) stretched over ~1 790 device px: **~4.7 device px per image px**. Art-directing a portrait crop — `<picture>` with a portrait `<source>` asking the Image CDN for `fit=cover&w=…&h=…` at the source's native height, plus a matching `media`-scoped preload — would give ~2.3× for slide 1 (767 px tall) and ~1.9× for slides 3–4 (933 px). That is about twice as sharp, at roughly half the bytes (the 333×767 crop is 34 KB against 62 KB for `w=960`, as JPEG q75), with the same composition `object-fit: cover` shows now.
   - **Limits:** detail is capped by source height, so only taller photography (runbook G2) removes the softness. Uploaded media has no recorded height, so the crop would request a fixed height and the CDN would upscale sources shorter than that. `useCdn` is off in `astro dev`, so the change can only be verified on a deploy preview, which needs a push. It is **not** in this commit; I recommend a separate ticket once pushing a preview is approved.
3. **`Assets/LH hero.png` is not a usable "less-wide" slide 1 source** (QA suggestion). It is a greyscale layout wireframe, not photography.

### Recheck handoff for Dell

- **Base:** `fbaad0e` on `main` (local, unpushed). `/tmp/qa7wt` is at `9a93d35` and lacks this fix; recreate it or check out `fbaad0e`.
- **Local DB `54329`:** still staged with the four launch slides. Nothing here changed data or images.
- **Recheck:** Tab to the region shows a green inset ring in EN/FR. The dot group is announced as "Choose a slide" / "Choisir une diapositive". Arrow keys still act on the focused region. The ring disappears when focus moves to a control, which then shows its own ring. There is no ring on mouse click (`:focus-visible`).
