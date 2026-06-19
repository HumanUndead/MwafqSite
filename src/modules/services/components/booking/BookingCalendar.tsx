'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarMonth, DayButton } from 'react-day-picker';
import { useDayPicker } from 'react-day-picker';
import { ar } from 'date-fns/locale/ar';
import { enUS } from 'date-fns/locale/en-US';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';

type BookingCalendarProps = {
  value: string | null;
  onChange: (date: string) => void;
  locale: string;
  loading?: boolean;
  availableDayOfWeeks?: ReadonlySet<number>;
  closingDays?: number[];
  scheduleOffDates?: ReadonlySet<string>;
};

const today = new Date();
today.setHours(0, 0, 0, 0);

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const navBtnClass = cn(
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px]',
  'border border-[#e5e7f0] bg-white text-[#1e2364] transition',
  'hover:border-[#00a8f1] hover:bg-[#00a8f1]/10',
  'disabled:pointer-events-none disabled:opacity-40'
);

function buildMonthCaption(locale: string) {
  return function MonthCaption({ calendarMonth }: { calendarMonth: CalendarMonth }) {
    const { goToMonth, nextMonth, previousMonth } = useDayPicker();
    const label = new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    }).format(calendarMonth.date);

    return (
      <div className='mb-2 flex h-7 items-center justify-between'>
        <button
          type='button'
          aria-label='Previous month'
          disabled={!previousMonth}
          onClick={() => previousMonth && goToMonth(previousMonth)}
          className={navBtnClass}
        >
          <ChevronLeft className='size-3.5 rtl:rotate-180' />
        </button>
        <span className='select-none text-[16px] font-semibold tracking-[-0.2px] text-[#1e2364]'>
          {label}
        </span>
        <button
          type='button'
          aria-label='Next month'
          disabled={!nextMonth}
          onClick={() => nextMonth && goToMonth(nextMonth)}
          className={navBtnClass}
        >
          <ChevronRight className='size-3.5 rtl:rotate-180' />
        </button>
      </div>
    );
  };
}

function MwafqDayButton({
  modifiers,
  day,
  className,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isInactive = modifiers.outside || modifiers.disabled;

  return (
    <button
      ref={ref}
      type='button'
      className={cn(
        'flex h-[38px] w-full items-center justify-center rounded-[7px] text-[14px] transition focus:outline-none',
        isInactive
          ? 'cursor-default text-[#1e2364]/25'
          : 'cursor-pointer text-[#1e2364] hover:bg-[#00a8f1]/10',
        modifiers.today &&
          !modifiers.disabled &&
          'underline decoration-[#00a8f1] decoration-2 underline-offset-[3px]',
        modifiers.selected && 'font-bold text-[#00a8f1]',
        className
      )}
      {...props}
    />
  );
}

export function BookingCalendar({
  value,
  onChange,
  locale,
  loading = false,
  availableDayOfWeeks,
  closingDays = [],
  scheduleOffDates,
}: BookingCalendarProps) {
  const selected = value ? new Date(value + 'T00:00:00') : undefined;
  const dpLocale = locale === 'ar' ? ar : enUS;
  const MonthCaption = buildMonthCaption(locale);

  function isDateDisabled(date: Date): boolean {
    if (loading) return false;
    const dow = date.getDay();
    if (closingDays.includes(dow)) return true;
    if (availableDayOfWeeks && !availableDayOfWeeks.has(dow)) return true;
    if (scheduleOffDates?.has(toIso(date))) return true;
    return false;
  }

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    onChange(toIso(date));
  }

  return (
    <div className='w-[340px] shrink-0 rounded-xl border border-[#e5e7f0] bg-white p-[18px]'>
      <Calendar
        mode='single'
        selected={selected}
        onSelect={handleSelect}
        startMonth={today}
        disabled={[{ before: today }, isDateDisabled]}
        showOutsideDays
        weekStartsOn={0}
        locale={dpLocale}
        className='p-0'
        classNames={{
          root: 'w-full',
          months: 'w-full',
          month: 'flex w-full flex-col gap-0',
          nav: 'hidden',
          month_caption: '',
          caption_label: 'hidden',
          month_grid: 'w-full border-collapse',
          weekdays: 'flex',
          weekday:
            'flex-1 select-none py-1.5 text-center text-[12px] font-semibold uppercase tracking-[0.04em] text-[#1e2364]/45',
          week: 'flex w-full',
          day: 'relative flex-1 p-0',
          today: '',
          outside: '',
          disabled: '',
          hidden: 'invisible',
        }}
        components={{
          MonthCaption,
          DayButton: MwafqDayButton,
        }}
      />
    </div>
  );
}
