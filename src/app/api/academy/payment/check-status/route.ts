import type { NextRequest } from 'next/server';
import { checkPaymentStatusWithToken } from '@/modules/academy/server/paymentService';
import {
  academyOk,
  academyRouteError,
  academyUnauthorized,
  resolveAcademyToken,
} from '@/modules/academy/server/routeHelpers';

export async function POST(request: NextRequest) {
  try {
    const token = await resolveAcademyToken(request);
    if (!token) return academyUnauthorized();

    const body = await request.json();
    const paid = await checkPaymentStatusWithToken(
      token,
      String(body?.pendingTransactionId ?? ''),
      String(body?.userId ?? ''),
      String(body?.paymentId ?? '')
    );

    return academyOk({ paid }, 'Payment status resolved');
  } catch (error) {
    return academyRouteError(error, '[academy/payment/check-status]');
  }
}
