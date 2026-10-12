# Admin v2: researched UX principles and decisions

Z · 12 October 2026 · ADMIN-V2-1 (`7de8af85-48ac-4d41-8cda-058f2b3ee570`). Implementation contract: [admin_redesign_spec_v2.md](admin_redesign_spec_v2.md). Research retrieved 12 October 2026. This is a synthesis of primary design-system documentation, published usability research, and product documentation; it is not a claim that Longhorn has undergone user testing.

## Problem and evidence

The user's supplied live-v1 screenshot (`a14cb949_Screenshot_2026-10-12_at_09.10.29.png`, attachment in the Studio workspace) shows five text-only slide rows, four Enabled and one Disabled, followed by a permanently visible homepage form and a `6000` milliseconds input. These are screenshot observations, not independently measured production counts. Source inspection confirms that collection and singleton editors are mounted inline, About is an uninterrupted bilingual form, and the existing media API permits authenticated admins to read private covers. The v1 shell is reusable; the browsing and editing model needs to change.

The user's requirements govern: add/edit forms open in pop-up cards or slide-overs; content is represented by preview cards; catalogue covers are mandatory where an image exists; About and analogous pages become professional read-only summaries. General advice favoring inline editing does not override these requirements.

## Research record: findings, application and limits

Each row distinguishes source guidance from the Longhorn design decision. Values such as 560px dialogs and 960px slide-overs are our implementation choices, not measurements prescribed by the sources.

| Source | Documented guidance / product behavior (paraphrased) | Decision for Longhorn and limit |
| --- | --- | --- |
| [NN/g: Modal & Nonmodal Dialogs](https://www.nngroup.com/articles/modal-nonmodal-dialog/) | A modal interrupts and blocks the underlying task; choose it when focused attention is justified. | Editors open only on an explicit Add/Edit action; browsing stays unobstructed. No welcome, load-error or success pop-ups. |
| [NN/g: Cards definition](https://www.nngroup.com/articles/cards-component/) | Cards group related information; irregular layouts and excess card size can impede scanning/comparison. | Fixed anatomy and aligned metadata, no masonry. Covers/thumbnails identify records; full forms do not appear in cards. |
| [NN/g: Data tables](https://www.nngroup.com/articles/data-tables/) | Tables support scalable comparison; discoverable filters and predictable actions matter. | User-required cards are default. Retain consistent metadata and a compact card-list option, search/filter/sort. No claim that cards outperform tables for numeric comparison. |
| [Shopify Polaris: Modal](https://shopify.dev/docs/api/app-home/latest/web-components/overlays/modal) | Overlay forms can collect structured data with Save/Cancel; overflow scrolls; detail previews can preserve page context. | Small focused dialogs and clearly separated header/body/footer. Adopt pattern, not Shopify's SDK or merchant commerce features. |
| [Carbon v10: Modal usage](https://v10.carbondesignsystem.com/components/modal/usage/) | Modals suit short tasks; long content may warrant a larger surface or page. Header/footer remain available while body scrolls. | Brief forms get centered dialogs; bilingual/long forms get large slide-overs and full-screen mobile sheets. This explicitly resolves the user's overlay requirement without squeezing long forms into small alerts. Carbon v10 is historical guidance, not current component API. |
| [Carbon v10: Modal accessibility](https://v10.carbondesignsystem.com/components/modal/accessibility/) | Modal background is inert and the Tab sequence remains inside the dialog. | Native modal semantics, focus containment and tests for every close path. Do not equate a visual scrim with accessibility. |
| [Atlassian: Modal usage](https://atlassian.design/components/modal-dialog/usage) | Name dialogs, provide dismissal, restore focus, keep tasks concise and avoid nested dialogs. | One active editor; dirty-close confirmation replaces its body temporarily rather than stacking another modal. Long forms use a dedicated large sheet. |
| [GOV.UK: Summary list / summary cards](https://design-system.service.gov.uk/components/summary-list/) | Summary cards separate named sets of information and related actions; a shared card action avoids repetitive row links. | About shows Heritage, Identity and Team sections with saved copy and explicit Edit actions. Contact/settings show labeled values using semantic description lists. |
| [GOV.UK: Error summary](https://design-system.service.gov.uk/components/error-summary/) | Validation should have a focused summary with links to fields and matching inline error messages. | Editor error summary above fields, errors beside their inputs; keep the editor and entered values intact. Apply within dialog, not a new page. |
| [Material 3: Canonical layout examples](https://m3.material.io/foundations/layout/canonical-examples/overview) | Feed, list-detail and supporting-pane layouts adapt across compact, medium and expanded spaces. | Responsive card grid and separate editing surface. Use available content width, not only device name, to determine columns. |
| [Material 3: Color roles](https://m3.material.io/styles/color/the-color-system) | Subtle outline roles differ from boundaries used to identify interactive targets. | Retain v1 decorative border and stronger control-border as separate tokens. No wholesale recoloring or Material implementation dependency. |
| [Material Components: M3 cards](https://github.com/material-components/material-components-android/blob/master/docs/components/Card.md) | Card anatomy includes headline, supporting text, image and actions for one subject. | Catalogue card = one title + actual cover + metadata + Edit; subjects/services need no fabricated image. Android implementation details do not prescribe web CSS values. |
| [Android Developers: Dialog](https://developer.android.com/develop/ui/compose/components/dialog) | Complex forms need custom dialog content and explicit sizing rather than a simple alert layout. | Distinguish editor from destructive confirmation; implement in Astro/HTML, not Compose. |
| [Sanity: List previews](https://www.sanity.io/docs/studio/previews-list-views) | Preview title/subtitle/media are selected from document fields to represent records compactly. | Define exact preview fields per content type. No substitute cover artwork; preview is a summary of saved content, not invented marketing copy. |
| [Sanity: Field groups](https://www.sanity.io/docs/studio/field-groups) | Grouping fields reduces input overload without changing stored document structure. | Section navigation inside long slide-overs; one payload remains intact. English/French pairs stay adjacent, not a multi-step wizard. |
| [Contentful: Content preview](https://www.contentful.com/help/content-preview/) | Preview helps inspect content before public release; live preview requires configuration. | Saved-content cards plus in-editor working summaries. Label them as summaries; no unconfigured iframe, pretend production preview or new publishing workflow. |
| [Webflow: Collection items](https://help.webflow.com/hc/en-us/articles/33961289539347-Collection-items-overview) | Collections support search/filter and open a selected item to edit; Webflow has distinct draft and publishing behavior. | Borrow collection → item editing, never its autosave, scheduled/queued publish or independent live/draft version semantics. Longhorn saves currently published records directly. |
| [Stripe: FocusView](https://docs.stripe.com/stripe-apps/components/focusview) and [official Stripe UI reference](https://github.com/stripe/ai/blob/main/skills/stripe-apps/references/ui-extensions.md) | FocusView gives a dedicated task surface; official examples map create/edit to a focused overlay drawer. | Long edits use a wide modal slide-over over the current collection. No Stripe commerce metrics or components are imported. Detailed versioned FocusView pages failed retrieval; use only the accessible overview/official reference. |
| [Linear: Creating issues](https://linear.app/docs/creating-issues) | Issue creation opens a modal and Linear supports retaining drafts; existing issue editing can be inline. | Explicit creation trigger and protection from accidental loss. Do not copy inline editing or persistent draft features absent from Longhorn. |
| [W3C APG: Modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Inert background, contained keyboard focus, context-sensitive initial focus, Escape and logical focus restoration define modal behavior. | Long editors initially focus the title; short forms the first field; destructive prompts the safe action. Visible close control always included. |

Material 3's card/dialog guideline pages were opened but returned no readable body through the research tool. The findings above use retrievable Material 3 layout/color guidance and Google's official implementation documentation. We do not attribute unverified detailed guideline text to those inaccessible pages. No vendor demo is claimed to have been interacted with; these comparisons come from documentation.

## Applied principles

### P1. Recognize before editing

A record must identify itself with its actual media, human title and publication state. Image-first catalogue cards show the entire cover without cropping. Hero slides show the selected image and full title beneath it; news uses returned hero image IDs. Card bodies contain only scanning information; Edit opens a separate surface. Subjects use bilingual names and assigned-title counts. Image presence never implies approved public use. Source basis: NN/g Cards, Sanity previews, Material cards (research table).

### P2. Treat editing as a bounded task

Choose the smallest surface that still accommodates real bilingual content. One action, one editor, one save. Short modal for a subject or coordinate pair; large slide-over for catalogue, news, hero, legal and large singleton sections. Full-screen sheet on phones. Header/footer remain separate from body scroll. This is a design compromise: NN/g, Carbon and Atlassian warn about complex modals; the user requires overlays, so large task surfaces and field grouping mitigate that risk rather than denying it.

### P3. Summarize singletons professionally

Use actual saved text, meaningful section titles, restrained typography and labeled values instead of disabled controls or dozens of textareas. Read-only English/French view selection is allowed; it changes presentation only. Heritage can breathe as prose, Identity becomes four consistent summary cards, Team capacity becomes repeat-item cards. No invented team portraits, claims, health score or decorative stock art. Source basis: GOV.UK summary cards and Sanity grouping.

### P4. Preserve the data unit behind the visual section

About/Homepage/Why/Contact/Settings APIs accept whole records. Editing a section is a view into a complete record, not a partial PUT. Clone the clean baseline, change only owned fields, validate/serialize the complete existing payload, save once, replace baseline only on success. Repeat-row dialogs likewise save their parent record. A missing singleton requires a whole-page setup sheet because other required fields do not yet exist. This principle comes from the repository contracts; vendor systems cannot settle it.

### P5. Protect progress without modal stacks

Cancel, Close and Escape use the same dirty guard. Clean closes immediately; dirty presents Keep editing / Discard changes within the same overlay, preserving the working draft. Backdrop is not a discard affordance for editors. Saving/uploading uses an explicit pending state; duplicate requests are blocked. No autosave, browser-storage content drafts or optimistic save-success. Source basis: Atlassian/APG and Linear, constrained by Longhorn's existing behavior.

### P6. Distinguish save, publication and preview

Published reflects a stored boolean; catalogue eligibility also depends on classification and cover rights. Enabled slides are configured to participate, not proof of CDN rendering. Summaries show saved content and explicitly separate unsaved editor previews. Duration is displayed in seconds but submitted in milliseconds. Site settings is Configured rather than Published. No audit authors or version history are inferred. Source basis: Longhorn APIs; Contentful/Webflow illustrate why workflow semantics must not be copied blindly.

### P7. Consistency supplies professionalism

Retain Inter, neutrals, burgundy focus/active accent, 12px panel radius and 44px targets. Use a common card anatomy, fixed metadata sequence, explicit actions and consistent empty/failure treatment. Exact gaps, type scale, overlay dimensions and media ratios live in the v2 spec. No masonry, glow, decorative gradients or animated hover elevation. Source basis: Material roles/cards and NN/g's scan/comparison findings.

### P8. Make errors actionable in context

Loading, successfully empty, filtered-empty, missing image and failed image are different states. A failed read never offers a blank form that could overwrite existing data. Failed save keeps values. Error summary navigates directly to affected fields, including fields in another group. Retrying never replaces a focused button. Source basis: GOV.UK and APG; retain the v1 focus/error fixes.

### P9. Accessibility is the overlay contract

Keyboard, screen-reader naming, visible focus, inert background, scroll behavior and focus restoration must work together. Scale text, wrap labels, use 16px mobile inputs, prevent horizontal overflow, and retain explicit text for status and actions. Motion only signals opening/closing and respects reduced motion. A design-system citation is not proof of WCAG compliance. Source basis: APG/Carbon; verification criteria are in the v2 spec.

### P10. Finish through live evidence, with one coordinated release

Spec/source validation is possible without deployment; admin interaction acceptance must be on the published live server, as requested. SoSo batches implementation and build/tests, Yv coordinates a single necessary push, Dell verifies signed-in behavior. Screenshot evidence and real field lengths must inform wrapping and sheet-height acceptance. Protect real content, respect the five-slide cap and record unavailable evidence honestly. Do not use local authentication bypasses or repeated pushes to substitute for planning.

## Decision trace and evidence boundary

| User concern | Research principle | Concrete implementation | Acceptance evidence |
| --- | --- | --- | --- |
| Forms always visible | P2/P5 | Initial state has no open content editor; Add/Edit opens named overlay | All content pages live, Add/Edit/Cancel/Escape |
| Catalogue lacks covers | P1/P6 | Same-origin authenticated media on every cover-bearing title card | Actual private cover loads signed in; public restriction unchanged |
| Text-only hero rows/raw milliseconds | P1/P6 | Image cards, separate settings summary, seconds field adapter | Saved five-slide set; conversion boundaries; no extra saves |
| About looks unprofessional | P3/P4/P7 | Heritage prose, Identity grid, Team cards, section-specific edit sheets | Real EN/FR lengths at desktop/mobile; sibling fields preserved |
| Don't revisit this | P8/P9/P10 | Complete state/route coverage with explicit release QA | Dell's signed-in production evidence, not build alone |

Dell's signed-in v1 audit will be incorporated in the spec if available before commit. Until then, production content totals and max lengths beyond the supplied screenshot are unknown; component sizing is based on schema caps and stress cases. No credentials are included in these documents. This research deliverable performs no production write, push or deploy.
