'use client';

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button, buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { confirmPayment } from '../api/paymentApi';
import { usePendingPaymentStore } from '../store/pendingPaymentStore';
import type { PaymentOutcome } from '../types/payment.types';

type ViewState = { kind: 'loading' } | { kind: 'missing' } | PaymentOutcome;

interface PaymentStatusViewProps {
  target: 'reservation' | 'course';
  continueHref: string;
  /** Where "Try again" goes after a decline (back to checkout). */
  retryHref?: string;
  /** Query-key prefixes to refresh once the payment settles. */
  invalidateKeys?: readonly QueryKey[];
  /** Extra cleanup once settled (e.g. clear basket + draft). */
  onSettled?: () => void;
}

const linkClass = (variant: 'brand' | 'outline') =>
  cn(buttonVariants({ variant }), 'w-full');

/**
 * Moyasar redirects here with `?id=<paymentId>&status=…`. `pt` (pending
 * transaction) is added by us; the persisted pending record is a fallback.
 * Confirms once on load; "Confirm again" re-checks and never charges again.
 */
export function PaymentStatusView({
  target,
  continueHref,
  retryHref,
  invalidateKeys = [],
  onSettled,
}: PaymentStatusViewProps) {
  const t = useTranslations('payment');
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [state, setState] = useState<ViewState>({ kind: 'loading' });
  const ran = useRef(false);
  const onSettledRef = useRef(onSettled);
  const invalidateRef = useRef(invalidateKeys);
  useEffect(() => {
    onSettledRef.current = onSettled;
    invalidateRef.current = invalidateKeys;
  });

  const verify = useCallback(async () => {
    const store = usePendingPaymentStore.getState();
    const paymentId = searchParams.get('id') || store.pending?.paymentId || '';
    const pendingTransactionId =
      searchParams.get('pt') || store.pending?.pendingTransactionId || '';

    if (!paymentId || !pendingTransactionId) {
      setState({ kind: 'missing' });
      return;
    }

    setState({ kind: 'loading' });
    const outcome = await confirmPayment({ paymentId, pendingTransactionId });
    setState(outcome);

    if (outcome.kind !== 'unverified') {
      store.clearPendingPayment(pendingTransactionId);
    }
    if (outcome.kind === 'settled') {
      onSettledRef.current?.();
      await Promise.all(
        invalidateRef.current.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey, refetchType: 'all' })
        )
      );
    }
  }, [queryClient, searchParams]);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void verify();
  }, [verify]);

  return (
    <div className='flex min-h-[60vh] items-center justify-center px-4 py-16'>
      <div
        className='w-full max-w-md rounded-[28px] border-2 border-[#e5e7f0] bg-white p-8 text-center'
        aria-live='polite'
      >
        {state.kind === 'loading' && (
          <div className='space-y-4'>
            <Loader2
              className='mx-auto size-12 animate-spin text-[#00a8f1]'
              aria-hidden
            />
            <p className='text-lg font-semibold text-[#1e2364]'>
              {t.status.verifying}
            </p>
          </div>
        )}

        {state.kind === 'settled' && (
          <div className='space-y-4'>
            <CheckCircle2
              className='mx-auto size-14 text-green-500'
              aria-hidden
            />
            <h1 className='text-xl font-bold text-[#1e2364]'>
              {t.status.settledTitle}
            </h1>
            <p className='text-[#6b7196]'>
              {target === 'course'
                ? t.status.settledCourse
                : t.status.settledReservation}
            </p>
            <Link href={continueHref} className={linkClass('brand')}>
              {target === 'course'
                ? t.status.goToCourses
                : t.status.goToReservations}
            </Link>
          </div>
        )}

        {(state.kind === 'declined' || state.kind === 'blocked') && (
          <div className='space-y-4'>
            <XCircle className='mx-auto size-14 text-red-500' aria-hidden />
            <h1 className='text-xl font-bold text-[#1e2364]'>
              {state.kind === 'declined'
                ? t.status.declinedTitle
                : t.status.blockedTitle}
            </h1>
            <p className='text-[#6b7196]'>
              {state.kind === 'blocked' && state.errorKey
                ? t.errors[state.errorKey]
                : t.status.declined}
            </p>
            {retryHref && (
              <Link href={retryHref} className={linkClass('brand')}>
                {t.status.tryAgain}
              </Link>
            )}
            <Link href={continueHref} className={linkClass('outline')}>
              {t.status.continue}
            </Link>
          </div>
        )}

        {state.kind === 'unverified' && (
          <div className='space-y-4'>
            <Clock3 className='mx-auto size-14 text-amber-500' aria-hidden />
            <h1 className='text-xl font-bold text-[#1e2364]'>
              {t.status.unverifiedTitle}
            </h1>
            <p className='text-[#6b7196]'>{t.status.unverified}</p>
            <Button
              variant='brand'
              className='w-full'
              type='button'
              onClick={() => void verify()}
            >
              {t.status.confirmAgain}
            </Button>
            <Link href={continueHref} className={linkClass('outline')}>
              {t.status.continue}
            </Link>
          </div>
        )}

        {state.kind === 'missing' && (
          <div className='space-y-4'>
            <AlertCircle
              className='mx-auto size-14 text-amber-500'
              aria-hidden
            />
            <h1 className='text-xl font-bold text-[#1e2364]'>
              {t.status.missingTitle}
            </h1>
            <p className='text-[#6b7196]'>{t.status.missing}</p>
            <Link href={continueHref} className={linkClass('brand')}>
              {t.status.continue}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
