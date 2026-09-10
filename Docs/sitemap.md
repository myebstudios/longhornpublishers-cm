# Sitemap: Longhorn Publishers Cameroon Corporate Website

**Prepared by:** UI/UX Designer & Developer, Gerer Build Studio
**Prepared for:** Yv (CEO), Gerer Build Studio
**Project:** Longhorn Publishers Cameroon Corporate Website
**Source of Truth:** Longhorn Company Profile _ Sep 2026.pdf (bespoke build — does not mirror HQ)

---

## 1. Site Hierarchy (Visual)

```
Home (/)
│
├── About Us (/about)
│   ├── Heritage & Local Presence
│   ├── Purpose, Vision, Mission, Values
│   └── Our Team & Capacity
│       ├── Editorial Team
│       ├── Design & Production Team
│       └── Project Management
│
├── Publishing Services (/services)
│   ├── Editorial
│   │   ├── Editing (#editing)
│   │   ├── Proofreading (#proofreading)
│   │   └── Translation (#translation)
│   ├── Creative
│   │   ├── Designing (#designing)
│   │   └── Illustration (#illustration)
│   ├── Production
│   │   └── Printing (#printing)
│   └── Our 5-Step Process
│       (Consultation → Planning → Execution → Quality Review → Delivery)
│
├── Catalogue (/catalogue)
│   ├── Filter: Level (Primary / Secondary)
│   ├── Filter: Subject
│   ├── Filter: Language (English / French)
│   ├── Catalogue Grid (title, level, subject, language, cover thumbnail)
│   └── Title Detail View
│       ├── Description & Curriculum Alignment (Cameroon / DRC)
│       ├── Available Languages
│       └── Inquiry CTA ("Request This Title" → /contact)
│
├── Why Choose Us (/why-choose-us)
│   ├── Local Presence, Regional Expertise
│   ├── Quality Commitment
│   └── Bilingual Capability & Cultural Relevance
│
├── Contact Us (/contact)
│   ├── Inquiry Form ("Let's Work Together")
│   ├── Direct Contact Details
│   └── Map / Location (Total École de police, Tsinga)
│
├── News & Updates (/news) — footer nav, not primary header nav
│   ├── Article List (filter by category: Company News / New Titles / Partnerships / Events)
│   └── Article Detail
│       ├── Title, date, category tag, body
│       └── Related Articles
│
└── Legal / Utility (footer-only, no primary nav entry)
    ├── Privacy Policy (/privacy-policy)
    └── Terms of Use (/terms-of-use)
```

> **Note:** "Why Choose Us" is broken out as its own top-level page (rather than a homepage section only) so it can be linked directly from marketing campaigns and carry its own SEO weight. It is not present in the original outline as a nav item but is fully scoped in the marketing content — the Designer recommends promoting it to primary nav. Flag for CEO confirmation.
>
> **Note:** "Catalogue" was scoped in `technical_architecture.md` (`CurriculumCatalog` component) but was missing from the sitemap and homepage — added here. It surfaces Longhorn's primary/secondary learning materials for the Cameroon and DRC national curricula, separate from the B2B "Publishing Services" offering (which sells editorial/production services to third parties, not finished titles). Both belong on the site: Catalogue = what they publish, Services = what they do for others.
>
> **Note:** "News & Updates" is new — not in the company profile, added to give the site a mechanism for fresh content (new title launches, curriculum changes, partnership announcements, school/ministry events) which supports SEO freshness and repeat visits. Scoped to footer nav only for now to avoid overcrowding the header at 6 links; promote to primary nav once there's a steady content cadence to justify it. Flag for CEO confirmation, and confirm who on the client side will own ongoing content updates post-launch.

---

## 2. URL Structure (Bilingual)

Per `technical_architecture.md`, all routes are duplicated under sub-path i18n routing with a shared default redirect at `/`.

| Page | English URL | French URL |
|---|---|---|
| Home | `/en/` | `/fr/` |
| About Us | `/en/about` | `/fr/a-propos` |
| Publishing Services | `/en/services` | `/fr/services` |
| Catalogue | `/en/catalogue` | `/fr/catalogue` |
| Catalogue — Title Detail | `/en/catalogue/[slug]` | `/fr/catalogue/[slug]` |
| Why Choose Us | `/en/why-choose-us` | `/fr/pourquoi-nous-choisir` |
| Contact Us | `/en/contact` | `/fr/contact` |
| News & Updates | `/en/news` | `/fr/actualites` |
| News — Article Detail | `/en/news/[slug]` | `/fr/actualites/[slug]` |
| Privacy Policy | `/en/privacy-policy` | `/fr/politique-de-confidentialite` |
| Terms of Use | `/en/terms-of-use` | `/fr/conditions-utilisation` |

- Root `/` auto-detects browser locale and redirects to `/en/` or `/fr/`, then persists the choice (cookie/localStorage) per `ui_ux_structure.md` §3.
- French slugs are localized (not literal translations of the English path) for proper multilingual SEO, per `technical_architecture.md` §4.
- `hreflang` alternates declared on every page pair.

---

## 3. Primary Navigation (Header)

```
[Logo]   About Us   Publishing Services   Catalogue   Why Choose Us   Contact Us   [EN | FR]   [Get in Touch →]
```

- 6 links keeps the header scannable — no dropdowns needed at this content depth.
- "Get in Touch" is a persistent high-contrast CTA button, separate from the "Contact Us" nav link, visible on every page (per `ui_ux_structure.md` §4.1).

## 4. Footer Structure

```
Column 1: Logo + one-line positioning statement ("Expanding minds. Enriching lives.")
Column 2: Sitemap links (About, Services, Catalogue, Why Choose Us, Contact, News & Updates)
Column 3: Contact block (Address, phone x2, email)
Column 4: Newsletter/Insights signup

Bottom bar: © Longhorn Publishers Cameroon Ltd · Privacy Policy · Terms of Use · Longhorn Publishers PLC (parent) link
```

The parent-company credit link is the **only** sanctioned reference to the Kenyan HQ site — it establishes credibility without pulling users into HQ's layout or catalog.

---

## 5. Page-by-Page Content & Component Map

### 5.1 Home — `/`
| Section | Content Source | Key Component |
|---|---|---|
| Hero | "Professional Publishing Services: Quality. Precision. Impact." + "Partner With Us" CTA | `HeroBanner` |
| Who We Are | Local presence in Yaoundé, 60+ years via parent PLC | Split-screen block |
| Services Preview | Editing, Proofreading, Translation, Designing, Illustration, Printing | `ServiceShowcase` (carousel) |
| Catalogue Preview | Featured/recent titles across primary & secondary levels, EN/FR | `CurriculumCatalog` (preview grid, 4 titles + "Browse Full Catalogue" link → `/catalogue`) |
| One Partner Banner | "One Partner, End-to-End Solution" | Full-width banner |
| Latest Updates | 3 most recent News & Updates articles | `NewsPreview` (3-card row + "View All News" link → `/news`) |
| Trust Indicators | 60+ years, Central Africa presence, DRC reach | Stat strip |
| CTA | "Let's Work Together" → links to `/contact` | Section CTA |

### 5.2 About Us — `/about`
| Section | Content Source | Key Component |
|---|---|---|
| Heritage | Registered Yaoundé entity, backed by NSE-listed Longhorn PLC | Text block |
| Core Identity | Purpose / Vision / Mission / Values | `IdentityGrid` (4-col) |
| Team & Capacity | Editorial Team, Design & Production Team, Project Management | `TeamCapacity` |

### 5.3 Publishing Services — `/services`
| Section | Content Source | Key Component |
|---|---|---|
| Hero | "From Manuscript to Masterpiece" | `HeroBanner` |
| Editorial | Editing, Proofreading, Translation | `ServiceShowcase` (zigzag) |
| Creative | Designing, Illustration | `ServiceShowcase` (zigzag) |
| Production | Printing | `ServiceShowcase` (zigzag) |
| Our Process | 5-step timeline | `ProcessTimeline` |

### 5.4 Catalogue — `/catalogue`
| Section | Content Source | Key Component |
|---|---|---|
| Hero | "Our Learning Materials" — primary & secondary titles aligned to the Cameroon & DRC national curricula | `HeroBanner` |
| Filters | Level (Primary/Secondary), Subject, Language (EN/FR) | Filter bar |
| Catalogue Grid | Title cards: cover thumbnail, title, level, subject, language tag | `CurriculumCatalog` (grid) |
| Title Detail | Description, curriculum alignment, available languages, "Request This Title" CTA → `/contact` | Title detail view |

### 5.5 Why Choose Us — `/why-choose-us`
| Section | Content Source | Key Component |
|---|---|---|
| Local Presence | On-the-ground Yaoundé team, regional network | Text + icon block |
| Quality Commitment | Rigorous editorial standards, bilingual capability, cultural relevance, timely delivery, competitive pricing | `WhyChooseUs` |
| Proof Points | Reiterated trust indicators (optionally reused from Home) | Stat strip |

### 5.6 Contact Us — `/contact`
| Section | Content Source | Key Component |
|---|---|---|
| Hero | "Let's Work Together" | `HeroBanner` |
| Info Panel | Address (Total École de police, Tsinga), phones, email | Left panel |
| Inquiry Form | Project Type selector (Educational Material / Training Resource / Report / Other), name, org, message | `ConsultationForm` |
| Map | Branded map pin | Map embed |

### 5.7 News & Updates — `/news`
| Section | Content Source | Key Component |
|---|---|---|
| Hero | "News & Updates" | `HeroBanner` (compact) |
| Category Filter | Company News / New Titles / Partnerships / Events | Filter bar |
| Article List | Card grid: thumbnail, title, date, category tag, excerpt | `NewsList` |
| Article Detail | Full title, date, category, body content, related articles | `NewsArticle` |

### 5.8 Privacy Policy / Terms of Use — `/privacy-policy`, `/terms-of-use`
- Footer-linked only, standard static legal content component (`LegalPage`). Not part of primary navigation or content strategy scope — flagged as a build requirement for launch compliance, content pending legal review.

---

## 6. Open Items for CEO Sign-Off

1. **Confirm "Why Choose Us" as a standalone nav page** vs. folding it into Home/Services as sections only.
2. **Confirm French slug translations** above, or provide preferred official French terminology.
3. **Legal content** (Privacy Policy, Terms of Use) has no source material in the company profile — needs to be sourced or drafted separately before launch.
4. **Catalogue data source:** the company profile does not include an actual title list. Need either a CSV/spreadsheet of titles (level, subject, language, cover art) from the client, or confirmation this page should launch with a smaller curated set and scale later via the admin panel.
5. **Confirm News & Updates** as in-scope for launch (vs. a phase-2 addition), and confirm an internal owner for ongoing content post-launch — an empty news page undercuts credibility more than not having one at all.
