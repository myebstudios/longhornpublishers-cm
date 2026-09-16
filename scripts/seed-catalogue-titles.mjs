/**
 * Seed the four client-supplied Longhorn Publishers Cameroon titles as DRAFTS.
 *
 * Source of truth is the cover artwork in Assets/Book covers/, supplied by the
 * client on 2026-09-15. Every field below is traceable to something printed on
 * the artwork. Nothing is inferred, translated or invented:
 *
 *   - No ISBNs, prices, page counts or publication dates. The covers state none,
 *     and the schema has no columns for them.
 *   - No curriculum alignment. Nullable, and left null.
 *   - No French editions. These are English-medium titles; `languages` is ['en'],
 *     which is where the edition claim actually lives. title_fr and
 *     description_fr repeat the English verbatim because both columns are
 *     NOT NULL — repeating is honest, machine-translating would assert a French
 *     edition we have no evidence for.
 *   - Capitalisation is reproduced exactly as printed, including the artwork's
 *     own inconsistency: b1/b2 read "For Secondary schools in Cameroon" while
 *     b3 reads "for secondary schools in Cameroon". We are faithful to the
 *     artwork, not to a house style we invented.
 *   - b2 carries no "Student's book" designation, so its product code has no
 *     type suffix. An honest gap beats a guessed one.
 *
 * DESCRIPTIONS ARE COVER-DERIVED PLACEHOLDERS pending real marketing copy from
 * the client. They restate printed cover text and carry author attribution,
 * which has nowhere else to live until Migration B adds an `author` column with
 * its own admin UI and API field. Do not extend them with pedagogical claims,
 * curriculum assertions or anything about what a book contains.
 *
 * Seeded as DRAFTS (published = false) deliberately. Unlike the seven
 * save-is-live copy tables, catalogue_titles has real draft state — so these
 * are reviewable in the admin panel before any of them reaches the public
 * catalogue. Covers will render for a signed-in admin and 404 publicly, because
 * media authorization derives reachability from PUBLISHED content.
 *
 * NOT demo rows: is_demo = false, no DEMO-CAT-00x slug or code is reused, and
 * the seed-demo path is not imported.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const CLI_SPEC = process.env.NETLIFY_CLI_SPEC ?? 'netlify@27.8.0';
const cli = (...args) => execFileSync('npx', ['-y', CLI_SPEC, ...args], {
  cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
});

/** Our own taxonomy, so genuinely bilingual — unlike the title text. */
const SUBJECTS = [
  { key: 'chemistry', name_en: 'Chemistry', name_fr: 'Chimie' },
  { key: 'physics', name_en: 'Physics', name_fr: 'Physique' },
  { key: 'mathematics', name_en: 'Mathematics', name_fr: 'Mathématiques' },
  { key: 'english', name_en: 'English', name_fr: 'Anglais' },
];

/**
 * Blob keys are fixed rather than random so re-running is idempotent and the
 * mapping from artwork to stored object stays reviewable. The shape matches
 * media.mts's KEY_PATTERN exactly — `uploads/<uuid>.<ext>` — because these are
 * real media records addressed the same way an admin upload would be, not
 * filesystem references.
 */
const TITLES = [
  {
    file: 'b1.png',
    coverUuid: '0d1aeefe-2be4-408f-92c4-2a88f2a7f899',
    product_code: 'LHC-CHEM-F1-SB',
    slug: 'chemistry-form-1-students-book',
    title: 'Chemistry for Secondary schools in Cameroon',
    description: "Chemistry Student's book for Form 1, for Secondary schools in Cameroon. By Fuhnwi Julius.",
    level: 'secondary',
    subject: 'chemistry',
  },
  {
    file: 'b2.png',
    coverUuid: '42b2c4a3-58ca-4d8f-adab-a597dac10697',
    product_code: 'LHC-PHYS-F2',
    slug: 'physics-form-2',
    title: 'Physics for Secondary schools in Cameroon',
    description: 'Physics for Form 2, for Secondary schools in Cameroon. By Clinton Ojong.',
    level: 'secondary',
    subject: 'physics',
  },
  {
    file: 'b3.png',
    coverUuid: '09cd73e7-8897-4de2-9590-a1ce2f7bf956',
    product_code: 'LHC-MATH-F1-TG',
    slug: 'mathematics-form-1-teachers-guide',
    title: 'Mathematics for secondary schools in Cameroon',
    description: "Mathematics Teacher's guide for Form 1, for secondary schools in Cameroon. By Ebenezer T. Fombin and N.L. Ebissouleye Nyamssi.",
    level: 'secondary',
    subject: 'mathematics',
  },
  {
    file: 'b4.png',
    coverUuid: 'cf0f7474-afb0-47ae-b4bb-97a3376ba3e9',
    // No author is credited anywhere on this cover, so none is asserted.
    product_code: 'LHC-ENG-C5-WB',
    slug: 'english-workbook-class-5',
    title: 'English Workbook',
    description: 'English Workbook for Class 5.',
    level: 'primary',
    subject: 'english',
  },
];

const quote = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

function assertLocalDatabase() {
  const { connection_string: connectionString, context } = JSON.parse(cli('database', 'connect', '--json'));
  if (!connectionString) throw new Error('No database connection string returned.');
  const { hostname } = new URL(connectionString);
  if (!['localhost', '127.0.0.1', '::1'].includes(hostname)) {
    throw new Error(`Refusing to seed: database host "${hostname}" is not loopback. Production seeding is a separate, separately authorised step.`);
  }
  if (context && context !== 'dev') throw new Error(`Refusing to seed: Netlify context is "${context}", expected "dev".`);
  return { hostname, context: context ?? 'dev' };
}

/**
 * Write each cover into the local blob store under the key the database will
 * reference, alongside the same metadata shape media.mts writes on upload.
 *
 * Deliberately independent of the demo cover helper: this content is not demo
 * content and must not share its code path.
 */
async function writeCovers(projectRoot, siteId) {
  const store = `site:longhorn-media`;
  const sourceDir = path.join(projectRoot, 'Assets', 'Book covers');
  const written = [];
  for (const title of TITLES) {
    const key = `uploads/${title.coverUuid}.png`;
    const source = path.join(sourceDir, title.file);
    const bytes = await fs.readFile(source);
    for (const kind of ['entries', 'metadata']) {
      const dest = path.join(projectRoot, '.netlify', 'blobs-serve', kind, siteId, store, key);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      if (kind === 'entries') await fs.writeFile(dest, bytes);
      else {
        await fs.writeFile(dest, JSON.stringify({
          contentType: 'image/png',
          originalName: title.file,
          uploadedAt: new Date().toISOString(),
        }));
      }
    }
    written.push({ key, file: title.file, bytes: bytes.length });
  }
  return written;
}

const dryRun = process.argv.includes('--dry-run');
const projectRoot = process.cwd();

const subjectSql = SUBJECTS.map(({ name_en, name_fr }) =>
  `INSERT INTO subjects (name_en, name_fr) VALUES (${quote(name_en)}, ${quote(name_fr)}) ON CONFLICT (name_en) DO UPDATE SET name_fr = EXCLUDED.name_fr`,
);

const titleSql = TITLES.map((t) => `INSERT INTO catalogue_titles (
  product_code, title_en, title_fr, slug, level, subject_id, languages,
  cover_image_id, description_en, description_fr,
  curriculum_alignment_en, curriculum_alignment_fr, featured, published, is_demo
) VALUES (
  ${quote(t.product_code)}, ${quote(t.title)}, ${quote(t.title)}, ${quote(t.slug)}, ${quote(t.level)},
  (SELECT id FROM subjects WHERE name_en = ${quote(SUBJECTS.find((s) => s.key === t.subject).name_en)} AND is_demo = false),
  '["en"]'::jsonb, ${quote(`uploads/${t.coverUuid}.png`)}, ${quote(t.description)}, ${quote(t.description)},
  NULL, NULL, false, false, false
) ON CONFLICT (slug) DO UPDATE SET
  product_code = EXCLUDED.product_code, title_en = EXCLUDED.title_en, title_fr = EXCLUDED.title_fr,
  level = EXCLUDED.level, subject_id = EXCLUDED.subject_id, languages = EXCLUDED.languages,
  cover_image_id = EXCLUDED.cover_image_id, description_en = EXCLUDED.description_en,
  description_fr = EXCLUDED.description_fr, updated_at = now()`);

if (dryRun) {
  console.log('Dry run — no database connection opened, no blobs written.\n');
  for (const sql of [...subjectSql, ...titleSql]) console.log(`${sql};\n`);
} else {
  const { hostname, context } = assertLocalDatabase();
  console.log(`Seeding catalogue against ${hostname} (context: ${context}).\n`);

  const siteId = JSON.parse(await fs.readFile(path.join(projectRoot, '.netlify', 'state.json'), 'utf8')).siteId;
  const covers = await writeCovers(projectRoot, siteId);
  for (const { key, file, bytes } of covers) {
    console.log(`  cover  ${file} -> ${key} (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
  }

  for (const [index, sql] of subjectSql.entries()) {
    cli('database', 'connect', '--json', '--query', sql);
    console.log(`  subject  ${SUBJECTS[index].name_en} / ${SUBJECTS[index].name_fr}`);
  }
  for (const [index, sql] of titleSql.entries()) {
    cli('database', 'connect', '--json', '--query', sql);
    console.log(`  draft  ${TITLES[index].product_code}  ${TITLES[index].title}`);
  }
  console.log(`\n${TITLES.length} titles seeded as DRAFTS. They are visible in the admin panel and absent from the public catalogue until published.`);
}
