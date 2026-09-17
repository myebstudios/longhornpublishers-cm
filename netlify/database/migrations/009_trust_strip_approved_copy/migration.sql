-- Migration 009: restore the APPROVED trust strip copy.
--
-- homepage_content.trust_stats was seeded by migration 007, which was generated
-- from the i18n dictionaries BEFORE commit e2f2e44 corrected item 4. Because a
-- populated CMS row overrides the dictionaries, production has been serving
-- pre-approval trust-strip copy ever since 007 shipped -- confirmed against the
-- live site. Every check we ran inspected the fallback build, which was
-- correct, so the divergence was invisible to all of them.
--
-- The values below are generated verbatim from src/i18n/en.ts and
-- src/i18n/fr.ts rather than retyped. The French strings carry U+2019
-- typographic apostrophes; those are not SQL delimiters and must survive
-- byte-for-byte, so they are emitted through JSON.stringify rather than being
-- hand-quoted.
--
-- Item 4 is deliberately "Aligned to national curricula" / "Conforme aux
-- programmes nationaux". It must NOT regain the DRC wording: that was reverted
-- for cause, we hold zero DRC titles, and the client has not confirmed whether
-- they distribute there.
--
-- Scoped and idempotent: it updates the single default row only, touches no
-- other column, and is a no-op if that row does not exist.

UPDATE homepage_content SET trust_stats = '[{"value":"","label_en":"60+ years parent PLC experience across Africa","label_fr":"60+ ans d’expérience du groupe PLC en Afrique"},{"value":"","label_en":"Local publishing team in Tsinga, Yaoundé","label_fr":"Équipe d’édition basée à Tsinga, Yaoundé"},{"value":"","label_en":"100% Bilingual EN & FR publishing capability","label_fr":"Capacité d’édition 100% bilingue EN & FR"},{"value":"","label_en":"Aligned to national curricula","label_fr":"Conforme aux programmes nationaux"}]'::jsonb
  WHERE id = 'default';
