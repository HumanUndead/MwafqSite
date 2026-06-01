import type { NextRequest } from 'next/server';
import { startCreditCardPaymentWithToken } from '@/modules/academy/server/paymentService';
import type { StartPaymentPayload } from '@/modules/academy/types/payment.types';
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

    const body = (await request.json()) as Partial<StartPaymentPayload>;

    const payload: StartPaymentPayload = {
      userCourseId: Number(body.userCourseId),
      amount: Number(body.amount),
      firstName: body.firstName ?? '',
      lastName: body.lastName ?? '',
      email: body.email ?? '',
      city: body.city ?? '',
      address: body.address ?? '',
      country: body.country ?? 'SA',
    };

    const data = await startCreditCardPaymentWithToken(token, payload);
    return academyOk(data, 'Payment started');
  } catch (error) {
    return academyRouteError(error, '[academy/payment/credit-card]');
  }
}
