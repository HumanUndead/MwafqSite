'use client';

import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { Button } from '@/shared/components/ui/Button';
import { ROUTES } from '@/shared/constants/routes';
import { academyLearnApi } from '../api/academyLearnApi';

type Status = 'verifying' | 'success' | 'failed' | 'error';

export function PaymentCallbackView() {
  const t = useTranslations('academyPayment');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<Status>('verifying');
  const [detail, setDetail] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function verify() {
      const paymentId =
        searchParams.get('id') ||
        sessionStorage.getItem('mwafq_moyasar_payment_id') ||
        '';
      const pendingTransactionId =
        sessionStorage.getItem('mwafq_pending_tx') || '';
      const userId = sessionStorage.getItem('mwafq_user_id') || '';

      if (!paymentId || !pendingTransactionId || !userId) {
        setStatus('error');
        setDetail(t.missingInfo);
        return;
      }

      try {
        const response = await academyLearnApi.checkPaymentStatus({
          pendingTransactionId,
          userId,
          paymentId,
        });

        sessionStorage.removeItem('mwafq_pending_tx');
        sessionStorage.removeItem('mwafq_user_id');
        sessionStorage.removeItem('mwafq_moyasar_payment_id');

        if (response.data.paid) {
          setStatus('success');
          setTimeout(() => {
            router.replace(getLocalizedRoute(locale, ROUTES.ACADEMY_COURSES));
          }, 2000);
        } else {
          setStatus('failed');
        }
      } catch (err) {
        setStatus('error');
        setDetail(err instanceof Error ? err.message : '');
      }
    }

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='flex min-h-[60vh] items-center justify-center px-4 py-16'>
      <div className='w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm'>
        {status === 'verifying' && (
          <div className='space-y-4'>
            <Loader2 className='mx-auto size-12 animate-spin text-[#00a8f1]' />
            <p className='text-lg font-semibold text-gray-900'>{t.verifying}</p>
          </div>
        )}

        {status === 'success' && (
          <div className='space-y-4'>
            <CheckCircle2 className='mx-auto size-14 text-green-500' />
            <h1 className='text-xl font-bold text-gray-900'>
              {t.successTitle}
            </h1>
            <p className='text-gray-600'>{t.successMessage}</p>
            <Button
              variant='brand'
              className='w-full'
              onClick={() =>
                router.replace(
                  getLocalizedRoute(locale, ROUTES.ACADEMY_COURSES)
                )
              }
              type='button'
            >
              {t.goToMyCourses}
            </Button>
          </div>
        )}

        {status === 'failed' && (
          <div className='space-y-4'>
            <XCircle className='mx-auto size-14 text-red-500' />
            <h1 className='text-xl font-bold text-gray-900'>{t.failedTitle}</h1>
            <p className='text-gray-600'>{t.failedMessage}</p>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => router.back()}
              type='button'
            >
              {t.tryAgain}
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className='space-y-4'>
            <AlertCircle className='mx-auto size-14 text-amber-500' />
            <h1 className='text-xl font-bold text-gray-900'>{t.errorTitle}</h1>
            <p className='text-gray-600'>{detail || t.failedMessage}</p>
            <Button
              variant='brand'
              className='w-full'
              onClick={() =>
                router.replace(
                  getLocalizedRoute(locale, ROUTES.ACADEMY_COURSES)
                )
              }
              type='button'
            >
              {t.goToMyCourses}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
