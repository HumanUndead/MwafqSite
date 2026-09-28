'use client';

import { Check, Lock, ShieldCheck } from 'lucide-react';
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

const modalCtaClass =
  'h-12 w-full bg-[#00a8f1] text-[15px] font-bold text-white hover:bg-[#0090d1] focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2';

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
    void checkout.start(
      resume
        ? {
            clientOrderId: String(resume.userCourseId),
            targetType: PaymentTarget.UserCourse,
            description,
          }
        : {
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
          }
    );
  }

  const price = paymentSettings?.price ?? 0;
  const sadadPrice = paymentSettings?.sadadPrice ?? 0;
  const certPrice = paymentSettings?.certifiedExamPrice ?? 0;

  return (
    <>
      <Button
        variant='brand'
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
        <div className='space-y-5 text-[#1e2364]'>
          {courseTitle ? (
            <p className='text-base font-semibold leading-snug wrap-break-word'>{courseTitle}</p>
          ) : null}
          {resume ? (
            <div className='flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3.5 ring-1 ring-amber-200'>
              <span className='text-sm font-semibold text-amber-800'>{t.stillToPay}</span>
              <SarAmount amount={resume.amountOwed} className='text-base font-bold text-[#1e2364]' />
            </div>
          ) : (
            <>
              <div className='flex items-center justify-between gap-3 rounded-2xl bg-[#f3f4f8] px-4 py-3.5 ring-1 ring-[#e5e7f0]'>
                <span className='text-sm text-[#6b7196]'>{t.coursePrice}</span>
                <SarAmount amount={price} className='text-base font-bold text-[#1e2364]' />
              </div>

              {isSplit && (
                <div className='space-y-2.5'>
                  <p className='text-sm font-semibold text-[#1e2364]'>{t.addons}</p>
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
                <ul className='space-y-2 rounded-2xl bg-[#f3f4f8] px-4 py-3 text-sm text-[#4a4f78] ring-1 ring-[#e5e7f0]'>
                  {sadadPrice > 0 && (
                    <li className='flex items-center gap-2'>
                      <Check className='size-4 shrink-0 text-emerald-600' aria-hidden />
                      {t.addonSadad}
                    </li>
                  )}
                  {certPrice > 0 && (
                    <li className='flex items-center gap-2'>
                      <Check className='size-4 shrink-0 text-emerald-600' aria-hidden />
                      {t.addonArkan}
                    </li>
                  )}
                </ul>
              )}
            </>
          )}

          <div className='flex items-center justify-between gap-3 border-t border-[#e5e7f0] pt-4'>
            <span className='text-base font-semibold text-[#1e2364]'>{t.total}</span>
            <SarAmount amount={total} className='text-[28px] font-bold leading-none text-[#1e2364]' />
          </div>

          {!payable && (
            <p className='rounded-xl bg-[#f3f4f8] px-3 py-2 text-sm font-semibold text-[#6b7196]'>
              {t.priceUnavailable}
            </p>
          )}

          {isAuthenticated ? (
            <Button
              variant='brand'
              shape='pill'
              className={modalCtaClass}
              onClick={handleProceed}
              disabled={!payable}
              type='button'
            >
              {t.proceed}
            </Button>
          ) : (
            <div className='space-y-2.5'>
              <p className='flex items-center justify-center gap-2 text-sm text-[#6b7196]'>
                <Lock className='size-4 shrink-0' aria-hidden />
                {t.loginToPay}
              </p>
              <Button
                variant='brand'
                shape='pill'
                className={modalCtaClass}
                onClick={goToLogin}
                type='button'
              >
                {t.loginCta}
              </Button>
            </div>
          )}

          <p className='flex items-center justify-center gap-1.5 text-center text-xs text-[#6b7196]'>
            <ShieldCheck className='size-3.5 shrink-0 text-emerald-600' aria-hidden />
            {t.securePayment}
          </p>
        </div>
      </Modal>

      {checkout.error && (
        <p className='mt-2 text-sm font-semibold text-red-600' role='alert'>
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
      variant='outline'
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'w-full justify-between rounded-2xl px-4 py-3 text-[#1e2364] focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2',
        selected
          ? 'border-[#00a8f1] bg-[#00a8f1]/10 hover:bg-[#00a8f1]/15'
          : 'border-[#e5e7f0] bg-white hover:bg-[#f3f4f8]'
      )}
    >
      <span className='flex items-center gap-2.5 text-start'>
        <span
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-md border',
            selected ? 'border-[#00a8f1] bg-[#00a8f1] text-white' : 'border-[#c9cde0] bg-white'
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
