# Admin V2-5 and V2-6 implementation — 12 October 2026

Tasks: V2-5 `b46b8f88-ede5-4d68-b04c-9fccc5ba56a5`; V2-6 `dfa09c78-0982-4989-bdff-19a1070019e9`.

## V2-5

- All publicly listed titles expose uploaded covers by default, regardless of National Book List membership or the legacy rights flag. Public catalogue queries, detail/homepage consumers, catalogue API and media approval agree. Published/classified and production non-demo listing boundaries remain; drafts, unclassified titles and abandoned uploads remain private. Admin badges and classification/rights copy match the new cover rule. Existing classification validation and stored client records are unchanged.
- News list/detail queries now select `hero_image_id`. News cards, homepage news teasers and article pages render that image; cards retain their category-icon fallback and articles omit the image when absent. EN and FR share the rendering implementation. Media remains served through `/api/media`.
- Removed the shared editor's raw working-summary disclosure and its unused styling.
- Fixed section ownership for file inputs in media groups. The Who we are picker and fallback hero picker are visible and retain existing upload/clear/preview behavior. Section saves preserve the whole parent record.
- EN trust item 3 is exactly `100% Bilingual publishing capability`.

### News root cause and read-only live evidence

The admin had saved a valid image on a published article. An authenticated GET of `/api/news-admin` found the stored key; anonymous media GET returned **200, image/png**. The public article returned 200 but its HTML did not reference that key. The public list/detail SQL omitted `hero_image_id`; news cards always used a category icon, and the article template had no image renderer. This was a public read/render omission, not a failed upload or missing client data.

Credentials were read in memory from the authorized local credential file. No credential was printed, copied to an artifact, added to a browser harness, or stored in the repository. No client record or production media was changed.

## V2-6

Implemented §13 from Z's `50d6b5a`: exact cream/burgundy/green/orange/semantic tokens, sidebar/rail/drawer and logo backing, greeting, card and overlay shadows, section headers, primary/secondary/selected/destructive states, semantic badge paint, focus and pending visibility, and all standalone auth modes. Dynamic status badges use a dedicated renderer; user-authored tags remain neutral metadata. Metric strips/chips follow their metric meaning; the existing Subjects metric remains neutral, and no new metric or health signal was invented.

Existing dashboard metrics had no icon slot. Decorative 40px chips use an absolute position in the existing cards, retaining the grid and metrics. Header backplates extend within existing spacing without moving content. No public palette changes; the only public CSS edit is the news-card image fit rule required by V2-5.

## Verification

- `npm run build` and strict admin TypeScript checks pass.
- Every `test:*` script passes: **13 scripts, 145 tests**, zero failures/skips. Coverage includes the revised cover rule, media/query boundaries, uploaded/no-image news paths, media ownership and sibling preservation, semantic badge paint, exact tokens and contrast thresholds before rounding.
- Mocked local browser harness at **375×667**: Who we are picker visible, upload attaches image, Save changes only the image field; all sibling fields, publication and custom 6123ms timing preserved. Working-summary disclosure absent.
- Synthetic public article fixture at 375px: French image loads, localized body remains intact, no horizontal overflow. Shared EN/FR template and no-image behavior covered by tests. Temporary fixture route removed before final build.
- Local computed-colour checks cover default/hover/pressed/selected/pending/invalid controls, badge/message roles, primary/publish/destructive pairs, light/dark keyboard focus, all four auth forms, editor header and shadow, 1024px rail and mobile drawer. These checks caught and resolved specificity conflicts in selected-control and invalid-border styling.
- Visual inspection: desktop dashboard, mobile login, mobile editor and French article. Screenshots are local under ignored `output/playwright/`; harnesses use synthetic data and no production session.

## Release handoff

All changes are local on main. No push or deployment. Unrelated pre-existing dirty files excluded. Board tools are unavailable in this session, so claiming/moving tasks requires Yv's board access.

After Yv's release, Dell should verify live EN/FR cover display (catalogue/detail/homepage/API), the affected news image (card/detail/home teaser), Who we are upload/save and preservation, and brand paint/focus in a real signed-in session. Local mocks do not replace live media/CDN and screen-reader checks.
