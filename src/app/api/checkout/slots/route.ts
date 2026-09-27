import type { NextRequest } from 'next/server';
import { getCheckoutSlots } from '@/modules/checkout/server/checkoutService';
import {
  resolveRouteToken,
  routeBadRequest,
  routeError,
  routeOk,
  routeUnauthorized,
  toPositiveInt,
} from '@/shared/lib/upstream';
import { readBasketQuery } from '../basketQuery';

export async function GET(request: NextRequest) {
  try {
    const token = await resolveRouteToken(request);
    if (!token) return routeUnauthorized();
    const branchId = toPositiveInt(request.nextUrl.searchParams.get('branchId'));
    const { basket, locale } = readBasketQuery(request);
    if (!branchId || !basket) return routeBadRequest('Invalid branch or basket');
    return routeOk(await getCheckoutSlots(token, branchId, basket, locale));
  } catch (error) {
    return routeError(error, '[checkout/slots]');
  }
}
