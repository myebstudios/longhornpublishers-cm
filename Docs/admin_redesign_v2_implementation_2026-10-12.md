# Admin v2 implementation and review handoff — 2026-10-12

Task: ADMIN-V2-2 (`0c2d1aba-b32d-4d00-b298-d5d26c3614e3`), SoSo.

Implemented on main against `admin_redesign_spec_v2.md`, including §12 at
`2a2d97b`, then `admin_ux_principles.md`, Dell's v1 live audit, and the v1
documents where v2 is silent. No push, deployment or production content change.

## Scope and page coverage

The existing authentication gate, Identity flow, backend endpoints, schemas and
validators are unchanged. Existing validators are reused in the client; no
validation rules were relaxed. Public source files are unchanged. The shared
confirmation helper gains only a client-side handoff for unsaved changes;
destructive actions retain the in-page named-item confirmation.

All twelve admin routes are covered:

| Page | Result |
| --- | --- |
| Dashboard | Saved-data summaries; styled dynamic rows; truthful recent records; separate text/cover eligibility counts; existing retry/focus handling retained. |
| Login | Existing standalone authentication presentation and behaviour retained. |
| Catalogue | Cover cards; four-axis status badges and separate homepage selection; search/filter/sort; grouped editor; cover and record metadata retained. |
| Homepage | All enabled/disabled carousel cards; five-slot cap; scratch full-list order editor; seconds adapter; collapsed Fallback hero and parent-owned section editors. |
| About | Professional Heritage/Identity sections and Team cards; individual section/item editors preserve the full parent. |
| Why choose us | Presence and Commitment cards, bilingual content and saved details; guarded parent-owned editing. |
| News | Image cards; large grouped editor; required image-upload interface through existing media endpoint. Image itself retains the existing optional validation. |
| Services | Service and process cards; grouped editors; full-list reorder without filtered-subset writes. |
| Subjects | Compact cards; short editor; existing referenced-delete conflict handling. |
| Contact | Section cards for office/contact details, coordinates and project options; parent-owned edits and complete payloads. |
| Site settings | Identity/contact/footer/social/SEO section cards, empty states and large grouped editors. |
| Legal pages | Two fixed document cards; large sheet with bilingual bodies and safe same-sheet preview; no new legal keys or Add/Delete. |

Every content add/edit form lives in a closed native dialog until explicitly
opened. Original named controls, limits, IDs and data hooks are retained or
attached to their corresponding new visible actions. The legacy page status
hook is visible in the preview canvas. Dialog error links target visible
controls, including media and destination pickers.

## Shared behaviour and safeguards

- One modal editor with header, optional section index, scrollable body and
  footer. Short forms use a card; longer forms use a slide-over; mobile uses a
  sheet with visual-viewport sizing. A dirty Close/Cancel/Escape decision stays
  inside the same dialog. Keep editing retains the draft; Discard restores the
  baseline. Focus returns to the stable initiating action or safe fallback.
- Fresh reads precede editing. Malformed/partial records cannot become editable
  blank defaults. Failed reads retain explicitly last-loaded previews and block
  editing. Null singleton setup has a pristine empty baseline rather than
  invented saved defaults.
- Section saves clone the whole latest baseline, replace only owned fields or
  array items, retain siblings, media IDs and publication flags, and run existing
  whole-record validation. A pre-save singleton read detects external changes;
  Review latest and guarded Reload retain the draft until an explicit decision.
- No forced slug generation, translation, coordinate lookup, cover approval,
  publication, image removal or inferred live status. Calendar fields use the
  existing date-input/API format without replacing saved dates with today.
- Upload/save busy states lock edits without dropping focused controls. Save
  waits for upload settlement; failed replacement retains the old image ID.
  A successful save with failed readback offers a read retry, not a second save.
- Cards distinguish missing media from failed media reads, expose retry, retain
  full titles, and use direct authenticated `/api/media` thumbnails. EN/FR
  switching is read-only. Collection controls retain search/filter/sort/page
  state; pagination starts beyond 24 records.
- Delete/Remove is inside More actions and opens the existing confirmation
  after the menu closes. Parent-array removal submits the complete parent;
  order dialogs hold scratch state until one full-list save.
- Friendly URL names, supported icon and destination pickers retain stored
  values and custom values. Destination previews use the existing localized
  route helper. Homepage fallback and carousel remain separate saved content.

§12's five v1 corrections are implemented: admin-scoped styles for script-created
dashboard rows, reserved navigation scroll cues, one-press search Escape,
singular/plural count formatting, and aligned Site settings contact fields.
Navigation cue measurement is scheduled and guarded to avoid resize loops.
Catalogue/featured-homepage previews share the existing text/cover predicates;
the mock's four published Other developed titles show admin-only covers when
rights are unapproved, while all four authenticated thumbnails still render.

## Commits

| Commit | Change |
| --- | --- |
| `8497726` | V2 editor foundation and live-audit corrections. |
| `09c8500` | Catalogue/Homepage cards, shared controller and guarded editors. |
| `b52a7de` | About/Why/News section editors and previews. |
| `fad175d` | Contact/Legal/Services/Settings/Subjects completion. |
| `ef91b89` | Preservation, badge, duration and operation-guard tests. |
| `85802e5` | Setup/read hydration, calendar handling, field-error targets and final presentation corrections. |

This handoff document is committed separately. Unrelated pre-existing dirty
documents and untracked assets were excluded from every commit.

## Engineering verification

Final `npm run build`: PASS. Additional strict TypeScript check of the admin
controller, shell and presentation modules: PASS. Scoped `git diff --check`: PASS.

All eleven `test:*` scripts passed, **132 tests, zero failures**:

| Script | Tests |
| --- | ---: |
| test:product-code | 4 |
| test:catalogue-classification | 8 |
| test:cms | 19 |
| test:hero | 7 |
| test:hero-admin | 5 |
| test:hero-launch | 7 |
| test:cms-parity | 8 |
| test:public-cache | 4 |
| test:demo-seed | 28 |
| test:on-demand-routing | 9 |
| test:admin-dashboard | 33 |

Added meaningful logic coverage for whole-record ownership, nullable/unknown
siblings and arrays, dirty fingerprints, milliseconds preservation, badges and
rights restrictions, stable sorting/pagination, existing validator compatibility,
parent row serialization, hero/singleton separation, safe legal grammar,
operation locks, failed file-input rollback, partial/malformed reads, null setup
and field/date hydration. The hero admin test was adapted from the removed
inline implementation to the shared editor while retaining hook assertions and
testing the five-slot rule including disabled slides.

Public CSS was compared with a separate clean build of git archive `2a2d97b`:
both `Layout.D4C6YiHx.css` and `404.BaRt-w58.css` are byte-identical. No public,
backend, login or hero implementation file changed in this task.

## Local browser evidence and limits

An ignored localhost harness served built admin HTML with synthetic in-memory
GET/write/media responses. Authentication was omitted only from the harness's
response; no application authentication bypass was added. No production data,
credentials or tokens were used. These checks are development evidence, not
signed-in acceptance tests:

- Ten content pages at 1440×900 had preview content, zero initially open inline
  editors and no horizontal page overflow.
- Catalogue: dirty Cancel → Keep editing retained the draft; mock Save restored
  Edit focus and retained cover, language, publication and classification fields.
- About: editing Purpose retained Heritage, Team, tags and parent publication in
  the mock payload.
- Homepage: untouched 6.123 seconds retained exactly 6123 ms; scratch order
  Cancel/Discard sent no reorder. Mobile hero editor showed the saved headline.
- Catalogue and hero sheet rendering were checked at 375×667. A mobile section
  index overlap and a navigation resize-loop warning were found and corrected.

Subsequent Chrome extension reconnection failed with
`Unable to load browser request-header policy`, so broader browser checks were
not represented as passes. There is no WCAG compliance or production GO claim.

## Deviations and live handoff

The fresh read finishes **before** opening the overlay; the initiating action
shows busy feedback and retains focus. A failed read leaves the editor closed,
rather than opening a read-loading overlay. Field-specific validation errors link
to controls; an unmapped whole-record validation error conservatively reveals
the full setup in the same sheet with the draft retained.

No implementation feature is intentionally deferred. Dell's ADMIN-V2-3 must
verify all twelve published routes while signed in: real private media access,
upload/error/session handling, permitted CRUD, preservation of singleton siblings,
dirty and conflict guards, reorder/cap behaviour, dashboard reads, keyboard and
screen-reader announcements, touch/virtual keyboard, short viewport, 320px,
enlarged text/zoom and reduced motion. Follow that task's QA-TEST-only write
protocol and do not change real client content to demonstrate a test.

Yv owns the single release push after review. SoSo did not push or deploy.
