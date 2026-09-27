import type { NextRequest } from 'next/server';
import { resolveTokenUser } from '@/modules/auth/server/resolveTokenUser';
import { checkPaymentStatus } from '@/modules/payment/server/paymentService';
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

    const body = (await request.json()) as {
      paymentId?: string;
      pendingTransactionId?: string;
    };
    const paymentId = String(body?.paymentId ?? '').trim();
    const pendingTransactionId = String(body?.pendingTransactionId ?? '').trim();
    if (!paymentId || !pendingTransactionId) {
      return routeBadRequest('paymentId and pendingTransactionId are required');
    }

    const user = await resolveTokenUser(token);
    const settled = await checkPaymentStatus(token, {
      paymentId,
      pendingTransactionId,
      // Required by the DTO binding; the backend resolves the owner from the token.
      userId: user.id,
    });
    return routeOk(settled === true, 'Payment status resolved');
  } catch (error) {
    return routeError(error, '[payment/confirm]');
  }
}
