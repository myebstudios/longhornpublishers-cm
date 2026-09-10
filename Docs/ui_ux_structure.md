# UI/UX Structure & Sitemap: Longhorn Publishers Cameroon

**Prepared by:** UI/UX Designer, Gerer Build Studio  
**Prepared for:** Yv (CEO), Gerer Build Studio  
**Project:** Longhorn Publishers Cameroon Corporate Website  

---

## 1. Executive Summary & Strategic Pivot

Following executive direction, the Longhorn Publishers Cameroon website will **not** mirror the Kenyan HQ's generic catalog layout. Instead, it will be a bespoke, modern, B2B-focused platform centered around **Professional Publishing Services**. The platform will position the Cameroon entity as a premium, end-to-end publishing partner capable of handling everything from manuscript to final printed book, reflecting the exact value propositions outlined in the September 2026 Company Profile. 

## 2. Sitemap

The architecture has been reimagined to focus on service delivery, credibility, and client acquisition, rather than acting as a standard online bookstore.

*   **1. Home**
    *   Hero: Professional Publishing Services (Quality. Precision. Impact.)
    *   Overview: About the Cameroon Branch
    *   Quick Services Grid
    *   Value Proposition (Why Choose Us)
    *   CTA: Let's Work Together
*   **2. About Us**
    *   Heritage & Local Presence (PLC backing, Yaoundé presence)
    *   Core Identity: Purpose, Vision, Mission, Values
    *   Our Team & Capacity (Editorial, Design & Production, Project Management)
*   **3. Publishing Services**
    *   Editorial (Editing, Proofreading, Translation)
    *   Creative (Designing, Illustration)
    *   Production (Printing)
    *   The 5-Step Process (Consultation to Delivery)
*   **4. Catalogue**
    *   Filters: Level (Primary/Secondary), Subject, Language (EN/FR)
    *   Catalogue Grid + Title Detail view
    *   National Curriculum alignment (Cameroon & DRC)
*   **5. Why Choose Us**
    *   Local Presence, Regional Expertise
    *   Quality Commitment
    *   Bilingual capabilities in action
*   **6. Contact Us**
    *   Location (Total École de police, Tsinga)
    *   Direct Contacts & Inquiry Form
*   **7. News & Updates** *(footer nav, not primary header nav)*
    *   Article List (Company News / New Titles / Partnerships / Events)
    *   Article Detail + Related Articles

> Full page-by-page content mapping, URL structure, and open items now live in `sitemap.md` — this document defers to it as the source of truth for site structure.

## 3. Bilingual Experience (English / French)

Cameroon is a bilingual nation, and the company heavily markets its seamless English/French capabilities.

*   **Seamless Toggle:** A sleek EN/FR switch in the primary navigation.
*   **Dynamic Localization:** Content is not just translated, but localized to reflect the "Cultural Relevance" emphasized in the brand's profile.
*   **Persistent Preference:** User's language choice is saved for seamless subsequent visits.

## 4. Page Layouts & Wireframe Descriptions

### 4.1. Global Elements
*   **Header:** Transparent on hero sections, turning solid on scroll. Features the Longhorn Cameroon logo, clean navigation links, a prominent EN/FR toggle, and a "Get in Touch" high-contrast button.
*   **Footer:** Dark burgundy background with green accents. Contains office address (Tsinga, Yaoundé), phone numbers, email, quick links, and a newsletter/insights signup.

### 4.2. Home Page
*   **Hero Section:** A dynamic, full-bleed cinematic header featuring a collaborative team environment (inspired by the PDF cover). Headline: "Professional Publishing Services." Subheadline: "Quality. Precision. Impact." with a primary CTA "Partner With Us."
*   **"Who We Are" Block:** A sophisticated split-screen layout. Left: A vibrant image of the local team. Right: A concise summary of their identity—backed by 60 years of excellence, firmly rooted in Cameroon.
*   **Services Carousel:** Modern, card-based carousel highlighting Editing, Proofreading, Translation, Designing, Illustration, and Printing. Hovering reveals a brief description and an icon.
*   **Catalogue Preview:** A 4-card grid of featured/recent titles (cover, level, subject, language tag) with a "Browse Full Catalogue" link to `/catalogue`.
*   **"One Partner, End-to-End Solution" Banner:** A wide, striking banner emphasizing the lack of need for multiple vendors. 
*   **Trust Indicators:** Logos or stats highlighting 60+ years experience, presence in Central Africa, and DRC.
*   **Latest Updates:** A 3-card row of the most recent News & Updates articles with a "View All News" link to `/news`, keeping the homepage visibly current.

### 4.3. Publishing Services Page
*   **Hero:** "From Manuscript to Masterpiece."
*   **Service Deep-Dive:** A zigzag layout (alternating text and imagery) detailing the specific services:
    *   *Editorial:* Focus on accuracy, structure, and bilingual translation.
    *   *Creative:* Focus on fine arts, cohesive layout, and cover design.
    *   *Production:* High-quality printing and delivery.
*   **Our Process (Interactive Timeline):** A vertical or horizontal interactive timeline showcasing the 5 steps:
    1. Consultation
    2. Planning
    3. Execution
    4. Quality Review
    5. Delivery

### 4.4. Catalogue Page
*   **Hero:** "Our Learning Materials" — primary & secondary titles aligned to the Cameroon & DRC national curricula.
*   **Filter Bar:** Level (Primary/Secondary), Subject, Language (EN/FR) — sticky beneath the header on scroll.
*   **Catalogue Grid:** Card-based layout with cover thumbnail, title, level, subject, and language tag. "Load More" pagination.
*   **Title Detail View:** Large cover, description, curriculum alignment, available languages, and a "Request This Title" CTA linking to `/contact`.

### 4.5. About Us Page
*   **Core Identity Grid:** A clean, 4-column grid displaying Purpose, Vision, Mission, and Values, utilizing custom iconography.
*   **Team & Capacity:** 
    *   Three distinct sections with visual cues: Editorial Team, Design & Production Team, and Project Management.
    *   Emphasis on their "Flexible to adapt to changing requirements" ethos.
*   **Quality Commitment:** A dedicated section outlining their rigorous standards, cultural relevance, and competitive pricing.

### 4.6. Contact Us Page
*   **Hero:** "Let's Work Together."
*   **Layout:**
    *   *Left Panel (Info):* Bold typography displaying the Yaoundé address, phone numbers (+237 672 49 10 93 / +237 657 51 92 03), and email.
    *   *Right Panel (Form):* A sleek, modern form tailored for B2B inquiries (e.g., "Project Type: Educational Material, Training Resource, Report, etc.").
*   **Map Integration:** A stylized, branded map pinpointing the Total École de police, Tsinga location.

### 4.7. News & Updates Page
*   **Hero:** Compact banner, "News & Updates."
*   **Category Filter:** Company News / New Titles / Partnerships / Events.
*   **Article List:** Card grid — thumbnail, date, category tag, headline, excerpt.
*   **Article Detail:** Hero image, body content (max-width 720px for readability), Related Articles row.
*   **Content Ownership Note:** Managed via the custom admin panel (see `admin_panel_spec.md`) so the Cameroon team can publish without developer involvement post-launch.

## 5. Visual Identity & UI Design System

To break away from the HQ mirror and establish a bespoke Cameroon identity:

*   **Color Palette (Derived from Profile):** 
    *   *Primary:* Deep Burgundy/Maroon (Authoritative, Grounded) and Vibrant Leaf Green (Growth, "Expanding Minds").
    *   *Secondary:* Warm Mustard/Orange and deep Purple accents for categorization (matching the team capacity colors in the PDF).
    *   *Backgrounds:* Soft creams and crisp whites for high legibility.
*   **Typography:** 
    *   *Headings:* A modern, bold geometric sans-serif (e.g., Montserrat or Poppins) to convey impact and professionalism.
    *   *Body:* A highly readable, clean sans-serif (e.g., Inter or Roboto) to handle bilingual text gracefully.
*   **Imagery Style:**
    *   Move away from generic textbook stock photos. Use authentic imagery of collaborative professionals, editors reviewing manuscripts, modern printing presses, and diverse Cameroonian teams (as seen in the PDF).
*   **UI Components:**
    *   Soft rounded corners on cards to reflect the curved graphic elements in the PDF.
    *   Micro-interactions on hover (e.g., icons subtly expanding) to make the B2B experience feel modern and engaging.
