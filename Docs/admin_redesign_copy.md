# Longhorn Publishers Cameroon — Admin Panel IA Labels & Microcopy Specification

**Document Owner:** Marty (Lead Marketer & Brand Strategist, Gerer Build Studio)  
**Task Reference:** ADMIN-2 (`cb1d4fb3-4ff0-4d19-9e3e-be8908acece6`)  
**Companion Documents:** Design Spec by Z (`Docs/admin_redesign_spec.md`), Engineering Handoff to SoSo (`ADMIN-3`), QA Handoff to Dell (`ADMIN-4`)  
**Target Repository:** `/Users/esoefildine/Documents/myebstudios/Dev/LonghornPublishers-CM`  
**Target File:** `Docs/admin_redesign_copy.md`  
**Date:** 11 October 2026  
**Status:** Complete — Ready for Engineering & QA Implementation  

---

## 1. Editorial Strategy, Audience & Voice

The Longhorn Cameroon Admin Panel (`/admin/*`) is an internal editorial work desk utilized by administrative officers, curriculum editors, and commercial leadership at Longhorn Publishers Cameroon based in Tsinga, Yaoundé. It is **not** a public-facing portal or an e-commerce storefront.

### Core Principles for Administrative Microcopy

1. **Unambiguous Editorial Clarity:** Staff members make critical decisions regarding textbook catalogue listings, national educational curriculum verification, and bilingual corporate announcements. Copy must be concise, direct, and unambiguous.
2. **Strict Terminology Consistency:** Every operational concept has exactly one canonical term across buttons, tables, badges, dialogs, and toast notifications. Never alternate between "Publish" and "Make live", or "Save" and "Submit".
3. **Respect for Bilingual Workflow:** While administrative chrome, navigation, and validation messages are presented in English, the system governs strict English and French (`EN / FR`) content parity for Cameroon's dual official language standard. Labels and helper notes must reinforce bilingual completeness.
4. **Transparent System Truthfulness:** Administrative state copy reflects actual system realities. A book marked as "Published" in the database is only "Publicly eligible" if it holds verified national curriculum classification. Slide "Enabled" state is distinguished from homepage publication. Local development mode limitations are stated plainly without false assurances.

---

## 2. Canonical Editorial Glossary

Every team member (Z in UI design, SoSo in full-stack implementation, Dell in QA) must adhere to these canonical terms. No synonym substitution is permitted.

| Canonical Term | Part of Speech / Role | Definition in Longhorn CM Context | Prohibited / Deprecated Synonyms | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Publish** | Verb (Action) | Make an approved record or page accessible on the public website. | Make live, Go live, Release, Post | "Publish" is the industry standard for publishing houses and aligns with the database boolean flag `published`. |
| **Published** | Status Badge / State | Record has its `published` flag set to `true`. | Live, Active, Online, Visible | "Published" clearly denotes editorial sign-off. (For catalogue titles, visibility also requires curriculum eligibility). |
| **Draft** | Noun / Status Badge | Content saved in the database but withheld from the public website (`published === false`). | Offline, Inactive, Unpublished, Hidden | "Draft" is familiar to editorial teams and standard across CMS architectures. |
| **Save** | Verb (Action) | Persist pending form edits into the database. | Submit, Store, Commit, Update | "Save" is universally understood and safe. Form submit buttons use contextual nouns: "Save title", "Save homepage", "Save slide". |
| **Publicly eligible** | Qualitative State | A catalogue title that is both `published === true` AND carries verified curriculum classification (`national_book_list_verified` or `other_developed`). | Publicly visible, Live in shop, Approved | Protects commercial integrity: unclassified titles remain withheld from the public catalogue even if published. |
| **Pending classification** | Qualitative State | A catalogue title whose curriculum verification status is unclassified or awaiting official ministerial confirmation. | Unverified, Inactive, Disallowed | Objective, respectful description of a title awaiting curriculum alignment. |
| **Enabled** | State (Hero Slides) | A hero carousel slide toggled on for display in the active carousel loop (`enabled === true`). | Active, Live, On | Slides are configured within the homepage; "Enabled" distinguishes carousel rotation from overall homepage publication. |
| **Disabled** | State (Hero Slides) | A hero carousel slide retained in the database but excluded from carousel rotation (`enabled === false`). | Inactive, Off, Hidden | Clearly states rotation exclusion without implying record deletion. |
| **Configured** | Status Badge | A singleton configuration record (such as Site settings) exists in the database. | Complete, Active, Saved | Singletons have no draft/publish toggle; "Configured" indicates the record has been established. |
| **Not set up** | Status Badge | A singleton page or legal document that has no database row (`null`). | Missing, Empty, Draft, Unconfigured | Accurate representation that initial content has not yet been authored. |
| **Sign in** | Verb (Action) | Authenticate with Netlify Identity into the admin panel. | Log in, Login, Enter | Standard English noun/verb pairing: "Sign in" and "Sign out". |
| **Sign out** | Verb (Action) | End the current administrative session and clear authentication tokens. | Log out, Logout, Exit | Consistent with "Sign in". |
| **Delete** | Verb (Destructive) | Permanently destroy an existing record from the database (requires confirmation). | Remove, Trash, Erase | Reserved strictly for permanent, irreversible database row deletions. |
| **Remove** | Verb (Detachment) | Detach an in-memory row, file, uploaded image, or repeatable field block from a form before saving. | Delete, Discard, Drop | "Remove" indicates disassociating an asset or list item without necessarily destroying backend master files. |
| **Discard** | Verb (Form State) | Abandon unsaved edits on a form and revert to previous database state. | Cancel, Clear, Revert | Accurately describes relinquishing unpersisted input changes. |
| **Clear filters** | Verb (Action) | Reset all search query inputs and dropdown filters in a list view back to default. | Reset filters, Reset search | "Clear filters" is the conventional SaaS pattern for search toolbars. |
| **Catalogue** | Noun | The complete collection of published and curriculum-aligned educational titles. | Catalog, Products, Store, Books | Mandatory British/Cameroon official spelling ("Catalogue"). |
| **Curriculum subjects** | Noun | The academic taxonomy categories recognized by MINEDUB and MINESEC. | Categories, Genres, Tags, Disciplines | Accurate Cameroonian pedagogical designation. |

---

## 3. Information Architecture & Navigation

### 3.1 Sidebar Branding & Workspace Indicator

| Component Key | UI Element | Copy / Text | Accessibility & Context Notes |
| :--- | :--- | :--- | :--- |
| `nav.brand_logo` | Brand Logo Link | **Longhorn Publishers Cameroon** | Links to `/admin/`. `alt="Longhorn Publishers Cameroon"`. |
| `nav.workspace_tag` | Workspace Subtitle | **Content Administration** | Static workspace descriptor beneath logo. |
| `nav.collapse_button` | Collapse Sidebar Toggle | **Collapse navigation** / **Expand navigation** | `aria-label` dynamically toggles based on sidebar state (`expanded` vs `collapsed`). |

### 3.2 Global Search Affordance (⌘K / Ctrl+K)

| Component Key | UI Element | Copy / Text | Accessibility & Context Notes |
| :--- | :--- | :--- | :--- |
| `nav.search_trigger` | Sidebar Search Button | **Search pages…** | Styled as an input field with visual shortcut badge `⌘K` (macOS) or `Ctrl+K`. |
| `search.modal_title` | Modal Heading | **Search admin pages** | `<h2>` within `<dialog>`, visually associated with search input. |
| `search.input_placeholder` | Input Placeholder | **Type a page name or section…** | Search input placeholder. `aria-label="Search admin pages"`. |
| `search.group_website` | Result Group Label | **Website** | Section grouping in search results modal. |
| `search.group_content` | Result Group Label | **Content** | Section grouping in search results modal. |
| `search.group_settings` | Result Group Label | **Settings** | Section grouping in search results modal. |
| `search.no_results` | Empty Search State | **No matching admin pages found.** | Announced to screen readers when query yields zero matches. |

### 3.3 Navigation Groups & Registry

The navigation structure groups items into four logical, predictable clusters:

```
┌──────────────────────────────────────────────┐
│                  WORKSPACE                   │
│  ◈ Overview                     (/admin/)    │
├──────────────────────────────────────────────┤
│                   WEBSITE                    │
│  ⌂ Homepage            (/admin/homepage/)    │
│  ◎ About us               (/admin/about/)    │
│  ▦ Services & process  (/admin/services/)    │
│  ✓ Why choose us  (/admin/why-choose-us/)    │
├──────────────────────────────────────────────┤
│                   CONTENT                    │
│  ▤ Catalogue          (/admin/catalogue/)    │
│  ❖ Subjects            (/admin/subjects/)    │
│  ✦ News & updates          (/admin/news/)    │
├──────────────────────────────────────────────┤
│                   SETTINGS                   │
│  ☎ Contact              (/admin/contact/)    │
│  § Legal pages      (/admin/legal-pages/)    │
├──────────────────────────────────────────────┤
│             ACCOUNT FOOTER (PINNED)          │
│  ⚙ Site settings   (/admin/site-settings/)   │
│  ↳ Sign out                  (Action)        │
└──────────────────────────────────────────────┘
```

#### Detailed Item Specifications:

| Group Key | Group Heading | Item Key | Item Label | Destination Route | Section ID | Icon Key | Tooltip (Rail Mode) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `nav_group.workspace` | *Workspace* | `nav.overview` | **Overview** | `/admin/` | `dashboard` | `layout-dashboard` | Overview dashboard |
| `nav_group.website` | **Website** | `nav.homepage` | **Homepage** | `/admin/homepage/` | `homepage` | `house` | Homepage & hero slides |
| `nav_group.website` | **Website** | `nav.about` | **About us** | `/admin/about/` | `about` | `building-2` | About us & team |
| `nav_group.website` | **Website** | `nav.services` | **Services & process** | `/admin/services/` | `services` | `layers` | Publishing services & process |
| `nav_group.website` | **Website** | `nav.why` | **Why choose us** | `/admin/why-choose-us/` | `why` | `badge-check` | Why choose us & quality |
| `nav_group.content` | **Content** | `nav.catalogue` | **Catalogue** | `/admin/catalogue/` | `catalogue` | `book-open` | Educational catalogue titles |
| `nav_group.content` | **Content** | `nav.subjects` | **Subjects** | `/admin/subjects/` | `subjects` | `tags` | Curriculum subjects taxonomy |
| `nav_group.content` | **Content** | `nav.news` | **News & updates** | `/admin/news/` | `news` | `newspaper` | News, releases & press |
| `nav_group.settings` | **Settings** | `nav.contact` | **Contact** | `/admin/contact/` | `contact` | `map-pin` | Contact page & coordinates |
| `nav_group.settings` | **Settings** | `nav.legal` | **Legal pages** | `/admin/legal-pages/` | `legal` | `file-text` | Privacy Policy & Terms of Use |
| `nav_group.account` | *Account* | `nav.site_settings`| **Site settings** | `/admin/site-settings/`| `settings` | `settings` | Global site settings & SEO |
| `nav_group.account` | *Account* | `nav.sign_out` | **Sign out** | *(Logout handler)* | — | `log-out` | Sign out of admin |

### 3.4 Pinned Account Footer

| Component Key | UI Element | Copy / Text | Notes |
| :--- | :--- | :--- | :--- |
| `account.avatar_alt` | User Avatar | **LP** / Initial letter | Visual neutral avatar pill. |
| `account.user_fallback` | Account Email Fallback | **Administrator** | Rendered when Netlify Identity email is unresolved. |
| `account.settings_link` | Account Settings Row | **Site settings** | Pinned 44px link in account card footer. |
| `account.sign_out_button`| Sign Out Trigger | **Sign out** | Secondary 44px button in account card footer. |
| `account.sign_out_progress`| In-Progress State | **Signing out…** | Button state while session is being invalidated. |

### 3.5 Top Header & Breadcrumbs

| Component Key | UI Element | Copy / Text | Notes |
| :--- | :--- | :--- | :--- |
| `header.breadcrumb_root` | Breadcrumb Root | **Content management** | Shared prefix for all admin pages. |
| `header.breadcrumb_separator`| Visual Separator | **/** | Slash delimiter between root and page. |
| `header.open_site_button` | Open Site Pill | **Open Site ↗** | Prominent black pill button. Opens `/en/` in a new browser tab. |
| `header.open_site_aria` | Screen Reader Label | **Open public website in a new tab** | Explicit accessible name for `header.open_site_button`. |
| `header.mobile_menu_open` | Mobile Menu Hamburger | **Open menu** | Target size ≥ 44×44 px. |
| `header.mobile_menu_close`| Mobile Drawer Close | **Close menu** | Accessible name for close button inside drawer. |

---

## 4. Overview Dashboard (`/admin/`)

The dashboard greeting and stat cards adapt the reference SaaS aesthetic into a focused, publication-grade editorial overview.

### 4.1 Page Header & Greeting

| Component Key | UI Element | Copy / Text | Notes |
| :--- | :--- | :--- | :--- |
| `dashboard.heading_default` | Page Title (Fallback) | **Hello, Administrator** | Shown when individual staff member name is unavailable. |
| `dashboard.heading_named` | Page Title (Personalized)| **Hello, {First Name}** | Injected if Identity profile name is resolved. |
| `dashboard.subtitle` | Page Subtitle | **Review your publication status, hero features, and recent editorial edits.** | Clear editorial orientation. |
| `dashboard.refresh_button` | Data Refresh Button | **Refresh data** | Reissues authenticated API reads. |
| `dashboard.refreshing` | In-Progress Button Text | **Updating…** | Disabled state while reads are settling. |
| `dashboard.last_updated` | Fetch Timestamp Caption | **Last updated: {time}** | Formatted in local browser time (`en-GB`). |

### 4.2 Content Overview Stat Cards (2×2 Primary Grid)

```
┌───────────────────────────────────┬───────────────────────────────────┐
│ Catalogue titles                  │ News articles                     │
│ 14                                │ 8                                 │
│ 12 published · 2 drafts           │ 6 published · 2 drafts            │
├───────────────────────────────────┼───────────────────────────────────┤
│ Curriculum subjects               │ Website content published         │
│ 9                                 │ 19                                │
│ 0 without assigned titles         │ 16 published · 3 drafts · 0 not   │
│                                   │   set up                          │
└───────────────────────────────────┴───────────────────────────────────┘
```

| Component Key | Card Role | Card Title | Metric Figure | Helper Line / Subtext | Error / Unavailable State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `dashboard.stat_catalogue` | Primary Metric | **Catalogue titles** | `{total}` | `{published} published · {drafts} drafts` | **—** *(Unable to load catalogue)* |
| `dashboard.stat_news` | Primary Metric | **News articles** | `{total}` | `{published} published · {drafts} drafts` | **—** *(Unable to load news)* |
| `dashboard.stat_subjects` | Primary Metric | **Curriculum subjects** | `{total}` | `{count} without assigned titles` | **—** *(Unable to load subjects)* |
| `dashboard.stat_website` | Primary Metric | **Website content published** | `{total_published}` | `{published} published · {drafts} drafts · {not_set_up} not set up` | **—** *(Unable to load website summary)* |
| `dashboard.stat_website_note`| Footnote Caption | — | — | **Includes pages, services, process steps, and legal documents.** | Footnote explaining aggregation scope. |

### 4.3 Section Status Panel (Primary Column Main Panel)

Replaces the reference commerce revenue chart with an authoritative editorial status inventory.

| Component Key | UI Element | Copy / Text |
| :--- | :--- | :--- |
| `dashboard.sections_title` | Panel Title | **Website sections** |
| `dashboard.sections_subtitle` | Panel Subtitle | **Publication readiness across core public pages and structured collections.** |
| `dashboard.th_section` | Table Column Header | **Section** |
| `dashboard.th_status` | Table Column Header | **Status** |
| `dashboard.th_items` | Table Column Header | **Items** |
| `dashboard.th_action` | Table Column Header | **Action** |

#### Section Status Row Labels & Badges:

| Section Row Key | Section Display Name | Published Badge | Draft Badge | Not Set Up Badge | Configured Badge | Action Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `row.homepage` | **Homepage** | **Published** | **Draft** | **Not set up** | — | `Edit homepage →` |
| `row.about` | **About us** | **Published** | **Draft** | **Not set up** | — | `Edit about →` |
| `row.services` | **Services** | **{N} published** | **{D} drafts** | **No items** | — | `Manage services →` |
| `row.process` | **Process steps** | **{N} published** | **{D} drafts** | **No items** | — | `Manage process →` |
| `row.why` | **Why choose us** | **Published** | **Draft** | **Not set up** | — | `Edit why us →` |
| `row.contact` | **Contact** | **Published** | **Draft** | **Not set up** | — | `Edit contact →` |
| `row.legal_privacy` | **Privacy Policy** | **Published** | **Draft** | **Not set up** | — | `Edit legal →` |
| `row.legal_terms` | **Terms of Use** | **Published** | **Draft** | **Not set up** | — | `Edit legal →` |
| `row.settings` | **Site settings** | — *(Not applicable)*| — *(Not applicable)*| **Not set up** | **Configured** | `Edit settings →` |

### 4.4 Right Rail Panels

#### Card 1: Hero Carousel Summary

| Component Key | UI Element | Copy / Text | Notes |
| :--- | :--- | :--- | :--- |
| `hero_card.title` | Card Heading | **Hero carousel** | Replaces "Shop Advisor" in reference. |
| `hero_card.action_link` | Trailing Link | **Manage slides →** | Links to `/admin/homepage/#hero-slides`. |
| `hero_card.slide_counts` | Saved Ratio Metric | **{N} / 5 slides saved** | Maximum of 5 slides allowed in carousel. |
| `hero_card.enabled_sub` | Active Ratio Subtext | **{E} enabled · {D} disabled** | Operational carousel breakdown. |
| `hero_card.autoplay_on` | Autoplay Status (On) | **Autoplay: On ({interval}s)** | E.g. `Autoplay: On (6s)`. |
| `hero_card.autoplay_off` | Autoplay Status (Off)| **Autoplay: Off** | Manual transition only. |
| `hero_card.legacy_fallback` | Attention Alert | **Legacy hero fallback in use** | Displayed when 0 slides exist (`N === 0`). |
| `hero_card.no_enabled` | Warning Alert | **No enabled slides** | Displayed when slides exist but all are disabled (`E === 0`). Legacy hero shows. |
| `hero_card.homepage_note` | Dependency Note | **Homepage must be Published for enabled slides to be public.** | Contextual reassurance for staff. |

#### Card 2: Catalogue Summary

| Component Key | UI Element | Copy / Text | Notes |
| :--- | :--- | :--- | :--- |
| `catalogue_card.title` | Card Heading | **Catalogue summary** | Replaces "Products" in reference. |
| `catalogue_card.action_link`| Trailing Link | **View catalogue →** | Links to `/admin/catalogue/`. |
| `catalogue_card.row_total` | Summary Row | **Total titles** | Overall record count in catalogue. |
| `catalogue_card.row_primary`| Summary Row | **Primary education** | Titles matching level `primary`. |
| `catalogue_card.row_secondary`| Summary Row | **Secondary education**| Titles matching level `secondary`. |
| `catalogue_card.row_teacher`| Summary Row | **Teacher’s guides** | Titles matching level `teacher_guide`. |
| `catalogue_card.row_eligible`| Status Row | **Publicly eligible** | `published === true` AND curriculum verified. |
| `catalogue_card.row_pending`| Status Row | **Pending classification** | Unclassified titles awaiting curriculum review. |
| `catalogue_card.row_drafts`| Status Row | **Draft titles** | `published === false`. |

#### Card 3: Quick Actions

| Component Key | UI Element | Copy / Text | Target Destination |
| :--- | :--- | :--- | :--- |
| `actions_card.title` | Card Heading | **Quick actions** | Right rail container. |
| `action.catalogue` | Action Row Button | **Edit catalogue →** | `/admin/catalogue/#editor` |
| `action.news` | Action Row Button | **Edit news →** | `/admin/news/#editor` |
| `action.slides` | Action Row Button | **Manage slides →** | `/admin/homepage/#hero-slides` |
| `action.settings` | Action Row Button | **Site settings →** | `/admin/site-settings/` |

### 4.5 Recent Edits Panel (Bottom Primary Column)

Replaces "Recent Activities" in reference. Reuses existing `updated_at` records across all 11 content models.

| Component Key | UI Element | Copy / Text | Notes |
| :--- | :--- | :--- | :--- |
| `recent_edits.title` | Panel Heading | **Recent edits** | Panel title. |
| `recent_edits.subtitle` | Panel Subtitle | **Latest saved records across publication desks.** | Clear orientation. |
| `recent_edits.disclaimer` | Footer Caption | **Latest saved records; not an audit activity log.** | Legal and technical precision. |
| `recent_edits.partial_err` | Warning Banner | **Some sections could not be loaded.** | Shown if 1+ endpoints fail. |
| `recent_edits.empty` | Empty State | **No recent edits available.** | Shown if all tables return empty or no edits exist. |
| `badge.published` | Row Status Badge | **Published** | Green pill badge (`#166534`). |
| `badge.draft` | Row Status Badge | **Draft** | Neutral/Muted badge (`#52525B`). |
| `badge.enabled` | Row Status Badge | **Enabled** | Green pill badge (for hero slides). |
| `badge.disabled` | Row Status Badge | **Disabled** | Muted badge (for hero slides). |
| `badge.configured` | Row Status Badge | **Configured** | Neutral badge (for site settings). |

---

## 5. Empty States Specification (Per Section)

Every empty state includes a 20px line icon, a clear heading (`<h3>`), explanatory body copy, and a single primary action button.

```
┌──────────────────────────────────────────────┐
│                     [icon]                   │
│          No Catalogue Titles Found           │
│  No catalogue entries match your current     │
│  search filters. Try clearing your filters.  │
│                                              │
│               [Clear Filters]                │
└──────────────────────────────────────────────┘
```

### 5.1 Empty State Inventory

| Section | State Context | Heading Key / Text | Body Copy Key / Text | Primary CTA Label | CTA Action / Destination |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Catalogue** | Zero records in database | `empty.catalogue_zero.title`<br>**No catalogue titles yet** | `empty.catalogue_zero.body`<br>Get started by adding your first bilingual educational title to the Longhorn Cameroon catalogue. | **+ Create First Title** | Clears form & scrolls to `#editor` |
| **Catalogue** | Filter / search yields 0 | `empty.catalogue_filtered.title`<br>**No matching titles found** | `empty.catalogue_filtered.body`<br>No publication titles match your current search terms or filters. Try adjusting or clearing your filters. | **Clear filters** | Resets search, level, and status dropdowns |
| **News** | Zero records in database | `empty.news_zero.title`<br>**No news articles yet** | `empty.news_zero.body`<br>Create your first bilingual press release, partnership announcement, or title release. | **+ Create First Article** | Clears form & scrolls to `#editor` |
| **News** | Filter / search yields 0 | `empty.news_filtered.title`<br>**No matching articles found** | `empty.news_filtered.body`<br>No news articles match your current category or status filters. Try clearing your search parameters. | **Clear filters** | Resets search, category, and status filters |
| **Subjects** | Zero records in database | `empty.subjects_zero.title`<br>**No curriculum subjects yet** | `empty.subjects_zero.body`<br>Add your first educational subject to establish the curriculum taxonomy for Cameroon schools. | **+ Create First Subject** | Focuses English subject name field |
| **Subjects** | Search yields 0 | `empty.subjects_filtered.title`<br>**No matching subjects found** | `empty.subjects_filtered.body`<br>No curriculum subjects match your search query. Try clearing your search input. | **Clear search** | Resets subject search filter |
| **Homepage** | Zero hero slides saved | `empty.hero_slides.title`<br>**No carousel slides yet** | `empty.hero_slides.body`<br>Add the first bilingual hero slide. The legacy hero banner remains visible on the homepage until an enabled slide is saved. | **+ Add First Slide** | Opens initial slide editor form |
| **Services** | Zero services saved | `empty.services.title`<br>**No services added yet** | `empty.services.body`<br>Publishing services outline Longhorn Cameroon’s B2B offerings (editorial, creative, production). Add your first service. | **+ Add Service** | Focuses service editor form |
| **Services** | Zero process steps saved | `empty.process.title`<br>**No process steps added yet** | `empty.process.body`<br>Process steps explain the publishing workflow to authors and institutional partners. Add the first step. | **+ Add Step** | Focuses process step editor form |
| **Why Choose Us** | Zero commitments saved | `empty.why_commitments.title`<br>**No quality commitments yet** | `empty.why_commitments.body`<br>Highlight Longhorn Cameroon’s core institutional pillars and quality standards for partners and educators. | **+ Add Commitment** | Appends new commitment repeat row |
| **About Us** | Zero team blocks saved | `empty.about_blocks.title`<br>**No team capacity blocks yet** | `empty.about_blocks.body`<br>Document your editorial, production, and distribution capacity in Yaoundé. | **+ Add Capacity Block** | Appends new team capacity repeat row |
| **Contact** | Zero project types saved | `empty.contact_types.title`<br>**No project types defined yet**| `empty.contact_types.body`<br>Define inquiry categories for the public contact form (e.g. Manuscript Submission, Book Supply, Partnership). | **+ Add Project Type** | Appends new project type repeat row |
| **Site Settings**| Zero social links saved | `empty.social_links.title`<br>**No social media links yet** | `empty.social_links.body`<br>Add official corporate profiles (LinkedIn, Facebook, X) for the website footer. | **+ Add Social Link** | Appends new social media repeat row |
| **Legal Pages** | Singleton row missing | `empty.legal_row.title`<br>**Legal content not initialized** | `empty.legal_row.body`<br>No database record exists for this policy. Provide complete English and French text below to publish this document. | *(Editor Form Mounted)* | Editor fields remain mounted below |

### 5.2 Image & Asset Picker Empty States

| Media Surface | Aspect / Constraints | Empty Placeholder Copy | Action Trigger Copy | Change / Clear Action Copy |
| :--- | :--- | :--- | :--- | :--- |
| **Book Cover Art** | 3:4 portrait (JPEG/PNG/WebP, max 8 MB) | **No cover image selected**<br><small>3:4 portrait art recommended. Appears in catalogue and detail views.</small> | **Choose cover image** | **Replace cover image** / **Remove image** |
| **Hero Slide Background** | 16:9 widescreen (1920×1080 px, max 8 MB) | **No slide image selected**<br><small>The standard brand hero background will be used until an image is attached.</small> | **Choose slide image** | **Replace slide image** / **Remove image** |
| **Open Graph (OG) Image** | 1200×630 px (max 8 MB) | **No social preview image selected**<br><small>The default Longhorn Cameroon social card will be displayed when links are shared.</small> | **Choose preview image** | **Replace preview image** / **Remove image** |

---

## 6. Action Confirmations & Dialogs

All confirmation prompts utilize an accessible in-page `<dialog>` component, replacing native browser alerts.

```
┌──────────────────────────────────────────────┐
│  Delete “Mathematics for Secondary Schools”? │
│                                              │
│  This title will be permanently removed from │
│  the catalogue. This action cannot be undone.│
│                                              │
│               [Cancel]   [Delete Title]      │
└──────────────────────────────────────────────┘
```

### 6.1 Confirmation Copy Inventory

| Scenario / Trigger | Dialog Title Key / Text | Dialog Message Body Key / Text | Cancel Button Label | Confirm Button Label | Danger Tone? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Unsaved Navigation Guard** *(In-app link click)* | `confirm.dirty_nav.title`<br>**Unsaved changes** | `confirm.dirty_nav.body`<br>You have unsaved changes on this page. Leaving now will discard your edits. Continue? | **Keep editing** | **Leave page** | Yes (Destructive) |
| **Unsaved Reorder Guard** *(Moving slides or list rows)*| `confirm.dirty_reorder.title`<br>**Unsaved changes** | `confirm.dirty_reorder.body`<br>Unsaved edits in this item will be discarded before reordering. Discard and reorder? | **Keep editing** | **Discard and reorder**| Yes |
| **Cross-Slide Save Guard** *(Saving another slide)* | `confirm.slide_conflict.title`<br>**Unsaved slide changes** | `confirm.slide_conflict.body`<br>Saving this slide will discard unsaved edits currently pending in another slide. Continue? | **Keep editing** | **Save and discard other**| Yes |
| **Clear / Reset Form Guard** *(Clear editor button)* | `confirm.reset_form.title`<br>**Discard form edits** | `confirm.reset_form.body`<br>Are you sure you want to discard your unsaved changes and reset this form? | **Keep editing** | **Discard changes** | Yes |
| **Delete Catalogue Title** | `confirm.delete_title.title`<br>**Delete publication title?** | `confirm.delete_title.body`<br>Delete “**{Title}**”? This publication title will be permanently removed from the catalogue. This action cannot be undone. | **Cancel** | **Delete title** | Yes (Red button) |
| **Delete News Article** | `confirm.delete_news.title`<br>**Delete news article?** | `confirm.delete_news.body`<br>Delete “**{Headline}**”? This article will be permanently removed from news and updates. This action cannot be undone. | **Cancel** | **Delete article** | Yes (Red button) |
| **Delete Curriculum Subject** | `confirm.delete_subject.title`<br>**Delete curriculum subject?** | `confirm.delete_subject.body`<br>Delete “**{Subject Name}**”? This subject will be permanently removed. (Cannot delete if titles are currently assigned). | **Cancel** | **Delete subject** | Yes (Red button) |
| **Delete Hero Slide** | `confirm.delete_slide.title`<br>**Delete hero slide?** | `confirm.delete_slide.body`<br>Delete “**{Headline / Slide Number}**”? This slide will be permanently removed from the carousel rotation. | **Cancel** | **Delete slide** | Yes (Red button) |
| **Delete Publishing Service**| `confirm.delete_service.title`<br>**Delete publishing service?**| `confirm.delete_service.body`<br>Delete “**{Service Name}**”? This service offering will be permanently removed from the public website. | **Cancel** | **Delete service** | Yes (Red button) |
| **Delete Process Step** | `confirm.delete_process.title`<br>**Delete process step?** | `confirm.delete_process.body`<br>Delete “**{Step Title}**”? This process step will be permanently removed from the workflow sequence. | **Cancel** | **Delete step** | Yes (Red button) |
| **Remove Repeatable Row** | `confirm.remove_row.title`<br>**Remove item?** | `confirm.remove_row.body`<br>Remove this item from the list? Save the form to apply this change to the website. | **Cancel** | **Remove** | No (Neutral) |
| **Remove Attached Media** | `confirm.remove_media.title`<br>**Remove attached image?** | `confirm.remove_media.body`<br>Detach this image from the record? Save the form to apply this change. | **Cancel** | **Remove image** | No (Neutral) |

---

## 7. Toasts, Alerts & Inline Feedback

### 7.1 In-Progress / Processing Feedback

| Action In Flight | Message Key | Microcopy |
| :--- | :--- | :--- |
| **Saving Form** | `status.saving` | **Saving changes…** |
| **Saving Specific Record** | `status.saving_named` | **Saving {item}…** *(e.g. "Saving catalogue title…")* |
| **Uploading Media** | `status.uploading` | **Uploading image…** |
| **Deleting Record** | `status.deleting` | **Deleting {item}…** |
| **Reordering Items** | `status.reordering` | **Updating display order…** |
| **Checking Credentials** | `status.authenticating` | **Checking administrator credentials…** |
| **Terminating Session** | `status.signing_out` | **Signing out…** |

### 7.2 Success Notifications (Inline & Toast)

Success toasts appear bottom-right (max-width 360px), auto-dismissing after 5 seconds while persistent inline text confirms the state.

| Event | Toast / Status Key | Microcopy | Notes |
| :--- | :--- | :--- | :--- |
| **Draft Saved** | `toast.save_draft` | **Draft saved. Changes are stored in the database and not visible on the live site.** | Clear statement of unlisted draft state. |
| **Page / Content Published** | `toast.save_published` | **{Section} published successfully. The live site cache will refresh shortly.** | E.g. *"Homepage published successfully."* |
| **Catalogue Title Published** | `toast.title_published` | **Catalogue title published. Public display requires verified curriculum classification.** | Vital reminder of eligibility criteria. |
| **Record Deleted** | `toast.deleted` | **{Item} deleted successfully.** | E.g. *"Catalogue title deleted successfully."* |
| **Hero Slide Deleted** | `toast.slide_deleted` | **Hero slide deleted. Carousel rotation updated.** | Unused uploaded blob queued for hygiene sweep. |
| **Order Saved** | `toast.reorder_success`| **Display order updated successfully.** | Confirms reorder persistence. |
| **Image Uploaded** | `toast.upload_success` | **Image uploaded and attached. Save the record to keep this change.** | Reminds editor that form must be saved. |
| **Image Removed** | `toast.remove_image` | **Image removed. Save the record to apply this change.** | Form save required. |

### 7.3 Error Notifications & Validation Alerts

Errors are persistent and **never** auto-dismiss until resolved.

| Failure Condition | Error Key | Microcopy | Remediation Guidance |
| :--- | :--- | :--- | :--- |
| **Missing Required Fields** | `err.required_fields` | **Please complete all highlighted required fields before saving.** | Red border + field focus on submission. |
| **Language Parity Gap** | `err.bilingual_parity` | **Both English and French content are required to maintain bilingual parity.** | Mandatory standard in Cameroon. |
| **Subject Deletion Blocked** | `err.subject_has_titles`| **Cannot delete subject: {count} catalogue titles are currently assigned to this subject. Reassign or remove those titles first.** | Prevents foreign key reference breaks. |
| **Duplicate Product Code** | `err.duplicate_code` | **A title with product code “{code}” already exists. Please assign a unique code.** | Prevents unique constraint collisions. |
| **Invalid Image Type** | `err.invalid_media_type`| **Invalid file format. Please choose a JPEG, PNG, or WebP image.** | Client-side check before upload. |
| **Oversized Image File** | `err.media_oversized` | **File exceeds the 8 MB size limit. Please compress or select a smaller image.** | Enforced by Netlify media handler. |
| **Autoplay Interval Out of Range**| `err.autoplay_range` | **Autoplay interval must be between 3,000 ms and 30,000 ms.** | Prevents disorienting rapid rotation. |
| **Featured Titles Cap Exceeded**| `err.featured_cap` | **Select no more than 4 featured catalogue titles for the homepage.** | Keeps homepage featured grid balanced. |
| **Network Failure (Status 0)**| `err.network` | **Network connection lost. Check your internet connection and try again.** | Clear, non-technical network error. |
| **Session Expired (401)** | `err.session_expired` | **Your session has expired. Sign in again to continue.** | Auth token renewal required. |
| **Unauthorized Access (403)** | `err.forbidden` | **Your account does not have administrator permissions.** | Role check feedback. |
| **Record Not Found (404)** | `err.not_found` | **That item no longer exists. The list has been refreshed.** | Graceful resolution of concurrent deletion. |
| **Server Error (500+)** | `err.server_error` | **The server could not complete that request. Please try again shortly.** | Standard server fallback. |
| **Password Mismatch** | `err.password_mismatch` | **Passwords do not match. Please re-enter your password.** | Form validation check. |
| **Password Length Error** | `err.password_length` | **Password must be at least 8 characters long.** | Enforces Netlify Identity minimum. |

---

## 8. Local Development Notice Banner

Shown exclusively when `import.meta.env.DEV` is `true`.

```
┌────────────────────────────────────────────────────────────────────────┐
│  ⓘ  Local development mode                                      [ ✕ ] │
│  Netlify Identity does not run in the local development server.        │
│  The local database and public CMS APIs remain active. Test admin      │
│  sign-in, user roles, and protected publishing on a Netlify deploy     │
│  preview.                                                              │
└────────────────────────────────────────────────────────────────────────┘
```

| Component Key | UI Element | Copy / Text |
| :--- | :--- | :--- |
| `dev_notice.heading` | Banner Heading | **Local development mode** |
| `dev_notice.message` | Banner Body | **Netlify Identity does not run in the local development server. The local database and public CMS APIs remain active. Test admin sign-in, user roles, and protected publishing on a Netlify deploy preview.** |
| `dev_notice.dismiss_btn` | Dismiss Action | **Dismiss notice** *(Accessible label for the `✕` close button)* |
| `dev_notice.footer_badge` | Pinned Footer Label | **Local development environment** *(Persists in the sidebar footer even when banner is dismissed)* |

---

## 9. Authentication & Identity Screens (`/admin/login/`)

The redesign streamlines all four authentication flows into a centered, distraction-free white card on a subtle grey canvas, eliminating the decorative quote aside in favor of clean brand focus.

### 9.1 Shared Authentication Card Header

| Component Key | UI Element | Copy / Text |
| :--- | :--- | :--- |
| `auth.brand_title` | Corporate Name | **Longhorn Publishers Cameroon** |
| `auth.brand_subtitle`| Desk Name | **Content Administration Desk** |

### 9.2 View 1: Standard Sign In (Default)

| Component Key | UI Element | Copy / Text |
| :--- | :--- | :--- |
| `auth.signin_title` | Card Heading | **Sign in to Admin** |
| `auth.signin_subtitle` | Subtitle | **Enter your credentials to manage Longhorn Cameroon’s bilingual catalogue and website content.** |
| `auth.email_label` | Field Label | **Email address** |
| `auth.email_placeholder`| Placeholder | `admin@longhorn.cm` |
| `auth.password_label` | Field Label | **Password** |
| `auth.password_placeholder`| Placeholder | `••••••••` |
| `auth.submit_signin` | Primary Submit Button | **Sign in →** |
| `auth.forgot_password` | Secondary Link Button | **Forgot your password?** |
| `auth.err_unauthorized` | Auth Failure Message | **Invalid email or password.** |

### 9.3 View 2: Password Recovery Request

| Component Key | UI Element | Copy / Text |
| :--- | :--- | :--- |
| `auth.recovery_title` | Card Heading | **Recover your account** |
| `auth.recovery_subtitle` | Subtitle | **Enter your administrator email and we will send a secure password reset link.** |
| `auth.recovery_email_label`| Field Label | **Administrator email** |
| `auth.recovery_email_placeholder`| Placeholder | `admin@longhorn.cm` |
| `auth.submit_recovery` | Primary Submit Button | **Send recovery link →** |
| `auth.back_to_signin` | Secondary Back Button | **Back to sign in** |
| `auth.recovery_sent_notice`| Confirmation Message | **If that administrator account exists, a recovery link has been sent to your inbox.** |
| `auth.err_recovery_failed`| Error Message | **Unable to request account recovery. Please try again shortly.** |

### 9.4 View 3: Set New Password (Reset Token Flow)

| Component Key | UI Element | Copy / Text |
| :--- | :--- | :--- |
| `auth.reset_title` | Card Heading | **Set a new password** |
| `auth.reset_subtitle` | Subtitle | **Choose a strong password for your administrator account (minimum 8 characters).** |
| `auth.new_password_label` | Field Label | **New password** |
| `auth.confirm_password_label`| Field Label | **Confirm new password** |
| `auth.submit_reset` | Primary Submit Button | **Set new password →** |
| `auth.token_expired_recovery`| Token Error Message | **This password recovery link has expired or was already used. Request a new link below.** |

### 9.5 View 4: Account Activation (Invite Token Flow)

| Component Key | UI Element | Copy / Text |
| :--- | :--- | :--- |
| `auth.activate_title` | Card Heading | **Activate administrator account** |
| `auth.activate_subtitle` | Subtitle | **Create a password to finish accepting your invitation to Longhorn Cameroon.** |
| `auth.create_password_label`| Field Label | **Create password** |
| `auth.confirm_create_label`| Field Label | **Confirm password** |
| `auth.submit_activate` | Primary Submit Button | **Activate administrator account →** |
| `auth.token_expired_invite` | Token Error Message | **This invitation link is invalid or has expired. Please request a new invitation from your administrator.** |
| `auth.err_no_admin_role` | Permission Error | **This account does not have administrator access.** |

### 9.6 Dev Mode Sign-In Replacement Card

| Component Key | UI Element | Copy / Text |
| :--- | :--- | :--- |
| `auth.dev_title` | Card Heading | **Admin sign-in requires a deploy preview** |
| `auth.dev_body` | Card Body | **Netlify Identity does not run in the local development server. You can test the local database and public CMS APIs here; test administrator login, roles, and protected writes on a Netlify deploy preview.** |
| `auth.dev_status_pill` | Status Chip | **Local Identity is intentionally unavailable in dev mode.** |

---

## 10. Form Field Labels, Helpers & Action Bars (All 12 Admin Pages)

### 10.1 Shared Action Bar Standard (Save Bar)

Every editor page implements a standardized bottom action bar (`AdminSaveBar`):

```
┌────────────────────────────────────────────────────────────────────────┐
│  [✓] Published — visible on the public website     [Cancel] [Save Title]│
└────────────────────────────────────────────────────────────────────────┘
```

| Element Key | UI Element | Copy / Text | Context Notes |
| :--- | :--- | :--- | :--- |
| `savebar.published_checkbox` | Publication Checkbox | **Published — visible on the public site** | Bound to `name="published"`. Checked publishes; unchecked keeps draft. |
| `savebar.cancel_button` | Reset / Discard Button | **Clear** / **Cancel** | Resets form to clean baseline after confirmation. |
| `savebar.save_button_default` | Submit Button (General) | **Save changes** | Contextual name preferred per section. |
| `savebar.saving_state` | In-Progress Submit Button | **Saving…** | Disabled during network write. |

---

### 10.2 Page-Specific Field & Section Specifications

#### Page 1: `homepage.astro` (`/admin/homepage/`)
* **Page Heading:** `Homepage & Hero Slides`
* **Page Subtitle:** `Manage homepage hero carousel slides, brand overview copy, trust metrics, partner highlights, and featured catalogue titles.`

* **Hero Slides Manager (`#hero-slides`):**
  * Section Title: `Hero carousel slides`
  * Section Helper: `Add up to 5 bilingual slides. Enabled slides rotate on the homepage when published. Slides with no image use the brand fallback.`
  * Add Slide Button: `+ Add slide` (Disabled when 5 slides exist; tooltip: `Maximum of 5 slides reached`)
  * Slide Card Header: `Slide {N}` · `{headline_en}` · Status Badge (`Enabled` / `Disabled`)
  * Slide Up / Down Actions: `Move slide up` / `Move slide down` (Accessible names)
  * Slide Fields:
    * `headline_en` / `headline_fr`: `Headline — English` / `Headline — French` *(Required)*
    * `subheadline_en` / `subheadline_fr`: `Subheadline — English` / `Subheadline — French`
    * `cta_label_en` / `cta_label_fr`: `Primary button label — English` / `Primary button label — French`
    * `cta_url`: `Primary button link` *(e.g. `/en/services/`)*
    * `secondary_cta_label_en` / `secondary_cta_label_fr`: `Secondary button label — English` / `Secondary button label — French`
    * `secondary_cta_url`: `Secondary button link` *(e.g. `/en/catalogue/`)*
    * `enabled`: `Enabled — include in active carousel rotation` *(Checkbox)*
  * Slide Actions: `Save slide` / `Delete slide`

* **Homepage Settings Form:**
  * Carousel Autoplay Toggle: `Enable automatic slide rotation` *(Checkbox)*
  * Autoplay Interval: `Rotation interval (seconds)` *(Number input; helper: "Between 3 and 30 seconds. Default is 6 seconds.")*
  * Who We Are Section: `Who We Are heading — English` / `French`, `Body — English` / `French`
  * Trust Statistics: Repeatable rows with `Metric value` *(e.g. "60+")*, `Label — English`, `Label — French`
  * Partner Highlight: `Partner headline — English` / `French`, `Partner body — English` / `French`
  * Featured Catalogue: `Featured publication titles` *(Checkbox selection; helper: "Select up to 4 titles to showcase on the homepage.")*
  * Save Bar Action: `Save homepage`

---

#### Page 2: `catalogue.astro` (`/admin/catalogue/`)
* **Page Heading:** `Educational Catalogue`
* **Page Subtitle:** `Manage publication titles, curriculum level assignments, ministerial classification status, and book cover artwork.`
* **Toolbar Controls:**
  * Search Input: `Search titles by name or code…`
  * Level Filter: `All education levels` / `Nursery` / `Primary` / `Secondary` / `Teacher's guide`
  * Status Filter: `All publication states` / `Published` / `Draft`
* **Table Headers:** `Title & Product Code`, `Level & Subject`, `Curriculum Classification`, `Status`, `Actions`
* **Editor Form (`#editor`):**
  * Form Title: `New publication title` / `Editing: {Title}`
  * `title_en` / `title_fr`: `Title — English` / `Title — French` *(Required)*
  * `product_code`: `Product code / ISBN` *(Required; helper: "Unique publication identifier, e.g. 9789966567890")*
  * `level`: `Education level` *(Select: Nursery, Primary, Secondary, Teacher's guide)*
  * `subject_id`: `Curriculum subject` *(Select from subjects taxonomy)*
  * `curriculum_alignment_en` / `_fr`: `Curriculum alignment notes — English` / `French`
  * `classification`: `Curriculum classification status` *(Select: National Book List Verified, Other Developed Material, Unclassified)*
  * `classification_notes`: `Official verification notes` *(Internal verification documentation)*
  * `cover_image_id`: `Book cover artwork` *(Cover file picker; helper: "3:4 portrait JPEG, PNG, or WebP up to 8 MB")*
  * `cover_rights_approved`: `Cover image distribution rights confirmed` *(Checkbox)*
  * `featured`: `Feature this title in catalogue highlights` *(Checkbox)*
  * Save Bar Action: `Save title`

---

#### Page 3: `subjects.astro` (`/admin/subjects/`)
* **Page Heading:** `Curriculum Subjects`
* **Page Subtitle:** `Manage the academic subject taxonomy for Cameroon primary and secondary curricula.`
* **Toolbar Controls:** Search input: `Search subjects…`
* **Table Headers:** `Subject Name (English / French)`, `Assigned Catalogue Titles`, `Actions`
* **Editor Form:**
  * Form Title: `New curriculum subject` / `Editing: {Subject}`
  * `name_en`: `Subject name — English` *(Required; e.g. "Mathematics")*
  * `name_fr`: `Subject name — French` *(Required; e.g. "Mathématiques")*
  * Save Bar Action: `Save subject` *(Note: Subjects have no draft/published state; saving directly persists the taxonomy).*

---

#### Page 4: `news.astro` (`/admin/news/`)
* **Page Heading:** `News & Updates`
* **Page Subtitle:** `Draft, publish, and archive company news, educational announcements, and press releases.`
* **Toolbar Controls:**
  * Search Input: `Search news articles…`
  * Category Filter: `All categories` / `Press release` / `Curriculum update` / `Event` / `Corporate`
  * Status Filter: `All publication states` / `Published` / `Draft`
* **Table Headers:** `Headline & Category`, `Publish Date`, `Status`, `Actions`
* **Editor Form (`#editor`):**
  * Form Title: `New news article` / `Editing: {Headline}`
  * `headline_en` / `headline_fr`: `Headline — English` / `Headline — French` *(Required)*
  * `slug`: `Article URL slug` *(helper: "e.g. 2026-curriculum-announcement")*
  * `category`: `Article category` *(Select dropdown)*
  * `publish_date`: `Stated publication date` *(Optional date input; helper: "Historical or display date; does not schedule automated release.")*
  * `excerpt_en` / `excerpt_fr`: `Short summary — English` / `French` *(Max 300 characters)*
  * `body_en` / `body_fr`: `Full article body — English` / `French` *(Markdown supported; min-height 280px)*
  * Save Bar Action: `Save article`

---

#### Page 5: `about.astro` (`/admin/about/`)
* **Page Heading:** `About Us`
* **Page Subtitle:** `Manage company heritage, institutional vision, mission statements, and operational team capacity.`
* **Field Groups:**
  * Heritage: `Heritage copy — English` / `Heritage copy — French`
  * Core Identity:
    * `Purpose — English` / `French`
    * `Vision — English` / `French`
    * `Mission — English` / `French`
    * `Values — English` / `French`
  * Team Capacity Blocks: Repeatable rows with `Capacity title`, `Description — English`, `Description — French`, `Tags (comma separated)`
  * Save Bar Action: `Save About page`

---

#### Page 6: `services.astro` (`/admin/services/`)
* **Page Heading:** `Publishing Services & Process`
* **Page Subtitle:** `Manage bilingual B2B service offerings and step-by-step author publishing workflows.`
* **Section 1 — Services:**
  * Form Title: `New publishing service` / `Editing: {Service}`
  * `name_en` / `name_fr`: `Service name — English` / `French` *(Required)*
  * `slug`: `Service anchor slug` *(e.g. "editorial-services")*
  * `category`: `Service category` *(Editorial, Creative, Production)*
  * `short_en` / `short_fr`: `Overview summary — English` / `French`
  * `description_en` / `description_fr`: `Detailed description — English` / `French`
  * `sort_order`: `Display order` *(Number)*
  * Action: `Save service`
* **Section 2 — Process Steps:**
  * Form Title: `New process step` / `Editing: {Step}`
  * `step_number`: `Step number` *(1, 2, 3…)*
  * `title_en` / `title_fr`: `Step title — English` / `French` *(Required)*
  * `description_en` / `description_fr`: `Step description — English` / `French` *(Required)*
  * Action: `Save process step`

---

#### Page 7: `why-choose-us.astro` (`/admin/why-choose-us/`)
* **Page Heading:** `Why Choose Us`
* **Page Subtitle:** `Manage local presence narrative in Yaoundé and quality assurance commitments.`
* **Field Groups:**
  * Local Presence: `Local presence narrative — English` / `French` *(Required)*
  * Quality Commitments: Repeatable blocks with `Commitment title — English` / `French`, `Description — English` / `French`, `Heading accent`, `Tags (comma separated)`
  * Save Bar Action: `Save Why Choose Us`

---

#### Page 8: `contact.astro` (`/admin/contact/`)
* **Page Heading:** `Contact Page`
* **Page Subtitle:** `Manage contact hero introduction, inquiry project types, and map coordinates.`
* **Field Groups:**
  * Introduction: `Hero introduction — English` / `French` *(Required)*
  * Office Coordinates: `Map latitude` / `Map longitude` *(Numeric coordinates; note: "For headquarters in Tsinga, Yaoundé")*
  * Cross-link Note: `Address, phone numbers, and public email are managed centrally in Site Settings.`
  * Project Type Options: Repeatable inquiry choices with `Label — English` / `Label — French`
  * Save Bar Action: `Save Contact page`

---

#### Page 9: `legal-pages.astro` (`/admin/legal-pages/`)
* **Page Heading:** `Legal Pages`
* **Page Subtitle:** `Manage complete bilingual legal texts for Privacy Policy and Terms of Use.`
* **Panel 1 — Privacy Policy:**
  * `body_en` / `body_fr`: `Privacy Policy body — English` / `French` *(Required)*
  * `content_updated_at`: `Last updated stated date` *(helper: "Shown publicly as month and year. Update only when substantive policy terms change.")*
  * Save Action: `Save Privacy Policy`
* **Panel 2 — Terms of Use:**
  * `body_en` / `body_fr`: `Terms of Use body — English` / `French` *(Required)*
  * `content_updated_at`: `Last updated stated date`
  * Save Action: `Save Terms of Use`

---

#### Page 10: `site-settings.astro` (`/admin/site-settings/`)
* **Page Heading:** `Site Settings`
* **Page Subtitle:** `Manage corporate identity, official contact coordinates, footer text, social links, and SEO defaults.`
* **Field Groups:**
  * Corporate Identity: `Company name — English` / `French`, `Tagline — English` / `French`
  * Contact Coordinates: `Head office address`, `Public email`, `Primary telephone`, `Secondary telephone`
  * Footer & Newsletter: `Footer tagline — English` / `French`, `Newsletter prompt — English` / `French`, `Parent company website URL`
  * Social Media Profiles: Repeatable links with `Platform name` *(e.g. LinkedIn)*, `Profile URL`
  * Search Engine Optimization (SEO): `Default meta title`, `Default meta description`, `Default Open Graph preview image`
  * Save Bar Action: `Save site settings` *(Note: Site settings are global configuration and have no draft toggle).*

---

#### Page 11: `login.astro` (`/admin/login/`)
*(Detailed fully in Section 9: Authentication & Identity Screens)*

---

#### Page 12: `index.astro` (`/admin/`)
*(Detailed fully in Section 4: Overview Dashboard)*

---

## 11. Implementation & Verification Checklist for Engineering (SoSo) & QA (Dell)

1. [ ] **Component Mapping:** All UI keys defined in this document map 1:1 onto `src/layouts/AdminLayout.astro` and the 12 `src/pages/admin/*.astro` templates.
2. [ ] **Terminology Adherence:** No prohibited synonyms from Section 2 appear in source code or browser rendered DOM.
3. [ ] **Bilingual Reinforcement:** English and French field pairs maintain explicit `English` and `French` visual labeling and programmatic `lang` attributes.
4. [ ] **Confirmation Dialogs:** Destructive actions (deletions, unsaved dirty navigations) trigger the custom `<dialog>` with exact copy from Section 6.
5. [ ] **Toast Timing & Persistence:** Error alerts stay mounted until dismissed or resolved; success notices display appropriate inline confirmation alongside the temporary 5-second toast.
6. [ ] **Zero Regressions in API Handlers:** No database column names, Netlify functions, or API payload keys are modified.
