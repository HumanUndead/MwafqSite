import type { NextRequest } from 'next/server';
import { resolveTokenUser } from '@/modules/auth/server/resolveTokenUser';
import { startCreditCardPayment } from '@/modules/payment/server/paymentService';
import {
  resolveRouteToken,
  routeBadRequest,
  routeError,
  routeOk,
  routeUnauthorized,
} from '@/shared/lib/upstream';

export async function POST(request: NextRequest) {
  try {
    const token = await resolveRouteToken(request);
    if (!token) return routeUnauthorized();

    const body = (await request.json()) as { clientOrderId?: string };
    const clientOrderId = String(body?.clientOrderId ?? '').trim();
    if (!clientOrderId) return routeBadRequest('clientOrderId is required');

    const user = await resolveTokenUser(token);
    const data = await startCreditCardPayment(token, clientOrderId, user);
    return routeOk(data, 'Payment started');
  } catch (error) {
    return routeError(error, '[payment/card]');
  }
}
