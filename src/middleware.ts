import { defineMiddleware } from 'astro:middleware';
import { withPublicRender } from './lib/request-context';
import { BROWSER_CACHE_CONTROL, CDN_CACHE_CONTROL, cacheTagsForPath } from './lib/public-cache';

export const onRequest = defineMiddleware(async ({ url }, next) => {
  const tags = cacheTagsForPath(url.pathname);
  if (!tags.length) return next();

  try {
    // Astro can stream component work after next() resolves. Finish the body
    // while the request context is active so database failures reach this catch
    // before any success cache header is sent.
    const response = await withPublicRender(async () => {
      const streamed = await next();
      const body = await streamed.arrayBuffer();
      return new Response(body, {
        status: streamed.status,
        statusText: streamed.statusText,
        headers: streamed.headers,
      });
    });
    if (response.status >= 200 && response.status < 300) {
      response.headers.set('Cache-Control', BROWSER_CACHE_CONTROL);
      response.headers.set('Netlify-CDN-Cache-Control', CDN_CACHE_CONTROL);
      response.headers.set('Netlify-Cache-Tag', tags.join(','));
    } else {
      response.headers.delete('Netlify-CDN-Cache-Control');
      response.headers.delete('Netlify-Cache-Tag');
      response.headers.set('Cache-Control', 'no-store');
    }
    return response;
  } catch (error) {
    console.error('[public render] Failed; serving uncached 503.', error);
    return new Response('Service temporarily unavailable', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
});
