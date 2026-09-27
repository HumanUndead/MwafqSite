import type { NextRequest } from 'next/server';
import { lookupUser } from '@/modules/family/server/familyService';
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
    const username = request.nextUrl.searchParams.get('username')?.trim();
    if (!username) return routeBadRequest('username is required');
    return routeOk(await lookupUser(token, username));
  } catch (error) {
    return routeError(error, '[family:lookup]');
  }
}
