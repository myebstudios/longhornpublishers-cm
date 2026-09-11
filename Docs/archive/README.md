# Archive

## `prototype/`

The original static HTML prototype. It was **read at build time** by
`src/components/PrototypePage.astro`, which injected each page's `<body>` into
an Astro layout and produced French by matching exact English strings against a
hand-maintained pair list.

That approach shipped two classes of defect to production:

- any string absent from the pair list rendered in English on `/fr/` pages, and
- internal engineering notes embedded in the prototype markup (`Docs/README.md`
  references, a `Prototype only` `alert()`, `Map placeholder`) reached live
  visitors.

As of 2026-09-11 all six pages are real Astro components under
`src/components/pages/`, driven by the type-checked dictionaries in
`src/i18n/en.ts` and `fr.ts`. A missing French string is now a build-time type
error rather than silent English on the live site.

**Nothing here is read at build time.** It is kept only as a visual reference
for the original design intent. Do not reintroduce a build dependency on it.
