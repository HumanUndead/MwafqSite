'use client';

import { Check, Lock } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { cn } from '@/shared/lib/cn';
import { ROUTES } from '@/shared/constants/routes';
import { useEnrollFlow } from '../hooks/useEnrollFlow';
import {
  CoursePaymentMode,
  computeTotalPrice,
  resolveSelectedService,
} from '../selectedService.shared';
import type { CoursePaymentSettings } from '../types/payment.types';
import { MoyasarPaymentForm } from './MoyasarPaymentForm';

interface EnrollButtonProps {
  courseId: number;
  courseTitle?: string;
  paymentSettings?: CoursePaymentSettings | null;
  className?: string;
  label?: ReactNode;
}

export function EnrollButton({
  courseId,
  courseTitle,
  paymentSettings,
  className,
  label,
}: EnrollButtonProps) {
  const t = useTranslations('academyEnroll');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    isAuthenticated,
    processing,
    error,
    paymentInit,
    proceed,
    reset,
  } = useEnrollFlow();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'plan' | 'payment'>('plan');
  const [includeSadad, setIncludeSadad] = useState(false);
  const [includeArkan, setIncludeArkan] = useState(false);

  const sellingPlan = paymentSettings?.sellingPlan;
  const isSplit = sellingPlan === CoursePaymentMode.Saprted;
  const isBulk = sellingPlan === CoursePaymentMode.Bulk;
  const total = computeTotalPrice(
    paymentSettings ?? undefined,
    includeSadad,
    includeArkan
  );

  function openModal() {
    reset();
    setStep('plan');
    setIncludeSadad(false);
    setIncludeArkan(false);
    setOpen(true);
  }

  function goToLogin() {
    const redirect = encodeURIComponent(pathname);
    router.push(
      `${getLocalizedRoute(locale, ROUTES.LOGIN)}?redirect=${redirect}`
    );
  }

  async function handleProceed() {
    if (!isAuthenticated || !user) {
      goToLogin();
      return;
    }
    const selectedService = resolveSelectedService(
      sellingPlan ?? CoursePaymentMode.CourseOnly,
      includeSadad,
      includeArkan
    );
    const init = await proceed(courseId, selectedService, total);
    if (init) setStep('payment');
  }

  const callbackUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${locale}/courses/payment/callback`
      : '';

  const price = paymentSettings?.price ?? 0;
  const sadadPrice = paymentSettings?.sadadPrice ?? 0;
  const certPrice = paymentSettings?.certifiedExamPrice ?? 0;

  return (
    <>
      <Button
        variant='brand'
        className={cn('w-full', className)}
        onClick={openModal}
        type='button'
      >
        {label ?? t.enrollNow}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={t.title}>
        {step === 'plan' && (
          <div className='space-y-5'>
            <div className='flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3'>
              <span className='text-sm text-gray-600'>{t.coursePrice}</span>
              <span className='font-semibold text-[#1e2364]'>
                {price} {t.currency}
              </span>
            </div>

            {isSplit && (
              <div className='space-y-3'>
                <p className='text-sm font-medium text-gray-700'>{t.addons}</p>
                <AddonToggle
                  label={t.addonSadad}
                  price={sadadPrice}
                  currency={t.currency}
                  selected={includeSadad}
                  onToggle={() => setIncludeSadad((value) => !value)}
                />
                <AddonToggle
                  label={t.addonArkan}
                  price={certPrice}
                  currency={t.currency}
                  selected={includeArkan}
                  onToggle={() => setIncludeArkan((value) => !value)}
                />
              </div>
            )}

            {isBulk && (sadadPrice > 0 || certPrice > 0) && (
              <ul className='space-y-1 text-sm text-gray-600'>
                {sadadPrice > 0 && (
                  <li className='flex items-center gap-2'>
                    <Check className='size-4 text-green-500' />
                    {t.addonSadad}
                  </li>
                )}
                {certPrice > 0 && (
                  <li className='flex items-center gap-2'>
                    <Check className='size-4 text-green-500' />
                    {t.addonArkan}
                  </li>
                )}
              </ul>
            )}

            <div className='flex items-center justify-between border-t border-gray-200 pt-4'>
              <span className='text-base font-semibold text-gray-900'>
                {t.total}
              </span>
              <span className='text-xl font-bold text-[#00a8f1]'>
                {total} {t.currency}
              </span>
            </div>

            {error && error !== 'NOT_AUTHENTICATED' && (
              <p className='text-sm text-red-600'>{t.errorGeneric}</p>
            )}

            {isAuthenticated ? (
              <Button
                variant='brand'
                className='w-full'
                onClick={handleProceed}
                loading={processing}
                type='button'
              >
                {processing ? t.processing : t.proceed}
              </Button>
            ) : (
              <div className='space-y-2'>
                <p className='flex items-center justify-center gap-2 text-sm text-gray-500'>
                  <Lock className='size-4' />
                  {t.loginToPay}
                </p>
                <Button
                  variant='brand'
                  className='w-full'
                  onClick={goToLogin}
                  type='button'
                >
                  {t.loginCta}
                </Button>
              </div>
            )}

            <p className='text-center text-xs text-gray-400'>
              {t.securePayment}
            </p>
          </div>
        )}

        {step === 'payment' && paymentInit && (
          <div className='space-y-4'>
            <MoyasarPaymentForm
              publishableKey={paymentInit.pubKey.pubkey}
              amountSar={total}
              description={courseTitle || `Course #${courseId}`}
              pendingTransactionId={paymentInit.pendingTransactionId}
              userId={user?.id ?? ''}
              callbackUrl={callbackUrl}
              loadingLabel={t.processing}
              errorLabel={t.errorGeneric}
            />
            <Button
              variant='ghost'
              className='w-full'
              onClick={() => setStep('plan')}
              type='button'
            >
              {t.back}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}

function AddonToggle({
  label,
  price,
  currency,
  selected,
  onToggle,
}: {
  label: string;
  price: number;
  currency: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type='button'
      variant={selected ? 'brand' : 'outline'}
      onClick={onToggle}
      aria-pressed={selected}
      className='w-full justify-between rounded-xl px-4 py-3'
    >
      <span className='flex items-center gap-2'>
        <span
          className={cn(
            'flex size-5 items-center justify-center rounded-md border',
            selected ? 'border-white bg-white/20' : 'border-gray-300'
          )}
        >
          {selected && <Check className='size-3.5' />}
        </span>
        {label}
      </span>
      <span className='font-semibold'>
        +{price} {currency}
      </span>
    </Button>
  );
}
