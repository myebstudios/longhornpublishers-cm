# Longhorn Publishers Cameroon Ltd — Client Approval Packet

**Document Owner:** Marty (Lead Marketer & Brand Strategist, Gerer Build Studio)  
**Prepared For:** Executive Leadership & Managing Director, Longhorn Publishers Cameroon Ltd  
**Date:** 13 September 2026  
**Target Domain:** `longhornpublishers-cm.com`  
**Deliverable Path:** `Docs/client_approval_packet.md`  

---

## Executive Summary

Prior to final production DNS deployment of the **Longhorn Publishers Cameroon Ltd** corporate website, this Approval Packet formally requests executive client sign-off on two key launch governance dependencies:

1. **Approval of Localized French URL Slugs** for core public site navigation.
2. **Authorization & Content Provision for 3 Client Testimonials and Logos** to seed the Phase 2 social proof carousel.

> **Brand Governance Note:** Per Gerer Build Studio policy, no placeholder testimonials, unverified client quotes, or unauthorized partner logos will be displayed on the public site. Phase 1 launches strictly with verified corporate trust indicators (*60+ years parent PLC heritage, 6+ years local Yaoundé presence, 100% bilingual capability*) until this packet is returned with formal written sign-off.

---

## 1. Localized French URL Slugs Approval Request

Technical implementation of sub-path bilingual routing (`/en/` and `/fr/`) is complete. Please review and approve the following drafted French localized URL slugs for the primary site sections:

| English Page | Drafted French URL Path | Section Description | Status |
|---|---|---|---|
| About Us | `/fr/a-propos` | Local heritage, company vision, mission, and team capacity | ⏳ Pending Sign-Off |
| Publishing Services | `/fr/services-edition` | Editorial, creative, and print production services | ⏳ Pending Sign-Off |
| Why Choose Us | `/fr/pourquoi-nous-choisir` | Value proposition, quality commitment, and process | ⏳ Pending Sign-Off |
| News & Updates | `/fr/actualites` | Company news feed, title releases, and events | ⏳ Pending Sign-Off |

### Action Required for URLs:
Indicate approval or provide official preferred terminology in the [Required Client Response Form](#3-required-client-response-form) below.

---

## 2. Three (3) Approved Client Testimonials & Partner Logos Request

To validate credibility with educational institutions, ministries, and B2B publishing partners, please provide **3 approved client quotes** along with written authorization to publish their organization logos.

### Required Fields per Testimonial:

#### **Testimonial 01**
- **Quote Text (EN or FR):** `[ Insert approved quote text here ]`
- **Client Name:** `[ Full Name of Spokesperson ]`
- **Title / Role:** `[ e.g., Headteacher / Programme Director / Publishing Director ]`
- **Organization Name:** `[ Full Name of School, NGO, Ministry, or Partner ]`
- **Logo Asset:** `[ Attach high-res logo file (.png or .svg, transparent background) ]`

#### **Testimonial 02**
- **Quote Text (EN or FR):** `[ Insert approved quote text here ]`
- **Client Name:** `[ Full Name of Spokesperson ]`
- **Title / Role:** `[ e.g., Curriculum Specialist / B2B Partner ]`
- **Organization Name:** `[ Full Name of Partner Organization ]`
- **Logo Asset:** `[ Attach high-res logo file (.png or .svg, transparent background) ]`

#### **Testimonial 03**
- **Quote Text (EN or FR):** `[ Insert approved quote text here ]`
- **Client Name:** `[ Full Name of Spokesperson ]`
- **Title / Role:** `[ e.g., Senior Inspector / Regional Co-ordinator ]`
- **Organization Name:** `[ Full Name of Organization ]`
- **Logo Asset:** `[ Attach high-res logo file (.png or .svg, transparent background) ]`

---

## 3. Required Client Response Form

Please complete, sign, and return this form to **Gerer Build Studio** (`yv@gererbuildstudio.com` & `marty@gererbuildstudio.com`).

```
================================================================================
FORMAL CLIENT APPROVAL & SIGN-OFF FORM
Longhorn Publishers Cameroon Ltd Corporate Website (longhornpublishers-cm.com)
================================================================================

SECTION A: FRENCH LOCALIZED URL SLUGS
[ ] APPROVED AS DRAFTED:
    - /fr/a-propos
    - /fr/services-edition
    - /fr/pourquoi-nous-choisir
    - /fr/actualites

[ ] APPROVED WITH AMENDMENTS (specify requested changes below):
    - About Us alternative:            /fr/__________________________________
    - Publishing Services alternative: /fr/__________________________________
    - Why Choose Us alternative:       /fr/__________________________________
    - News & Updates alternative:      /fr/__________________________________


SECTION B: SOCIAL PROOF & TESTIMONIALS (3 APPROVED QUOTES)
[ ] ATTACHED & AUTHORIZED:
    I confirm that the 3 provided testimonials and organization logos are fully 
    authorized for public display on longhornpublishers-cm.com.

[ ] DEFER TO PHASE 2 (POST-LAUNCH):
    Proceed with Phase 1 launch using corporate trust indicators only; 
    testimonials will be provided post-launch.


SECTION C: EXECUTIVE SIGN-OFF
Authorized Signatory Name: ____________________________________________________
Title / Position:         ____________________________________________________
Entity:                   Longhorn Publishers Cameroon Ltd
Date:                     ______________________
Signature:                ______________________
================================================================================
```

---

## 4. Next Steps & Timeline

1. **Client Return:** Longhorn Cameroon management reviews and returns this signed document.
2. **Route Finalization:** If any French URL slug amendments are requested, routes are updated in `src/i18n/routes.ts`.
3. **Phase 2 Ingestion:** Upon receipt of Section B quote assets, testimonials are ingested into the live CMS database via `/admin`.
