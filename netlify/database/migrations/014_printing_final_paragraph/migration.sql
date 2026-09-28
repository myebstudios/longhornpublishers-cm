-- CLIENT-3 C14: remove the Printing service's final paragraph ("Because
-- production sits…" / "La production étant intégrée…") from the live CMS row.
-- Paragraph-scoped so any other editor changes to the description survive;
-- a no-op if an editor has already removed it. A deploy clears the CDN cache.
UPDATE services
SET description_en = regexp_replace(description_en, '\s*\n\s*\nBecause production sits in the same house as editorial[^\n]*$', ''),
    description_fr = regexp_replace(description_fr, '\s*\n\s*\nLa production étant intégrée à la maison d’édition[^\n]*$', ''),
    updated_at = now()
WHERE slug = 'printing'
  AND (description_en LIKE '%Because production sits in the same house as editorial%'
       OR description_fr LIKE '%La production étant intégrée à la maison d’édition%');
