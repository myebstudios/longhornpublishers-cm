# Wireframes: Longhorn Publishers Cameroon Corporate Website

**Prepared by:** UI/UX Designer, Gerer Build Studio
**Prepared for:** Yv (CEO), Gerer Build Studio
**Project:** Longhorn Publishers Cameroon Corporate Website
**Companion documents:** `sitemap.md`, `ui_ux_structure.md`, `marketing_content_outline.md`, `admin_panel_spec.md`

ASCII layout wireframes for every route in `sitemap.md`, drawn top-to-bottom as the page actually stacks. Pair with `ui_ux_structure.md` for color, type, and imagery direction.

---

## Global: Header (all pages)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [LOGO]   About Us   Publishing Services   Catalogue   Why Choose Us   Contact │
│                                              [EN|FR]   [ Get in Touch ]  │
└──────────────────────────────────────────────────────────────────────────┘
  sticky · transparent over hero, solid burgundy on scroll
```

## Global: Footer (all pages)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [LOGO]          Sitemap            Contact               Newsletter    │
│  tagline         About Us           Tsinga, Yaoundé        [ email__ ]  │
│                  Publishing Svcs     +237 672 49 10 93     [ Sign Up ]  │
│                  Catalogue            +237 657 51 92 03                  │
│                  Why Choose Us       info@...                           │
│                  Contact Us                                              │
│                  News & Updates                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  © Longhorn Publishers Cameroon Ltd   Privacy Policy · Terms · PLC ↗    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Home — `/`

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              HEADER (global)                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│                    PROFESSIONAL PUBLISHING SERVICES                      │
│                     Quality. Precision. Impact.                          │
│                        [ Partner With Us → ]                             │
│                    (full-bleed background image)                        │
│                                                                            │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐   Who We Are                                 │
│  │                       │   Backed by 60+ years of publishing          │
│  │    [team photo]       │   excellence, rooted in Yaoundé, Cameroon.   │
│  │                       │   [ Learn More → ]                           │
│  └───────────────────────┘                                              │
├──────────────────────────────────────────────────────────────────────────┤
│                      Our Services                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐   ◄ scroll/swipe ►                   │
│  │ Editing│ │ Proof-  │ │ Trans- │  Designing · Illustration · Printing │
│  │  icon  │ │ reading │ │ lation │                                      │
│  └────────┘ └────────┘ └────────┘                                       │
├──────────────────────────────────────────────────────────────────────────┤
│                       Our Catalogue                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                           │
│  │ [cover]│ │ [cover]│ │ [cover]│ │ [cover]│   Primary · Secondary      │
│  │ Title  │ │ Title  │ │ Title  │ │ Title  │   EN / FR                  │
│  │ Lvl·Sub│ │ Lvl·Sub│ │ Lvl·Sub│ │ Lvl·Sub│                           │
│  └────────┘ └────────┘ └────────┘ └────────┘                           │
│                  [ Browse Full Catalogue → ]                             │
├──────────────────────────────────────────────────────────────────────────┤
│              ONE PARTNER, END-TO-END SOLUTION                            │
│         From manuscript to final printed book — one team.                │
├──────────────────────────────────────────────────────────────────────────┤
│        60+ Years        Central Africa Presence      Cameroon & DRC      │
├──────────────────────────────────────────────────────────────────────────┤
│                       Latest Updates                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │ [thumb] Date    │  │ [thumb] Date    │  │ [thumb] Date    │            │
│  │ Headline        │  │ Headline        │  │ Headline        │            │
│  │ Category tag    │  │ Category tag    │  │ Category tag    │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
│                     [ View All News → ]                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                     Let's Work Together                                  │
│                      [ Get in Touch → ]                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                              FOOTER (global)                             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. About Us — `/about`

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              HEADER (global)                             │
├──────────────────────────────────────────────────────────────────────────┤
│  About Longhorn Publishers Cameroon                                      │
│  (compact banner, left-aligned)                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  Heritage & Local Presence                    ┌────────────────────┐   │
│  Registered in Yaoundé, Cameroon. Backed       │   [PLC badge /     │   │
│  by Longhorn Publishers PLC, listed on the     │    supporting img] │   │
│  Nairobi Securities Exchange. 60+ years of      └────────────────────┘   │
│  publishing excellence across Africa.                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                         Our Core Identity                                │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐            │
│  │  Purpose  │  │  Vision   │  │  Mission  │  │  Values   │            │
│  │  icon+txt │  │  icon+txt │  │  icon+txt │  │  icon+txt │            │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘            │
├──────────────────────────────────────────────────────────────────────────┤
│                       Our Team & Capacity                                │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐          │
│  │ Editorial Team │   │ Design &       │   │ Project        │          │
│  │ icon + desc    │   │ Production     │   │ Management     │          │
│  └────────────────┘   └────────────────┘   └────────────────┘          │
├──────────────────────────────────────────────────────────────────────────┤
│                              FOOTER (global)                             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Publishing Services — `/services`

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              HEADER (global)                             │
├──────────────────────────────────────────────────────────────────────────┤
│                    From Manuscript to Masterpiece                        │
│                     (full-width banner)                                  │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐    Editorial                                     │
│  │                    │    Editing · Proofreading · Translation         │
│  │   [image]          │    Accuracy, flow, structure, bilingual         │
│  │                    │    rephrasing for EN/FR education content.      │
│  └───────────────────┘                                                  │
├──────────────────────────────────────────────────────────────────────────┤
│    Creative                    ┌───────────────────┐                    │
│    Designing · Illustration    │                    │                    │
│    Layout, cover design,       │    [image]         │                    │
│    fine-art illustration.      │                    │                    │
│                                 └───────────────────┘                    │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐    Production                                    │
│  │                    │    Printing                                     │
│  │   [image]          │    High-quality printing of texts and images.   │
│  │                    │                                                 │
│  └───────────────────┘                                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                          Our 5-Step Process                              │
│   ①───────②───────③───────④───────⑤                                  │
│  Consult  Plan   Execute  QA Review  Deliver                             │
│  (horizontal timeline, stacks vertically on mobile)                      │
├──────────────────────────────────────────────────────────────────────────┤
│                              FOOTER (global)                             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Catalogue — `/catalogue`

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              HEADER (global)                             │
├──────────────────────────────────────────────────────────────────────────┤
│                        Our Learning Materials                            │
│         Primary & secondary titles aligned to the national curriculum    │
├──────────────────────────────────────────────────────────────────────────┤
│  Level: [Primary▾][Secondary▾]  Subject: [dropdown▾]  Language: [EN][FR] │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ [cover]│ │ [cover]│ │ [cover]│ │ [cover]│ │ [cover]│ │ [cover]│      │
│  │ Title  │ │ Title  │ │ Title  │ │ Title  │ │ Title  │ │ Title  │      │
│  │ Lvl·Sub│ │ Lvl·Sub│ │ Lvl·Sub│ │ Lvl·Sub│ │ Lvl·Sub│ │ Lvl·Sub│      │
│  │ EN·FR  │ │ EN·FR  │ │ EN·FR  │ │ EN·FR  │ │ EN·FR  │ │ EN·FR  │      │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘      │
│                          [ Load More ]                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                              FOOTER (global)                             │
└──────────────────────────────────────────────────────────────────────────┘

  Title Detail (on card click) — /catalogue/[slug]
┌──────────────────────────────────────────────────────────────────────────┐
│                              HEADER (global)                             │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐   Title Name                                      │
│  │                    │   Level · Subject · Available in EN / FR         │
│  │   [cover, large]   │   Description & curriculum alignment              │
│  │                    │   (Cameroon & DRC national curriculum)            │
│  └───────────────────┘   [ Request This Title → ]  (links to /contact)   │
├──────────────────────────────────────────────────────────────────────────┤
│                              FOOTER (global)                             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Why Choose Us — `/why-choose-us`

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              HEADER (global)                             │
├──────────────────────────────────────────────────────────────────────────┤
│                        Why Partner With Us                               │
│                     (full-width banner)                                  │
├──────────────────────────────────────────────────────────────────────────┤
│  Local Presence, Regional Expertise           ┌────────────────────┐    │
│  On the ground in Yaoundé, with access to a    │  [map / image]     │    │
│  regional network of subject matter experts     └────────────────────┘    │
│  and illustrators.                                                       │
├──────────────────────────────────────────────────────────────────────────┤
│                       Our Quality Commitment                             │
│  ┌─────────────────────────┐   ┌─────────────────────────┐             │
│  │ ✓ Rigorous Editorial     │   │ ✓ Bilingual Capability  │             │
│  │   Standards               │   │                          │             │
│  ├─────────────────────────┤   ├─────────────────────────┤             │
│  │ ✓ Cultural Relevance     │   │ ✓ Timely Delivery       │             │
│  ├─────────────────────────┤   ├─────────────────────────┤             │
│  │ ✓ Competitive Pricing    │   │                          │             │
│  └─────────────────────────┘   └─────────────────────────┘             │
├──────────────────────────────────────────────────────────────────────────┤
│        60+ Years        Central Africa Presence      Cameroon & DRC      │
├──────────────────────────────────────────────────────────────────────────┤
│                     Let's Work Together                                  │
│                      [ Get in Touch → ]                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                              FOOTER (global)                             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Contact Us — `/contact`

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              HEADER (global)                             │
├──────────────────────────────────────────────────────────────────────────┤
│                        Let's Work Together                               │
│                     (full-width banner)                                  │
├──────────────────────────────────────────────────────────────────────────┤
│  Total École de police, Tsinga        ┌──────────────────────────────┐  │
│  Yaoundé, Cameroon                     │  Project Type:  [dropdown▾] │  │
│                                         │  Name:          [________]  │  │
│  +237 672 49 10 93                     │  Organization:  [________]  │  │
│  +237 657 51 92 03                     │  Email:         [________]  │  │
│  longhorncameroon@longhornpublishers.com│  Message:      [________]  │  │
│                                         │                [________]  │  │
│                                         │        [ Send Inquiry ]     │  │
│                                         └──────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────┤
│                      [ branded map — Tsinga pin ]                        │
├──────────────────────────────────────────────────────────────────────────┤
│                              FOOTER (global)                             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 7. News & Updates — `/news`

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              HEADER (global)                             │
├──────────────────────────────────────────────────────────────────────────┤
│                          News & Updates                                  │
├──────────────────────────────────────────────────────────────────────────┤
│  Category: [All][Company News][New Titles][Partnerships][Events]        │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │ [thumb]           │  │ [thumb]           │  │ [thumb]           │      │
│  │ Date · Category   │  │ Date · Category   │  │ Date · Category   │      │
│  │ Headline           │  │ Headline           │  │ Headline           │      │
│  │ Excerpt text...    │  │ Excerpt text...    │  │ Excerpt text...    │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                          [ Load More ]                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                              FOOTER (global)                             │
└──────────────────────────────────────────────────────────────────────────┘

  Article Detail (on card click) — /news/[slug]
┌──────────────────────────────────────────────────────────────────────────┐
│                              HEADER (global)                             │
├──────────────────────────────────────────────────────────────────────────┤
│  Category tag · Date                                                     │
│  Article Headline                                                        │
│  ┌──────────────────────────────────────────────────────┐               │
│  │                    [hero image]                       │               │
│  └──────────────────────────────────────────────────────┘               │
│  Body content, max-width 720px, centered.                                │
├──────────────────────────────────────────────────────────────────────────┤
│                        Related Articles                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │ [thumb]         │  │ [thumb]         │  │ [thumb]         │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
├──────────────────────────────────────────────────────────────────────────┤
│                              FOOTER (global)                             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Privacy Policy / Terms of Use — `/privacy-policy`, `/terms-of-use`

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              HEADER (global)                             │
├──────────────────────────────────────────────────────────────────────────┤
│  Privacy Policy   (compact banner)                                       │
├──────────────────────────────────────────────────────────────────────────┤
│                  ┌──────────────────────────────────┐                    │
│                  │  Section heading                  │                    │
│                  │  Paragraph text, max-width 720px, │                    │
│                  │  centered on page.                │                    │
│                  │                                    │                    │
│                  │  Section heading                  │                    │
│                  │  Paragraph text...                │                    │
│                  └──────────────────────────────────┘                    │
├──────────────────────────────────────────────────────────────────────────┤
│                              FOOTER (global)                             │
└──────────────────────────────────────────────────────────────────────────┘
```

*Content pending — see Open Item #3 in `sitemap.md`.*

---

## 9. Admin Panel — `/admin/*`

Authenticated section, separate chrome from the public site (no public header/footer). Screens per `admin_panel_spec.md` §4.

### 9.1 Login — `/admin/login`

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│                          [ Longhorn Admin ]                              │
│                                                                            │
│                  ┌──────────────────────────────────┐                    │
│                  │  Email:     [______________]      │                    │
│                  │  Password:  [______________]      │                    │
│                  │                                    │                    │
│                  │           [ Log In ]               │                    │
│                  │                                    │                    │
│                  │  Forgot password?                  │                    │
│                  └──────────────────────────────────┘                    │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘
  centered card, no public nav/footer — Netlify Identity email/password only
```

### 9.2 Admin Shell & Dashboard — `/admin`

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Longhorn Admin]                                    admin@... [Log Out]  │
├────────────────┬───────────────────────────────────────────────────────┤
│ Dashboard      │  Welcome back                                          │
│ Site Settings  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐│
│ Homepage       │  │ 12 Published  │ │ 3 Drafts      │ │ 5 Titles      ││
│ About Us       │  │ Catalogue     │ │ News Articles │ │ missing FR    ││
│ Services       │  └───────────────┘ └───────────────┘ └───────────────┘│
│ Catalogue      │                                                        │
│ Why Choose Us  │  Recently Edited                                       │
│ Contact        │  • "Grade 6 Mathematics" — updated 2h ago              │
│ News & Updates │  • "New Partnership with MINEDUB" — draft              │
│ Legal Pages    │  • Site Settings — updated yesterday                   │
└────────────────┴───────────────────────────────────────────────────────┘
  persistent left sidebar nav (maps 1:1 to admin_panel_spec.md §4 screens)
```

### 9.3 Single-Record Screen Pattern — e.g. Site Settings, Homepage, About Us, Contact

```
┌────────────────┬───────────────────────────────────────────────────────┐
│ (sidebar nav)  │  Site Settings                          [ Save ]      │
│                │  ┌─────────────────────┬─────────────────────────┐   │
│                │  │ EN                   │ FR                       │  │
│                │  │ Company name: [____]  │ Nom: [____]              │  │
│                │  │ Tagline: [________]   │ Slogan: [________]       │  │
│                │  └─────────────────────┴─────────────────────────┘   │
│                │  Address: [________________________________]         │
│                │  Phone 1: [______________]  Phone 2: [______________] │
│                │  Email: [______________________]                     │
│                │  Social Links: [+ Add Link]                          │
│                │  ⚠ French field required before save                 │
└────────────────┴───────────────────────────────────────────────────────┘
  bilingual fields always shown side-by-side; validation blocks save if
  one language is empty
```

### 9.4 List + Form Screen Pattern — e.g. Catalogue, News & Updates, Services

```
  List view — /admin/catalogue
┌────────────────┬───────────────────────────────────────────────────────┐
│ (sidebar nav)  │  Catalogue                          [ + Add Title ]   │
│                │  Level:[▾] Subject:[▾] Status:[All▾]  Search:[______]  │
│                │  ┌──────────────────────────────────────────────────┐ │
│                │  │ [cover] Grade 6 Mathematics  Primary  Math  ✓Pub  │ │
│                │  │ [cover] Français Facile CM2   Primary  FR   Draft│ │
│                │  │ [cover] Physics for Form 3    Secondary Sci ✓Pub │ │
│                │  └──────────────────────────────────────────────────┘ │
│                │  each row: [ Edit ] [ Publish/Unpublish ] [ Delete ]  │
└────────────────┴───────────────────────────────────────────────────────┘

  Edit/Add form — /admin/catalogue/[id]
┌────────────────┬───────────────────────────────────────────────────────┐
│ (sidebar nav)  │  Edit Title                    [ Save Draft ][ Publish]│
│                │  Cover Image: [ current thumb ] [ Upload New ]        │
│                │  Title EN: [____________]  Title FR: [____________]   │
│                │  Level: [Primary▾]   Subject: [Mathematics▾]          │
│                │  Languages: [x] EN  [x] FR                            │
│                │  Description EN: [________]  FR: [________]           │
│                │  Curriculum Alignment: [________________________]     │
│                │  Featured on Homepage: [ ] (max 4 featured at a time) │
└────────────────┴───────────────────────────────────────────────────────┘
```

---

## 10. Mobile Collapse Behavior

```
Desktop (≥1024px)          Tablet (768–1023px)        Mobile (<768px)
┌─────┬─────┬─────┐        ┌───────┬───────┐          ┌───────────┐
│  A  │  B  │  C  │   →    │   A   │   B   │    →     │     A     │
└─────┴─────┴─────┘        ├───────┴───────┤          ├───────────┤
  (3-col grids)             │       C       │          │     B     │
                            └───────────────┘          ├───────────┤
                            (grids → 2 cols)            │     C     │
                                                         └───────────┘
                                                         (all stack, 1 col)

Header nav: full inline  →  full inline, tighter  →  hamburger + EN|FR + CTA
Carousel: 3 cards visible → 2 cards visible        → 1 card, swipe
Timeline: horizontal      → horizontal              → vertical stack

Admin Panel (/admin/*): desktop-first, optimized for the content-editing
workflow. Sidebar nav collapses to a hamburger/top-bar on tablet and mobile;
list/form screens stack to a single column. Not a primary design target for
launch — admins are expected to manage content from a desktop/laptop.
```
