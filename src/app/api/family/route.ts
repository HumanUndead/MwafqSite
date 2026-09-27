import type { NextRequest } from 'next/server';
import { resolveTokenUser } from '@/modules/auth/server/resolveTokenUser';
import { createRelation, getFamily } from '@/modules/family/server/familyService';
import {
  resolveRouteToken,
  routeBadRequest,
  routeError,
  routeOk,
  routeUnauthorized,
} from '@/shared/lib/upstream';

export async function GET(request: NextRequest) {
  try {
    const token = await resolveRouteToken(request);
    if (!token) return routeUnauthorized();
    const user = await resolveTokenUser(token);
    return routeOk(await getFamily(token, user.id));
  } catch (error) {
    return routeError(error, '[family]');
  }
}

/** Send a relation request to an existing user. */
export async function POST(request: NextRequest) {
  try {
    const token = await resolveRouteToken(request);
    if (!token) return routeUnauthorized();
    const body = (await request.json()) as { username?: string };
    const username = String(body?.username ?? '').trim();
    if (!username) return routeBadRequest('username is required');
    const user = await resolveTokenUser(token);
    return routeOk(await createRelation(token, username, user.id), 'Request sent');
  } catch (error) {
    return routeError(error, '[family:create]');
  }
}
