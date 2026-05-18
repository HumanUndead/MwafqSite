import { ReservationStatus } from './reservationStatus';
import type { Reservation } from './types/reservation.types';
import { buildPrepItems, formatReservationDate, formatReservationTime } from './reservationFormat';

export type TimelineStepId = 'new' | 'accepted' | 'progress' | 'completed';

export function isCanceledReservationStatus(status: number): boolean {
  return (
    status === ReservationStatus.Cancel ||
    status === ReservationStatus.Reject ||
    status === ReservationStatus.NoShow ||
    status === ReservationStatus.Delayed
  );
}

export function mapStatusToTimelineStep(status: number): TimelineStepId | null {
  if (isCanceledReservationStatus(status)) {
    return null;
  }
  if (status === ReservationStatus.Complete) {
    return 'completed';
  }
  if (
    status === ReservationStatus.CheckIn ||
    status === ReservationStatus.InProgress ||
    status === ReservationStatus.Delayed
  ) {
    return 'progress';
  }
  if (status === ReservationStatus.Accept) {
    return 'accepted';
  }
  return 'new';
}

export function resolveIsResultView(
  reservation: Reservation,
  viewParam?: string
): boolean {
  if (viewParam === 'info') {
    return true;
  }
  return reservation.status === ReservationStatus.Complete;
}

export function shouldShowCancelAction(status: number): boolean {
  return status === ReservationStatus.New || status === ReservationStatus.Accept;
}

export function shouldShowReorderAction(status: number): boolean {
  return isCanceledReservationStatus(status);
}

export type ReservationDetailsViewModel = {
  id: string;
  title?: string;
  hospital?: string;
  date?: string;
  time?: string;
  prepItems: string[];
  companyName?: string;
  sellPrice?: number;
  paymentStatus?: number;
  note?: string;
  timelineStep: TimelineStepId | null;
  isCanceled: boolean;
  isResultView: boolean;
  showCancel: boolean;
  showReorder: boolean;
};

export function buildReservationDetailsViewModel(
  reservation: Reservation,
  options?: { view?: string }
): ReservationDetailsViewModel {
  const service = reservation.reservationServices?.[0];
  const isResultView = resolveIsResultView(reservation, options?.view);

  return {
    id: reservation.id,
    title: service?.serviceName?.trim() || undefined,
    hospital: reservation.serviceProviderBranchName?.trim() || undefined,
    date: formatReservationDate(reservation.dateChosen),
    time: formatReservationTime(service?.timeFrom, service?.timeTo),
    prepItems: buildPrepItems(reservation),
    companyName: reservation.companyName?.trim() || undefined,
    sellPrice: reservation.sellPrice,
    paymentStatus: reservation.paymentStatus,
    note: reservation.note?.trim() || undefined,
    timelineStep: mapStatusToTimelineStep(reservation.status),
    isCanceled: isCanceledReservationStatus(reservation.status),
    isResultView,
    showCancel: shouldShowCancelAction(reservation.status),
    showReorder: shouldShowReorderAction(reservation.status),
  };
}
