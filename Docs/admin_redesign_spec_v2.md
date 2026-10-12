# Longhorn admin v2 — preview cards and focused editors

Z · 12 October 2026 · ADMIN-V2-1 (`7de8af85-48ac-4d41-8cda-058f2b3ee570`). Build handoff to SoSo (ADMIN-V2-2), production QA to Dell (ADMIN-V2-3).

## 1. Binding scope and precedence

This spec supersedes v1's inline-editor, table-first and always-visible-form instructions. Keep the v1 tokens, shell/navigation, dashboard data definitions and previously fixed accessibility behavior in [admin_redesign_spec.md](admin_redesign_spec.md), [admin_redesign_copy.md](admin_redesign_copy.md) and `Docs/admin_redesign_implementation_2026-10-11.md`. V2 applies to **all content editing**, including singleton fields and repeatable items. Pages render read-only saved-content summaries/cards; Add, Edit, publication changes and settings changes open an editor overlay. No inline textareas, editable controls or disabled forms masquerading as previews. Login/invitation/recovery/reset are standalone authentication workflows and retain their existing presentation and behavior.

Research basis and citation ledger: [admin_ux_principles.md](admin_ux_principles.md), principles P1–P10. Sizes below are Z's design decisions, not borrowed vendor requirements. Current reference is the user's live-v1 homepage screenshot in the Studio attachment `a14cb949_Screenshot_2026-10-12_at_09.10.29.png`. Five saved rows/four enabled/one disabled/6000ms are observations from that screenshot, not persistent fixture values.

Presentation and client-side behavior only. Keep existing endpoints, API payload keys, auth/Identity flows, validation, schema, cache handling and public-site rendering/media authorization. No autosave, new backend, bulk editing, bulk deletion, synthetic analytics, undo/history, scheduled release or independent draft version. Preserve source selector hooks when moving form DOM; explicitly adapt event bindings where inline form assumptions change. No production code in this design task, no push/deploy. SoSo batches implementation locally; Yv coordinates the single necessary release; browser acceptance is signed-in on the **published live server**, per user instruction.

## 2. Visual foundation and page anatomy

Use existing `src/styles/admin.css` scoped tokens: canvas `#FFFFFF`, sidebar `#F5F5F5`, subtle `#F7F7F8`, ink `#18181B`, muted `#52525B`, decorative border `#E4E4E7`, control-border `#71717A`, accent/focus `#5C1A2B`, accent-bg `#F7EDF0`, success `#166534`/`#F0FDF4`, warning `#854D0E`/`#FEFCE8`, danger `#B91C1C`/`#FEF2F2`, scrim `rgba(24,24,27,.40)`. Retain local Inter, SVG line icons, space scale 4/8/12/16/20/24/32/40/48/64px. Use rem equivalents at 16px root; never pin browser root font size.

Retain 240px desktop sidebar, 72px tablet rail/collapsed desktop, existing mobile navigation drawer and search. Main canvas max-width 1280px including padding: 32px desktop, 24px tablet, 16px mobile. Page heading 28/36/600 desktop and 24/32/600 mobile; description 14/22/400, max-width 680px. Panels/cards radius 12px, 1px decorative border, no shadow; overlay shadow only `0 8px 24px rgba(24,24,27,.12)`. New card heading 16/24/600, summary text 14/22/400, metadata 12/18/400. Form inputs 14/22 desktop, 16/24 mobile; actions 14/20/500, minimum 44px target. No typography/token change justified by research.

Page order: breadcrumb/header → h1 + subtitle + primary Add action for collections → optional read-only page publication/last-saved strip → search/filter/sort controls → result count → cards or named section summaries. Gap 24px between major sections, 16px between cards. Saved-content language selector consists of two 44px buttons, English / Français, aria-pressed; changes read-only previews only and does not write or hide editing fields. Select English initially; maintain choice in memory for current page. Display translated field or “French copy missing”, never silently replace French with English (except already supported legacy title fallback, labeled as such).

Singleton publication strip: actual Published/Draft/Not set up state, valid updated_at (browser timezone), “Change publication” button. Site settings uses Configured/Not set up and no publication button. Buttons open overlays; no publication switches in read-only canvas. “Open public page” is an external-tab link to current published language route; helper says it shows published content. Never imply it previews unsaved edits or verifies deployment.

## 3. Collection preview contract

### Grid, card list and toolbar

Cards are a semantic `<ul>`/`<li>` collection with an `<article>` per item; CSS grid, not ARIA interactive grid. No masonry. Base grid uses `repeat(auto-fit,minmax(min(100%,260px),1fr))`, gap 16px, maximum 4 columns; hero/news cap at 3 columns. Subject/process compact cards use 240px minimum, maximum 3 columns. A page narrower than the minimum always gets one column; no fixed viewport heights on cards. Collections with one/two items keep column width consistent using auto-fill or explicit column cap rather than stretching a lone catalogue cover across the canvas.

Grid default. “Cards” / “Compact cards” 44px view buttons, aria-pressed; compact variant uses an 88×116px catalogue image or 144×81px landscape image with content/actions beside it at inner width ≥560px, stacked below that. It still shows media; no text-only catalogue alternate. Legal has just two fixed cards and needs no view toggle. No selection checkboxes or bulk toolbar.

Toolbar is above the collection, never inside editor: labeled search 44px height, minimum 240px preferred width but `min-width:0` when narrow; existing filters plus Sort select, each min-height 44px, gaps 12px, wrap. At <640px stack search full-width, then a wrapping filter row; labels visible. Display “Showing X of Y” with active filters and Clear filters. Keep focus on query/control when results update; one polite count announcement after 250ms debounce. Filtering/sorting is client-side over already returned arrays, no added endpoint parameters. Stable key DOM updates prevent focus loss. Clear filters resets query, filters and page offset; view choice retained.

Catalogue/news paginate client-side at 24 items; Previous/Next 44px, “Page X of Y” below cards, preserve current filters/sort through editor open/close; reset to page 1 when query/filter/sort changes. If ≤24 omit pagination. No infinite scroll or record virtualization. Other collections render all (bounded repeat arrays/short lists). Updated sort falls back to title then stable ID when timestamps missing; never substitute creation time for edit time.

### Shared anatomy

1. Media or type icon/step number as appropriate; status is beneath media on white, never low-contrast image overlay.
2. Human title, bilingual secondary name when useful. Full title wraps (`overflow-wrap:anywhere`), no ellipsis; don't truncate the text needed to distinguish records.
3. Two-to-four metadata lines, same order in every card. Excerpt can clamp to 3 lines; full text is available through “View full summary” read-only expansion and the editor. Clamp isn't applied to labels, errors, title or buttons.
4. Footer with explicit Edit button and optional Delete/Remove or Move action. 44px targets, 8px gap, border-top, 12px padding. Accessible names contain item identity; no whole-card button enclosing other controls, no hover-only actions.

Card image shell subtle bg, center contain with 16px inner padding for book covers; landscape images have no padding and use cover for thumbnail. Image alt `<title> — cover preview` or `<title> — image preview`. All images specify dimensions/aspect ratio to reserve space; loading=lazy outside first visible row and decoding=async. Image fetch failure becomes “Image unavailable” with Retry image, not “No image”; missing ID becomes “No cover/image added” with neutral icon. A Retry does not write. Do not fabricate/generate/book-jacket placeholders or alter stored assets.

### Content-specific cards, query and sort

| Collection | Preview fields and image | Search / filters / sort |
| --- | --- | --- |
| Catalogue | `cover_image_id`, full `title_en` + `title_fr`, product_code, level, subject name resolved from subjects-admin, language editions, Published/Draft, classification/public eligibility. Cover shell height 240px (200px at <480px); actual image max-width 180px, max-height 224px, contain. Book-cover public permission is separate from admin preview. | Search titles EN/FR, product_code, slug; existing level/subject/publication filters; add classification filter using 3 existing enum values. Sort Last edited (default), Title A–Z, Title Z–A. |
| News | Returned `hero_image_id` (16:9), full headline, category, excerpt selected language, stated publish_date, Published/Draft. Missing image uses a 16:9 neutral labeled placeholder. | Search headlines EN/FR, slug; existing category/publication; Last edited, Headline A–Z, Stated publication date descending (missing last). |
| Hero slides | `image_id` 16:9, heading/accent text below image, subheadline excerpt, primary/secondary CTA labels + destination text, actual order number, Enabled/Disabled. Render all saved rows including disabled. | Search headlines EN/FR; All/Enabled/Disabled filter. Sort Carousel order only; stored order is semantic. Search/filter never changes order. |
| Subjects | Type icon (no invented image), `name_en` and `name_fr`, actual `title_count`, “Used by N titles” / “No titles assigned”. No publication badge. | Search names EN/FR; All/With titles/Without titles; Name A–Z default, Assigned titles descending. |
| Services | Allowed icon key or neutral layers icon, bilingual name, `short_*`, category, description excerpt, actual sort_order and Published/Draft. No image field exists in this admin response contract. | Search name/slug EN/FR; category/publication; Display order default, Name A–Z. |
| Process steps | Actual step_number, title and description in selected language, Published/Draft. | Search title EN/FR, publication; Process order only. |
| Why-us commitments | Stored icon, title/lead/accent, eyebrow, description excerpt and up to 3 stored tag chips plus “+N more”; inherits page publication. | Search titles/tags EN/FR; Display order default, Title A–Z for browsing only. No independent publication filter/state. |
| Legal pages | Fixed Privacy policy / Terms of use cards, selected-language body excerpt, stated content_updated_at and separate saved timestamp, Published/Draft/Not set up; no image field, file-text icon. | Search title/body EN/FR, All/Published/Draft/Not set up; Page name A–Z default or Last saved. No Add/delete document because only two supported keys exist. |
| Team capacity / trust stats / contact project types / social links | Parent-section item cards, actual icon/title/tag fields or label/value pairs; parent save/status rules in §5. No synthetic per-item updated_at/Published state. | Search applicable title/labels; display order fixed, optional name A–Z for browsing. No publication filters or API-level CRUD claims. |

### Media/data sources

Use the same existing 11 admin GET endpoints as v1, response shapes unchanged: catalogue/news/subjects/hero/legal arrays; homepage `{content,catalogue}`; services `{services,process}`; About/Why/Contact settings/Site settings nullable singletons. Correct Contact path is `/api/contact-settings-admin`. A thumbnail uses direct same-origin `/api/media/${storedKey}` for upload IDs. No anonymous public catalogue API, Netlify image optimization proxy or external CDN for private previews: direct media reads carry the existing admin cookie and server enforces access. Do not embed tokens in URLs, copy private images to public/, or change cache/permission logic. Keep returned `cover_image_id`, `hero_image_id`, `image_id`, `og_image_id` intact when not edited. Only show curated static fallback imagery where the current front-end already explicitly uses it; label it “Fallback image”.

Current news editor has no named hero_image_id input even though API returns/accepts it. SoSo must preserve the returned ID in the edit payload (a hidden input or explicit mapped value), and may expose the existing media picker in the overlay; otherwise editing a text field can clear the image. This is a frontend preservation requirement, not an API/validator change. No permission to replace any production news image in this task.

## 4. Overlay/editor system

### Dimensions and structure

Use one shared `AdminEditorDialog` based on native `dialog.showModal()`. At most one editing dialog active. Modes:

| Mode | Size ≥768px | When used |
| --- | --- | --- |
| Short centered card | `width:min(560px,calc(100vw - 48px))`; max-height `calc(100dvh - 48px)`; centered; 12px radius | Subject, coordinate pair, trust item, social link, contact option, publication dialog |
| Medium centered card | `width:min(760px,calc(100vw - 48px))`; same max-height/radius | Brief EN/FR copy or metadata-only section |
| Large modal slide-over | Right anchored, width `min(960px,calc(100vw - 48px))`, height/max-height `100dvh`, margin 0, radius `12px 0 0 12px` | Catalogue/news/hero/legal, About Heritage/Identity, Why commitments, singleton setup; any section with long text/repeat groups |
| Mobile editing sheet | At <768px all editor modes `width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;border-radius:0` | Same task, full-screen; no separate route |

Layout: flex column, header and footer flex:none; body `flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain`; dialog itself does not create a second body scrollbar. Header padding 24px desktop / 16px mobile, border-bottom 1px; title 20/28/600 max 2 lines before growing, concise “Edit catalogue title” and record name metadata beneath. 44px Close icon right. Body padding 24px/16px; group gap 24px, field gap 16px. Footer min-height 76px but allowed to grow, 16px padding, 1px top border; save consequences/status text left, Cancel + primary Save right, gaps 12px. Below 400px actions form two equal columns (min-width:0), labels wrap. Safe-area top/bottom padding added. On viewport height <480px header/footer use 12px vertical padding, no giant margins; body still scrolls. With the virtual keyboard, sheet follows available visual viewport and focused input scrolls inside body; footer must not cover fields. If viewport APIs unavailable, allow sheet scrolling with focused-field clearance rather than hiding controls.

Large editors use a compact section index row (44px anchor buttons) under header: scroll-wrap on narrow space, not inaccessible clipped tabs. These are same-document anchors into a single form; fields stay mounted, enabled and included in validation. Do not use multi-step Next/Back workflow or tabs that conceal required errors. EN/FR pairs side-by-side only if body inner width ≥640px; otherwise stack English then French. Body textareas min-height 160px; news/legal long bodies 320px desktop / 240px mobile, vertically resizable. Read-only preview expansion never launches a second editor.

No modal opens on page load, route restore, read failure or automatic refresh. Existing fragment links `#editor` become a visible trigger location, not auto-open. Contextual page links may focus/highlight the relevant preview section but still require explicit Edit. Close navigation drawer/search before starting an editor; search shortcut disabled while editor or confirmation is active.

### Lifecycle/state machine

```text
Closed → Add/Edit → Opening/read → Editing clean ↔ Editing dirty
Editing → Save → Saving → success: Saved → Closed + updated preview
                       → failure: Editing dirty + persistent errors
Editing clean → Cancel/Close/Escape → Closed
Editing dirty → Cancel/Close/Escape → Discard decision
Discard decision → Keep editing/Escape → original draft + original focus
                 → Discard changes → Closed + baseline restored
```

- On open, capture trigger element, stable record key, page scroll/filter/sort/pagination state. Use clean cached record to render read-only loading preview; read latest record/list as needed before enabling Edit/Save. Never mount a blank editable form on read failure. Add initializes the existing defaults (unpublished/disabled when existing defaults do so); no record is created until Save.
- Initial focus: short form's first field; large sheet's title `tabindex=-1` so top context stays visible. Native modal blocks background; Tab/Shift+Tab stay inside. Dialog accessible name from visible title; short description only, never aria-describedby the entire long form. Close/Cancel/Escape follow identical logic.
- Editor backdrop clicks do **nothing** (no accidental loss from image/file dragging). Close/Cancel remain visible. Clean Escape closes. Dirty Escape replaces the editor body/footer with a concise discard decision **in the same dialog**; keep form DOM and working values in memory, hide/inert it only during decision. Decision title “Discard unsaved changes?”; Keep editing initially focused; Discard changes danger button. Escape there returns to editing. Restore prior input and body scroll after Keep editing. No stacked modal or duplicate focus trap.
- Saving/uploading keeps current focus and exposes `aria-disabled=true` for blocked actions with duplicate-activation guards, plus busy text. A close attempt during save/upload reports “Wait for this operation to finish” once; it does not discard a request in flight or launch a second prompt. Do not disable the focused trigger in a way that drops focus. Clear pending locks on every settled result. Beforeunload retains existing dirty protection; no fabricated guarantee that closing the browser cancels a committed request.
- Dirty baseline uses complete record + repeat arrays + media selection; language/filter/view changes are not dirty. Upload pending/successful new ID is dirty. Cancel discards content changes; uploaded blobs may already exist, so don't claim cancellation deletes uploaded media. Revoke temporary object URLs on close/replacement; no storage of content/credentials in localStorage.
- Success: use returned canonical record (or successful follow-up GET), replace clean baseline, update only affected card/summary, close, restore focus to item's Edit button. New record: focus new card heading `tabindex=-1`; if current filters exclude it, preserve filters and focus result summary with “Saved; this item is hidden by current filters” + Clear filters. Deleted item focus next/previous surviving action or Add button. Reorder restores focused move control by stable ID. Avoid rebuilding entire lists during focus restoration.
- Failure: editor stays open, working fields preserved, error summary at body top, summary receives focus and contains links to specific inputs; inline errors match. For unknown server field association show safe server text and no invented mapping. Links reveal/open target group if needed and scroll/focus the input. No success toast on failed read/write. Network/401/403 states retain draft in current session and offer existing sign-in/access instructions; no auth-flow changes.

Deletion is invoked from read-only card actions, never embedded in an edit form footer. Existing `confirmAction()` remains the deletion/dirty-navigation boolean mechanism; extend its context handling if needed, preserving contract. Use one page-level confirm dialog when no editor is open, width 440px max, initial Cancel, named record and actual consequence, 44px controls. Remove a parent-array item follows parent payload save rules, not DELETE endpoint. Its confirmation explicitly says removal is saved to the parent page and can affect published content; never label it a merely unsaved detachment when saving immediately. Unknown/missing IDs do not permit destructive actions.

### Form grouping and preview within editor

Catalogue: Content → Classification/evidence → Cover → Publication. News: Content → Media → Metadata → Publication. Hero: Image → Headline/copy → Primary CTA → Secondary CTA → Enabled. Legal: Body → Stated date → Publication. Large singleton setup: named sections matching canvas cards. Put metadata/descriptions into labeled fieldsets; existing hidden identifiers retain their names. Icon-key fields explain accepted existing keys; unknown key renders neutral icon, no new schema options.

Media panel contains actual cover/image and existing choose/replace/clear/upload status; JPEG/PNG/WebP, max 8MB, existing media API. No image-crop UI, media library, image-generation or unrequested rights changes. Optional working content summary inside editor is collapsed by default with “Show working preview” and explicitly “Unsaved summary”; never a second modal or autoplaying iframe. Do not execute raw HTML/Markdown supplied by content in previews. Use textContent or the existing safe renderer; preserve intentional line breaks.

Save controls use current publication checkbox/flag inside the overlay. Footer text reflects working state: “Saves changes to published content” vs “Saves a draft”; site settings “Updates site-wide settings”; slides “Enabled slide changes may affect the published homepage”. Save remains a single existing request; no added Publish endpoint, no separate live/draft snapshot. Ordinary Save does not spawn confirmation; destructive discard/delete does. Do not translate Published into guaranteed anonymous visibility.

## 5. Singletons and parent-owned repeatable items

### Whole-record preservation algorithm (required)

The page preview is generated from a clean, successfully fetched record. Section edit owns a declared set of fields (§6). Clone full record into an in-memory working record; hydrate the existing complete form/data containers from it. Reveal selected section in the overlay but do not drop unedited siblings from serialization. On Save, merge section changes into the full clean record, preserve unedited arrays, flags/media IDs and existing optional values, then run existing serialization/validation and PUT the **complete existing payload**. Never submit `FormData` from only the visible section to a whole-record endpoint.

Hidden unedited sibling controls must not cause “invalid control not focusable”: validate selected fields in the section normally, then validate full payload against existing rules. If other required content is missing/invalid, expand the same sheet to “Complete page setup” showing all affected sections and focus error summary; never silently bypass validation. Array-item Edit/Add clones its parent array and uses same whole-record save; array item gets no invented UUID, independent publish switch, saved timestamp, API endpoint or autosave. Saved order and unknown supported payload fields must not be discarded by rendering only visible values.

For a null record, show Not set up with “Set up page”; open one full setup sheet for all required page fields. Do not allow one section to create an incomplete singleton. GET failure is unavailable, never null/setup. For legal, setup is per fixed page key, not whole legal collection.

Before saving a singleton section, re-read its existing endpoint and compare returned updated_at/content baseline: if server changed since opening, keep working draft and show “Content changed since you opened this editor” with Review latest (read-only) and Reload and discard (guarded). Do not silently overwrite external changes. Once reloaded, editing restarts against new baseline. This frontend check is a mitigation, not atomic concurrency protection: existing APIs have no conditional-write/version token. Do not promise perfect concurrent edit isolation or change API to provide it in ADMIN-V2-2.

Page publication belongs to parent: Change publication opens short dialog containing Published checkbox and consequence text, merges whole record. Repeat-item cards inherit page state and never imply an independent publish operation. Section Save preserves the existing parent published value unless specifically changed in publication/setup editor. Missing record/default state uses existing validator defaults.

### Professional section presentation

**About:** Heritage full-width editorial summary: panel header “Heritage” + Edit heritage, selected-language prose max-width 72ch, first 6 lines on canvas + Show full text. Below, Identity cards Purpose/Vision/Mission/Values in 2 columns when inner width ≥640px, one below; each max 6-line excerpt + explicit Edit and full-text expansion. Team capacity section has count + Add block, compact icon/title/description/tag cards, no stock portraits. Publication/updated timestamp at page-level. Canvas contains real copy, not field labels repeated above disabled textareas. Each Identity Edit owns that bilingual pair; same large overlay full payload safeguards apply.

**Homepage:** Ordered hero card grid first; saved slide count/cap helper visible, Add slide and “Manage order” triggers. Carousel settings summary beneath: Autoplay On/Off, Duration “6 seconds” from returned value, Edit settings. Remaining canvas cards: Legacy fallback (collapsed read-only details initially), Who we are (image+prose), Trust statements (actual values only if nonblank), One partner (prose), Featured titles (up to 4 miniature cover cards using catalogue-admin for media/classification). Empty featured selection shows “No featured titles selected”. Legacy fallback is always editable via a sheet, clearly states used when no slides are saved; do not remove required fields from parent payload.

**Contact:** Intro prose, Location description list with stored coordinates or “Coordinates not set”; no geocoder or guessed pin; Project types label cards; card links to Site settings for actual office address/email/phones. **Site settings:** Identity preview with company name/taglines; Contact description list; Footer/newsletter summary; Social link cards; SEO summary with OG thumbnail 1.91:1. No fabricated storefront or newsletter inbox. **Why:** Local presence prose panel followed by commitment cards; page publication state applies to both. **Legal:** two document cards with excerpt/heading summaries, stated date distinct from database saved date, each opens its own long editor.

Read-only full-text expansion uses native details/summary or explicit Expand/Collapse button inside its card; never an inline editing control. All content remains available to assistive technology when expanded. Default excerpt length is a visual line cap, not data truncation. Empty language values have explicit messages. EN/FR badges indicate nonblank required field coverage only, not translation quality or “guaranteed parity”. If Add/Edit a repeat item is requested while its parent setup sheet is already open, switch to that item's fields within the same sheet, retaining the full working parent record; return to the parent view without a second dialog. Such setup-item changes remain unsaved until the parent Save, with visible “Unsaved changes”; outside setup, the item editor's Save persists the complete parent payload once.

## 6. Per-page build map — all 12

| Page | Saved-content canvas / editor trigger | Exact ownership / existing endpoint |
| --- | --- | --- |
| `index.astro` `/admin/` | Retain truthful dashboard; quick actions route to collection/section previews, do not auto-open blank forms | v1 dashboard's 11 read adapters and state/focus fixes remain; no write controls |
| `homepage.astro` `/admin/homepage/` | Hero cards, settings summary, 5 other named section cards; Add/Edit slide large sheet; Edit section mode per §5 | Hero independently `/api/homepage-hero-slides-admin`; parent `/api/homepage-admin`. Settings owns hero_autoplay_enabled/hero_autoplay_interval; Fallback owns hero_headline_*, hero_headline_accent_*, hero_eyebrow_*, hero_subheadline_*, hero_cta_label_*, hero_image_id. Who owns who_we_are_copy_* and who_we_are_image_id; Trust owns trust_stats; Partner owns one_partner_copy_*; Featured owns featured_catalogue_ids; Publication owns published. All parent section saves retain every other field. |
| `catalogue.astro` `/admin/catalogue/` | Cover card grid + search/filters/sort; Add title/Edit title large sheet | `/api/catalogue-admin`, `/api/subjects-admin`, `/api/media`; preserve id/product_code, title_*, slug, level, subject_id, languages, cover_image_id, description_*, curriculum_alignment_*, featured, published, classification, booklist_evidence_ref, booklist_verified_by, booklist_verified_at, cover_rights_approved. Existing product-code conflict and classification/rights checks stay. |
| `news.astro` `/admin/news/` | Image cards; Add article/Edit article large sheet | `/api/news-admin`, `/api/media`; id, headline_*, slug, category, publish_date, excerpt_*, body_*, published and returned hero_image_id preserved. Media picker may bind the existing image field (§3). |
| `subjects.astro` `/admin/subjects/` | Compact bilingual subject cards with title_count; Add/Edit short modal | `/api/subjects-admin`; id, name_en, name_fr. Preserve referenced-subject delete conflict, no cascade; no published/updated_at invented. |
| `services.astro` `/admin/services/` | Services and Process as separate card collections with separate toolbars, Add actions and Manage order | `/api/services-admin`, correct kind service/process. Service large sheet owns id, name_*, slug, short_*, category, icon, description_*, sort_order, published; process medium sheet owns id, step_number, title_*, description_*, published. Existing ordering endpoints retained. |
| `about.astro` `/admin/about/` | Heritage prose, 4 Identity cards, Team capacity cards (§5); Edit each pair, Add/Edit block large sheets | `/api/about-admin`; each prose edit owns its *_en/*_fr pair. Team block owns selected row in team_capacity_blocks, including title/title_en/title_fr, icon, description_en/fr, tags_en/fr. Full-record save, preserve published and other blocks. Max 12 blocks. |
| `why-choose-us.astro` `/admin/why-choose-us/` | Local presence preview + Quality commitments card collection; Edit presence large sheet, Add/Edit commitment large sheet | `/api/why-choose-us-admin`; local_presence_copy_*; commitment in quality_commitment_items owns icon, title_*, description_*, eyebrow_*, title_lead_*, title_accent_*, tags_*. Full parent payload/published preserved; max 12 commitments. |
| `contact.astro` `/admin/contact/` | Intro summary, coordinates summary, project-type cards | `/api/contact-settings-admin`; Intro owns hero_copy_* (medium sheet); Location owns map_lat/map_lng (short); project item owns row label_en/fr (short). Full payload and published preserved; max 30 options; null/range coordinate behavior retained. |
| `legal-pages.astro` `/admin/legal-pages/` | Fixed document cards, Edit/Set up legal page large sheet; read-only full excerpt | `/api/legal-pages-admin`; per form page=privacy_policy/terms_of_use, body_en/fr, content_updated_at, published. Preserve existing two data-page forms/guards. No new key/Add/Delete; no automatic stated-date replacement. |
| `site-settings.astro` `/admin/site-settings/` | Identity, Contact details, Footer/newsletter, Social cards, SEO/OG preview | `/api/site-settings-admin`, `/api/media`. Identity owns company_name_*, tagline_*; Contact owns address/email/phone_1/phone_2; Footer owns footer_tagline_*, newsletter_copy_*, parent_company_url; Social owns social_links row platform/url (max 10); SEO owns seo_default_title, seo_default_description, og_image_id. Full payload merged; no published flag. Long groups large sheet, Social short. |
| `login.astro` `/admin/login/` | Existing centered auth card; no content overlay requirement | Retain all Identity/invite/recovery/reset states and accessibility fixes; no new signup/autofill/auth changes |

Every existing field, name, limit, nullable conversion and data hook remains accounted for even if its summary is not displayed. Source summary tables are not permission to strip unsupported-looking data. A hidden form must be inside a closed dialog, never inline in page reading/tab order; register dirty checks only for an active working draft (closed-clean forms never block navigation).

## 7. Homepage order and time controls

“Manage order” opens a medium dialog, image thumbnail 80×45px for hero (step number/type icon for process/services), order number, full title and 44px Move up/Move down controls. This represents the entire saved collection unfiltered, including disabled/draft rows; no sorting subset. **Build target is a local scratch order + Save order once**, using the existing PUT action=reorder contract for hero/services/process. Adapt current immediate-move handlers so the dialog move buttons only change scratch state; Cancel makes no write. Save sends every saved ID once with correct kind where applicable. Boundary controls use aria-disabled/no-op to retain keyboard focus; name includes record title. Cards update order only after saved response. Failed reorder retains scratch list and error; the original persisted baseline is unchanged. No drag-only affordance; drag optional only if keyboard path already works. Parent-owned repeat arrays retain their existing stored sequence and serialize that sequence in the parent save; no new reorder API is invented for them.

Hero cap: five saved slides **including disabled**. At cap Add slide remains focusable aria-disabled=true with click no-op and helper ID; visible “5 of 5 saved. Delete a slide to add another.” No automatic deletion/disable. Do not allow saving zero enabled slides when homepage is published if existing validator rejects it. No presumed spare slot in QA.

Settings dialog label “Time per slide (seconds)”. Display numeric seconds with min 3, max 30, step 0.5; recommended 6. Adapter renders milliseconds/1000; on Save require finite value in range and existing UI step compliance, then integer milliseconds = round(seconds×1000). Existing stored integer milliseconds may not be a multiple of 500: show exact saved value (up to 3 decimal places), preserve unchanged value without forcing rounding to step; explain existing custom interval if needed. Changed values follow current 500ms UI increments. Preserve form payload name hero_autoplay_interval and exact current value when untouched. Raw milliseconds are absent from browse canvas. Autoplay checkbox remains inside editor; no automatic public carousel preview in admin.

## 8. Empty, loading, failure and safety states

| State | Required result |
| --- | --- |
| Loading page | Static skeletons for 3 cards desktop / 1 mobile, media ratio reserved; one loading status; aria-busy. No blank editable form or Create enabled against unknown singleton. |
| Successful empty collection | Named empty panel, short helper, Add first item trigger opens overlay. Legal missing fixed key = Set up. Null singleton = full setup sheet. |
| Search/filter empty | “No matching items”, result count 0 of Y, Clear filters; never imply no records exist or clear all data. |
| Read failed/malformed | Persistent safe error + Retry. Preserve last successful cards explicitly “Last loaded”; disable editing stale unknown data until valid read. Failure is not zero or Not set up. |
| Image missing | Fixed-size neutral icon + No cover/image added; no invented cover. |
| Image failed | Image unavailable + Retry; valid stored ID retained. Render other card content/actions. Private cover 404 doesn't prove absent image; do not erase ID. |
| Save failed | Overlay open and draft intact; summary+inline errors; unblock retry and Close; no false success/card update. |
| Save succeeded/readback failed | State “Saved; latest preview could not be loaded”, preserve successful returned record if available, offer Retry read; never resubmit save automatically. |
| Upload in progress/failed | Exact current upload status inside overlay; block save until upload settled, preserve original media if failed; no orphan-cleanup claim. |
| Parent-array remove | Confirm named item then send full validated parent payload; array siblings and parent flag untouched; success only after request. |
| External edit detected | Keep draft; Review latest / Reload and discard guard; no silent last-write overwrite from stale baseline. |

Current endpoint data does not establish translation accuracy, public-CDN freshness, actor attribution or field-level audit history. No “healthy”, “approved” or “complete” badge without a defined test. Preview describes saved/working CMS fields, not exact live typography/crop. Public catalogue text/cover rules stay unchanged even when private images show to admins. Thumbnail reads do not consume deployment credits; do not push for asset previews or documentation.

## 9. Accessibility, responsive behavior and motion

Target WCAG 2.1 AA; no compliance claim until live evidence. Retain v1 §7 and ADMIN-FIX focus/label/alert fixes. Additional v2 criteria:

- Dialog title is visible and aria-labelledby; native modal/inert behavior verified. Logical focus containment, Close/Cancel/Escape, restore stable trigger, safe fallback after deletion. Short title-only aria-describedby optional; no entire long-form announcement. W3C [modal pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) governs.
- No background focus or scroll while editing. One editor and one decision surface at a time. Card list is semantic document content; no aria-grid keyboard model imposed. Edit/Delete buttons retain visible words in accessible names (WCAG 2.5.3). Image alt communicates actual preview; redundant decorative icons hidden.
- 44×44px minimum targets; status includes text, not color alone. Contrast ≥4.5:1 normal text, ≥3:1 large text/control boundary/focus. Subtle card border is decorative only. Focus 3px accent + 2px white gap; never remove it from upload labels or read-only expansion controls.
- Required/optional labels, lang=en/fr, helpful constraints, safe associated errors. Error summary links to fields and receives focus on failed validation, matching [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/). Announce save/errors once; duplicate toast and inline live regions must not both announce. Existing error sinks remain textContent.
- Wrap real full titles, long IDs/emails, French CTA labels; no fixed-height text containers clipping content. At 320 CSS px, 200% text resize and 400% zoom, one column and full-screen sheet; no horizontal page/dialog overflow. Handle virtual keyboard/landscape/short-height focus clearance. Header/footer may grow as text wraps; body flex scroll keeps actions reachable.
- Preserve caret/field values and focus when uploading/validating/saving. Do not rebuild editor DOM on every keystroke or toggle language preview. Reset dirty baseline only after success, discard or successful load.
- Animation: centered editor opacity 120ms ease-out; slide-over opacity+translateX(16px) 180ms cubic-bezier(.2,0,0,1); exit 120ms; no card lift/count animation. Reduced-motion sets 0ms and scrolling auto. No autoplaying media, shimmer or timed modal dismissal.

## 10. Build/release acceptance matrix

SoSo inventories hooks before migration, introduces shared overlay/controller and preview-card renderer, migrates Catalogue/Homepage first, then About/Why/News, then remaining pages. Style dynamically generated row/card/dialog content consistently. Keep public code and auth/validation/functions untouched; do not ship a second design framework.

Compile/build and all current `test:*` scripts remain engineering checks required by ADMIN-V2-2; tests must meaningfully exercise dialog state/whole-record merge/seconds conversion/media preservation, not merely mirror CSS. No local browser evidence is accepted as signed-in admin QA. User requires browser tests on published live server. Yv batches one push once implementation self-review/build/tests pass; Dell then records production outcomes, with defects batched for a necessary follow-up rather than repeated speculative deploys.

| Area | Required live test and evidence |
| --- | --- |
| All 12 routes | Initial content pages have preview cards/summaries and zero open inline editors; auth page intentionally standalone. 1440×900, 1024×768, 768×1024, 375×812 and 320×568 screenshots, with actual titles/text lengths. |
| Catalogue | All returned cover IDs render signed in including private unverified covers; no wrong-cover/title pair; missing/failed states; create/edit/cancel, metadata/media retained. Public cover eligibility unchanged. |
| News/hero | Real images with no incorrect fallback; full titles; modal operation; headline/image state preserved after text edit. Hero cap stays 5; published last-enabled rule preserved. |
| About/Why/Contact/Settings | Edit one section and ensure all unedited sibling fields/arrays/publication flags/media survive; cancel sends no content write; null setup and missing-language errors accessible. No fake per-block publish/time state. |
| Subject/legal/services/process | Subject referenced delete conflict; legal stated date independent of saved date; service/process complete-order requests; no invented legal key/Add/Delete. |
| Overlay lifecycle | Add → cancel clean; Edit → dirty → close/Escape → Keep editing; Discard restores saved baseline; pending/save-error/upload-error/session-error behavior; focus restoration after saved/filtered-out/deleted/reordered record. |
| Search/filter/sort/page | EN/FR/product-code matching, filter count, no-match vs empty, stable sort, 24-item pagination, state retained on editor return. Ordered-content filtered view never writes order subset. |
| Duration | 3s→3000ms, 6s→6000ms, 30s→30000ms, 0.5s increments; out-of-range invalid; untouched custom integer-ms value preserved exactly. |
| Accessibility | Keyboard/SR names/focus trap, discard stage, visible focus, status/error announcement once, 200% text and 400% zoom, reduced motion, touch keyboard/short viewport, no clipping/overflow. |
| Runtime | Dashboard/read failures honest; no console exceptions or failed media falsely shown as missing; auth remains protected and no public source/style regressions. |

Production protocol is ADMIN-V2-3's existing task instruction: audit/read-only first; never alter/disable/delete real client records. Authorized disposable collection QA records only are prefixed QA-TEST, unpublished/disabled, cleaned up in the same session and logged. Opening existing editors then Cancel or saving truly unchanged data follows Yv/Dell's protocol. Singleton content has no parallel test record: preservation write checks need no-change saves or a separately authorized controlled test; do not overwrite live copy to prove a merge test. At five hero slides, create/reorder validation cannot justify deleting/disabling an existing slide; record cap verification and blocked write scenario honestly. Never commit credentials, tokens or authenticated content dumps; screenshots stay under ignored tmp per QA brief.

## 11. Evidence status for this design handoff

Full ADMIN-V2-1 brief and user's screenshot inspected; current page/form/media/validation contracts reviewed. External sources read/limitations recorded in principles document. This is a specification, so live v2 interaction tests are pending implementation/release, not claimed passes. Dell's `Docs/admin_v1_live_audit_2026-10-12.md` is checked before final commit; if not yet available, live counts and max field lengths remain unknown beyond the screenshot. Stress acceptance must include schema limits: hero headline 300/subheadline 1000/CTA 100/destination 2000; About heritage 8000 and each Identity pair 3000; Why presence 8000/commitment description 2000; arrays 12 team/12 commitment/8 trust/4 featured/30 project/10 social. These are maximum allowed characters/items, not measured production content lengths.

No production code, data, auth, API, push or deployment is changed by this task. Commit only the two design documents on main; board task moves to Review for Yv/SoSo.

## 12. Live-audit amendments

Added after Dell's signed-in, read-only [live audit](admin_v1_live_audit_2026-10-12.md), commit `95b5d9a`. **This section overrides conflicting instructions in §§3–11**, especially destructive-action placement and News upload optionality. The audit covered 11 protected pages at 1440×900 and 375×667, with no application writes, runtime errors or failed requests. It does not prove save/upload/delete behavior or screen-reader accessibility. §11's pending-audit note describes the original handoff; this amendment incorporates the now-available evidence.

### 12.1 Five required v1 fixes

| Finding | Build requirement / live acceptance |
| --- | --- |
| Unstyled script-created dashboard rows (B1), e.g. “Saved5 / 5” | Put dynamic-row styles in shared admin CSS, scoped by `.admin-app`, rather than Astro page-scoped selectors. Summary rows: flex, space-between, gap 16px, padding 12px 0, min-height 44px; section rows: labeled grid/cards; recent-edit links: flex with 12px gap and stacked title/metadata. Separate caveat text below rows. Inspect actual script-created nodes after all 11 reads: styles apply, labels/values do not concatenate, focus/alert stability remains. |
| Contact/Legal hidden without scroll cue (B2) | Keep navigation's independent overflow scroll and account footer. Reserve a 24px cue row outside nav scroll: “More below” when scrollHeight exceeds clientHeight and bottom remains; “More above” at the opposite edge. Update on scroll/resize, hide when unnecessary; no repetitive live announcements. Focused nav links scroll into view. At 1440×900 and short heights both destinations are discoverable/reachable with no footer overlap. |
| Search takes two Escape presses (B3) | Capture Escape on the open search dialog before the native search-input clear action; preventDefault, stop propagation and close once, restoring trigger focus. Verify one press with empty and nonempty queries. Editor dirty-Escape behavior stays as §4. |
| “1 drafts” (B4) | Shared count formatter: `count === 1 ? singular : plural`. Check 0 drafts / 1 draft / 2 drafts, and slides/articles/titles/subjects consistently; don't concatenate untranslated suffixes to arbitrary labels. |
| Misaligned Public email field (B6) | Use the shared field wrapper with 6px label gap, 44px input, zero field-specific top margin, grid align-items:start and helpers below controls. Adjacent single-line fields align at default size; longer labels wrap and grow without clipping. Check Site settings at 1440/375 and enlarged text. |

Recent edits (B5) legitimately contains six hero/homepage records after the swap: keep chronological truth and the “Latest saved records” caption; do not fabricate diversity. Existing section cards provide access to other content.

### 12.2 Homepage: distinguish carousel and fallback

Rename §5/§6's Legacy fallback canvas card **Fallback hero**. Default collapsed read-only summary: “Used when no carousel slides are saved”, stored image presence and headline; Edit fallback opens the large sheet. Show “Not currently used” whenever saved slide count >0; if slides exist but none is enabled, show an attention state, never imply fallback activates. Keep every legacy field, required rule and full-parent payload unchanged; no deletion/migration or automatic blanking of unused data.

Audit snapshot: 5 saved / 4 enabled / 1 disabled, 4 slide images. Cards show persistent Enabled/Disabled text, order number and thumbnail; duplicate “Expanding Minds” titles remain distinguishable by order/state/CTA destination. Disabled card retains readable text and image without low-opacity dimming. Header shows all three counts and cap explanation; Add remains focusable aria-disabled at 5, with no write. The disabled anchor occupies a slot; don't remove it to create room. Autoplay summary is 6 seconds; seconds adapter remains §7.

### 12.3 Catalogue: one consistent status model

Use one four-axis badge group in this order, wrapping with 8px gaps, plus a separate homepage-selection line. No standalone “Publicly eligible” badge that can imply the cover is cleared.

| Axis | Exact derivation / label |
| --- | --- |
| Publication/text | published=false → **Draft**; published=true and classification in national_book_list_verified/other_developed → **Published · Text eligible**; published=true otherwise → **Published · Listing withheld**. Eligibility is the existing public predicate, not a live CDN check. |
| Catalogue feature | featured=true → **Catalogue featured**; otherwise **Not featured**. This flag does not mean selected on Homepage. |
| Classification | Existing enum → **National Book List · verified**, **Other developed**, **Unclassified**; never infer verification from image presence or publication. |
| Cover | Empty cover_image_id → **No cover added**; existing coverIsPublic predicate true → **Cover · Public eligible**; all other stored images → **Cover · Admin only**, with helper naming applicable reasons: draft, classification restriction, or rights unapproved. Rights approval alone cannot override classification. |

Homepage line: **Selected on homepage** / **Not selected on homepage**, derived only from successfully loaded homepage.content.featured_catalogue_ids; failed read → “Homepage selection unavailable”. Dashboard aggregate label becomes **Text-listing eligible**, alongside a separate **Cover-public eligible** count; reuse the same predicates. Audit's four published Other developed titles display Text eligible / Not featured / Other developed / Cover Admin only; all four covers still render authenticated, while public cover count is zero. Change label to **Product code or ISBN**, helper “Enter the title's unique product code (for example LHC-PHYS-F2) or its ISBN”; retain name product_code, required/64-character/uniqueness rules. Identical EN/FR text may show a nonblocking “English and French text match — review translation” note; never auto-translate or treat matching text as validation failure.

### 12.4 Friendly technical fields, client-side only

| Field | Control/helper; stored value stays compatible |
| --- | --- |
| Slug | Label **URL name**; helper “Lowercase letters, numbers and hyphens; changing this can affect existing links.” Optional Generate from title button on Add only; explicit activation, never overwrite an existing slug automatically. Existing pattern/required rules remain. |
| Icon key | Labeled icon select with visible samples from existing `src/components/Icon.astro` keys (including pen, brush, users, check, globe, layout, print), None where allowed; retain unknown stored key as “Current custom icon: …” and optional Custom key input. Serialize original key, no schema expansion. |
| CTA path | **Destination** page picker for existing supported public routes, plus Custom destination input for existing paths/fragments/http(s) URLs. Show localized EN/FR destinations read-only. Preserve custom values, current href validation and stored language-neutral paths; no route guesses or forced rewrites. |
| Latitude/longitude | **Map coordinates (optional)** with Latitude/Longitude labels, decimal examples 4.0511 / 9.7679, ranges −90…90 / −180…180 and “Use verified coordinates; leave blank if unknown.” Examples are format hints, not this office's coordinates. Keep both audited empty values; no geocoding/new map API. |
| Legal `##` | Helper next to each body: “Start a heading on a new line with ## followed by a space; separate paragraphs with a blank line.” Provide read-only Preview using existing safe legal-block parsing (`src/lib/cms-content.ts`), not arbitrary HTML or a new rich-text format. No automatic rewriting of saved text. |

### 12.5 Destructive actions and News media

**Override §3 card footer and §4 deletion placement:** cards expose Edit plus a 44px **More actions** menu; Delete/Remove lives inside that menu, visually separated from ordinary actions, with the existing named-item confirmation. No red Delete beside Edit/Save, including hero/service/process rows. Menu supports keyboard operation, Escape and trigger-focus restoration; selecting Delete closes menu before opening confirmation. Legal still has no Delete. Parent-array removal still saves the complete parent record only after explicit confirmation. This avoids nesting a delete dialog over an editor.

**News image upload is mandatory in the editor**, using existing `/api/media`, hidden named hero_image_id and shared Choose/Replace/Remove image controls. Show 16:9 preview, JPEG/PNG/WebP/8MB helper, upload progress/error and preserved old ID on failure; Save waits for upload completion. Text-only edits preserve the ID; Cancel does not save the article or promise blob cleanup. Audit's sole article is a 51-character leftover QA draft with no image: show No image added; do not delete it as part of redesign or invent artwork.

### 12.6 Size against measured content

Audit snapshot, not hardcoded totals: 4 catalogue titles (42–45-character names; 4 covers), 1 news draft, 4 subjects, 5 hero slides, 6 services, 5 process steps, 2 legal documents, 3 team blocks, 2 commitments, 7 project types, 4 trust statements and 4 homepage selections. No pagination at these volumes; retain §3's threshold of 24 for growth. Catalogue uses 3 columns at available inner width ≥900px, 2 at ≥560px, otherwise 1; hero 3/2/1 at the same widths. Titles wrap fully; no fabricated empty grid slots.

Legal bodies are 1220–1465 characters EN / up to 1632 FR: **large 960px slide-over**, one 320px-minimum body textarea per language, same-sheet full-text preview, no small 560px modal. Services reach 439 characters, Who we are 537 EN / 613 FR, commitments 328–411, team descriptions 108–154: keep large grouped sheets for these edits, full read-only expansion on cards, 160px-minimum ordinary textareas. About has 3 actual team blocks, not empty decorative portraits. Coordinates, social links, OG image and legal stated dates are empty: retain explicit empty summaries, no invented defaults. Accept at 1440×900 and **375×667** (audit viewport), plus §10's short-height/zoom cases. Schema-limit stress tests remain; measured shorter content is no reason to narrow validators or crop fields.

Implementation evidence must cover these five fixes, badge predicates/current four-cover state, nonnested Delete confirmation, News upload and sibling-field preservation on the published server. This amendment changes specification only; no live content edits, production tests, push or deployment are performed here. ADMIN-V2-1 remains Review.

## 13. Brand colour and depth

V2-6 (`dfa09c78-0982-4989-bdff-19a1070019e9`) · Z · 12 October 2026. **Overrides the earlier accent-only, white/grey canvas, black primary-button and shadow-free rules**, including §2 and inherited v1 styling. Keep layout, typography, spacing, radii, components, data/status predicates, responsive behavior and motion unchanged. Apply to `.admin-app`, `.admin-login` and their generated cards/overlays; do not change public styles. Palette source: [src/styles/global.css](../src/styles/global.css), `@theme` / `:root` brand tokens.

### 13.1 Exact admin tokens

| Token (prefix `--admin-`) | Value / source |
| --- | --- |
| canvas / surface / subtle | `#FBF6EE` cream / `#FFFFFF` white / `#F3EADD` cream-deep |
| ink / muted | `#1A1216` ink / `#5A4C52` ink-soft |
| sidebar / sidebar-hover / sidebar-text | `#3B0F1B` burgundy-deep / `#5C1A2B` burgundy / `#FBF6EE` cream |
| accent / accent-hover / accent-soft / accent-bg | `#5C1A2B` / `#3B0F1B` / `#7A2C3F` / `#F7EDF0` (retained admin tint) |
| green / success / success-hover / success-bg | `#6FBF3F` brand green / `#2F7A2A` green-deep / `#245E20` (admin hover shade) / `#EAF7E2` green-pale |
| orange / warning / warning-bg | `#F47E27` brand orange / `#854D0E` (retained admin text) / `#FFF0E3` (admin orange tint) |
| danger / danger-bg | `#B91C1C` / `#FEF2F2` (retained semantic error pair) |
| border / control-border / focus | `#E4D9CD` (decorative warm line) / `#71717A` (retained control line) / `#5C1A2B` |
| scrim | `rgba(59,15,27,.40)` |
| shadow-card / shadow-popover / shadow-dialog | `0 2px 10px rgba(59,15,27,.06)` / `0 14px 40px rgba(59,15,27,.10)` / `0 30px 70px rgba(59,15,27,.18)`; public site's existing shadow values |

### 13.2 Component paint rules

| Component | Build instruction |
| --- | --- |
| Sidebar, tablet rail, mobile drawer | Deep burgundy background; all labels, metadata, icons, scroll cues and account email cream at full opacity. Hover burgundy/cream. Active cream/burgundy, existing 3px inset indicator orange; retain weight and aria-current. Account footer burgundy/cream, hover soft burgundy/cream; avatar cream/burgundy. Search button cream/burgundy, hover cream-deep/burgundy. Keep existing colour logo on a white backing within its current box. Tooltips deep burgundy/cream. |
| Canvas and topbar | Warm cream canvas; white topbar and card bodies. Body ink; metadata/helpers/placeholders muted. Open Site becomes burgundy/white, hover deep burgundy/white. Ordinary links burgundy, underlined in prose; hover deep burgundy. |
| Dashboard greeting | Paint the existing greeting/header region deep burgundy with cream heading, subtitle and any metadata; 12px radius. Preserve its content, dimensions and placement; no additional hero or decoration affecting the grid. Any existing action here uses cream/burgundy, hover cream-deep/burgundy. |
| Stat cards | White body, card shadow, **3px inset top strip** and **40×40px icon chip** in the existing icon position (20px line icon). Catalogue: burgundy strip, accent-bg chip/burgundy icon; Published: green strip, brand-green chip/deep-burgundy icon; Drafts: orange strip, orange chip/deep-burgundy icon; News: burgundy strip, accent-bg chip/burgundy icon. Match by metric meaning, not card position; other neutral metrics use cream-deep/burgundy. Numbers ink; labels muted. Strips/chips are supplementary decoration, never the status signal. |
| Section-card/panel headers | Existing header region cream-deep, heading/icons/links burgundy, metadata muted; existing separator warm border. White body; no coloured paragraphs or whole-card saturation. Collection media wells cream-deep; preserve cover colours/crop and image dimensions. Existing footer stays white. |
| Buttons and selected controls | Save/Add/Sign in: burgundy/white, hover and pressed deep burgundy/white. Explicit Publish: green-deep/white, hover and pressed success-hover/white; generic Save stays burgundy even for a published record. Secondary: white/burgundy with control-border, hover cream/burgundy. Selected language/filter/view: accent-bg/burgundy with burgundy border. Unselected icons ink/white, hover ink/cream-deep. Filled destructive confirmation retains danger/white; destructive menu text danger/white. |
| Status badges and messages | Published/Enabled/success: success-bg/success. Draft/Disabled/Not set up/Not featured: cream-deep/muted. Featured/selected: accent-bg/burgundy. Attention/Listing withheld/Admin-only cover/restriction: warning-bg/warning. Error: danger-bg/danger. Classification labels use neutral cream-deep/muted; they are metadata, not approval. Keep §12's four-axis labels and exact eligibility rules. Small badges use existing pill radius and text+icon; no fabricated health state. Success/warning/error messages use their same foreground/background pair for all text and links; links underlined. |
| Cards and overlays | All preview/section/stat/panel cards: shadow-card plus decorative border. Menus/search: shadow-popover. Editor/confirmation dialogs and navigation drawer: shadow-dialog. Editor/confirmation header cream-deep/burgundy, body/footer white with ink/muted text; controls as above. Shadows never replace control outlines; no hover lift or extra animation. |
| Login and auth states | Existing standalone layout and fields retained. Canvas cream, form card white with shadow-popover and 3px inset burgundy top strip. Existing brand/title region cream-deep/burgundy; logo on white. Sign in and recovery/reset primary actions burgundy/white. Helpers muted/white; errors danger-bg/danger. Apply the same field, focus and pending rules across auth modes. |

Inputs/selects/textareas stay white with ink values, muted placeholders and `1px solid control-border`; invalid border danger. Checkbox/radio selected fill burgundy with white mark; unselected control-border on white. Pressed uses the hover pair where specified; otherwise hover/pressed retain the default pair, including destructive actions. Pending/aria-disabled controls **retain their normal colours and opacity 1**; show existing busy/unavailable text and enforce the existing interaction guard. Disabled cards also stay fully readable. No alpha text, gradients, coloured image overlays or brand-green/orange text on white. Bright green and orange are decorative fills only, carrying deep-burgundy icons if present.

### 13.3 Contrast ledger and focus

Ratios below are computed from opaque sRGB tokens using relative luminance, displayed to two decimals; thresholds checked before rounding. Normal text passes **4.5:1**; meaningful control boundaries/icons and focus pass **3:1**, per W3C [text contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) and [non-text contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html). This approved pair list is exhaustive for this amendment; use the same pair for icons as for its text. Decorative card lines/strips/shadows carry no essential information.

| Foreground / background (hex) | Contrast :1 | Application / result |
| --- | --- | --- |
| Ink `#1A1216` / white `#FFFFFF`, cream `#FBF6EE`, cream-deep `#F3EADD` | 18.39 / 17.09 / 15.43 | Body, field values, neutral icons; text AA |
| Muted `#5A4C52` / white, cream, cream-deep | 8.11 / 7.54 / 6.80 | Helpers, placeholders, neutral badges; text AA |
| Cream `#FBF6EE` / deep burgundy `#3B0F1B`, burgundy `#5C1A2B`, soft burgundy `#7A2C3F` | 15.37 / 11.92 / 8.64 | Sidebar/greeting/footer, hover, tooltip; text AA |
| Burgundy `#5C1A2B` / white, cream, cream-deep, accent-bg `#F7EDF0` | 12.82 / 11.92 / 10.76 / 11.19 | Links, section headings, secondary/active/selected controls; text AA |
| Deep burgundy `#3B0F1B` / white, cream, cream-deep | 16.53 / 15.37 / 13.88 | Hovered ordinary links; text AA |
| White `#FFFFFF` / burgundy, deep burgundy | 12.82 / 16.53 | Primary labels/marks and filled-button boundary against white; text AA |
| White / green-deep `#2F7A2A`, success-hover `#245E20` | 5.33 / 7.79 | Publish labels/icons and boundary against white; text AA |
| Green-deep `#2F7A2A` / green-pale `#EAF7E2`, white, cream | 4.80 / 5.33 / 4.96 | Success text; publish boundary against cream; text AA |
| Warning `#854D0E` / orange tint `#FFF0E3` | 6.14 | Attention badge/message text; text AA |
| Danger `#B91C1C` / danger-bg `#FEF2F2`, white, cream | 5.91 / 6.47 / 6.01 | Error text, invalid border, destructive action; text AA |
| White / danger `#B91C1C` | 6.47 | Destructive confirmation label; text AA |
| Deep burgundy / brand green `#6FBF3F`, orange `#F47E27` | 7.24 / 6.19 | Chip icons; exceeds text AA and icon minimum |
| Orange `#F47E27` / burgundy, deep burgundy | 4.80 / 6.19 | Decorative dark-surface accent; ≥3:1. Active cream-row strip is decorative; selection is also shown by contrasting text, weight and aria-current |
| Control-border `#71717A` / white, cream, cream-deep, accent-bg, green-pale, orange tint | 4.83 / 4.49 / 4.06 / 4.22 / 4.35 / 4.33 | Input/secondary-control boundary; all ≥3:1, never use this grey for text |

Focus on light surfaces: retain `3px` burgundy outline with `2px` white separating gap; burgundy/white is 12.82:1 and burgundy/light surfaces ≥10.76:1. On dark sidebar/greeting surfaces: **3px cream outline + 2px deep-burgundy gap**; cream/deep, cream/burgundy and cream/soft are 15.37/11.92/8.64:1. The gap also keeps the ring distinct around cream active controls. Keep outlines outside card clipping and visible during hover/pressed/pending states; reduced-motion behavior unchanged.

Acceptance for SoSo: inspect computed colours for every ledger role, default/hover/pressed/selected/pending/invalid/focus states, dark drawer/rail and all auth modes; verify dynamic nodes inherit these tokens without public-style leaks. Retain §10/§12 responsive, keyboard, content-preservation and live QA requirements. These are verified token contrasts, not a claim that the unimplemented UI passes WCAG. Specification-only commit on main; no push.
