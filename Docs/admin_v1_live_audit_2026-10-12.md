# Admin v1 — signed-in live audit (read-only)

Auditor: Dell · 12 October 2026 · input to ADMIN-V2-1 (Z's v2 redesign spec).
Target: `https://longhornpublishers-cm.netlify.app/admin/` (production, admin v1 as released 11 Oct, includes ADMIN-FIX A-1 to A-9).
Screenshots: `tmp/admin-v1-audit/` (git-ignored, local only). Indexed at the end.

## 1. Method and safety

- Signed in once through the real login form with the QA admin account. Credentials were read from the local credentials file at run time and are not recorded anywhere in this repo, in these notes or in any log.
- **Read-only.** No save, delete, upload, reorder or publish was performed. Editors were opened with **Edit** and left again with **Close editor**, with nothing typed. As a safety net, every browser context aborted any non-GET request except the Identity sign-in. Zero application writes were attempted; the only blocked requests were 2 POSTs to Netlify's own analytics beacon (`…nsvcs.net/rum_collection`), which fired from the pages and were aborted, so nothing was sent.
- Tools: Playwright and headless Chromium. Every page at **1440×900** and **375×667** (mobile emulation, touch). Console, page errors, failed requests, HTTP status and all `/api/*-admin` responses were captured for every page load (22 loads).
- The saved responses were used for content statistics. They are not stored in the repo.
- The signed-in account's email address appears in the sidebar footer of every screenshot; it is deliberately not reproduced here.
- Limits: Chromium only; touch is emulated; no screen reader; no write flows (create, edit-save, delete, upload, reorder) were exercised, so none of their behaviour is covered.

## 2. Summary for Z

**Runtime health is good.** Across 22 loads there were **0 console errors, 0 page errors, 0 failed requests and 0 HTTP errors**. The dashboard fires its 11 reads in parallel and reaches "loaded" in **1.0–2.2 s** (3 runs). No horizontal scroll at 1440 or 375 on any page.

**Five real defects**, details in §3:

1. **Dashboard panels are visibly unstyled.** The rows built by script (Hero carousel, Section status, Catalogue summary, Recent edits) lose their CSS, so they read "Saved5 / 5", "Total4", "Expanding MindsHero slide" and the Recent edits rows render as inline underlined links with a stray icon on its own line. Cause confirmed (page-scoped CSS never reaches script-created nodes).
2. **Sidebar clips two nav links at 900px tall.** At 1440×900, **Contact** and **Legal pages** sit under the account card inside a scroll area with no scroll cue (fine at 1080px).
3. **Search dialog needs two Escape presses** once text has been typed (first press only clears the field).
4. **Dashboard grammar:** "0 published · 1 drafts".
5. **Site settings:** the Public email field is vertically offset from its neighbour (label gap and mis-aligned input).

**The dominant UX problem is volume and no preview, not styling.** Every editor is one long always-mounted form. The Homepage has **115 fields** (**80 hidden inside collapsed slide panels**); a single open hero slide is **1,500px tall at 1440** and **2,556px at 375**; the page is **10.4 phone-screens** long. Nothing on any page shows what the public result will look like.

**Content reality (what v2 must hold):** 4 catalogue titles, 1 news article (a leftover QA draft), 4 subjects, 5 hero slides (4 enabled, cap reached), 6 services, 5 process steps, 2 legal documents of 1.2–1.6k characters, 3 team blocks, 2 quality commitments, 7 project types. Longest single text: legal body ~1,630 chars; typical long copy 100–440 chars; most labels and titles under 45 chars.

## 3. Runtime defects (evidence)

| # | Severity | Where | What | Evidence |
|---|---|---|---|---|
| B1 | High (landing page) | Dashboard | Script-built rows have `display: block` or `inline` and no borders or min-height. `.summary-row`, `.section-status-row`, `.recent-edit` computed to block, block, inline, with zero Astro scope attributes. Page `<style>` is scoped and nodes made with `document.createElement` never receive the scope attribute. | `dashboard_1440.png`, `dashboard_375_fold.png`; computed-style probe |
| B2 | Medium | Shell, ≥1200 | At 900px height the nav scrolls (636px content in 528px) and hides Contact and Legal pages behind the account footer; no scroll indicator. At 1080px all links fit. | computed layout probe; every 1440 screenshot |
| B3 | Low | Search dialog | Escape with text typed clears the text and leaves the dialog open; second Escape closes. Empty query closes on one press. | keyboard probe |
| B4 | Low | Dashboard | Pluralisation: "1 drafts". | `dashboard_1440.png` |
| B5 | Low (UX) | Dashboard | Recent edits shows only the 6 latest records, and all 6 are hero slides and the homepage from the 11 Oct swap, so it says nothing about catalogue, news or other pages. | `dashboard_1440.png` |
| B6 | Low | Site settings | Public email input is offset below its label, unlike the neighbouring field. | `site-settings_1440_fold.png` |
| B7 | Info | Dashboard | The "Hero carousel" panel prints its own caveat ("Enabled is a configuration state…") inside the data rows, which then run together. Part of B1. | `dashboard_1440.png` |

Not defects (checked): the 5 "broken image" counts on Homepage, Catalogue and Site settings are hidden empty-state preview `<img src="">` elements; no real image failed.

**Verified working live** (previously blocked in ADMIN-4 for lack of a session): the label-in-name fixes (Open Site is named "Open Site (opens in a new tab)", search is named "Search pages…"); Ctrl+K opens search with focus in the field, filters, shows "No matching admin pages found." and restores focus to the trigger on close; rail collapse (240 to 72px), its `localStorage` persistence across reload, and tooltips on hover; the mobile drawer (focus lands on Close, scroll locked, 10 links, Escape restores focus to Menu, focus order cycles inside the drawer then wraps through the document, resize to desktop closes it and unlocks scroll); dashboard failure handling with 4 reads blocked client-side (4 alert cards, 4 inserted in total, Retry and Refresh keep focus). Not exercised: dirty-leave guard with real edits, delete-confirm dialog, upload errors, reorder.

## 4. Page by page

Density = full-page height ÷ viewport height (screens of scrolling). Fields = form controls in `<main>`.

### 4.1 Overview (`/admin/`)

- **Content shown:** 4 metric tiles (Catalogue 4, News 1, Subjects 4, Website content 17); Hero carousel panel (5/5 saved, 4 enabled, 1 disabled, homepage Published, autoplay On · 6 seconds); Section status (8 rows); Catalogue summary (total 4, primary 1, secondary 3, published 4, drafts 0, unclassified 0, publicly eligible 4); Quick actions (4 links); Recent edits (6).
- **Density:** 1.9 screens at 1440, 4.4 at 375 (tiles stack to one column; panels one column).
- **Pain points:** B1, B4, B5. The metrics are informative, but "Website content published 17" mixes pages, services and process steps. "Publicly eligible 4" sits beside a disclaimer, but all 4 covers have rights unapproved (§4.6), so the figure still reads as more than visitors actually see. No link from a metric to the filtered list it counts. "Refresh data" is the only control; no per-panel freshness.

### 4.2 Homepage (`/admin/homepage/`)

- **Content:** 5 hero slides (see below); homepage record: who-we-are copy 537 chars EN / 613 FR; "One partner" copy 64 / 86; 4 trust stats (value + EN/FR label); 4 featured catalogue titles; autoplay on, **6000 ms**; legacy hero image empty; who-we-are image empty.
- **Hero slides:** order 0 "Expanding Minds" (**disabled**, contact-first anchor, secondary CTA set), 1 "Expanding Minds" (enabled), 2 "Books for Cameroonian classrooms", 3 "Every Stage.", 4 "LoHo e-learning —". 4 of 5 have an image. Headlines median 15 chars, max 32 (FR max 41); subheadlines median 33, max 67; CTA labels ≤22 chars; eyebrow set on 3 slides; headline accent on 2.
- **Density:** 115 fields (68 text, 28 textarea, 11 checkbox, 7 file, 1 number), **5.0 screens at 1440, 10.4 at 375**. 80 fields sit inside the 5 collapsed `<details>`. One open slide = **1,500px (1440) / 2,556px (375)**.
- **Pain points:**
  - **Raw milliseconds:** "Time per slide (milliseconds)", a number box (3000–30000, step 500) with help text. The dashboard shows the same value as "6 seconds", so the two screens use different units.
  - **Collapsed slide list shows no thumbnails**: each row is "Slide N · headline · Enabled/Disabled · EN + FR". The 158×88 preview exists only inside the opened panel.
  - Slides 1 and 2 have identical headlines ("Expanding Minds"); the disabled legacy anchor occupies one of the 5 slots, and the **Add slide button is disabled** at the cap (a paragraph above explains "delete an existing slide").
  - **Two hero concepts coexist:** carousel slides, and a legacy single-hero block (hero image, required CTA labels) that only matters as a fallback. Required fields for an unused hero are confusing.
  - Eyebrow, headline, headline accent and subheadline are 4 separate bilingual fields with no preview of how they combine; the destination is a raw path ("/services") with no page picker.
  - **Save slide, Move up, Move down, Delete slide** sit in one row; the destructive action is adjacent to the primary. A slide save and the homepage save are separate buttons on one page. A notice warns that saving an enabled slide refreshes the live cache.
  - Featured titles are 4 checkboxes labelled by title and code, with no cover preview.

### 4.3 About us (`/admin/about/`)

- **Content:** heritage copy; purpose, vision, mission, values (each EN/FR, one sentence to short paragraph); **3 team-capacity blocks** (icon key, title EN/FR ≤29 chars, description EN/FR 108–154 chars, 3 tags each EN/FR).
- **Density:** 32 fields (16 textarea, 15 text), **3.8 screens / 8.0 on phone**.
- **Pain points:** Icon is a free-text key ("pen", "brush", "users") with no picker or preview; tags are stored as separate EN and FR lists (input format not inspected); no preview of the page's layout; all 16 textareas open at once with no grouping control beyond headings.

### 4.4 Services & process (`/admin/services/`)

- **Content:** 6 services (name EN median 10 chars, short description median 45–58, full description median 290 EN / 333 FR, max 439; categories editorial ×3, creative ×2, production ×1; icon keys pen, check, globe, layout, brush, print); 5 process steps (title ≤16, description ≤126), all published.
- **Density:** 17 form fields but 11 list items; **3.5 screens / 7.9 on phone**.
- **Pain points:** Every row carries two arrow buttons, **Edit** and a red **Delete**, so 4 controls × 11 rows; ordering is by up/down arrows only. Service and process editors both sit below their lists ("New service … Clear"), so editing means scrolling past the list. Icon, slug and category are raw technical fields. The FR name equals the EN name for Illustration.

### 4.5 Why choose us (`/admin/why-choose-us/`)

- **Content:** local-presence copy; **2 quality commitments**, each with eyebrow (≤47 chars), title lead + accent + title (3 fields ×2 languages), description 328–411 chars, tags (5 / 0), icon (empty on both).
- **Density:** 29 fields, **2.8 screens / 5.8 on phone**.
- **Pain points:** one repeat row holds about 13 bilingual inputs, which is the most fragmented editor (a title is split into lead, accent and title). Icon key empty; no preview of the accent styling the split produces.

### 4.6 Catalogue (`/admin/catalogue/`)

- **Content:** 4 titles, all published, all classification "Other developed", none featured, none with evidence fields filled; titles 42–45 chars, descriptions 80–126; levels: 3 secondary, 1 primary; all 4 have an uploaded cover (PNG), **all 4 have cover rights *not* approved**; **FR title and FR description are identical to EN for all 4**. Product codes look like LHC-PHYS-F2, labelled "ISBN / Product code".
- **Density:** list 3.0 screens at 1440 / 7.7 on phone. The editor is a **1,736px (1440) / 2,697px (375)** form mounted below the list at all times.
- **Pain points:**
  - **List shows no cover thumbnail and no description**, although every title has a cover; the cover appears only after opening the editor (a 90×120 preview).
  - Status column says "Published · Publicly eligible" for titles whose cover cannot be shown (rights unapproved) with no hint, so a visitor-facing gap is invisible in the list.
  - Five overlapping concepts: Published, Featured title (a checkbox here), homepage Featured (a separate selector on Homepage), classification, and "Cover and publication rights approved". The editor has to hold the whole combination in their head.
  - The classification section carries private evidence fields (reference, verified by, date) that apply only to National Book List; shown always.
  - Search plus 2 selects fill the first phone screen: the first record starts about 70% of the way down it and only its first fields fit. Edit and red Delete side by side on every row.
  - EN/FR duplication of identical text is not flagged anywhere.

### 4.7 Subjects (`/admin/subjects/`)

- **Content:** 4 subjects (Chemistry/Chimie, English/Anglais, Mathematics/Mathématiques, Physics/Physique), each with 1 assigned title.
- **Density:** the lightest page: 3 fields, **1.3 screens / 3.0 phone**. The editor is a 316px compact form.
- **Pain points:** minimal. I did not check whether the assigned-title count links through to the catalogue.

### 4.8 News & updates (`/admin/news/`)

- **Content:** **1 article, "QA disposable news qa-20260914-1125" (unpublished draft, 14 Sep, body 51 chars)**: a leftover test record in the production CMS. No hero image.
- **Density:** 13 fields, **2.4 screens / 4.4 phone**. The "New news article" editor is open by default under the list (1,432px).
- **Pain points:** body fields are plain 280px textareas with no formatting help or preview (Legal documents use a `##` heading convention, News does not say); **the page has no file input, although the record has an image field**; "Stated publication date" next to "Published" invites confusion (the helper says it does not schedule); category list and status filters take the first screen.

### 4.9 Contact (`/admin/contact/`)

- **Content:** hero copy EN/FR (~110 chars); map latitude and longitude **empty**; **7 project-type options** (EN ≤27 chars, FR ≤37).
- **Density:** 19 fields (16 required), **2.8 screens / 5.5 phone**.
- **Pain points:** raw latitude and longitude boxes with no format hint, validation range or map preview, and both are empty; one-line pointer text sends the user to Site settings for address and phone; project-type rows are 7 stacked mini-forms (EN + FR labels) and no reorder controls were seen.

### 4.10 Legal pages (`/admin/legal-pages/`)

- **Content:** Privacy Policy and Terms of Use, both published; bodies 1,220–1,465 chars EN, up to 1,632 FR; the stated "last updated" date is **empty on both**.
- **Density:** 8 fields (4 textarea, 2 date, 2 checkbox), **3.1 screens / 4.3 phone**.
- **Pain points:** the whole document is a ~280px textarea with the `##` markup convention explained only in the page subtitle; no preview of the rendered page; 1.4k characters scroll inside a small box; two independent forms with separate saves.

### 4.11 Site settings (`/admin/site-settings/`)

- **Content:** company name, tagline, footer tagline, newsletter copy (EN/FR); address, 2 phones, public email; parent-company URL; SEO title (28 chars) and description (61 chars); **social links: empty**; **OG image: empty**.
- **Density:** 16 fields, **2.3 screens / 4.3 phone**.
- **Pain points:** B6; no warning that saving changes the live global configuration appears on the first screen; none of the 16 fields has helper text, so the SEO description (61 chars) has no length guidance; no preview of footer, newsletter or search result; the empty OG image means shares fall back silently.

## 5. Cross-cutting patterns for v2

1. **One long always-open form per page.** No section navigation, no sticky save bar, no per-section save on most pages, no indication of what changed. Phone length is about 2–2.6× desktop.
2. **No previews anywhere:** not of hero slides, covers in lists, headline accent styling, Open Graph, or rendered legal text. "Open Site" is the only way out and is global, not per record.
3. **Lists are text-only tables** (catalogue, news, subjects, services): no thumbnails; Edit and a red Delete on every row; Edit opens an editor far below the list.
4. **Raw technical inputs exposed to editors:** milliseconds, slug, product code ("ISBN"), icon keys, destination paths, latitude/longitude, `##` markup.
5. **Overlapping publish/feature/eligibility states** (Published, Featured on catalogue, homepage featured, classification, cover rights) with no single status summary per title.
6. **Bilingual duplication:** side by side at 1440 (works well), stacked at 375 (doubles height). Identical EN and FR text goes unflagged (all 4 catalogue titles).
7. **Destructive actions sit beside primary actions** (hero slide row; every list row).
8. **Strengths worth keeping:** consistent "Required" markers and helper text; clear classification guidance in the catalogue; truthful state wording ("Enabled is a configuration state"); good keyboard shell (search, drawer, rail); fast data load.

## 6. Data hygiene noted in production

- Leftover QA article "QA disposable news qa-20260914-1125" (draft).
- 4 of 4 catalogue titles and descriptions have FR identical to EN.
- Disabled legacy hero slide "Expanding Minds" duplicates enabled slide 2's headline and uses 1 of 5 slots.
- Empty: social links, OG image, map coordinates, legal "last updated" dates, quality-commitment icons, news image, legacy hero image, who-we-are image.
- All 4 catalogue covers exist but none is cleared for public display.

## 7. Screenshot index (`tmp/admin-v1-audit/`, local only)

Per page and viewport: `<page>_1440.png` and `<page>_375.png` (full page), plus `_fold.png` (first screen). Pages: `dashboard`, `homepage`, `about`, `services`, `why-choose-us`, `catalogue`, `subjects`, `news`, `contact`, `legal-pages`, `site-settings`.
Interaction captures: `catalogue_editor_open_{1440,375}.png`, `news_editor_open_*.png`, `subjects_editor_open_*.png`, `homepage_slide_open_*.png`, `shell_drawer_375.png`, `dashboard_failure_injection_1440.png`.
