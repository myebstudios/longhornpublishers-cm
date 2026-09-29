-- CLIENT-3 C04 follow-up: 015 stored the English Who We Are paragraph 2
-- without its closing full stop (the French has one). Append it only when the
-- paragraph still ends exactly as 015 wrote it; a no-op after any editor change.
UPDATE homepage_content
SET who_we_are_copy_en = who_we_are_copy_en || '.'
WHERE id = 'default'
  AND who_we_are_copy_en LIKE '%reflecting the country''s bilingual education environment';
