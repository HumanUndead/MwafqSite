export interface InitCreditCardPaymentPayload {
  userId: string;
  amount: number;
  reservationId: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  state?: string;
  postCode?: string;
  targetType?: number;
  targetId?: string | number;
}

export interface InitCreditCardPaymentResult {
  pendingTransactionId: string;
  pubKey: string;
}

export interface CheckPaymentStatusPayload {
  userId: string;
  paymentId: string;
  pendingTransactionId: string;
  reservationId: string | number;
}

export async function initCreditCardPayment(
  payload: InitCreditCardPaymentPayload
): Promise<InitCreditCardPaymentResult> {
  const res = await fetch('/api/payment/credit-card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Payment initialization failed');
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message ?? 'Payment initialization failed');
  }

  return json.data as InitCreditCardPaymentResult;
}

export interface MoyasarDirectPaymentResult {
  id: string;
  status: string;
  amount: number;
  currency: string;
  message?: string | null;
}

export async function processMoyasarPayment({
  publishableKey,
  amount,
  description,
  callbackUrl,
  name,
  number,
  cvc,
  month,
  year,
}: {
  publishableKey: string;
  amount: number;
  description: string;
  callbackUrl: string;
  name: string;
  number: string;
  cvc: string;
  month: string;
  year: string;
}): Promise<MoyasarDirectPaymentResult> {
  const credentials = btoa(`${publishableKey}:`);
  const fullYear = year.length === 2 ? `20${year}` : year;

  const res = await fetch('https://api.moyasar.com/v1/payments', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'SAR',
      description,
      callback_url: callbackUrl,
      source: { type: 'creditcard', name, number, cvc, month, year: fullYear },
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    const errors = (json as { errors?: Record<string, string[]> }).errors;
    if (errors) {
      const first = Object.values(errors).flat()[0];
      if (first) throw new Error(first);
    }
    throw new Error(
      (json as { message?: string }).message ?? `Payment failed (${res.status})`
    );
  }

  return json as MoyasarDirectPaymentResult;
}

export async function checkPaymentStatus(
  payload: CheckPaymentStatusPayload
): Promise<boolean> {
  const res = await fetch('/api/payment/check-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Payment status check failed');
  }

  const json: { data: boolean; success: boolean } = await res.json();
  return !!json.success;
}
