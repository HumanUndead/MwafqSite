'use client';

import { useLocale } from '@/i18n/DictionaryProvider';
import { cn } from '@/lib/utils';
import { BookingCalendar } from '@/modules/services/components/booking/BookingCalendar';
import { useBookingWeeklyTimeSlots } from '@/modules/services/hooks/useBookingWeeklyTimeSlots';
import type {
  BookingTimeSlot,
  ServiceProviderBranch,
} from '@/modules/services/types/booking.types';

const DAY_NAMES: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

function parseDayOfWeek(day: string): number | undefined {
  const n = Number(day);
  if (Number.isInteger(n) && n >= 0 && n <= 6) return n;
  return DAY_NAMES[day.toLowerCase().trim()];
}

function englishWeekdayName(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(
    new Date(`${dateStr}T12:00:00`)
  );
}

function fmtSelectedDay(dateStr: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr + 'T00:00:00'));
}

type TimeStepLabels = {
  availableTimes: string;
  pickDateFirst: string;
  loadingSlots: string;
  noSlots: string;
  loadError: string;
  slotsAriaLabel: string;
};

type TimeStepProps = {
  serviceGroupId: number;
  serviceIds: number[];
  branch: ServiceProviderBranch;
  selectedDate: string | null;
  selectedSlots: BookingTimeSlot[];
  onDateChange: (date: string) => void;
  onSlotsChange: (slots: BookingTimeSlot[]) => void;
  labels: TimeStepLabels;
};

export function TimeStep({
  serviceGroupId,
  serviceIds,
  branch,
  selectedDate,
  selectedSlots,
  onDateChange,
  onSlotsChange,
  labels,
}: TimeStepProps) {
  const locale = useLocale();

  const { days, loading, error } = useBookingWeeklyTimeSlots({
    branchId: branch.id,
    serviceIds,
    serviceGroupIds: [serviceGroupId],
  });

  const availableDayOfWeeks = new Set(
    days.flatMap((g) => {
      const n = parseDayOfWeek(g.day);
      return n !== undefined ? [n] : [];
    })
  );

  const scheduleOffDates = new Set(
    branch.scheduleOffs.map((s) => s.date).filter((d): d is string => d !== null)
  );

  const slots = (() => {
    if (!selectedDate) return [];
    const weekday = englishWeekdayName(selectedDate);
    const raw = days.find((group) => group.day === weekday)?.slotTimes ?? [];
    return [...new Map(raw.map((s) => [s.slotTimeId, s])).values()];
  })();

  function toggleSlot(slot: BookingTimeSlot) {
    const already = selectedSlots.some((s) => s.slotTimeId === slot.slotTimeId);
    onSlotsChange(already ? [] : [slot]);
  }

  return (
    <div className='mb-6 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12'>
      <BookingCalendar
        value={selectedDate}
        onChange={onDateChange}
        locale={locale}
        loading={loading}
        availableDayOfWeeks={availableDayOfWeeks}
        closingDays={branch.closingDays}
        scheduleOffDates={scheduleOffDates}
      />

      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='mb-2.5 flex flex-wrap items-center justify-between gap-2'>
          <span className='translate-x-0.5 text-[12.5px] font-bold text-[#1e2364]'>
            {labels.availableTimes}
          </span>
          {selectedDate && (
            <span className='-translate-x-0.5 text-[11px] font-semibold text-[#6b7196]'>
              {fmtSelectedDay(selectedDate, locale)}
            </span>
          )}
        </div>

        {loading ? (
          <>
            <p className='mb-2.5 text-[13px] text-[#6b7196]' role='status'>
              {labels.loadingSlots}
            </p>
            <div className='grid grid-cols-3 gap-2.5'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='h-[50px] animate-pulse rounded-[6px] bg-[#f0f2f8]' />
              ))}
            </div>
          </>
        ) : error ? (
          <p className='rounded-lg bg-red-50 px-4 py-3 text-[13.5px] font-medium text-red-600'>
            {labels.loadError}
          </p>
        ) : !selectedDate ? (
          <>
            <div className='pointer-events-none grid grid-cols-3 gap-2.5 opacity-55'>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className='h-[50px] rounded-[6px] border border-[#e5e7f0] bg-white' />
              ))}
            </div>
            <p className='mt-2 text-end text-[11.5px] font-semibold text-[#6b7196]'>
              {labels.pickDateFirst}
            </p>
          </>
        ) : !slots.length ? (
          <p className='text-[14px] text-[#6b7196]'>{labels.noSlots}</p>
        ) : (
          <ul className='grid grid-cols-3 gap-2.5' aria-label={labels.slotsAriaLabel}>
            {slots.map((slot) => {
              const isSelected = selectedSlots.some((s) => s.slotTimeId === slot.slotTimeId);
              return (
                <li key={slot.slotTimeId}>
                  <button
                    type='button'
                    onClick={() => toggleSlot(slot)}
                    aria-pressed={isSelected}
                    className={cn(
                      'w-full cursor-pointer rounded-[6px] border px-1 py-3.5 text-center text-[13.5px] font-bold tracking-[-0.2px] transition duration-200 hover:-translate-y-px',
                      isSelected
                        ? 'border-[#00a8f1] bg-[#00a8f1] text-white'
                        : 'border-[#e5e7f0] bg-white text-[#1e2364] hover:border-[#00a8f1] hover:bg-[#00a8f1]/5'
                    )}
                  >
                    {slot.from} – {slot.to}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
