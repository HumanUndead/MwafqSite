'use client';

import { useTranslations } from '@/i18n/DictionaryProvider';
import { StatusBadge, type StatusTone } from '@/shared/components/product';
import {
  reservationStatusKey,
  reservationStatusTone,
} from '@/modules/reservations/reservationStatus.shared';

const TONE: Record<ReturnType<typeof reservationStatusTone>, StatusTone> = {
  primary: 'info',
  warning: 'warning',
  success: 'success',
  danger: 'danger',
  neutral: 'neutral',
};

export function ReservationStatusBadge({ status }: { status: number }) {
  const t = useTranslations('reservations');
  return (
    <StatusBadge tone={TONE[reservationStatusTone(status)]}>
      {t.status[reservationStatusKey(status)]}
    </StatusBadge>
  );
}
