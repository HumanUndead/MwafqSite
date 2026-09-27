'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { toast } from '@/shared/components/feedback/Toast';
import { confirmPayment } from '../api/paymentApi';
import {
  getResumablePayment,
  usePendingPaymentStore,
} from '../store/pendingPaymentStore';

/**
 * Once per page load, re-confirms a payment that reached the gateway but was
 * never confirmed (tab closed during 3-D Secure, network drop…).
 * Silent while still unverified; the record is kept for next time.
 */
export function PendingPaymentResumer() {
  const t = useTranslations('payment');
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !isAuthenticated) return;
    // The callback page confirms on its own.
    if (pathname.includes('/payment/callback')) return;
    ran.current = true;

    const store = usePendingPaymentStore.getState();
    const pending = store.pending;
    const resumable = getResumablePayment(pending);
    if (!resumable?.paymentId) {
      // Never reached the gateway, or expired: nothing to confirm. The
      // callback page still works without it (it carries `pt` in the URL).
      if (pending) store.clearPendingPayment(pending.pendingTransactionId);
      return;
    }

    void confirmPayment({
      paymentId: resumable.paymentId,
      pendingTransactionId: resumable.pendingTransactionId,
    }).then((outcome) => {
      if (outcome.kind === 'unverified') return;
      store.clearPendingPayment(resumable.pendingTransactionId);
      if (outcome.kind === 'settled') toast.success(t.resume.settled);
      else toast.error(t.resume.declined);
    });
  }, [isAuthenticated, pathname, t]);

  return null;
}
