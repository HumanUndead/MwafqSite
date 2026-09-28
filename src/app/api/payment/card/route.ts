import type { NextRequest } from 'next/server';
import { resolveTokenUser } from '@/modules/auth/server/resolveTokenUser';
import { startCreditCardPayment } from '@/modules/payment/server/paymentService';
import {
  resolveRouteToken,
  routeBadRequest,
  routeError,
  routeOk,
  routeUnauthorized,
  UpstreamError,
} from '@/shared/lib/upstream';

export async function POST(request: NextRequest) {
  try {
    const token = await resolveRouteToken(request);
    if (!token) return routeUnauthorized();

    const body = (await request.json()) as { clientOrderId?: string };
    const clientOrderId = String(body?.clientOrderId ?? '').trim();
    if (!clientOrderId) return routeBadRequest('clientOrderId is required');

    const user = await resolveTokenUser(token);
    // TEMP debug: log the PaymentCreditCardPayment request/response.
    console.log('[payment/card] request', JSON.stringify({ clientOrderId }));
    const data = await startCreditCardPayment(token, clientOrderId, user);
    console.log('[payment/card] response', JSON.stringify(data));
    return routeOk(data, 'Payment started');
  } catch (error) {
    // TEMP debug: upstream failures (status / code / message) or the crash.
    console.log(
      '[payment/card] error',
      error instanceof UpstreamError
        ? JSON.stringify({
            status: error.status,
            code: error.code,
            message: error.message,
          })
        : error instanceof Error
          ? `${error.name}: ${error.message}\n${error.stack ?? ''}`
          : String(error)
    );
    return routeError(error, '[payment/card]');
  }
}
