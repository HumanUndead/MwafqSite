'use client';

import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { MemberAvatar } from '@/modules/family';
import {
  PaymentDialog,
  PaymentTarget,
  usePaymentCheckout,
  type CreateClientOrderPayload,
} from '@/modules/payment';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { ROUTES } from '@/shared/constants/routes';
import { interpolate } from '@/shared/lib/interpolate';
import {
  checkoutTotals,
  formatSlotTime,
  fromIsoDate,
  utcOffsetLabel,
} from '../../checkout.shared';
import type { OwnerOption } from '../../hooks/useOwnerOptions';
import type { CheckoutState } from '../../types/checkout.types';
import { StepFooter } from '../StepFooter';

function Section({ title, children, onEdit }: { title: string; children: ReactNode; onEdit?: () => void }) {
  const t = useTranslations('checkout');
  return (
    <section className='rounded-[20px] border-2 border-[#e5e7f0] bg-white p-4'>
      <div className='mb-3 flex items-center justify-between gap-3'>
        <h2 className='text-[13px] font-bold uppercase tracking-wide text-[#6b7196]'>{title}</h2>
        {onEdit && (
          <button
            type='button'
            onClick={onEdit}
            className='cursor-pointer rounded-full text-[13px] font-bold text-[#00a8f1] hover:text-[#0090d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]'
          >
            {t.confirm.edit}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function PriceRow({ label, amount, strong }: { label: string; amount: number; strong?: boolean }) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <span className={strong ? 'text-[15px] font-extrabold text-[#1e2364]' : 'text-sm text-[#6b7196]'}>
        {label}
      </span>
      <SarAmount
        amount={amount}
        className={strong ? 'text-lg font-extrabold text-[#1e2364]' : 'text-sm font-semibold text-[#1e2364]'}
      />
    </div>
  );
}

interface ConfirmStepProps {
  state: CheckoutState;
  owner: OwnerOption | null;
  onEdit: (step: 'family' | 'facility' | 'time' | 'course') => void;
  onBack: () => void;
}

export function ConfirmStep({ state, owner, onEdit, onBack }: ConfirmStepProps) {
  const t = useTranslations('checkout');
  const paymentT = useTranslations('payment');
  const locale = useLocale();
  const checkout = usePaymentCheckout({
    callbackPath: getLocalizedRoute(locale, ROUTES.CHECKOUT_PAYMENT_CALLBACK),
  });

  const totals = checkoutTotals(state);
  const { facility, appointment, course, service } = state;
  const date = appointment.dateChosen
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(fromIsoDate(appointment.dateChosen))
    : '';
  const ready =
    Math.round(totals.total * 100) > 0 &&
    !!facility &&
    !!appointment.dateChosen &&
    appointment.selectedSlots.length > 0 &&
    !!state.ownerId;

  function pay() {
    if (!ready || !facility || !appointment.dateChosen || !state.ownerId) return;
    const order: CreateClientOrderPayload = {
      reservation: {
        serviceProviderBranchId: facility.branchId,
        dateChosen: appointment.dateChosen,
        ownerId: state.ownerId,
        reservationServices: appointment.selectedSlots.map((slot) => ({
          serviceProviderBranchServiceId: slot.serviceProviderBranchServiceId,
          slotTimeId: slot.slotTimeId,
        })),
      },
      courses:
        course.courseId && course.selectedService !== undefined
          ? [{ courseId: course.courseId, selectedService: course.selectedService }]
          : undefined,
    };
    const description =
      service?.serviceNames.filter(Boolean).join(', ') ||
      facility.name ||
      paymentT.reservationDescription;
    void checkout.start({ order, targetType: PaymentTarget.Reservation, description });
  }

  return (
    <div className='flex flex-col gap-4'>
      <Section title={t.confirm.bookingFor} onEdit={() => onEdit('family')}>
        {owner && (
          <div className='flex items-center gap-3'>
            <MemberAvatar name={owner.name} image={owner.image} />
            <p className='text-[15px] font-bold text-[#1e2364]'>
              {owner.isSelf ? `${owner.name} (${t.family.you})` : owner.name}
            </p>
          </div>
        )}
        {facility && (
          <p className='mt-3 text-sm text-[#6b7196]'>
            {t.confirm.facility}: <span className='font-semibold text-[#1e2364]'>{facility.name}</span>
          </p>
        )}
      </Section>

      <Section title={t.confirm.dateTime} onEdit={() => onEdit('time')}>
        <p className='text-[15px] font-bold text-[#1e2364]'>{date}</p>
        <ul className='mt-2 flex flex-col gap-2'>
          {appointment.selectedSlots.map((slot) => (
            <li key={slot.slotTimeId} className='flex items-center justify-between gap-3 rounded-[12px] bg-[#f3f4f8] px-3 py-2.5'>
              <span className='min-w-0'>
                <span className='block truncate text-sm font-semibold text-[#1e2364]'>{slot.label}</span>
                <span className='text-xs font-bold tabular-nums text-[#6b7196]' dir='ltr'>
                  {formatSlotTime(slot.from)} – {formatSlotTime(slot.to)}
                </span>
              </span>
              <SarAmount amount={slot.price} className='text-sm font-bold text-[#1e2364]' />
            </li>
          ))}
        </ul>
        <p className='mt-2 text-xs font-medium text-[#6b7196]'>
          {interpolate(t.confirm.timesShownIn, { offset: utcOffsetLabel() })}
        </p>
      </Section>

      {course.courseId && course.courseName && (
        <Section title={t.confirm.course} onEdit={() => onEdit('course')}>
          <p className='text-[15px] font-bold text-[#1e2364]'>{course.courseName}</p>
        </Section>
      )}

      <section className='flex flex-col gap-2.5 rounded-[20px] border-2 border-[#e5e7f0] bg-white p-4'>
        <PriceRow label={t.confirm.base} amount={totals.base} />
        <PriceRow label={t.confirm.tax} amount={totals.tax} />
        {totals.course > 0 && <PriceRow label={t.confirm.courseTotal} amount={totals.course} />}
        <div className='border-t-2 border-[#eef0f7] pt-2.5'>
          <PriceRow label={t.confirm.total} amount={totals.total} strong />
        </div>
      </section>

      {checkout.error && (
        <p className='rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700' role='alert'>
          {checkout.error}
        </p>
      )}

      <StepFooter
        ready={!!ready}
        busy={checkout.phase === 'preparing'}
        hint={ready ? t.confirm.vatIncluded : t.confirm.invalidTotal}
        nextLabel={
          <>
            <Lock className='size-4' aria-hidden />
            {t.confirm.payNow}
          </>
        }
        nextAccessory={
          <span className='rounded-full bg-white/15 px-2 py-0.5'>
            <SarAmount amount={totals.total} />
          </span>
        }
        onNext={pay}
        onBack={onBack}
      />

      <PaymentDialog
        phase={checkout.phase}
        session={checkout.session}
        onClose={checkout.close}
        onExpire={checkout.expire}
      />
    </div>
  );
}
