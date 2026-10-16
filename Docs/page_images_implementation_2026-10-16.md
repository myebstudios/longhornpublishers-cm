# PAGE-IMAGES implementation — 16 October 2026

Task: `fa8c3263-e344-4ece-a78b-2b50d9bdedfc`. Local work on main; no push or deploy. Yv owns the board moves.

## Scope and storage

Migration: **`018_page_images`** (`netlify/database/migrations/018_page_images/migration.sql`). It adds `page_images(key, image_id, updated_at)` and nullable `services.image_id`. No content rows are inserted, updated or unpublished. Existing service image values default to null.

The fixed slot registry has 14 slots, shared by API validation, admin presentation and public fallback resolution:

- About: hero, heritage, quality/distribution, and the three existing capacity illustrations.
- Services: hero; each service's detail photograph is controlled by its own record's `image_id`.
- Why choose us: hero and three existing pillar image positions.
- Catalogue, News and Contact: hero each. Title covers and article images retain their existing editors.

Repeated capacity/pillar illustrations retain their existing three-position rotation. Both languages share image settings and keep their existing alternative text/decorative-image treatment. Clearing a custom image restores the exact original static file. Hero/split responsive handling recognizes `/img/` paths when looking up intrinsic dimensions, preserving the original size limits. Service public splits, editor previews and saved cards share the existing slug/category fallback mapping.

## API and media lifecycle

`GET /api/page-images-admin?page=about|services|why|catalogue|news|contact` returns saved slots for that page. `PUT /api/page-images-admin` accepts only `{key, image_id}` for one allowlisted slot; `image_id` is an uploaded JPEG/PNG/WebP key or explicit null. Admin authorization applies to reads and writes. Invalid slots, arbitrary URLs, traversal, SVG uploads, missing image values and unrelated fields are rejected. Non-null images must exist in the existing `longhorn-media` store before saving.

Each slot is upserted independently, preserving sibling images and page copy. Services support image create/replace/clear; an older editor that omits `image_id` preserves the stored image. Existing bilingual copy, classification, publication and ordering rules remain.

Media authorization now releases saved page-image references and images on published services. Unsaved uploads and images referenced only by draft services remain private. Page-image settings take effect on Save, like shared site settings; there is no separate page-image publication flag. Service replacement, unpublish and delete purge media references; image changes also purge the appropriate public content tags. Public media approval and services handlers were extracted into dependency-injected modules so tests exercise their actual SQL and write paths.

## Admin behavior

Each of the six pages has a Page images section with saved/default previews and a header jump link. Each Edit opens the page's existing v2 dialog and picker/upload flow. The same dirty guard, pending-operation lock, keyboard cancellation and focus rules apply. Upload or save failures retain the draft and saved reference. A fresh read detects changes to the same slot before Save; sibling changes do not overwrite or block an unrelated slot edit. Save restores focus to the rebuilt card's Edit button.

The services item editor adds the image picker, preview and clear action. Default previews follow edits to slug/category. Its form contains a control named `id`, which shadows `form.id`; the new binding reads the HTML id attribute explicitly and has regression coverage.

## Verification

- `npm run build`, plus strict TypeScript checks covering admin and the changed function entry points.
- All **14 `test:*` scripts: 155 tests**, zero failures/skips. The ten new tests exercise the real migration, allowlists, fallback files, authorization/method errors, missing uploads, sibling/page-copy preservation, cache purge targets, public media approval/revocation, service CRUD and older-editor preservation, preview mapping, and production responsive defaults.
- New migration applied against an isolated in-memory PostgreSQL-compatible database and a separate temporary PostgreSQL cluster. The standard routing test also manages and migrates its usual local test database. No production database was changed.
- Browser checks at 375×667 across all six admin pages: modal pickers, successful upload/save, failed upload/save retention, dirty Escape/Keep editing, focus restoration, service image save and public approval. Saved removal restores the public fallback.
- Real local public rendering against the isolated PostgreSQL database: all twelve EN/FR routes returned 200; custom hero/section references rendered in every declared position, and uploaded images loaded through a local media harness. Original hero fallbacks verified on unset pages; service custom/default previews checked. Browser harness authentication and storage were mocked; no production session or credentials were used.
- No public or admin stylesheet changes. Screenshots are in ignored `output/playwright/`; harness/database files are outside the repository.

## Release checks requiring Yv/Dell after an approved push

Confirm `018_page_images` is applied before testing runtime pages. In a real signed-in session, upload/save/replace/clear page and service images, verify both languages anonymously, check draft-service media protection, and confirm Netlify Blob/Image CDN delivery and cache purging. Real Identity authorization, deployed blob storage, CDN invalidation and screen-reader announcements cannot be certified by the local harness.
