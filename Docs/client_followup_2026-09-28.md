# Client Intake Audit & Launch Follow-Up: Book Covers & Outstanding Blockers

**Document Owner:** Marty (Lead Marketer & Brand Strategist, Gerer Build Studio)  
**Project:** Longhorn Publishers Cameroon (`longhornpublishers-cm`)  
**Target Path:** `Docs/client_followup_2026-09-28.md`  
**Date:** 28 September 2026 (Revised per CEO/Yv Review)  
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

## 2. Strategic Quality & Governance Adjustments (Hero Slide 2 & Dependencies)

Prior to issuing the client follow-up, our internal quality audit identified two critical risks in Homepage Hero Slide 2 (`Docs/hero_slide_copy.md`):
1. **Unsubstantiated Curriculum Claim:** The proposed draft uses `"National Curriculum Approved"` (EN) and `"Matériels pédagogiques agréés"` (FR). Unless Longhorn Cameroon provides formal ministerial accreditation certificates, publishing unverified regulatory claims creates legal exposure. We present the client with a choice: provide formal substantiation or approve verified, safer wording (`"Curriculum-Aligned Learning Materials"` / `"Matériels pédagogiques conformes aux programmes nationaux"`).
2. **Hero Image Sub-Par Resolution:** The current image mapped to Slide 2 (`public/img/lh-catalogue-shelves.jpg`) measures **410 × 410 px**, far below the desktop hero minimum of **1920 × 1080 px**. A high-resolution replacement image must be provided before production deployment.
3. **Deployment Prerequisites:** Production slide replacement is not unblocked by copy sign-off alone; it requires resolution of high-resolution image assets and multi-bot QA verification.
4. **Missing Endorsements (Pack C):** 3 client testimonials and partner logos with signed publication authorizations remain outstanding.

---

## 3. Send-Ready Client Follow-Up Draft

> [!NOTE]
> **Instructions for User:** Attach the four-slide Pack D copy from `Docs/hero_slide_copy.md` when sending this draft. No message has been sent.

```markdown
Subject: Urgent Launch Review: Hero Slide Adjustments, Book Covers & Open Blockers

Dear Longhorn Cameroon Team,

Thank you for the four book covers. All meet our 800×1200 px minimum.

Please confirm these launch items:

1. Homepage Hero Slide Sign-Off & Revisions (Pack D — Launch Blocker)
Please review the attached four bilingual hero slides:
- Slide 2 claims "National Curriculum Approved" / "agréés". Please provide accreditation evidence or approve "Curriculum-Aligned Learning Materials" / "Matériels pédagogiques conformes aux programmes nationaux".
- Its current image is 410×410 px. Please supply a replacement at least 1920×1080 px, perhaps from Pack B.
Publication follows copy approval and asset verification.

2. Book Cover Metadata (Pack A)
Please supply the catalog details for the 4 covers: official title (EN/FR), ISBN/Product Code, education level, subject taxonomy, and descriptions, plus any additional covers for the initial 6–12 title pack.

3. Operational Photos (Pack B)
Please send the 22 requested photos, including a full-width replacement for slide 2, or confirm which images can follow after launch.

4. Missing Testimonials & Partner Logos (Pack C)
Please provide 3 approved client testimonials and partner logos with signed publication releases, or confirm deferring them to Phase 2 while launching with factual heritage metrics.

5. Yaoundé Office GPS Coordinates
Please share exact latitude/longitude coordinates for your Tsinga office to pin the contact map accurately.

6. DRC Market Scope
Please confirm whether you distribute DRC-aligned titles (with ISBNs) or if catalogue filtering should remain strictly locked to Cameroon.

Thank you for your guidance as we prepare these launch assets.

Warm regards,
The Gerer Build Studio Team
```

---

## 4. Governance & Integrity Checklist

- [x] **Cover Audit Completed:** Exact pixel dimensions, aspect ratio, pass/fail status, and apparent titles documented.
- [x] **Slide 2 Unsupported Claim Addressed:** Client offered choice between official substantiation or safer curriculum-aligned phrasing.
- [x] **Slide 2 Image Resolution Flagged:** 410×410 px asset identified and 1920×1080 px replacement requested.
- [x] **Deployment Gating Accurately Framed:** Does not claim copy sign-off alone enables deployment.
- [x] **Missing Logos & Testimonials Included:** Pack C requirements explicitly restated.
- [x] **Word Count Verified:** Send-ready email is ~258 words (strictly < 300 words).
- [x] **User Dirty Files Preserved:** Zero changes made to `AGENTS.md`, `Docs/client_approval_packet.md`, `Docs/ui_ux_structure.md`, or `Docs/wireframes.md`.
- [x] **Zero External Transmissions:** Draft held locally in `Docs/` for user dispatch.
