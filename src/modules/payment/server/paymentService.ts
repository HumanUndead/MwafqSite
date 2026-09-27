import 'server-only';

import type { User } from '@/shared/types/user.types';
import { upstreamRequest } from '@/shared/lib/upstream';
import type {
  ClientOrder,
  CreateClientOrderPayload,
  CreateClientOrderResult,
  CreditCardPaymentInit,
} from '../types/payment.types';

/** The backend rejects empty billing fields; it accepts this placeholder. */
const EMPTY_VALUE = 'EmptyValue';

function billingValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : EMPTY_VALUE;
}

export function createClientOrder(
  token: string,
  payload: CreateClientOrderPayload
): Promise<CreateClientOrderResult> {
  return upstreamRequest<CreateClientOrderResult>({
    method: 'POST',
    path: '/api/Client/ClientOrder/CreateClientOrder',
    token,
    body: payload as Record<string, unknown>,
    fallbackMessage: 'Failed to create order',
  });
}

export function getClientOrder(
  token: string,
  clientOrderId: string
): Promise<ClientOrder> {
  return upstreamRequest<ClientOrder>({
    method: 'GET',
    path: '/api/Client/ClientOrder/GetClientOrder',
    token,
    query: { clientOrderId },
    fallbackMessage: 'Failed to load order',
  });
}

interface RawCreditCardInit {
  pendingTransactionId: string;
  amount: number;
  pubKey: { pubkey: string } | string;
}

/**
 * Open a pending Moyasar transaction for a client order. The server computes
 * the amount; billing comes from the signed-in user's profile.
 */
export async function startCreditCardPayment(
  token: string,
  clientOrderId: string,
  user: User
): Promise<CreditCardPaymentInit> {
  const form = new FormData();
  form.append('TargetId', clientOrderId);
  form.append('Firstname', billingValue(user.firstName));
  form.append('Lastname', billingValue(user.lastName));
  form.append('Email', billingValue(user.email));
  form.append('Address', billingValue(user.address));
  form.append('City', billingValue(user.cityName));
  form.append('State', EMPTY_VALUE);
  form.append('Country', billingValue(user.countryName));
  form.append('Postcode', billingValue(user.postCode));

  const raw = await upstreamRequest<RawCreditCardInit>({
    method: 'POST',
    path: '/api/Payment/Payment/PaymentCreditCardPayment',
    token,
    body: form,
    fallbackMessage: 'Failed to start payment',
  });

  return {
    pendingTransactionId: raw.pendingTransactionId,
    amount: Number(raw.amount),
    pubKey: typeof raw.pubKey === 'string' ? raw.pubKey : raw.pubKey?.pubkey,
  };
}

/** true = settled, false = declined. Not idempotent: a settled row is deleted. */
export function checkPaymentStatus(
  token: string,
  payload: { paymentId: string; pendingTransactionId: string; userId: string }
): Promise<boolean> {
  return upstreamRequest<boolean>({
    method: 'POST',
    path: '/api/Payment/Payment/CheckPaymentStatus',
    token,
    body: payload,
    fallbackMessage: 'Failed to verify payment',
  });
}
