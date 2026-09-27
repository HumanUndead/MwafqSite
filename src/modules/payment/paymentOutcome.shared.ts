import type {
  PaymentErrorKey,
  PaymentOutcome,
} from './types/payment.types';

/** Backend payment business error codes → app copy key. */
export const PAYMENT_ERROR_CODES: Record<string, PaymentErrorKey> = {
  InvalidPaymentTargetCode: 'unsupportedTarget',
  InvalidPaymentTargetReferenceCode: 'targetMissing',
  InvalidReservationIdCode: 'targetMissing',
  InvalidUserCourseIdCode: 'targetMissing',
  InvalidPaymentTargetIdFormatCode: 'targetMissing',
  ReservationNotFoundCode: 'targetMissing',
  PaymentAlreadyCompletedCode: 'alreadySettled',
  InvalidPaymentAmountCode: 'amountMismatch',
  PendingTransactionNotFoundCode: 'alreadySettled',
  PendingTransactionNotOwnedByUserCode: 'notOwned',
};

/** Codes meaning the payment already went through. */
const SETTLED_CODES = new Set([
  'PendingTransactionNotFoundCode',
  'PaymentAlreadyCompletedCode',
]);

/** Strip the `Missing resource: ` prefix the backend adds to some codes. */
export function normalizePaymentCode(code: string | null | undefined): string {
  return (code ?? '').replace(/^Missing resource:\s*/i, '').trim();
}

export function paymentErrorKey(
  code: string | null | undefined
): PaymentErrorKey | undefined {
  return PAYMENT_ERROR_CODES[normalizePaymentCode(code)];
}

/** Classify a confirm response value. */
export function outcomeFromValue(settled: boolean): PaymentOutcome {
  return { kind: settled ? 'settled' : 'declined' };
}

/**
 * Classify a failed confirm call. Never report "failed" when the charge may
 * have gone through: transport errors and unknown errors are `unverified`.
 */
export function outcomeFromError(
  status: number | null | undefined,
  code: string | null | undefined
): PaymentOutcome {
  const normalized = normalizePaymentCode(code);
  if (SETTLED_CODES.has(normalized)) {
    return { kind: 'settled' };
  }
  const errorKey = PAYMENT_ERROR_CODES[normalized];
  if (errorKey) {
    return { kind: 'blocked', errorKey };
  }
  return { kind: 'unverified' };
}

/** Pending records older than this are dropped. */
export const PENDING_PAYMENT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Idle time after which an open card form is closed. */
export const PAYMENT_SESSION_DURATION_MS = 5 * 60 * 1000;

/** Amount in halalas, or null when not a positive integer. */
export function toHalalas(amount: number): number | null {
  const halalas = Math.round(amount * 100);
  return Number.isFinite(halalas) && halalas > 0 ? halalas : null;
}
