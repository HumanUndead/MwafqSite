import type { NextRequest } from 'next/server';
import { resolveLocale } from '@/i18n/routing';
import { getServiceGroupCourses } from '@/modules/checkout/server/checkoutService';
import {
  resolveRouteToken,
  routeBadRequest,
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
    const serviceGroupId = toPositiveInt(params.get('serviceGroupId'));
    if (!serviceGroupId) return routeBadRequest('serviceGroupId is required');
    const locale = resolveLocale(params.get('locale'));
    return routeOk(await getServiceGroupCourses(token, serviceGroupId, locale));
  } catch (error) {
    return routeError(error, '[checkout/courses]');
  }
}
