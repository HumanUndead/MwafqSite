'use client';

import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { CUSTOM_DAYS_ORDER, customDayFlag } from '../../../checkout.shared';

/** Open weekday chips built from the branch's `closingDays` flags. */
export function WorkingDays({ closingDays }: { closingDays: number[] }) {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const format = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // 2024-01-07 is a Sunday: index + offset gives each JS weekday.
  const dayLabel = (jsDay: number) => format.format(new Date(2024, 0, 7 + jsDay));

  const open = CUSTOM_DAYS_ORDER.filter(
    (jsDay) => !closingDays.includes(customDayFlag(jsDay))
  );

  if (open.length === 0) {
    return <span className='text-xs font-semibold text-red-600'>{t.facility.closedAllWeek}</span>;
  }
  if (open.length === 7) {
    return (
      <span className='rounded-full bg-green-50 px-2.5 py-0.5 text-[11.5px] font-bold text-green-700'>
        {t.facility.everyDay}
      </span>
    );
  }
  return (
    <ul className='flex flex-wrap gap-1' aria-label={t.facility.openDays}>
      {open.map((jsDay) => (
        <li
          key={jsDay}
          className='rounded-full bg-[#f3f4f8] px-2 py-0.5 text-[11px] font-bold text-[#1e2364]'
        >
          {dayLabel(jsDay)}
        </li>
      ))}
    </ul>
  );
}
