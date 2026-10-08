'use client';

import { Check, ShieldCheck } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { useAuthStore } from '@/modules/auth/store/authStore';
import {
  PaymentDialog,
  PaymentTarget,
  usePaymentCheckout,
} from '@/modules/payment';
import { Notice } from '@/shared/components/product';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { cn } from '@/shared/lib/cn';
import { ROUTES } from '@/shared/constants/routes';
import {
  CoursePaymentMode,
  computeTotalPrice,
  resolveSelectedService,
} from '../selectedService.shared';
import type { CoursePaymentSettings } from '../types/payment.types';

const modalCtaClass = 'w-full';

/** Label / amount row inside the enrol dialog. */
const priceRowClass = 'flex items-center justify-between gap-3 py-3';

interface EnrollButtonProps {
  courseId: number;
  courseTitle?: string;
  paymentSettings?: CoursePaymentSettings | null;
  className?: string;
  label?: ReactNode;
  /**
   * Resume a pending enrolment (MyCourses `payment.status === 1`): pay that
   * user course for `amountOwed`, skipping the plan step (mobile rule).
   */
  resume?: { userCourseId: number; amountOwed: number };
  /** Open the dialog on mount (e.g. `?pay=` deep link). */
  defaultOpen?: boolean;
}

/**
 * Plan (course + optional SADAD / certificate exam) → CreateClientOrder →
 * Moyasar card form → `/courses/payment/callback`.
 */
export function EnrollButton({
  courseId,
  courseTitle,
  paymentSettings,
  className,
  label,
  resume,
  defaultOpen = false,
}: EnrollButtonProps) {
  const t = useTranslations('academyEnroll');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkout = usePaymentCheckout({
    callbackPath: `${getLocalizedRoute(locale, ROUTES.COURSES)}/payment/callback`,
  });

  const [open, setOpen] = useState(defaultOpen);
  const [includeSadad, setIncludeSadad] = useState(false);
  const [includeArkan, setIncludeArkan] = useState(false);

  const sellingPlan = paymentSettings?.sellingPlan;
  const isSplit = sellingPlan === CoursePaymentMode.Saprted;
  const isBulk = sellingPlan === CoursePaymentMode.Bulk;
  const total = resume
    ? resume.amountOwed
    : computeTotalPrice(paymentSettings ?? undefined, includeSadad, includeArkan);
  const payable = Math.round(total * 100) > 0;

  function openModal() {
    setIncludeSadad(false);
    setIncludeArkan(false);
    checkout.setError(null);
    setOpen(true);
  }

  function goToLogin() {
    router.push(
      `${getLocalizedRoute(locale, ROUTES.LOGIN)}?redirect=${encodeURIComponent(pathname)}`
    );
  }

  function handleProceed() {
    if (!isAuthenticated) {
      goToLogin();
      return;
    }
    if (!payable) return;
    const description = courseTitle || `Course Payment - ${courseId}`;
    setOpen(false);
    // Payment TargetId must be a ClientOrder GUID, never a userCourseId, so a
    // resume also goes through CreateClientOrder.
    void checkout.start({
      order: {
        courses: [
          {
            courseId,
            selectedService: resolveSelectedService(
              sellingPlan ?? CoursePaymentMode.CourseOnly,
              includeSadad,
              includeArkan
            ),
          },
        ],
      },
      targetType: PaymentTarget.UserCourse,
      description,
    });
  }

  const price = paymentSettings?.price ?? 0;
  const sadadPrice = paymentSettings?.sadadPrice ?? 0;
  const certPrice = paymentSettings?.certifiedExamPrice ?? 0;

  return (
    <>
      <Button
        variant='product'
        size='control'
        className={cn('w-full', className)}
        onClick={openModal}
        loading={checkout.phase === 'preparing'}
        type='button'
      >
        {label ?? (resume ? t.continuePayment : t.enrollNow)}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={resume ? t.reviewPayment : t.title}
      >
        <div className='flex flex-col gap-4 text-[#1e2364]'>
          {courseTitle ? (
            <p className='text-[15px] font-semibold leading-6 wrap-break-word'>{courseTitle}</p>
          ) : null}
          {resume ? (
            <div className={cn(priceRowClass, 'border-y border-[#eef0f7]')}>
              <span className='text-[14px] font-semibold text-[#6b7196]'>{t.stillToPay}</span>
              <SarAmount amount={resume.amountOwed} className='text-[15px] font-bold' />
            </div>
          ) : (
            <>
              <div className={cn(priceRowClass, 'border-y border-[#eef0f7]')}>
                <span className='text-[14px] font-semibold text-[#6b7196]'>{t.coursePrice}</span>
                <SarAmount amount={price} className='text-[15px] font-bold' />
              </div>

              {isSplit && (
                <div className='flex flex-col gap-2'>
                  <p className='text-[13px] font-semibold text-[#6b7196]'>{t.addons}</p>
                  <AddonToggle
                    label={t.addonSadad}
                    price={sadadPrice}
                    selected={includeSadad}
                    onToggle={() => setIncludeSadad((value) => !value)}
                  />
                  <AddonToggle
                    label={t.addonArkan}
                    price={certPrice}
                    selected={includeArkan}
                    onToggle={() => setIncludeArkan((value) => !value)}
                  />
                </div>
              )}

              {isBulk && (sadadPrice > 0 || certPrice > 0) && (
                <ul className='flex flex-col gap-2 text-[14px] text-[#4a5078]'>
                  {sadadPrice > 0 && (
                    <li className='flex items-center gap-2'>
                      <Check className='size-4 shrink-0 text-green-700' aria-hidden />
                      {t.addonSadad}
                    </li>
                  )}
                  {certPrice > 0 && (
                    <li className='flex items-center gap-2'>
                      <Check className='size-4 shrink-0 text-green-700' aria-hidden />
                      {t.addonArkan}
                    </li>
                  )}
                </ul>
              )}
            </>
          )}

          <div className={cn(priceRowClass, 'border-t border-[#eef0f7] pb-0 pt-4')}>
            <span className='text-[15px] font-bold'>{t.total}</span>
            <SarAmount amount={total} className='text-[24px] font-bold leading-none' />
          </div>

          {!payable && <Notice tone='warning'>{t.priceUnavailable}</Notice>}

          {isAuthenticated ? (
            <Button
              variant='product'
              size='control'
              className={modalCtaClass}
              onClick={handleProceed}
              disabled={!payable}
              type='button'
            >
              {t.proceed}
            </Button>
          ) : (
            <div className='flex flex-col gap-2'>
              <p className='text-center text-[14px] text-[#6b7196]'>{t.loginToPay}</p>
              <Button
                variant='product'
                size='control'
                className={modalCtaClass}
                onClick={goToLogin}
                type='button'
              >
                {t.loginCta}
              </Button>
            </div>
          )}

          <p className='flex items-center justify-center gap-1.5 text-center text-[13px] text-[#6b7196]'>
            <ShieldCheck className='size-4 shrink-0' aria-hidden />
            {t.securePayment}
          </p>
        </div>
      </Modal>

      {checkout.error && (
        <p className='mt-2 text-[13px] font-semibold text-red-700' role='alert'>
          {checkout.error}
        </p>
      )}
      <PaymentDialog
        phase={checkout.phase}
        session={checkout.session}
        onClose={checkout.close}
        onExpire={checkout.expire}
      />
    </>
  );
}

function AddonToggle({
  label,
  price,
  selected,
  onToggle,
}: {
  label: string;
  price: number;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type='button'
      variant='productSecondary'
      size='control'
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'w-full justify-between px-4 font-semibold',
        selected && 'border-[#1e2364] bg-[#f7f8fb]'
      )}
    >
      <span className='flex items-center gap-2.5 text-start'>
        <span
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150',
            selected ? 'border-[#1e2364] bg-[#1e2364] text-white' : 'border-[#c9cde0] bg-white'
          )}
        >
          {selected && <Check className='size-3.5' aria-hidden />}
        </span>
        {label}
      </span>
      <span className='inline-flex shrink-0 items-center gap-1 font-bold'>
        + <SarAmount amount={price} />
      </span>
    </Button>
  );
}
