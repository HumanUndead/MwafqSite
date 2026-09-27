'use client';

import { Lock, ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { Spinner } from '@/shared/components/ui/Spinner';
import { usePaymentSession } from '../hooks/usePaymentSession';
import type {
  PaymentCheckoutPhase,
  PaymentFormSession,
} from '../hooks/usePaymentCheckout';
import { toHalalas } from '../paymentOutcome.shared';
import { usePendingPaymentStore } from '../store/pendingPaymentStore';
import { MoyasarForm } from './MoyasarForm';

interface PaymentDialogProps {
  phase: PaymentCheckoutPhase;
  session: PaymentFormSession | null;
  onClose: () => void;
  onExpire: () => void;
}

/** Modal hosting every non-idle phase of `usePaymentCheckout`. */
export function PaymentDialog({
  phase,
  session,
  onClose,
  onExpire,
}: PaymentDialogProps) {
  const t = useTranslations('payment');
  const locale = useLocale();
  const attachPaymentId = usePendingPaymentStore(
    (state) => state.attachPaymentId
  );
  usePaymentSession(phase === 'form', onExpire);

  const open = phase !== 'idle';
  const halalas = session ? toHalalas(session.amount) : null;

  return (
    <Modal open={open} onClose={onClose} size='lg'>
      {phase === 'preparing' && (
        <div
          className='flex flex-col items-center gap-3 py-10'
          aria-live='polite'
        >
          <Spinner />
          <p className='text-sm text-[#6b7196]'>{t.preparing}</p>
        </div>
      )}

      {phase === 'form' && session && halalas && (
        <div className='flex flex-col gap-5'>
          <div className='flex items-center justify-between gap-4'>
            <h2 className='text-xl font-bold text-[#1e2364]'>
              {t.dialogTitle}
            </h2>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700'>
              <ShieldCheck className='size-4' aria-hidden />
              {t.securedNote}
            </span>
          </div>
          <div className='flex items-center justify-between rounded-[14px] bg-[#f3f4f8] px-4 py-3'>
            <span className='text-sm text-[#6b7196]'>{t.amountDue}</span>
            <SarAmount
              amount={session.amount}
              className='text-lg font-bold text-[#1e2364]'
            />
          </div>
          <MoyasarForm
            publishableKey={session.pubKey}
            amountHalalas={halalas}
            description={session.description}
            callbackUrl={session.callbackUrl}
            language={locale}
            loadingLabel={t.loadingForm}
            errorLabel={t.formError}
            onCompleted={(paymentId) =>
              attachPaymentId(session.pendingTransactionId, paymentId)
            }
          />
          <p className='flex items-center justify-center gap-1.5 text-xs text-[#6b7196]'>
            <Lock className='size-3.5' aria-hidden />
            {t.poweredBy}
          </p>
        </div>
      )}

      {(phase === 'gatewayDisabled' || phase === 'expired') && (
        <div className='flex flex-col gap-4 text-center' role='alert'>
          <h2 className='text-xl font-bold text-[#1e2364]'>
            {phase === 'expired' ? t.sessionExpiredTitle : t.gatewayDisabledTitle}
          </h2>
          <p className='text-sm leading-6 text-[#6b7196]'>
            {phase === 'expired' ? t.sessionExpired : t.gatewayDisabled}
          </p>
          <Button variant='brand' onClick={onClose} type='button'>
            {t.close}
          </Button>
        </div>
      )}
    </Modal>
  );
}
