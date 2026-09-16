/**
 * Snapshot every built public HTML route for before/after comparison.
 *
 * The acceptance test for CMS baseline seeding is that the public site does not
 * change. Build, snapshot, seed, build again, snapshot again, diff. A non-empty
 * diff means the seed mapping is wrong.
 *
 * Admin routes are excluded: they are expected to change (that is the point),
 * and they render no CMS content at build time anyway.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const [, , distDir = 'dist', outDir] = process.argv;
if (!outDir) {
  console.error('Usage: node scripts/capture-public-html.mjs <distDir> <outDir>');
  process.exit(1);
}

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });

let count = 0;
for await (const file of walk(distDir)) {
  const rel = path.relative(distDir, file);
  if (rel.split(path.sep)[0] === 'admin') continue;
  const dest = path.join(outDir, rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(file, dest);
  count += 1;
}
console.log(`Captured ${count} public HTML routes from ${distDir} into ${outDir}`);
