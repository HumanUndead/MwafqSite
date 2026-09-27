import type { NextRequest } from 'next/server';
import { getCheckoutBranches } from '@/modules/checkout/server/checkoutService';
import {
  resolveRouteToken,
  routeBadRequest,
  routeError,
  routeOk,
  routeUnauthorized,
} from '@/shared/lib/upstream';
import { readBasketQuery } from '../basketQuery';

function readCoordinate(value: string | null, limit: number): number | null {
  if (value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= limit ? n : null;
}

export async function GET(request: NextRequest) {
  try {
    const token = await resolveRouteToken(request);
    if (!token) return routeUnauthorized();
    const { basket, locale } = readBasketQuery(request);
    if (!basket) return routeBadRequest('The basket is empty');

    const params = request.nextUrl.searchParams;
    const latitude = readCoordinate(params.get('latitude'), 90);
    const longitude = readCoordinate(params.get('longitude'), 180);
    const center =
      latitude !== null && longitude !== null ? { latitude, longitude } : undefined;

    return routeOk(await getCheckoutBranches(token, basket, locale, center));
  } catch (error) {
    return routeError(error, '[checkout/branches]');
  }
}
