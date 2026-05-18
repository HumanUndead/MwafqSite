import type { Reservation } from './types/reservation.types';

export function formatReservationDate(
  dateChosen: string | undefined
): string | undefined {
  if (!dateChosen) {
    return undefined;
  }
  const datePart = dateChosen.split('T')[0];
  return datePart || undefined;
}

export function formatReservationTime(
  timeFrom: string | undefined,
  timeTo: string | undefined
): string | undefined {
  if (!timeFrom) {
    return undefined;
  }
  if (!timeTo || timeFrom === timeTo) {
    return timeFrom.slice(0, 5);
  }
  return `${timeFrom.slice(0, 5)} – ${timeTo.slice(0, 5)}`;
}

export function buildPrepItems(reservation: Reservation): string[] {
  const items: string[] = [];
  if (reservation.note?.trim()) {
    items.push(reservation.note.trim());
  }
  if (reservation.cancelationReason?.trim()) {
    items.push(reservation.cancelationReason.trim());
  }
  if (reservation.rejectionReason?.trim()) {
    items.push(reservation.rejectionReason.trim());
  }
  return items;
}
