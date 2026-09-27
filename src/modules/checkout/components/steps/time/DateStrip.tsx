'use client';

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { cn } from '@/shared/lib/cn';
import {
  BOOKING_HORIZON_DAYS,
  addDays,
  startOfToday,
  toIsoDate,
} from '../../../checkout.shared';

interface DateStripProps {
  weekStart: Date;
  selected: Date | null;
  isBookable: (date: Date) => boolean;
  onSelect: (date: Date) => void;
  onWeekChange: (weekStart: Date) => void;
  onOpenMonth: () => void;
}

/** Sunday of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  return addDays(date, -date.getDay());
}

/** One week of days (Sunday first) with paging, plus a month-view button. */
export function DateStrip({
  weekStart,
  selected,
  isBookable,
  onSelect,
  onWeekChange,
  onOpenMonth,
}: DateStripProps) {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const today = startOfToday();
  const firstWeek = startOfWeek(today);
  const lastWeek = startOfWeek(addDays(today, BOOKING_HORIZON_DAYS));
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const monthFormat = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });

  const navClass =
    'inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-[#e5e7f0] bg-white text-[#1e2364] hover:border-[#00a8f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364] disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className='rounded-[20px] border-2 border-[#e5e7f0] bg-white p-3'>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <button
          type='button'
          onClick={onOpenMonth}
          aria-label={t.time.openMonth}
          className='inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#f3f4f8] px-3 py-1.5 text-[13.5px] font-bold text-[#1e2364] hover:bg-[#e8eaf3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]'
        >
          <CalendarDays className='size-4' aria-hidden />
          {monthFormat.format(selected ?? weekStart)}
        </button>
        <div className='flex gap-1.5'>
          <button
            type='button'
            aria-label={t.time.previousWeek}
            disabled={weekStart <= firstWeek}
            onClick={() => onWeekChange(addDays(weekStart, -7))}
            className={navClass}
          >
            <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
          </button>
          <button
            type='button'
            aria-label={t.time.nextWeek}
            disabled={weekStart >= lastWeek}
            onClick={() => onWeekChange(addDays(weekStart, 7))}
            className={navClass}
          >
            <ChevronRight className='size-4 rtl:rotate-180' aria-hidden />
          </button>
        </div>
      </div>
      <div className='grid grid-cols-7 gap-1.5'>
        {days.map((day) => {
          const bookable = isBookable(day);
          const active = selected ? toIsoDate(selected) === toIsoDate(day) : false;
          return (
            <button
              key={toIsoDate(day)}
              type='button'
              disabled={!bookable}
              aria-pressed={active}
              aria-label={new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(day)}
              onClick={() => onSelect(day)}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-0.5 rounded-[14px] py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364] disabled:cursor-not-allowed',
                active
                  ? 'bg-[#1e2364] text-white'
                  : bookable
                    ? 'bg-[#f3f4f8] text-[#1e2364] hover:bg-[#e6f6fe]'
                    : 'text-[#b7bbd0] line-through'
              )}
            >
              <span className='text-[11px] font-semibold'>{weekdayFormat.format(day)}</span>
              <span className='text-[16px] font-extrabold tabular-nums'>{day.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
