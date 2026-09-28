# Client Intake Audit & Launch Follow-Up: Book Covers & Outstanding Blockers

**Document Owner:** Marty (Lead Marketer & Brand Strategist, Gerer Build Studio)  
**Project:** Longhorn Publishers Cameroon (`longhornpublishers-cm`)  
**Target Path:** `Docs/client_followup_2026-09-28.md`  
**Date:** 28 September 2026 (Revised per Pack D Image & CTA Governance Gates)  
**Status:** Complete — Send-Ready Draft Awaiting User Review  

---

## 1. Technical Audit: Book Cover Intake (`Assets/Book covers/`)

The client supplied four initial cover image files (`b1.png` to `b4.png`) without metadata. Each asset was audited against the Pack A specification threshold (minimum dimensions: **800 × 1200 px**).

### Cover Audit Table

| File Name | Dimensions (px) | Aspect Ratio | Spec Threshold | Audit Result | Apparent Title | Subtitle / Level | Author / Attribution | Subject Taxonomy |
|---|---|---|---|---|---|---|---|---|
| `b1.png` | **2048 × 2790** | 1:1.36 | Min 800 × 1200 | **PASS** (High-Res) | *Chemistry For Secondary schools in Cameroon* | Student's book — Form 1 | Fuhnwi Julius | Secondary Sciences (Chemistry) |
| `b2.png` | **1088 × 1481** | 1:1.36 | Min 800 × 1200 | **PASS** | *Physics For Secondary schools in Cameroon* | Form 2 | Clinton Ojong | Secondary Sciences (Physics) |
| `b3.png` | **1087 × 1481** | 1:1.36 | Min 800 × 1200 | **PASS** | *Mathematics for secondary schools in Cameroon* | Teacher's guide — Form 1 | Ebenezer T. Fombin, N.L. Ebissouleye Nyamssi | Secondary Mathematics |
| `b4.png` | **1088 × 1481** | 1:1.36 | Min 800 × 1200 | **PASS** | *English Workbook Class 5* | Workbook — Class 5 | Student Fill-in Fields (Pupil's Name / Class / School) | Primary Languages (English) |

### Technical Findings & Brand Observations
1. **Resolution Compliance:** All 4 assets exceed the minimum requirement of 800 × 1200 px with crisp typography, balanced color gamuts, and valid aspect ratios (~1:1.36 standard portrait book proportion).
2. **Missing Metadata:** The files arrived without title codes, ISBNs, localized French titles/descriptions, publication years, or syllabus/curriculum cycle confirmation.
3. **Catalogue Pack Completeness:** Pack A requires a curated intake of 6–12 titles to populate the digital catalogue filter grids effectively. These 4 titles represent an initial intake batch.

---

## 2. Strategic Quality & Governance Adjustments (Pack D Hero Launch Gates)

Following technical review by engineering (SoSo) and QA (Dell), the launch hero carousel (`Docs/hero_slide_copy.md`) requires client rulings on several governance items:

1. **Shortfall on All Four Hero Images (1920 × 1080 Minimum):**  
   Every image currently mapped to the launch slides falls below the 1920 × 1080 px desktop specification:
   - **Slide 1 (`lh-hero.jpg`):** 1920 × 767 px (height deficit of −313 px).
   - **Slide 2 (`lh-catalogue-shelves.jpg`):** 410 × 410 px (severe deficit, requiring ~4.7× upscale at 1920 width).
   - **Slide 3 (`lh-bilingual-editor-wide.jpg`):** 1400 × 933 px (both dimensions below spec).
   - **Slide 4 (`lh-print-inspection-wide.jpg`):** 1400 × 933 px (both dimensions below spec).  
   *Requirement:* The client must supply 4 compliant high-resolution replacement photos (≥1920 × 1080 px) or provide written acceptance to launch with these assets.

2. **Slide 1 CTA Locale Mismatch & Priority Swap:**  
   - **Secondary CTA Mismatch:** EN copy uses `"Partner With Us"`, whereas the FR draft uses `"Nous contacter"` (*"Contact us"*). The approved live FR hero uses `"Devenir partenaire"`. The client must confirm whether to align on `"Partner With Us"` / `"Devenir partenaire"` or `"Contact Us"` / `"Nous contacter"`.
   - **Primary/Secondary Priority Swap:** Live production hero prioritizes lead generation (Primary: `"Partner With Us"` → `/contact`, Secondary: `"Explore our services"` → `/services`). Pack D proposes swapping to browsing (Primary: `"Explore Our Services"`, Secondary: `"Partner With Us"`). The client must rule on whether to keep live contact-first priority or approve the services-first swap.

3. **Slide 2 Unsubstantiated Curriculum Claim:**  
   The draft claims `"National Curriculum Approved"` (EN) and `"Matériels pédagogiques agréés"` (FR). Unless ministerial accreditation evidence is provided, the client must approve safer wording: *"Curriculum-Aligned Learning Materials"* / *"Matériels pédagogiques conformes aux programmes nationaux"*.

4. **Deployment Prerequisites:** Production slide replacement is not enabled by copy sign-off alone; it strictly requires resolution of image assets and verification.

---

## 3. Send-Ready Client Follow-Up Draft

> [!NOTE]
> **Instructions for User:** Attach the four-slide Pack D copy from `Docs/hero_slide_copy.md` when sending this draft. No message has been sent externally.

```markdown
Subject: Urgent Launch Review: Hero Slide Adjustments, Book Covers & Open Blockers

Dear Longhorn Cameroon Team,

Thank you for supplying the four book covers (`b1.png`–`b4.png`). All meet our 800×1200 px catalogue display minimum.

Please review and rule on the following launch items:

1. Homepage Hero Slide Decisions (Pack D — Launch Blocker)
We need your formal ruling on the four bilingual slides (Docs/hero_slide_copy.md):
- Slide 1 CTAs: Resolve the EN/FR mismatch (EN: "Partner With Us" vs FR draft: "Nous contacter"; approved live FR is "Devenir partenaire"). Also confirm CTA priority: retain live order (Primary: Contact, Secondary: Services) or adopt Pack D's order (Primary: Services, Secondary: Contact).
- Slide 2 Curriculum Claim: Substantiate "National Curriculum Approved" / "agréés" with accreditation proof, or approve safer wording: "Curriculum-Aligned Learning Materials" / "Matériels pédagogiques conformes aux programmes nationaux".
- Hero Image Resolutions: All four images miss our 1920×1080 px minimum (Slide 1: 1920×767; Slide 2: 410×410; Slides 3 & 4: 1400×933). Please supply 4 compliant photos (≥1920×1080 px) or written acceptance to launch with these assets.
(Note: Deployment remains gated on copy approval and asset verification.)

2. Book Cover Metadata (Pack A)
Please supply title, ISBN, level, subject, and summary for each cover, plus any additions toward the 6–12 title pack.

3. Operational Photos (Pack B)
Please provide the 22 operational photos with signed model releases, or confirm post-launch delivery.

4. Testimonials & Logos (Pack C)
Please supply 3 approved quotes and partner logos with signed releases, or confirm deferring to Phase 2.

5. Yaoundé GPS Coordinates & DRC Scope
Please provide Tsinga office GPS coordinates and confirm whether to filter for DRC curriculum titles (with ISBNs) or lock strictly to Cameroon.

Warm regards,
The Gerer Build Studio Team
```

---

## 4. Governance & Integrity Checklist

- [x] **Cover Audit Maintained:** Dimensions, aspect ratio, pass/fail status, and titles verified.
- [x] **All 4 Hero Images Shortfall Flagged:** Explicitly listed Slide 1 (1920×767), Slide 2 (410×410), Slides 3 & 4 (1400×933); requested 4 compliant photos or written acceptance.
- [x] **Slide 1 CTA Issues Included:** Secondary CTA EN/FR mismatch (`Partner With Us` vs `Nous contacter` vs `Devenir partenaire`) and Primary/Secondary conversion priority swap presented for client ruling.
- [x] **Slide 2 Curriculum Claims Addressed:** Client offered choice between official accreditation documentation or safer curriculum-aligned wording.
- [x] **Deployment Gating Accurately Framed:** Does not claim copy sign-off alone enables deployment.
- [x] **All Existing Blockers Retained:** Covers metadata (Pack A), 22 operational photos (Pack B), 3 testimonials/logos (Pack C), Yaoundé GPS coordinates, and DRC market scope.
- [x] **Email Word Count Verified:** Send-ready draft is **278 words** excluding subject (288 words including subject), strictly < 300 words.
- [x] **User Dirty Files Preserved:** Zero modifications made to `AGENTS.md`, `Docs/client_approval_packet.md`, `Docs/ui_ux_structure.md`, or `Docs/wireframes.md`.
- [x] **Zero External Transmissions:** Draft held locally in `Docs/` for user dispatch.
