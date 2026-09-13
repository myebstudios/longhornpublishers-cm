# Longhorn Publishers Cameroon — Bilingual Client Content-Request Pack & Acceptance Checklist

**Project:** Longhorn Publishers Cameroon Ltd Corporate Website & Custom Admin Panel  
**Document Owner:** Marty (Lead Marketer & Brand Strategist, Gerer Build Studio)  
**Target Audience:** Yv (CEO, Gerer Build Studio), Longhorn Cameroon Executive Team, Client Content Owners  
**Date:** 10 September 2026  
**Deliverable Path:** `Docs/bilingual_content_request_pack.md`  
**Source of Truth:** Sourced strictly from `Docs/marketing_content_outline.md`, `Docs/sitemap.md`, `Docs/service_proposal.md`, `Docs/README.md`, `Docs/technical_architecture.md`, and `Docs/admin_panel_spec.md`.

---

## 1. Executive Summary & Brand Alignment

To ensure a seamless, high-impact bilingual website rollout for **Longhorn Publishers Cameroon Ltd**, this Content-Request Pack establishes explicit technical specifications, bilingual requirements, individual content ownership, and strict launch-gating criteria.

### Brand Positioning & Voice Checklist
- **Core Identity:** Professional Publishing Services (*Quality. Precision. Impact.*)
- **Brand Tone:** Professional, authoritative, collaborative, innovative, and culturally relevant to the Cameroonian and Central African educational context.
- **Key Differentiator:** Genuine end-to-end bilingual capability (English and French), physical presence in Yaoundé, and an integrated "One Partner" solution spanning editorial, design, illustration, and printing.
- **Formatting Standards:** Strict attention to brand consistency, including dual-language parity (EN/FR), clean typography, exact punctuation, and standardized product/series numbering.

---

## 2. Content Dependency Specifications (6 Key Domains)

### Domain 1: Legal & Compliance Pages
*Ensures regulatory compliance, user data protection, and copyright defense prior to public launch.*

| Attribute | Specification |
|---|---|
| **Content Scope** | Privacy Policy & Terms of Use |
| **Exact Source Format** | Editable Document (`.docx`) or Plain Text (`.md` / `.txt`) with clear section headers |
| **Designated Owner** | Client Legal Counsel / Managing Director (Longhorn Cameroon) |
| **Bilingual Requirements** | Complete parallel English and French versions. Must include localized French URL paths: `/fr/politique-de-confidentialite` and `/fr/conditions-utilisation`. |
| **Key Mandatory Clauses** | User data privacy disclosures, cookie policy, IP rights over curriculum materials, liability disclaimers, contact address for legal notices in Yaoundé. |
| **Launch Gating** | 🔴 **LAUNCH BLOCKER (Phase 1)** — Public site cannot go live under client domain without signed-off legal content. |

---

### Domain 2: Catalogue Import & Learning Materials Data
*Defines the primary educational products published by Longhorn Cameroon for the national curricula.*

| Attribute | Specification |
|---|---|
| **Content Scope** | Primary & Secondary learning materials for Cameroon and DRC National Curricula |
| **Exact Source Format** | **Data:** Formatted CSV / Spreadsheet (`.csv`, `.xlsx`) containing structured metadata.<br>**Covers:** High-resolution RGB graphics (`.png` or `.jpg`), minimum 800×1200 px at 72–300 DPI, clean cropped border without print registration marks. |
| **Designated Owner** | Head of Editorial & Curriculum (Longhorn Cameroon) |
| **Bilingual Requirements** | Dual localized title descriptions and tags. Each title tagged with explicit language (`English`, `French`, or `Bilingual`). |
| **Required Schema Fields** | 1. Title (EN & FR)<br>2. ISBN / Product Code<br>3. Level (`Primary` / `Secondary`)<br>4. Subject (`Mathematics`, `English Language`, `Science`, `French`, `Social Studies`, etc.)<br>5. Language Tag<br>6. Description & Curriculum Alignment notes (Cameroon / DRC)<br>7. Cover Artwork filename |
| **Launch Gating** | 🔴 **LAUNCH BLOCKER for Curated Launch Set (Phase 1)** — Requires a curated initial set of 6–12 titles.<br>🟢 **POST-LAUNCH (Phase 2)** — Bulk catalogue expansion via the Custom Admin Panel (`/admin/catalogue`). |

---

### Domain 3: News & Editorial Content Strategy
*Establishes brand freshness, SEO domain authority, and institutional updates.*

| Attribute | Specification |
|---|---|
| **Content Scope** | News & Updates feed articles (Categories: `Company News`, `New Titles`, `Partnerships`, `Events`) |
| **Exact Source Format** | Editable Document (`.docx`) or Markdown (`.md`) + 16:9 featured imagery (`.jpg` / `.png`, min 1200×675 px). |
| **Designated Owner** | Marketing Communications Specialist (Longhorn Cameroon) / CEO sign-off |
| **Bilingual Requirements** | Full EN & FR articles with localized routes (`/en/news/[slug]` and `/fr/actualites/[slug]`). |
| **Initial Launch Content** | Minimum 3 launch articles:<br>1. *Corporate Announcement:* Longhorn Publishers Cameroon local presence in Yaoundé.<br>2. *Curriculum Solutions:* Dedicated primary/secondary learning materials rollout.<br>3. *Bilingual Publishing Services:* B2B editorial & printing capabilities for regional partners. |
| **Launch Gating** | 🔴 **LAUNCH BLOCKER for 3 Launch Articles (Phase 1)** — Prevents empty or skeleton news pages.<br>🟢 **POST-LAUNCH (Phase 2)** — Ongoing monthly/quarterly article posting schedule managed via `/admin/news`. |

---

### Domain 4: Approved Brand & Operational Imagery
*Replaces stock photography with authentic, high-impact visuals of the Cameroon team and facilities.*

| Attribute | Specification |
|---|---|
| **Content Scope** | Office imagery, editorial workflow photos, printing press operations, team portraits, brand logos |
| **Exact Source Format** | High-resolution uncompressed image files (`.png`, `.webp`, `.jpg`), minimum 1920×1080 px for full-bleed hero banners; Vector `.svg` for official corporate logos. |
| **Designated Owner** | Brand Manager (Longhorn Cameroon) / UI/UX Specialist (Z) |
| **Bilingual Requirements** | Descriptive `alt` text in both English and French for accessibility (a11y) and localized image SEO. |
| **Visual Direction** | Authoritative burgundy (`#7A1C1C` / `#800000`) and growth leaf green tones. Authentic photography of the Yaoundé facility (Total École de police, Tsinga), real editors at work, and printing production. No generic stock textbooks. |
| **Launch Gating** | 🔴 **LAUNCH BLOCKER (Phase 1)** — Hero banners, team section visuals, and brand logos must be approved prior to build finalization. |

---

### Domain 5: Client Testimonials & Institutional Endorsements
*Validates credibility with schools, education boards, and B2B publishing partners.*

| Attribute | Specification |
|---|---|
| **Content Scope** | Quotes from headteachers, educational institutions, ministry partners, or B2B editorial clients |
| **Exact Source Format** | Document (`.docx` / `.pdf`) with written permission / release confirmation + high-res partner logos (`.png`, transparent background). |
| **Designated Owner** | Head of Sales & Institutional Partnerships (Longhorn Cameroon) |
| **Bilingual Requirements** | Quotes provided in original language with professional translation into English/French. |
| **Acceptance Criteria** | Explicit authorization to publish name, title, organization logo, and quote on the public website. |
| **Launch Gating** | 🟢 **POST-LAUNCH ENHANCEMENT (Phase 2)** — Initial launch utilizes corporate trust stats (60+ years heritage, 6+ years in Central Africa); formal testimonials added as permissions are completed. |

---

### Domain 6: Direct Contact Details, Social Vectors & Parent Branding
*Facilitates B2B sales inquiries and verifies corporate governance linkages.*

| Attribute | Specification |
|---|---|
| **Content Scope** | Official contact information, physical location, social media links, parent PLC credit |
| **Exact Source Format** | Verified Text / JSON Sheet (`.json` / `.docx`) |
| **Designated Owner** | Operations & Office Manager (Yaoundé Office) |
| **Bilingual Requirements** | UI labels localized in EN & FR on `/en/contact` and `/fr/contact`. |
| **Verified Data Points** | • **Phones:** `+(237) 672 49 10 93` / `+(237) 657 51 92 03`<br>• **Email:** `longhorncameroon@longhornpublishers.com`<br>• **Physical Address:** Total École de police, Tsinga, Yaoundé, Cameroon<br>• **Parent Company Link:** Direct footer credit link to Longhorn Publishers PLC (`longhornpublishers.com`) |
| **Launch Gating** | 🔴 **LAUNCH BLOCKER (Phase 1)** — Must be 100% verified prior to launch. |

---

## 3. Master Content Acceptance Checklist for CEO / Client Review

Use this master checklist during Phase 1 gating reviews. Every item marked **Launch Blocker** must achieve `APPROVED` status before DNS cutover to production domain (`longhornpublishers-cm.com`).

| Item ID | Content Requirement | Format | EN/FR Parity | Designated Owner | Phase Gating | Status |
|---|---|---|---|---|---|---|
| **LEG-01** | Privacy Policy Document | Code / Text | Required (EN & FR) | GBS Marketing / Client Legal | 🔴 Launch Blocker | ✅ Factual copy wired; ⏳ Final legal sign-off pending |
| **LEG-02** | Terms of Use Document | Code / Text | Required (EN & FR) | GBS Marketing / Client Legal | 🔴 Launch Blocker | ✅ Factual copy wired; ⏳ Final legal sign-off pending |
| **CAT-01** | Initial Catalogue Spreadsheet (6-12 titles) | `.csv` / `.xlsx` | Required metadata | Cameroon Editorial | 🔴 Launch Blocker | ⏳ Pending client title list |
| **CAT-02** | Catalogue Cover Art (min 800×1200px) | `.png` / `.jpg` | N/A (Visual) | Cameroon Editorial | 🔴 Launch Blocker | ⏳ Pending client assets |
| **CAT-03** | Full Catalogue Backlist Import | Admin Panel | Required metadata | Cameroon Editorial | 🟢 Post-Launch | 📅 Scheduled |
| **NWS-01** | Article 1: Longhorn Cameroon Launch | `.docx` / `.md` | Required (EN & FR) | Client Marketing | 🔴 Launch Blocker | ⏳ Pending client copy |
| **NWS-02** | Article 2: National Curriculum Materials | `.docx` / `.md` | Required (EN & FR) | Client Marketing | 🔴 Launch Blocker | ⏳ Pending client copy |
| **NWS-03** | Article 3: End-to-End Publishing Services | `.docx` / `.md` | Required (EN & FR) | Client Marketing | 🔴 Launch Blocker | ⏳ Pending client copy |
| **NWS-04** | Ongoing News Posting Owner & Schedule | Process Spec | N/A | Client Marketing | 🟢 Post-Launch | 📅 Scheduled |
| **IMG-01** | High-Res Logo Assets (Vector / PNG) | `.svg` / `.png` | N/A (Visual) | Brand Manager | 🔴 Launch Blocker | ✅ Official logo integrated |
| **IMG-02** | Hero Banner Photography (Yaoundé / Press) | `.png` / `.jpg` | Alt text EN & FR | Brand Manager | 🔴 Launch Blocker | ⏳ Pending photographic assets |
| **TST-01** | Trust Statistics (60+ yrs HQ, 6+ yrs CM) | Text | Required (EN & FR) | GBS Marketing | 🔴 Launch Blocker | ✅ Wired to authentic trust block |
| **TST-02** | Client / School Testimonials & Logos | `.docx` + `.png` | Required (EN & FR) | Sales & Partnerships | 🟢 Post-Launch | 📅 Scheduled (no fake logos/quotes used) |
| **CNT-01** | Official Phones, Email, Address Verification | Text | Required UI labels | Operations Manager | 🔴 Launch Blocker | ✅ Ready & Verified |
| **CNT-02** | Parent Company (Longhorn PLC) Footer Link | URL | Standard label | Operations Manager | 🔴 Launch Blocker | ✅ Ready & Verified |

---

## 4. Active Blockers & Gating Review Notes

1. **French Slug Sign-Off (`a-propos`, `services-edition`, `pourquoi-nous-choisir`, `actualites`):**
   - *Status:* 🛑 **EXTERNAL CLIENT BLOCKER**
   - *Detail:* French localized routes (`/fr/a-propos`, `/fr/services-edition`, `/fr/pourquoi-nous-choisir`, `/fr/actualites`, `/fr/catalogue`, `/fr/contact`, `/fr/politique-de-confidentialite`, `/fr/conditions-utilisation`) are 100% technically implemented. Formal executive sign-off from Longhorn Publishers Cameroon leadership is dispatched via `Docs/client_approval_packet.md`. Approval must not be claimed until client written sign-off is returned.

2. **Social Proof & Testimonials Request (3 Quotes & Logos):**
   - *Status:* 🛑 **EXTERNAL CLIENT DEPENDENCY (Phase 2)**
   - *Detail:* Site currently displays authentic corporate credentials (*60+ years parent PLC heritage, 6+ years local Yaoundé presence, dual EN/FR capability*). Request for 3 approved client quotes and high-res logos is included in `Docs/client_approval_packet.md` for Phase 2 cms population.

3. **Legal Content (Privacy Policy & Terms of Use):**
   - *Status:* ✅ **WIRED / FACTUAL COPY COMPLETE**
   - *Detail:* Factual bilingual Privacy Policy and Terms of Use copy is wired strictly based on actual website form behavior (Netlify Forms contact & newsletter processing, local language preference storage, zero 3rd-party tracking). Formal client legal sign-off remains pending.

---

## 5. Next Actions for Content Handover

1. **CEO Sign-Off (@Yv):** Review and sign off on this content request pack and `Docs/client_approval_packet.md`.
2. **Client Dispatch:** Transmit `Docs/client_approval_packet.md` to Longhorn Publishers Cameroon Ltd executive leadership.
3. **Admin Panel Seeding:** As client content arrives, populate catalogue titles and news entries via `/admin`.
