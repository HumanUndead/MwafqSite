import 'server-only';

import type {
  PaymentInitData,
  StartPaymentPayload,
} from '../types/payment.types';
import { academyAuthedRequest } from './academyUpstream';

/** Start a Moyasar credit-card payment for a user course. */
export async function startCreditCardPaymentWithToken(
  token: string,
  payload: StartPaymentPayload
): Promise<PaymentInitData> {
  const formData = new FormData();
  formData.append('Firstname', payload.firstName);
  formData.append('Lastname', payload.lastName);
  formData.append('Email', payload.email);
  formData.append('TargetType', '2'); // user course
  formData.append('TargetId', String(payload.userCourseId));
  formData.append('Amount', String(payload.amount));
  formData.append('City', payload.city);
  formData.append('State', payload.city);
  formData.append('Postcode', payload.city);
  formData.append('Address', payload.address || payload.city);
  formData.append('Country', payload.country || 'SA');

  return academyAuthedRequest<PaymentInitData>({
    method: 'POST',
    path: '/api/Payment/Payment/PaymentCreditCardPayment',
    token,
    body: formData,
    fallbackMessage: 'Failed to start payment',
  });
}

/** Verify the final payment status with the backend; true = paid. */
export async function checkPaymentStatusWithToken(
  token: string,
  pendingTransactionId: string,
  userId: string,
  paymentId: string
): Promise<boolean> {
  return academyAuthedRequest<boolean>({
    method: 'POST',
    path: '/api/Payment/Payment/CheckPaymentStatus',
    token,
    body: { pendingTransactionId, userId, paymentId },
    fallbackMessage: 'Failed to verify payment',
  });
}
