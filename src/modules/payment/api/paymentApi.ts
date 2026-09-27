import { ApiError, http } from '@/shared/lib/http';
import {
  outcomeFromError,
  outcomeFromValue,
} from '../paymentOutcome.shared';
import type {
  ConfirmPaymentPayload,
  CreateClientOrderPayload,
  CreateClientOrderResult,
  CreditCardPaymentInit,
  PaymentOutcome,
} from '../types/payment.types';

export const paymentApi = {
  createOrder: (payload: CreateClientOrderPayload) =>
    http.post<CreateClientOrderResult>('/api/payment/order', payload),
  startCard: (clientOrderId: string) =>
    http.post<CreditCardPaymentInit>('/api/payment/card', { clientOrderId }),
  confirm: (payload: ConfirmPaymentPayload) =>
    http.post<boolean>('/api/payment/confirm', payload),
};

/** Confirm a charge and classify the result. Never throws. */
export async function confirmPayment(
  payload: ConfirmPaymentPayload
): Promise<PaymentOutcome> {
  try {
    const response = await paymentApi.confirm(payload);
    return outcomeFromValue(response.data === true);
  } catch (error) {
    if (error instanceof ApiError) {
      return outcomeFromError(error.status, error.code);
    }
    return { kind: 'unverified' };
  }
}
