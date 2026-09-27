import type { NextRequest } from 'next/server';
import { resolveLocale } from '@/i18n/routing';
import { getReservationDetails } from '@/modules/reservations/server/reservationsService';
import {
  resolveRouteToken,
  routeBadRequest,
  routeError,
  routeOk,
  routeUnauthorized,
} from '@/shared/lib/upstream';

const GUID = /^[0-9a-f-]{8,64}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await resolveRouteToken(request);
    if (!token) return routeUnauthorized();
    const { id } = await params;
    if (!GUID.test(id)) return routeBadRequest('Invalid reservation id');
    const locale = resolveLocale(request.nextUrl.searchParams.get('locale'));
    return routeOk(await getReservationDetails(token, id, locale));
  } catch (error) {
    return routeError(error, '[reservations/id]');
  }
}
