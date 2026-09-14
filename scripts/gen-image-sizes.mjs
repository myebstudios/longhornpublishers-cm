/**
 * Regenerates `src/lib/image-sizes.ts` from the files in `public/img/`.
 *
 * `responsive()` needs each source's real pixel width so it never asks the
 * Image CDN for a width the file cannot supply — that would upscale, spending
 * bytes to add blur. Reading the files at request time is not an option in a
 * static build, so the widths are baked into a generated module.
 *
 * Run with `npm run gen:image-sizes` after adding or replacing a source.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const IMG_DIR = 'public/img';
const OUT = 'src/lib/image-sizes.ts';

const files = fs.readdirSync(IMG_DIR).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();

const entries = files.map((file) => {
  const out = execFileSync('sips', ['-g', 'pixelWidth', path.join(IMG_DIR, file)], { encoding: 'utf8' });
  const w = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1]);
  if (!w) throw new Error(`Could not read pixel width of ${file}`);
  return `  '${file}': ${w},`;
});

const body = `/**
 * Intrinsic pixel width of every raster source in \`public/img/\`.
 *
 * GENERATED FILE — do not edit by hand. Run \`npm run gen:image-sizes\` after
 * adding or replacing a source. See \`scripts/gen-image-sizes.mjs\` for why
 * these widths are baked in rather than read at build time.
 */
export const INTRINSIC_WIDTH: Record<string, number> = {
${entries.join('\n')}
};
`;

fs.writeFileSync(OUT, body);
console.log(`Wrote ${OUT} (${files.length} sources)`);
