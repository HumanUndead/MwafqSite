'use client';

import { Building2, CalendarDays, GraduationCap, Layers, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { interpolate } from '@/shared/lib/interpolate';
import { checkoutTotals, formatSlotTime, fromIsoDate } from '../checkout.shared';
import type { CheckoutState } from '../types/checkout.types';

const MAX_CHIPS = 4;

export function ServiceChips({ names }: { names: string[] }) {
  const t = useTranslations('checkout');
  const shown = names.slice(0, MAX_CHIPS);
  const more = names.length - shown.length;
  return (
    <div className='flex flex-wrap gap-1.5'>
      {shown.map((name) => (
        <span
          key={name}
          className='rounded-full bg-[#f3f4f8] px-3 py-1 text-[12.5px] font-semibold text-[#1e2364]'
        >
          {name}
        </span>
      ))}
      {more > 0 && (
        <span className='rounded-full bg-[#e6f6fe] px-3 py-1 text-[12.5px] font-semibold text-[#0090d1]'>
          {interpolate(t.moreServices, { count: more })}
        </span>
      )}
    </div>
  );
}

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className='flex gap-3'>
      <span className='mt-0.5 text-[#00a8f1]' aria-hidden>
        {icon}
      </span>
      <div className='min-w-0 flex-1'>
        <p className='text-[11.5px] font-bold uppercase tracking-wide text-[#6b7196]'>
          {label}
        </p>
        <div className='text-sm font-semibold text-[#1e2364]'>{children}</div>
      </div>
    </div>
  );
}

interface BookingSummaryProps {
  state: CheckoutState;
  ownerName: string | null;
}

/** Side panel that fills in as the user moves through the steps. */
export function BookingSummary({ state, ownerName }: BookingSummaryProps) {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const totals = checkoutTotals(state);
  const date = state.appointment.dateChosen
    ? new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(fromIsoDate(state.appointment.dateChosen))
    : null;

  return (
    <aside className='flex flex-col gap-4 rounded-[24px] border-2 border-[#e5e7f0] bg-white p-5'>
      <p className='text-[15px] font-extrabold text-[#1e2364]'>{t.youAreBooking}</p>
      {state.service && (
        <Row icon={<Layers className='size-4' />} label={t.youAreBooking}>
          <ServiceChips names={state.service.serviceNames} />
        </Row>
      )}
      {ownerName && (
        <Row icon={<User className='size-4' />} label={t.confirm.bookingFor}>
          {ownerName}
        </Row>
      )}
      {state.facility && (
        <Row icon={<Building2 className='size-4' />} label={t.confirm.facility}>
          {state.facility.name}
        </Row>
      )}
      {date && (
        <Row icon={<CalendarDays className='size-4' />} label={t.confirm.dateTime}>
          <p>{date}</p>
          {state.appointment.selectedSlots.map((slot) => (
            <p key={slot.slotTimeId} className='text-[13px] font-medium text-[#6b7196]'>
              <span dir='ltr'>
                {formatSlotTime(slot.from)} – {formatSlotTime(slot.to)}
              </span>
              {state.appointment.selectedSlots.length > 1 && ` · ${slot.label}`}
            </p>
          ))}
        </Row>
      )}
      {state.course.courseId && state.course.courseName && (
        <Row icon={<GraduationCap className='size-4' />} label={t.confirm.course}>
          {state.course.courseName}
        </Row>
      )}
      {totals.total > 0 && (
        <div className='flex items-center justify-between border-t-2 border-[#eef0f7] pt-4'>
          <span className='text-sm font-bold text-[#6b7196]'>{t.confirm.total}</span>
          <SarAmount amount={totals.total} className='text-lg font-extrabold text-[#1e2364]' />
        </div>
      )}
    </aside>
  );
}
