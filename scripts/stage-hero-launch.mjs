/**
 * Stage or roll back the HERO-7 launch set on the LOCAL fixed-port database.
 *
 *   node scripts/local-db.mjs start && node scripts/local-db.mjs migrate
 *   npm run stage:hero-launch             # stage
 *   npm run stage:hero-launch -- --rollback
 *
 * This rehearses the production swap in Docs/hero_launch_runbook.md: existing
 * slides are disabled (not deleted) and the four launch slides take positions
 * 0-3. Rows are written with is_demo = false so a CONTEXT=production build
 * pointed at this database (CMS_DATABASE_URL) renders them exactly as
 * production would. The prior state of every other slide is snapshotted under
 * .netlify/ and restored by --rollback.
 *
 * It only ever connects to the loopback URL exported by scripts/local-db.mjs,
 * and refuses to run in any deploy or CI context.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import { assertLoopbackConnection } from './demo-seed-lib.mjs';
import { LAUNCH_SLIDES, LOCAL_IMAGE_KEYS, LOCAL_SLIDE_IDS, slidePayload } from './hero-launch-set.mjs';

// Same URL as scripts/local-db.mjs, which cannot be imported: it dispatches its CLI on load.
const url = `postgres://postgres@localhost:${process.env.LOCAL_DB_PORT ?? '54329'}/longhorn_cms`;
const MAX_SLIDES = 5;
const projectRoot = process.cwd();
const snapshotPath = path.join(projectRoot, '.netlify', 'hero-launch-snapshot.json');
const rollback = process.argv.includes('--rollback');

if (process.env.NETLIFY === 'true' || process.env.CI || ['production', 'deploy-preview', 'branch-deploy'].includes(process.env.CONTEXT ?? '')) {
  throw new Error('Refusing to stage: this script is local-only.');
}
assertLoopbackConnection(url, 'dev');

/** Mirror of writeLocalDemoHeroImages for the launch masters. */
async function writeLocalImages() {
  const { siteId } = JSON.parse(await fs.readFile(path.join(projectRoot, '.netlify', 'state.json'), 'utf8'));
  const blobsRoot = path.join(projectRoot, '.netlify', 'blobs-serve');
  for (const [index, slide] of LAUNCH_SLIDES.entries()) {
    const key = LOCAL_IMAGE_KEYS[index];
    const data = await fs.readFile(path.join(projectRoot, 'Assets', 'hero-launch', slide.upload));
    for (const [kind, body] of [
      ['entries', data],
      ['metadata', JSON.stringify({ contentType: 'image/jpeg', originalName: slide.upload, uploadedAt: new Date().toISOString() })],
    ]) {
      const target = path.join(blobsRoot, kind, siteId, 'site:longhorn-media', ...key.split('/'));
      if (!path.resolve(target).startsWith(path.resolve(blobsRoot) + path.sep)) throw new Error(`Refusing blob path ${target}.`);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, body);
    }
  }
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query('BEGIN');
  if (rollback) {
    const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8').catch(() => 'null'));
    if (!snapshot) throw new Error(`No snapshot at ${snapshotPath}; nothing to roll back.`);
    for (const row of snapshot) {
      await client.query('UPDATE homepage_hero_slides SET enabled = $2, sort_order = $3, updated_at = now() WHERE id = $1', [row.id, row.enabled, row.sort_order]);
    }
    const { rowCount } = await client.query('DELETE FROM homepage_hero_slides WHERE id = ANY($1::uuid[])', [LOCAL_SLIDE_IDS]);
    await client.query('COMMIT');
    await fs.rm(snapshotPath);
    console.log(`Rolled back: removed ${rowCount} launch slides, restored ${snapshot.length} prior slides.`);
  } else {
    const [{ published } = {}] = (await client.query("SELECT published FROM homepage_content WHERE id = 'default'")).rows;
    if (published !== true) throw new Error('Local homepage_content is not published; seed the CMS baseline first.');
    const others = (await client.query(
      'SELECT id, enabled, sort_order FROM homepage_hero_slides WHERE homepage_id = $1 AND NOT (id = ANY($2::uuid[])) ORDER BY sort_order',
      ['default', LOCAL_SLIDE_IDS],
    )).rows;
    if (others.length + LAUNCH_SLIDES.length > MAX_SLIDES) {
      throw new Error(`${others.length} other slides + ${LAUNCH_SLIDES.length} launch slides exceeds the ${MAX_SLIDES}-slide cap. Delete placeholders first, as the runbook does.`);
    }
    // Keep the first snapshot across restages; it is the true pre-launch state.
    const hasSnapshot = await fs.access(snapshotPath).then(() => true, () => false);
    if (!hasSnapshot) await fs.writeFile(snapshotPath, JSON.stringify(others, null, 2));

    await writeLocalImages();
    for (const [index, row] of others.entries()) {
      await client.query('UPDATE homepage_hero_slides SET enabled = false, sort_order = $2, updated_at = now() WHERE id = $1', [row.id, 100 + index]);
    }
    for (const [index, slide] of LAUNCH_SLIDES.entries()) {
      const p = slidePayload(slide, LOCAL_IMAGE_KEYS[index]);
      await client.query(`
        INSERT INTO homepage_hero_slides (
          id, homepage_id, sort_order, image_id, eyebrow_en, eyebrow_fr, headline_en, headline_fr,
          headline_accent_en, headline_accent_fr, subheadline_en, subheadline_fr,
          primary_cta_label_en, primary_cta_label_fr, primary_cta_href,
          secondary_cta_label_en, secondary_cta_label_fr, secondary_cta_href, enabled, is_demo
        ) VALUES ($1, 'default', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, true, false)
        ON CONFLICT (id) DO UPDATE SET
          sort_order = EXCLUDED.sort_order, image_id = EXCLUDED.image_id,
          eyebrow_en = EXCLUDED.eyebrow_en, eyebrow_fr = EXCLUDED.eyebrow_fr,
          headline_en = EXCLUDED.headline_en, headline_fr = EXCLUDED.headline_fr,
          headline_accent_en = EXCLUDED.headline_accent_en, headline_accent_fr = EXCLUDED.headline_accent_fr,
          subheadline_en = EXCLUDED.subheadline_en, subheadline_fr = EXCLUDED.subheadline_fr,
          primary_cta_label_en = EXCLUDED.primary_cta_label_en, primary_cta_label_fr = EXCLUDED.primary_cta_label_fr,
          primary_cta_href = EXCLUDED.primary_cta_href,
          secondary_cta_label_en = EXCLUDED.secondary_cta_label_en, secondary_cta_label_fr = EXCLUDED.secondary_cta_label_fr,
          secondary_cta_href = EXCLUDED.secondary_cta_href, enabled = true, is_demo = false, updated_at = now()
      `, [
        LOCAL_SLIDE_IDS[index], index, p.image_id, p.eyebrow_en, p.eyebrow_fr, p.headline_en, p.headline_fr,
        p.headline_accent_en, p.headline_accent_fr, p.subheadline_en, p.subheadline_fr,
        p.primary_cta_label_en, p.primary_cta_label_fr, p.primary_cta_href,
        p.secondary_cta_label_en, p.secondary_cta_label_fr, p.secondary_cta_href,
      ]);
    }
    await client.query('COMMIT');
    console.log(`Staged ${LAUNCH_SLIDES.length} launch slides; disabled ${others.length} prior slides (snapshot: ${path.relative(projectRoot, snapshotPath)}).`);
  }
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await client.end();
}
