-- CLIENT-3 D4 (QA b8a30a2): 015 introduced Vision wording that is not in the
-- client DOCX and adds a geographic claim. Revert to the previously approved
-- Vision minus its geography, per Yv. Only rows still holding 015's text change.
UPDATE about_page
SET vision_en = 'To be the publishing partner of choice for institutions that will not compromise on quality.',
    vision_fr = 'Devenir le partenaire éditorial de référence pour les institutions qui refusent tout compromis sur la qualité.'
WHERE id = 'default'
  AND vision_en = 'To be a trusted publishing partner for institutions across Cameroon and Central Africa.';
