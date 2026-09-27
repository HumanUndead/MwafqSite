import type { NextRequest } from 'next/server';
import { resolveLocale } from '@/i18n/routing';
import { resolveTokenUser } from '@/modules/auth/server/resolveTokenUser';
import { listReservations } from '@/modules/reservations/server/reservationsService';
import {
  resolveRouteToken,
  routeError,
  routeOk,
  routeUnauthorized,
  toPositiveInt,
} from '@/shared/lib/upstream';

export async function GET(request: NextRequest) {
  try {
    const token = await resolveRouteToken(request);
    if (!token) return routeUnauthorized();
    const params = request.nextUrl.searchParams;
    const ownerId =
      params.get('ownerId')?.trim() || (await resolveTokenUser(token)).id;

    const data = await listReservations(
      token,
      {
        tab: params.get('tab') === 'results' ? 'results' : 'exams',
        upcoming: params.get('upcoming') !== '0',
        pageNumber: toPositiveInt(params.get('page')) ?? 1,
        ownerId,
      },
      resolveLocale(params.get('locale'))
    );
    return routeOk(data);
  } catch (error) {
    return routeError(error, '[reservations]');
  }
}
