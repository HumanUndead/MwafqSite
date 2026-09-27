import type { ReservationsListQuery } from './types/reservations.types';

/** Upstream `Reservation.status` bit flags (OR-able in filters). */
export const ReservationStatus = {
  New: 1,
  Accept: 2,
  Cancel: 4,
  Reject: 8,
  CheckIn: 16,
  InProgress: 32,
  Complete: 64,
  NoShow: 128,
  Delayed: 256,
} as const;

export type ReservationStatusKey =
  | 'New'
  | 'Accepted'
  | 'Cancelled'
  | 'Rejected'
  | 'CheckedIn'
  | 'InProgress'
  | 'Completed'
  | 'NoShow'
  | 'Delayed'
  | 'Unknown';

const STATUS_KEYS: Record<number, ReservationStatusKey> = {
  1: 'New',
  2: 'Accepted',
  4: 'Cancelled',
  8: 'Rejected',
  16: 'CheckedIn',
  32: 'InProgress',
  64: 'Completed',
  128: 'NoShow',
  256: 'Delayed',
};

export function reservationStatusKey(status: number): ReservationStatusKey {
  return STATUS_KEYS[status] ?? 'Unknown';
}

/** Badge tone per status (mobile: new=primary, in progress=warning, complete=success). */
export function reservationStatusTone(
  status: number
): 'primary' | 'warning' | 'success' | 'danger' | 'neutral' {
  if (status === ReservationStatus.New || status === ReservationStatus.Accept) {
    return 'primary';
  }
  if (status === ReservationStatus.InProgress || status === ReservationStatus.CheckIn) {
    return 'warning';
  }
  if (status === ReservationStatus.Complete) return 'success';
  if (
    status === ReservationStatus.Cancel ||
    status === ReservationStatus.Reject ||
    status === ReservationStatus.NoShow
  ) {
    return 'danger';
  }
  return 'neutral';
}

/** Every status except Accept (the "not only upcoming" filter). */
const ALL_BUT_ACCEPT = 509;

export const RESERVATIONS_PAGE_SIZE = 10;

/** Upstream filter for a tab. */
export function reservationListFilter(query: Pick<ReservationsListQuery, 'tab' | 'upcoming'>) {
  if (query.tab === 'results') {
    return { status: ReservationStatus.Complete, orderDirection: false };
  }
  return {
    status: query.upcoming ? ReservationStatus.Accept : ALL_BUT_ACCEPT,
    orderDirection: true,
  };
}
