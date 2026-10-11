# Longhorn CM admin redesign — implementation specification

Owner: Z · 11 October 2026 · ADMIN-1 (`440e47ec-c5fd-4acd-8610-9b095a879c10`). Handoff: SoSo, ADMIN-3; QA: Dell, ADMIN-4.

## 1. Scope and visual direction

Replace the presentation of `src/layouts/AdminLayout.astro` and all 12 `src/pages/admin/*.astro` pages. This document is the design deliverable; it changes no production code. Reference: `Assets/admin-redesign-reference.png`, inspected directly. Adopt its light sidebar, white canvas, black Open Site pill, bordered panels, compact section headings, grouped navigation, search affordance, bottom account card, notice banner, and right rail. Replace its commerce metrics and revenue chart with CMS state and section summaries. No simulated analytics, trend percentages, subscription upsell, chat widget, or fabricated activity.

Keep all routes, API contracts, auth gating, Identity callbacks, roles, local-dev behavior, form names/IDs/data attributes, validators, draft/publish semantics, dirty checks, upload handling, reorder operations, and delete confirmations. Do not add autosave, scheduled publishing, revision history, or an independent draft alongside a live record. Saving a changed published record updates that record; clearing Published can remove it from the public site. Existing cache refresh behavior stays intact.

All interface labels in this spec are **placeholder English copy** pending `Docs/admin_redesign_copy.md` from Marty (ADMIN-2). Marty owns wording; this spec owns geometry, interaction, data definitions, and field coverage. Preserve EN/FR content inputs and their required rules. No admin locale switch is requested. UI strings may wrap; never constrain controls to a single text line to match the reference.

## 2. Design tokens

Use admin-scoped `--admin-*` tokens, shared by login and shell. Do not alter public-site tokens. All pixel values below are CSS px at default zoom; implement typography and spacing as rem equivalents using 16px root, preserving browser font scaling.

| Token | Value | Use |
| --- | --- | --- |
| canvas | `#FFFFFF` | Main workspace, cards, inputs |
| sidebar | `#F5F5F5` | Navigation background |
| subtle | `#F7F7F8` | Table headers, neutral banner, hover |
| ink | `#18181B` | Headings, body, primary black buttons |
| muted | `#52525B` | Helper text, secondary labels |
| border | `#E4E4E7` | Decorative panel/table dividers |
| control-border | `#71717A` | Input boundaries and unchecked controls |
| accent | `#5C1A2B` | Longhorn mark, active nav indicator, selected icon |
| accent-bg | `#F7EDF0` | Active navigation background |
| accent-hover | `#3B0F1B` | Accent link hover |
| success / success-bg | `#166534` / `#F0FDF4` | Published or save-success text |
| warning / warning-bg | `#854D0E` / `#FEFCE8` | Attention state, pending public eligibility |
| danger / danger-bg | `#B91C1C` / `#FEF2F2` | Error text, destructive actions |
| focus | `#5C1A2B` | 3px outline, 2px white separating gap |
| scrim | `rgba(24,24,27,.40)` | Drawer/dialog backdrop |
| space | `4, 8, 12, 16, 20, 24, 32, 40, 48, 64px` | Shared spacing scale |
| radius-control / panel / pill | `8px` / `12px` / `999px` | Inputs and buttons / cards / Open Site and badges |
| shadow-popover | `0 8px 24px rgba(24,24,27,.12)` | Search, dialog, drawer only |
| layer | header `20`, save bar `30`, scrim `40`, drawer `50`, modal `60`, toast `70` | One modal at a time |

Load existing `/fonts/inter-latin-variable.woff2` locally with `font-display: swap`; stack `Inter, system-ui, sans-serif`. Use Inter throughout admin. No Poppins/Fraunces, gradients, glowing status dots, lift-on-hover, or panel shadows. Longhorn accent is limited to logo/active navigation/focus/selected states; default action buttons are ink on white or white on ink.

| Type role | Size / line height / weight |
| --- | --- |
| Desktop page heading | `28 / 36 / 600`, tracking `-.02em` |
| Mobile page heading | `24 / 32 / 600` |
| Panel heading | `18 / 26 / 600` |
| Metric number | `32 / 40 / 600`, tabular numerals |
| Body and field input | `14 / 22 / 400`; mobile inputs `16 / 24 / 400` |
| Navigation / field label / button | `14 / 20 / 500` |
| Helper / badge / metadata | `12 / 18 / 400`; badge `500` |
| Nav group label | `12 / 18 / 500`, sentence case |

Line icons: use one shared inline SVG component, 24×24 viewBox, no fill, `currentColor`, stroke width `1.75`, rounded caps/joins. Display at 18px in nav/actions and 20px in empty states. Use the icon keys in §3 (Lucide-style silhouettes); local SVG paths avoid a new runtime dependency. Remove unicode icon glyphs, including generated error cards. Decorative SVGs are `aria-hidden`; icon-only buttons receive an accessible name and 44×44px target.

## 3. Shell and navigation

### Navigation registry

Keep existing `section` keys for active matching. Each group is a heading plus a list of ordinary links; groups remain expanded. Site settings exists once, in the pinned account footer. Login has no sidebar entry.

| Group | Label | Route | Existing section key | Icon key |
| --- | --- | --- | --- | --- |
| Workspace | Overview | `/admin/` | dashboard | layout-dashboard |
| Website | Homepage | `/admin/homepage/` | homepage | house |
| Website | About us | `/admin/about/` | about | building-2 |
| Website | Services & process | `/admin/services/` | services | layers |
| Website | Why choose us | `/admin/why-choose-us/` | why | badge-check |
| Content | Catalogue | `/admin/catalogue/` | catalogue | book-open |
| Content | Subjects | `/admin/subjects/` | subjects | tags |
| Content | News & updates | `/admin/news/` | news | newspaper |
| Settings | Contact | `/admin/contact/` | contact | map-pin |
| Settings | Legal pages | `/admin/legal-pages/` | legal | file-text |
| Account footer | Site settings | `/admin/site-settings/` | settings | settings |
| Account footer | Sign out (button) | Existing logout handler | — | log-out |

### Desktop ≥1200px

Sidebar fixed left, full `100dvh`, 240px wide, padding 16px, right 1px decorative border. Main margin-left 240px. Logo block: 44px minimum height, existing `/img/longhorn-logo.png` contained within 136×36px, alt “Longhorn Publishers Cameroon”; collapse button at right. Below: static workspace label “Longhorn Cameroon” (no fake workspace selector), 16px gap, Search pages button styled as a field, 44px height. Group gap 20px; heading bottom gap 8px; nav items minimum 44px high, gap 4px, horizontal padding 12px, icon/text gap 10px. Active link: accent-bg, accent text, 3px inset left indicator, weight 600 and `aria-current="page"`. Hover: subtle background, no movement.

Sidebar flex column: logo/search fixed; navigation `flex:1; min-height:0; overflow-y:auto`; account footer pinned within the sidebar, never over nav. Footer white panel with 1px border, radius 12px, padding 8px; 32px neutral initials avatar, account email from the existing `getUser()` result (fallback Administrator); email wraps with `overflow-wrap:anywhere`. Site settings and Sign out rows are 44px. No synthetic person name/photo or new profile menu.

Collapse control toggles 240px ↔ 72px and main offset together; retain accessible names for every link. Hide visual labels/group headings in rail mode, retain screen-reader text, separate groups by 16px gap, show label tooltip on hover and focus. Footer becomes avatar + Settings/Sign out icons. Search becomes 44px icon button. Persist only desktop collapsed preference in localStorage key `lh-admin-sidebar-collapsed`; storage failure falls back to expanded. No navigation request on collapse.

Header: sticky white, min-height 72px, border-bottom 1px, padding 16px 32px. Left: breadcrumb `Content management / <page>` at 12px; right: black Open Site pill, min-height 44px, 16px horizontal padding, globe 18px and external-link 16px. Preserve `/en/`, `target="_blank"`, rel protection; accessible text announces new tab. Account/sign out are in sidebar only. Main content max-width 1280px **including** padding, centered within available space, padding `32px 32px 64px`. Every grid child uses `min-width:0`.

### Tablet 768–1199px

Default 72px rail, desktop expansion preference does not force 240px at this width. Expand button opens the same labeled 280px modal drawer as mobile, over the rail. Header padding 16px 24px; main padding `24px 24px 48px`. Dashboard rail panels move into document flow beneath the primary panels. Bilingual pairs use two columns only when the containing editor's inner width is ≥640px; otherwise stack English then French.

### Mobile <768px

No persistent sidebar or main offset. Header min-height 64px, padding 10px 16px, Menu 44×44px left, page label center (wrap), Open Site right (icon permitted below 400px, with accessible name). Page content padding `24px 16px 40px`. Page header actions wrap below title. Metric grid is two columns at 480–767px and one at <480px; all other dashboard panels one column.

Drawer width `min(280px, calc(100vw - 32px))`, left edge, `100dvh`, background sidebar, same labels/groups/footer. Use modal `<dialog>` or equivalent focus trap + inert background; accessible name “Admin navigation”. Open focuses Close button; Tab/Shift+Tab remain inside; Escape and backdrop click close and restore trigger focus. Body scroll locks; drawer navigation scrolls independently; safe-area top/bottom padding applies. Closing after route selection respects the existing dirty-navigation confirmation: cancelling Leave keeps the current page and preserves focus. On resizing to desktop, clear inert/scroll lock and put focus on the corresponding visible nav control. Do not keep both desktop and drawer copies focusable.

### Search pages and notices

Search field is a button opening a modal named “Search admin pages”, max-width 560px, margin 16px, top 96px desktop / 16px mobile. Cmd+K on macOS, Ctrl+K elsewhere opens it; do not intercept while typing in an input, textarea, or contenteditable. Search filters only the 11 nav destinations (including Site settings), case-insensitive label/group matching; no content search API. Labeled 44px search input, grouped result links min-height 44px; Tab reaches results, Enter activates focused link; Escape closes/restores trigger, no-match message when empty. The keyboard hint is decorative text. Avoid nesting drawer and search modals: close drawer before opening search, restore to Menu on search dismissal.

Notice banner appears beneath page heading, before panels: subtle background, radius 8px, 16px padding, info icon, text, 44px Dismiss button. Show the existing local-dev notice here when DEV, with its truthful Identity limitations; dismiss for current session (`lh-admin-dev-notice-dismissed`) and retain a “Local development” footer label. Production may omit the banner. No invented announcement. API errors and validation errors are separate persistent messages, never dismissible as informational notices.

## 4. Overview dashboard and data contract

Page heading “Hello, Administrator” unless a name is already available in the existing Identity integration; do not derive a name from email or add an Identity query. Subtitle placeholder “Review your content and continue editing.” Open Site remains in shared header. Optional dashboard Refresh button reissues reads only and reports last successful fetch time as browser-local UI metadata, never as server health.

Desktop composition: primary column `minmax(0, 2fr)`, right column `minmax(280px, 1fr)`, gap 24px. Primary: Content overview (2×2 stat grid), Section status, Recent edits. Right: Hero carousel, Catalogue summary, Quick actions. DOM order for tablet/mobile: Content overview → Hero carousel → Section status → Catalogue summary → Quick actions → Recent edits. Use named grid areas on desktop to maintain that reading order. Each panel header has title and a real destination link only where one exists.

```text
240px sidebar | breadcrumb                              Open Site
              | Hello, Administrator
              | [conditional notice banner]
              | Content overview (2×2)      Hero carousel
              | Section status             Catalogue summary
              | Recent edits               Quick actions
```

### Read adapters (existing endpoints only)

Fetch authenticated admin responses with existing `request()` helper, once per endpoint per overview load; settle independently. Netlify function sources are `.mts` under `netlify/functions/`. Reuse fetched results across cards; do not use public APIs to infer drafts.

| Endpoint | Response | Available dashboard fields / limits |
| --- | --- | --- |
| `/api/catalogue-admin` | Array | `id`, `title_en`, `title_fr`, `published`, `classification`, `cover_image_id`, `cover_rights_approved`, `level`, `subject_id`, `featured`, `updated_at`; excludes demo rows |
| `/api/news-admin` | Array | `id`, `headline_en`, `published`, `publish_date`, `updated_at`; excludes demo rows; publish_date is not edit time or scheduling state |
| `/api/subjects-admin` | Array | `id`, `name_en`, `name_fr`, `created_at`, `title_count`; no `published` or `updated_at` returned |
| `/api/homepage-admin` | `{content: record|null, catalogue: array}` | `content.published`, `content.updated_at`, carousel settings; catalogue projection lacks classification/updated_at: do not use it for dashboard catalogue metrics |
| `/api/homepage-hero-slides-admin` | Array in stored order | `id`, `headline_en`, `enabled`, `sort_order`, `image_id`, `updated_at` |
| `/api/about-admin` | Record or null | `published`, `updated_at`; fixed page label |
| `/api/why-choose-us-admin` | Record or null | `published`, `updated_at`; fixed page label |
| `/api/contact-settings-admin` | Record or null | `published`, `updated_at`; fixed Contact label |
| `/api/services-admin` | `{services: array, process: array}` | Each item: `id`, `published`, `updated_at`; service `name_en`; process `title_en`, `step_number` |
| `/api/legal-pages-admin` | Array | `page` (`privacy_policy`, `terms_of_use`), `published`, `updated_at`; `content_updated_at` is stated legal date, not edit time |
| `/api/site-settings-admin` | Record or null | `updated_at`; no published/draft state |

### Exact metric definitions

Content overview's four stats: **Catalogue titles** = catalogue array length, helper P published / D drafts; **News articles** = news length, same helper; **Subjects** = subjects length, helper Z with no assigned titles (`title_count === 0`); **Website content published** = published item count across homepage content, About, Why, Contact, services, process and legal arrays, helper “P published · D drafts · M pages not set up”. Each singleton contributes one only when non-null; each service/process/legal row contributes one. Expected missing singleton pages (4) and missing legal keys (2) contribute to M, never D. Do not count subjects, settings, or hero enabled slides as published content. Explain “Includes pages, services and process steps” beside website metric. Legal missing keys are compared against those two expected keys.

Section status panel: rows Homepage, About us, Services, Process steps, Why choose us, Contact, Legal pages, then Site settings. Numeric Published/Draft columns for returned publishable records; singleton null → “Not set up”, not Draft. Services/process empty → “No items”; missing legal key shown by name below the legal row. Settings → “Configured” if record exists / “Not set up”; publish columns show “Not applicable”. Each row links to the mapped editor. This panel replaces the reference revenue chart; no timeline graphic or aggregate health score.

Hero panel: `N / 5 saved`, `E enabled`, `N-E disabled`, homepage Published/Draft/Not set up. If slides nonempty and homepage published, enabled slides are potentially public; badge “Enabled” is a configuration state, not proof of CDN visibility. If N=0 show “Legacy hero fallback” (existing homepage fallback); if N>0 and E=0 show attention “No enabled slides”. Autoplay setting is shown only from non-null homepage content: On/Off + milliseconds converted to seconds. Endpoint failure → corresponding state Unknown. Link “Manage slides” → `/admin/homepage/#hero-slides`; SoSo may add this fragment ID to the existing section without altering behavior.

Catalogue summary: total, primary/secondary counts by exact `level`, published flag count, draft count (`published === false`), unclassified count, and **Publicly eligible** count where `published === true` and classification in `national_book_list_verified`, `other_developed`. Published unclassified records must not be described as publicly visible. Optional “Public cover eligible” count uses the existing `coverIsPublic` predicate, including nonempty cover ID, verified classification and approved rights. Eligibility is not a live network verification or a new compliance check. “See all” links `/admin/catalogue/`; retain editor classification/evidence fields.

Quick actions: four full-width 44px links with icons and arrow: Catalogue, News, Homepage slides, Site settings. Catalogue/News links go to existing editor fragments (`#editor`, retaining existing behavior); labels “Edit catalogue”, “Edit news”, “Manage slides”, “Site settings”. Do not promise Add unless the destination actually resets into new mode. No dashboard write buttons.

Recent edits: flatten records from catalogue/news/homepage content/hero/About/Why/Contact/services/process/legal/settings with valid `updated_at`; deduplicate by source + ID/key; newest first (timestamp descending, source/key tie-break ascending), take six. Exclude subjects because created_at cannot represent edits. Row: source icon, English title or fixed page name, source label, timestamp `<time datetime>`, Published/Draft/Enabled/Disabled/Configured badge as applicable, link to its editor route. Catalogue/news/services link to their list/editor page without claiming preselection; no unsupported `?id` deep-link loader. Format date/time `en-GB` in browser timezone with timezone abbreviation; invalid/missing timestamps are omitted. No author avatars or “X edited” attribution: endpoints return no audit authors. Caption “Latest saved records; not an activity history.” Partial source failure adds “Some sections could not be loaded”; do not claim list is complete. Empty successful result → “No recent edits available”. No global See all link because no activity page exists.

### Loading, empty and failure semantics

Pending: static subtle skeleton blocks, same minimum panel geometry (stat min-height 132px); `aria-busy=true`, single polite loading message. Success empty array means zero; singleton null means Not set up. Failure/malformed shape means em dash + “Could not load” + visible Retry, never zero/ready/healthy. Aggregate website metric requires every contributing source; any failure makes its total unavailable while successful section rows remain usable. Validate expected array/object shape before rendering counts. Error text is assigned with textContent using existing helper; never interpolate server content into HTML. Refresh disables its own button during read, retains previous successful values marked “Updating”; a failed refresh marks retained values “Last loaded” rather than silently presenting them as current. No background polling.

## 5. Shared component contracts

Suggested component boundaries: `AdminIcon`, `AdminPageHeader`, `AdminPanel`, `AdminStatusBadge`, `AdminFieldGroup`, `AdminSaveBar`, `AdminEmptyState`, `AdminNotice`; admin stylesheet shared with login. These are implementation boundaries, not a requirement to rewrite functioning scripts. Preserve DOM selector hooks when migrating markup; generated rows and the confirm dialog need the same styling as server-rendered components.

| Pattern | Geometry and behavior |
| --- | --- |
| Page header | Heading/subtitle left; optional primary action right; gap 16px, margin-bottom 24px; subtitle max-width 680px. One h1. Desktop heading 28px; mobile 24px. |
| Panel | White, 1px decorative border, radius 12px, padding 20px (16px mobile), gap 20px between sections. Title row aligns baseline, wraps; trailing link min-height 44px. No colored top border. |
| List toolbar | Search flexes, min-width 0; labels always accessible; search and existing filters 44px high, gap 12px. Wrap at available width; stack <640px. Preserve current filters/search logic; no unsupported bulk actions. |
| Table / record list | Header subtle bg, 12px labels; cells 12px 16px, rows min-height 60px, bottom divider. Explicit Edit/Delete 44px targets; never rely on clicking entire row. Long titles wrap. Catalogue columns: title+product code, level/subject, classification, status, actions. News: headline+category, publish date, status, actions. Subjects: bilingual name, assigned title count, actions. Below 768px transform to labeled record cards with all data/actions retained; DOM order unchanged. |
| Editor | One column panel max-width 960px; English/French pairs two columns only at inner width ≥640px with 20px gap. Place permanent language labels on every field. All existing textarea content and required fields remain mounted/visible; no language tabs hiding invalid fields. Metadata field groups use fieldset/legend. Default textarea min-height 120px; news/legal bodies 280px, vertical resize. |
| Fields | Label gap 6px; input/select min-height 44px, padding 10px 12px, control-border 1px, radius 8px. Helpers gap 6px. Required marker + visible legend explaining it. Checkbox 18×18px within 44px label row. Error danger text with icon, `aria-invalid=true`, aria-describedby helper/error IDs. Keep existing validators; do not add required conditions. |
| Repeatable groups | Each row bordered, radius 8px, padding 16px, gap 16px; row title/number and Remove action top; language pairs below. Add button 44px. Keep existing serialization and caps. Removal/reorder retains existing confirmation and persistence behavior. |
| Save bar | Within each existing form, white with top border, padding 12px 16px, flex-wrap gap 12px; show Published checkbox and existing Save button, plus existing Reset/Cancel where present. Single-form pages may use sticky bottom:0, z30; multi-form Services/Legal bars remain inline to avoid stacked sticky controls. Safe-area bottom inset; reserve bar height in content and use scroll-padding-bottom so focused fields/errors aren't covered. Below 768px buttons full-width if needed. Save in-progress label, disabled duplicate submission, retain values on failure. No extra Publish API call or added confirmation on ordinary save. |
| Status / toast | Persistent inline status near originating form, success with check icon, error with alert icon. Optional duplicate success toast max-width 360px right/bottom 24px (mobile inset 16px); 16px padding, radius 8px, no focus theft, dismiss button 44px. Auto-dismiss success after 5s only if inline message remains; errors never auto-dismiss. One live announcement, not inline+toast both. Session/API helper messages remain truthful. |
| Empty | In panel, padding 32px 20px, 20px outline icon, h3 16/24/600, body max-width 400px, action 16px below. Distinguish no records from no search matches; filtered-empty offers Clear filters, not Create as sole action. Singleton null keeps setup form available. |
| Error | Alert heading + actual safe helper message + Retry; preserve already entered form data. Display persistent inline field/server errors; do not replace a loaded editor with an empty state after a failed save. |
| Confirm dialog | Restyle existing `confirmAction()` dialog; width min(440px, viewport−32px), padding 24px, radius 12px, scrim. Accessible title plus message, Cancel and Confirm/Delete buttons min-height 44px; focus Cancel initially, trap focus, Escape = cancel, restore initiating control. Below 400px stack actions. Keep current boolean result/confirm-before-delete and dirty-leave behavior. No new native blocking confirm. |
| Image picker | Existing file input + Choose/Replace/Clear controls. Portrait cover preview 90×120px `object-fit:contain`; hero 160×90px; OG 160×84px; neutral bg and border. Responsive media row wraps. Accept JPEG/PNG/WebP and existing 8MB limit; show type/size helper, upload pending, safe error, success; save enabled/disabled exactly per existing upload handler. Do not invent media library, crop editor, rights approval, or queued cleanup. Actual image alt identifies preview; empty block states No image selected. |

When keyboard Edit opens/populates an existing editor, focus its heading (temporary tabindex −1) or first field per existing page behavior; after delete return focus to the next surviving action or list heading. Style move-up/down buttons as 44px named controls including record identity; preserve endpoint semantics and disable/no-op boundary logic without losing focus. Drag cannot be the only ordering method.

## 6. Per-page migration map (all 12)

These field groups are a layout inventory, not permission to remove a field omitted from a summary. Keep each page's entire existing payload and handlers. Collection editors may move below their lists for a list-first scan; initial new editor remains visible, and existing Edit/Reset behavior remains intact. Keep actual anchors stable.

| Page file / route | New layout and shared patterns | API and preservation notes |
| --- | --- | --- |
| `index.astro` `/admin/` | Shell + greeting + dashboard in §4 | Read adapters only; no fabricated health or analytics |
| `homepage.astro` `/admin/homepage/` | Hero slides panel first with ID `hero-slides`: order, thumbnail, heading, Enabled badge, Edit/Save/Delete and up/down controls; EN/FR slide fields grouped into Headline, Image, Primary CTA, Secondary CTA, Enabled. Below: existing homepage form, carousel settings, legacy fallback, Who we are, Trust stats, One partner, Featured catalogue, Published + Save | `/api/homepage-hero-slides-admin`, `/api/homepage-admin`, `/api/media`; preserve separate slide and homepage saves, 5 total slides including disabled; visible cap explanation linked to Add control. 3000–30000ms interval, 500ms step, default 6000; max 4 published featured titles. Preserve last-enabled-slide rules and existing validation/errors. No preview autoplay in admin. |
| `catalogue.astro` `/admin/catalogue/` | Toolbar + record table/cards, existing editor (`#editor`): bilingual title/description; product code/slug; level/subject; curriculum; classification & private verification evidence; cover picker; editions/Featured/Published; save bar | `/api/catalogue-admin`, `/api/subjects-admin`, `/api/media`; retain product-code conflict, explicit classification, evidence fields/date, cover rights, private media and public eligibility rules. Published and public eligibility shown separately. |
| `news.astro` `/admin/news/` | Toolbar + table/cards; existing editor (`#editor`): bilingual headline/excerpt, slug/category/date, image controls if present, full bilingual body, Published + save | `/api/news-admin`; keep category values, required bodies/excerpts, publish_date nullable and existing media behavior; date is not scheduling. |
| `subjects.astro` `/admin/subjects/` | Search/list + assigned title counts; compact editor with EN/FR names, existing Save/Reset | `/api/subjects-admin`; no Published checkbox/badge; retain delete conflict when referenced, no cascade delete. |
| `about.astro` `/admin/about/` | One editor panel: Heritage, Identity (Purpose/Vision/Mission/Values), Team capacity repeat rows, Published + save | `/api/about-admin`; preserve all row fields/dirty guard |
| `services.astro` `/admin/services/` | Two stacked workspaces Services and Process steps, each own list, own existing editor and inline save bar. Service fields: bilingual name/summary/description, slug/category/icon/order, Published. Process: number, bilingual title/description, Published | `/api/services-admin` (`kind=service` / `kind=process`); retain up/down reorder, separate forms, existing numeric order validation and API operations |
| `why-choose-us.astro` `/admin/why-choose-us/` | Local presence bilingual group + Quality commitments repeat rows; every existing title/description/eyebrow/heading lead/accent/tags/icon input; Published + save | `/api/why-choose-us-admin`; retain rich repeat-row schema and tags serialization |
| `contact.astro` `/admin/contact/` | Bilingual intro, Coordinates (lat/lng), Project type repeat rows, Published + save. Inline cross-link to Site settings for address/phones/email | `/api/contact-settings-admin`; preserve nullable coordinate values/ranges; no guessed coordinates or new geocoder/map integration |
| `legal-pages.astro` `/admin/legal-pages/` | Two stacked panels, Privacy Policy then Terms of Use; each its own EN/FR body, stated update date helper, Published, inline save bar/status | `/api/legal-pages-admin`; maintain two independent forms/page keys; never set content_updated_at from save time |
| `site-settings.astro` `/admin/site-settings/` | One editor: Identity, Contact details, Footer/newsletter, Social links repeat rows, SEO defaults/OG picker; save bar | `/api/site-settings-admin`, `/api/media`; no Published switch; saving affects global live configuration, label Configured, keep all validation limits |
| `login.astro` `/admin/login/` | Standalone white sign-in card width min(440px, viewport−32px), padding 32px (24px <480px), radius 12px, 1px border, no shadow. Subtle page bg, logo above title, 24px section gaps, 44px full-width buttons. Center with min-height 100dvh and 32px vertical padding; allow scroll for short viewports. Remove decorative quote side panel | Preserve Identity sign-in/invite activation/recovery request/reset forms, IDs, hidden flow states, minlength/autocomplete, callback/session memory, role checks and existing DEV notice/no-login behavior. Apply tokens to all four forms, not only normal login. No signup link or auth/API change. |

## 7. Motion and WCAG 2.1 AA requirements

Motion supports orientation only: control background/border transitions 120ms ease-out; drawer slide/opacity 180ms `cubic-bezier(.2,0,0,1)`; collapse width 180ms same easing; toast fade 120ms, no slide/bounce. With `prefers-reduced-motion: reduce`, all these durations become 0ms and programmatic scroll uses auto. Skeletons static; no shimmer/pulse, count-up, staged card entrances, or hover translations.

Design target is WCAG 2.1 AA; implementation must be verified, not declared compliant from this document. Use these acceptance requirements:

- Semantic landmarks: skip link first focus target to main, one main, named navigation, header, one h1/page and ordered h2/h3 structure; current link aria-current. Icons never carry meaning alone (1.3.1, 1.1.1).
- Text contrast ≥4.5:1 normal / ≥3:1 large. Use muted on white/subtle/sidebar, ink for primary text, status text on its paired tint. Decorative border token is not an interactive boundary: control-border/checked fill/focus indicator must contrast ≥3:1 against adjacent surfaces (1.4.3, 1.4.11). Badges always contain state text.
- Visible 3px focus outline with white 2px gap on every control including search results, nav, upload label, dialogs and drawer; no outline removal without replacement. Logical DOM/Tab order, full keyboard operation, Escape close and focus restoration (2.1.1, 2.1.2, 2.4.3, 2.4.7). Shortcut must not fire inside editable fields.
- Reflow at 320 CSS px, 200% text resize and 400% zoom; long French values, emails, error strings and dropdown labels wrap; no horizontal page scroll. Tables become labeled cards, not tiny type. All pointer targets ≥44px in this design (an ergonomic requirement stronger than WCAG 2.1 AA). No hover-only help (1.4.4, 1.4.10, 1.4.13).
- Labels are visible and programmatically associated; language pairs use `lang="en"`/`lang="fr"` where appropriate; required markers include words for assistive tech; errors describe correction and associate to fields. Move focus to first existing invalid field after submission; retain native validation and server messages. Announce save/upload/loading status once politely; urgent failures use alert once. Do not replace user text on error (3.3.1, 3.3.2, 4.1.2, 4.1.3).
- Hidden login flows/duplicate nav/closed dialogs are absent from accessibility tree and keyboard navigation. Modal background inert, focus trap and scroll lock cleared on every close/resize path. No keyboard traps after cancellation (2.1.2, 4.1.2).
- Dirty-navigation guard covers drawer links and search result anchors as well as sidebar. Leave/delete dialogs name the affected content, Cancel first; do not claim deletion removes an image blob unless the existing response guarantees it.
- Save bars and sticky header never cover focused inputs, helper text, validation, or final action; account footer remains reachable on short screens. Respect browser autofill/password managers and current autocomplete attributes.

## 8. Implementation and review checklist

1. SoSo implements scoped tokens/inline icons/shared shell, then dashboard read adapters and states, then shared components. Keep the existing auth gate and imports intact; no cosmetic local auth bypass.
2. Migrate Homepage and Catalogue first, then remaining pages and all login flows. Inventory hooks before moving markup; style dynamic `innerHTML` rows and the existing dialog, not only Astro markup. Resolve Marty's copy against the registry and data definitions above before handoff.
3. Run `npm run build` and relevant existing suites for migrated behavior: `test:cms`, `test:hero-admin`, `test:product-code`, `test:catalogue-classification`. No production writes/deploy required for spec or local UI review.
4. Dell checks all 12 routes at 320, 375, 768, 1024 and 1440px; add 320×568/768×600 for drawer/account/save-bar height. Inspect default, active, hover, focus, collapsed, loading, empty, filtered-empty, partial failure, malformed result, dirty, saving, upload-error and delete-cancel states. Test keyboard search/drawer/confirm, reduced motion, screen reader labels/status, contrast, 200% text and 400% zoom.
5. Verify all existing create/edit/reset/save/delete/reorder and field validations remain equivalent. Test API failures separately from successful empty records; verify subjects/settings do not acquire draft states; verify catalogue Published unclassified is not described as publicly listed.
6. Local DEV cannot prove Identity callbacks/role checks/protected writes: use an authorized deploy preview for those checks and record that limitation. Build alone is not browser or accessibility evidence. ADMIN-4 records actual outcomes before release.

Spec verification: reference and full ADMIN-1 brief reviewed; all 12 page sources and current admin response contracts inspected. No rendered implementation exists in this task, so responsive/accessibility checks above are requirements for ADMIN-3/4, not claimed passes. Commit only this file on main and do not push.
