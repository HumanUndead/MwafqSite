import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PENDING_PAYMENT_TTL_MS } from '../paymentOutcome.shared';
import type { PendingPayment } from '../types/payment.types';

interface PendingPaymentState {
  pending: PendingPayment | null;
  startPendingPayment: (
    record: Omit<PendingPayment, 'paymentId' | 'createdAt'>
  ) => void;
  attachPaymentId: (pendingTransactionId: string, paymentId: string) => void;
  clearPendingPayment: (pendingTransactionId?: string) => void;
}

export const usePendingPaymentStore = create<PendingPaymentState>()(
  persist(
    (set, get) => ({
      pending: null,
      startPendingPayment: (record) =>
        set({
          pending: {
            ...record,
            paymentId: null,
            createdAt: new Date().toISOString(),
          },
        }),
      attachPaymentId: (pendingTransactionId, paymentId) => {
        const pending = get().pending;
        if (pending?.pendingTransactionId !== pendingTransactionId) return;
        set({ pending: { ...pending, paymentId } });
      },
      clearPendingPayment: (pendingTransactionId) => {
        const pending = get().pending;
        if (
          pendingTransactionId &&
          pending?.pendingTransactionId !== pendingTransactionId
        ) {
          return;
        }
        set({ pending: null });
      },
    }),
    {
      name: 'pending-payment-store',
      storage: createJSONStorage(() => window.localStorage),
    }
  )
);

/** A record worth re-confirming: reached the gateway and is not expired. */
export function getResumablePayment(
  pending: PendingPayment | null
): PendingPayment | null {
  if (!pending?.paymentId) return null;
  const age = Date.now() - new Date(pending.createdAt).getTime();
  return Number.isFinite(age) && age <= PENDING_PAYMENT_TTL_MS
    ? pending
    : null;
}
