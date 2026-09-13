/**
 * Netlify Image CDN helpers — see Docs/ui_ux_audit.md §10.
 *
 * Sources live in `public/img/`. In production we route them through
 * `/.netlify/images`, which negotiates AVIF/WebP from the request's `Accept`
 * header; that is why no `fm` parameter is set here. Passing `fm` would pin a
 * single format and defeat the negotiation.
 *
 * `astro dev` does not serve `/.netlify/images` (only `netlify dev` does), so
 * in development we emit the untransformed source instead of a dead URL.
 */

/**
 * Widths offered in `srcset`, in CSS pixels.
 *
 * Capped at 1920 because that is the widest source in `public/img` — asking the
 * CDN for more would upscale, costing bytes for no detail.
 */
export const IMAGE_WIDTHS = [640, 960, 1280, 1600, 1920] as const;

/** Route through the CDN only for real builds — see module note above. */
const useCdn = import.meta.env.PROD;

/**
 * Resolve an image reference to a path under `/img/`.
 *
 * A bare name (`'hero'`) means an SVG; anything containing a dot is used
 * verbatim (`'lh-hero.jpg'`). Mirrors the convention the components used
 * before this helper existed.
 */
export function imgPath(img: string): string {
  return img.includes('.') ? `/img/${img}` : `/img/${img}.svg`;
}

/** Open Graph's expected share-card dimensions. */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/**
 * Site-wide share image, cropped to 1200x630 by the Image CDN.
 *
 * Returns a root-relative path; callers must resolve it against `Astro.site`
 * because `og:image` requires an absolute URL.
 *
 * `fm=jpg` is explicit here, unlike elsewhere: social crawlers do not send the
 * `Accept` header the CDN negotiates on, and several still fail to render AVIF
 * or WebP cards. The CDN endpoint only exists on Netlify, so this URL is dead
 * under `astro dev` — harmless, since only crawlers hitting production read it.
 */
export function ogImagePath(img = 'lh-share-card.jpg'): string {
  const src = imgPath(img);
  return `/.netlify/images?url=${encodeURIComponent(src)}` +
    `&w=${OG_WIDTH}&h=${OG_HEIGHT}&fit=cover&position=center&fm=jpg&q=82`;
}

/** SVG is already resolution-independent; transforming it gains nothing. */
function isRaster(src: string): boolean {
  return !src.endsWith('.svg');
}

/** A single Image CDN URL at the given width. */
export function cdnUrl(src: string, width: number, quality = 75): string {
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

/**
 * Build `srcset`/`src` for an image under `/img/`.
 *
 * Returns `srcset: undefined` for SVGs and in dev, so callers can spread the
 * result onto an `<img>` and let Astro drop the empty attribute.
 */
export function responsive(
  img: string,
  { maxWidth = 1920, quality = 75 }: { maxWidth?: number; quality?: number } = {},
): { src: string; srcset?: string } {
  const src = imgPath(img);
  if (!useCdn || !isRaster(src)) return { src };

  const widths = IMAGE_WIDTHS.filter((w) => w <= maxWidth);
  return {
    src: cdnUrl(src, widths.at(-1) ?? maxWidth, quality),
    srcset: widths.map((w) => `${cdnUrl(src, w, quality)} ${w}w`).join(', '),
  };
}
