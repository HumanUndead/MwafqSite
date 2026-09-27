import 'server-only';

import type { User } from '@/shared/types/user.types';
import { upstreamRequest } from '@/shared/lib/upstream';
import { getAuthSession } from './authSession';
import { buildUserFromToken } from './authService';
import { parseUpstreamUser } from './upstreamUser';

/**
 * The signed-in user for a bearer token: the session cookie when it matches,
 * otherwise `GetUserByToken`, otherwise the JWT claims.
 */
export async function resolveTokenUser(token: string): Promise<User> {
  const session = await getAuthSession();
  if (session?.user && session.token === token) {
    return session.user;
  }

  try {
    const payload = await upstreamRequest<unknown>({
      method: 'POST',
      path: '/api/Authenticate/Auth/GetUserByToken',
      token,
    });
    return parseUpstreamUser(payload, token);
  } catch {
    return buildUserFromToken(token, '');
  }
}
