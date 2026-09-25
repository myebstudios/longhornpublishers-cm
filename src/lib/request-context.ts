import { AsyncLocalStorage } from 'node:async_hooks';

// Distinguishes a public server render from a prerendered build page. A failed
// database read must abort the former so no fallback HTML reaches the CDN.
const publicRender = new AsyncLocalStorage<boolean>();

export const inPublicRender = () => publicRender.getStore() === true;
export const withPublicRender = <T>(render: () => T): T => publicRender.run(true, render);
