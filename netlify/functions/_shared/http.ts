export function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, { ...init, headers: { 'Cache-Control': 'no-store', ...init.headers } });
}

export function methodNotAllowed(allow = 'GET, POST, PUT, DELETE') {
  return new Response('Method not allowed', { status: 405, headers: { Allow: allow } });
}
