-- CLIENT-3 C05/C15 release correction (Yv, CLIENT-3B addendum 6504d63).
--
-- 012 made every existing row 'unclassified', which would hide the whole live
-- catalogue. Titles that were already published keep their publication
-- decision and stay public as text-only "Other developed titles": their
-- Book List status is unverified, so no booklist claim and no cover
-- (cover_rights_approved stays false). Unpublished and demo rows are left
-- 'unclassified' until an admin decides.
--
-- A separate migration, not an edit to 012: 012 is already applied to local
-- QA databases, and both run in the same production deploy.
UPDATE catalogue_titles
SET classification = 'other_developed',
    updated_at = now()
WHERE published = true
  AND is_demo = false
  AND classification = 'unclassified';
