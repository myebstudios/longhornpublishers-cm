# ADMIN-3 implementation evidence — 11 October 2026

Owner: SoSo. Board task: `9c2f6acb-825e-42b8-802a-7dc1c5875047`.
Inputs: Z's `admin_redesign_spec.md` (`6f1f7d4`), reference image inspected directly, and Marty's `admin_redesign_copy.md` (`32dc974`).

## Implementation

All 12 admin page templates migrated. Admin-scoped light tokens, local Inter, line SVGs, grouped navigation, account footer, responsive rail/drawer, collapsed-navigation storage, page search and keyboard shortcut are shared by the protected shell. Login shares the tokens while retaining its standalone Identity flows. Existing auth and DEV gating remain in place.

Dashboard reads the 11 existing endpoints independently. Adapters distinguish empty, null, malformed and failed responses. Website totals exclude taxonomy, hero configuration and global settings. Catalogue Published and Publicly eligible remain distinct. Recent edits use actual valid saved timestamps, exclude subjects, deduplicate by source/record and limit to six. Retry/refresh preserve and label previous successful data.

Shared form/save-bar/header/icon presentation covers generated repeatable rows as well as templates. Catalogue/news/subjects use list-first records and mobile labeled cards; new editors stay mounted and initially visible. Services/process and legal editors are stacked with separate forms. Hero ordering, uploads, private evidence, all bilingual fields, and in-page boolean confirmations remain attached to their existing handlers.

## Commits on main (not pushed)

| Commit | Step |
| --- | --- |
| `b128b17` | Light tokens and responsive shell/navigation |
| `cabdfbb` | Independent dashboard reads and truthful state adapters |
| `f5b6554` | Shared accessible forms and dialog presentation |
| `83741f6` | Homepage/hero and catalogue migration |
| `badc389` | Remaining editors and all Identity form presentation |
| `d90528a` | Dashboard adapter tests and accessible-state polish |

No public page, API/function, database/schema, auth gate, Identity flow, validator or payload key was changed. Source inventory against the pre-implementation baseline confirms existing editor/login IDs, form names and data hooks remain. The dashboard retains its existing metric/badge hooks. Unrelated dirty documents and untracked assets were excluded from every commit. No production content was changed, no hero swap was run, and no push/deploy was performed.

## Verification

`npm run build`: PASS. Strict standalone TypeScript checking of dashboard, shell, presentation, icons and navigation modules: PASS. Scoped `git diff --check`: PASS.

Every current `test:*` script was executed:

| Script | Passed tests |
| --- | ---: |
| `test:product-code` | 4 |
| `test:catalogue-classification` | 8 |
| `test:cms` | 19 |
| `test:hero` | 5 |
| `test:hero-admin` | 5 |
| `test:hero-launch` | 7 |
| `test:cms-parity` | 8 |
| `test:public-cache` | 4 |
| `test:demo-seed` | 28 |
| `test:on-demand-routing` | 9 |
| `test:admin-dashboard` | 7 |

All 11 scripts finish with exit 0; 104 tests pass with zero skipped. The first routing run failed because Astro selected port 4365 while the harness expected 4364. Its standalone retry passed all nine tests without changing the harness or public routing implementation. The new dashboard tests exercise empty versus malformed responses, missing singleton/legal rows, aggregate exclusions, catalogue eligibility and deterministic recent-edit selection.

## Differences and remaining QA

- Shared components follow the spec's suggested boundaries where useful; existing dynamic renderers and handlers are retained rather than rewritten as components. Save bars are inline (sticky was optional); existing inline save/upload feedback and disabling logic are preserved rather than adding toast timers or new submission behavior.
- Marty’s compatible page headings/subtitles, Save actions, publication terminology and confirmation button wording were incorporated. Existing field descriptions and server/Identity messages are retained where more precise. The copy sheet is not applied literally where it specifies different field names, category/level options, validators, localized hero destinations, conversion of milliseconds to a seconds input, or assurances of live visibility. Neutral `/services` and `/catalogue` destinations, the existing millisecond interval, category values and classification/evidence rules remain authoritative. No new archive, scheduling, bulk-action or media-library behavior was introduced.
- Existing validators/dirty guards and editor error behavior remain authoritative; the presentation pass adds required legends, language metadata and helper associations without adding validation rules. Existing reset, save and delete focus behavior still requires browser regression checking in ADMIN-4.
- Browser evidence does **not** establish responsive or accessibility compliance. Chrome's extension connector reported `Unable to load browser request-header policy`; native Chrome navigation was available. A foreground local Astro server could be reached, but the protected route redirected to `/admin/login/` under the existing Netlify role rule. No role/auth workaround was introduced. Authenticated preview inspection, all editor CRUD/upload/reorder flows, drawer/search/confirm focus paths, 320–1440px reflow, short-height layouts, contrast, screen-reader checks, 200% text and 400% zoom remain Dell's ADMIN-4 verification before release.

Board state: SoSo assignment verified; Doing claimed, then moved to Review after completed build/test checks. The returned board state explicitly shows Review (revision 4). This is an implementation handoff, not a production release or an assertion that protected browser QA has passed.
