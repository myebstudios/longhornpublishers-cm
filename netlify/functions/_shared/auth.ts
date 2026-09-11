import { getUser } from '@netlify/identity';

export async function requireAdmin(): Promise<Response | null> {
  const user = await getUser();
  if (!user) return new Response('Authentication required', { status: 401 });
  if (!user.roles?.includes('admin')) return new Response('Administrator access required', { status: 403 });
  return null;
}
