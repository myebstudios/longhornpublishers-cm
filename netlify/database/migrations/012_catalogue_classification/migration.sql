-- CLIENT-3 (C05/C15): split the public catalogue into verified National Book
-- List titles and other developed titles, and restrict covers to the former.
--
-- Fail-closed by design: every existing row, including the four titles
-- published before this migration, becomes 'unclassified' and leaves the
-- public catalogue until an admin classifies it. Publication authorization
-- (`published`) stays a separate decision. Booklist membership needs private
-- evidence for the exact title/edition/code, recorded here and never rendered.
ALTER TABLE catalogue_titles
  ADD COLUMN classification text NOT NULL DEFAULT 'unclassified',
  ADD COLUMN booklist_evidence_ref text,
  ADD COLUMN booklist_verified_by text,
  ADD COLUMN booklist_verified_at date,
  ADD COLUMN cover_rights_approved boolean NOT NULL DEFAULT false;

ALTER TABLE catalogue_titles
  ADD CONSTRAINT catalogue_titles_classification_check
    CHECK (classification IN ('national_book_list_verified', 'other_developed', 'unclassified')),
  ADD CONSTRAINT catalogue_titles_booklist_evidence_check
    CHECK (
      classification <> 'national_book_list_verified'
      OR (
        nullif(btrim(booklist_evidence_ref), '') IS NOT NULL
        AND nullif(btrim(booklist_verified_by), '') IS NOT NULL
        AND booklist_verified_at IS NOT NULL
      )
    );
