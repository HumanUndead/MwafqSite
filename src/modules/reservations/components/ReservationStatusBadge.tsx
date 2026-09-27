'use client';

import { useTranslations } from '@/i18n/DictionaryProvider';
import { cn } from '@/shared/lib/cn';
import {
  reservationStatusKey,
  reservationStatusTone,
} from '../reservationStatus.shared';

const TONE_CLASS = {
  primary: 'border-[#bfe8fb] bg-[#e6f6fe] text-[#0077ad]',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
  neutral: 'border-[#e5e7f0] bg-[#f3f4f8] text-[#6b7196]',
} as const;

export function ReservationStatusBadge({ status }: { status: number }) {
  const t = useTranslations('reservations');
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold',
        TONE_CLASS[reservationStatusTone(status)]
      )}
    >
      {t.status[reservationStatusKey(status)]}
    </span>
  );
}
