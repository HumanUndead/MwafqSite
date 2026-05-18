import 'server-only';

import type { UpstreamApiResponse } from '@/shared/types/api.types';
import type {
  Reservation,
  ReservationsShortcutListPage,
} from '../types/reservation.types';

export function parseMyReservationsList(payload: unknown): Reservation[] {
  const data = (payload as UpstreamApiResponse<ReservationsShortcutListPage>)
    .value?.data;
  return Array.isArray(data) ? data : [];
}

export function parseReservationsShortcutListPage(
  payload: unknown
): ReservationsShortcutListPage | null {
  const value = (payload as UpstreamApiResponse<ReservationsShortcutListPage>)
    .value;
  if (!value) {
    return null;
  }
  return {
    ...value,
    data: parseMyReservationsList(payload),
  };
}
