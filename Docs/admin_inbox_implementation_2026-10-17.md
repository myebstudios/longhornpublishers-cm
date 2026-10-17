# Admin Inbox

Local implementation for Yv’s INBOX request. No push, deployment, production write, or credentials used.

## Storage and notifications

Migration: `019_form_submissions/migration.sql`. Additive table with UUID IDs, unique Netlify submission IDs, constrained form/status values, nullable mapped fields, cleaned original JSON, source timestamps and filter/count indexes. No existing client records are changed.

The existing `submission-created` event function first attempts the idempotent insert, then independently attempts its existing Brevo notification. Storage failure or a missing database never prevents the email attempt. Email failure never rolls back the insert. `[inbox]` logs contain outcomes, not submission contents or raw database errors. Retry events preserve the original row and its later status; existing email retry behaviour remains unchanged.

The contact form’s `projectType` maps to `project_type`; repeated language values become readable text. Only `bot-field` and `form-name` are removed from stored JSON.

## Admin experience

`/api/form-submissions-admin` requires `requireAdmin` for every method, including counts. Responses and errors use private/no-store headers. GET supports validated form/status/search/page/page_size, literal substring search, stable descending date/ID pagination, and counts-only reads. PUT accepts only ID/status; DELETE removes only the mirrored Inbox row. No public Inbox API is added.

Workspace navigation includes Inbox and a capped visual badge with the full new-submission count in its accessible label. The dashboard’s New inquiries metric counts new contact submissions and links to Inbox. Count failures show an unavailable state rather than a fabricated zero.

Inbox uses the current admin tokens/cards/controls and shared dialog. Inquiries and Newsletter tabs support New, Read, Archived and All, search, pagination and retry. Opening a new item marks it read; archived items stay archived until explicitly changed. Details show submitted fields as text, safe email reply links with the specified subject, status actions, and deletion through `confirmAction`. Escape cancels deletion, returning to the detail dialog. Delete failure keeps details available to retry.

Newsletter CSV export runs in the browser and fetches every page matching the selected status/search, rather than just the visible page. It includes email/date/status, UTF-8 BOM, CRLF records and quote escaping; formula-like values are prefixed to prevent spreadsheet evaluation. No data is put in local storage.

## Validation

- Build and strict TypeScript checks for the new frontend/backend modules.
- All 16 `test:*` scripts: 168 tests, no failures or skips. New Inbox tests use the real migration and SQL handlers in isolated PGlite: mapping, constraints, duplicate events, notification isolation, authorization, query/body validation, literal search, pagination, counts, status updates, deletion, private errors, CSV and mailto.
- Local browser harness uses synthetic `.invalid` submissions and the real API handler against isolated PGlite. It bypasses Identity only inside ignored local harness files. Verified read-on-open/count updates, literal HTML display, exact reply subject, archive, Escape cancelling delete, PUT/DELETE failure retention, and CSV download containing 103 unique signups across two export requests. Mobile layout at 375×667 has document width 375px (no horizontal overflow). Local screenshots and the harness are in ignored `output/playwright/`. The repository’s admin redesign spec currently ends at §13; no §14 text was available, so styling follows the existing admin implementation and tokens.

## Release checks

After an approved push, verify migration application, real Netlify submission event shape/DB credentials, Brevo delivery, and Identity 401/403/admin access. Submit an approved test contact inquiry and newsletter signup to confirm the event-to-Inbox-to-email flow. No production submissions were made for local verification.

This mirrors future submission events. Existing historical Netlify Forms records are not backfilled. Deleting an Inbox row leaves the original Netlify Forms submission in place.
