import { ReservationStatus } from './reservationStatus';
import type {
  Reservation,
  ReservationPublicDetail,
  ReservationPublicService,
} from './types/reservation.types';
import {
  buildPrepItems,
  formatReservationDate,
  formatReservationTime,
} from './reservationFormat';

function publicReservationServices(
  detail: ReservationPublicDetail
): ReservationPublicService[] {
  return [
    ...detail.reservationServices.services,
    ...detail.reservationServices.groupServices,
  ];
}

function buildPrepItemsFromPublicServices(
  services: ReservationPublicService[]
): string[] {
  const items: string[] = [];
  for (const service of services) {
    if (service.conditions) {
      for (const line of service.conditions) {
        items.push(line);
      }
    }
    if (service.requirements) {
      for (const line of service.requirements) {
        items.push(line.requirement);
      }
    }
  }
  return items;
}

export type TimelineStepId = 'new' | 'accepted' | 'progress' | 'completed';

const CANCELED_RESERVATION_STATUSES: number[] = [
  ReservationStatus.Cancel,
  ReservationStatus.Reject,
  ReservationStatus.NoShow,
  ReservationStatus.Delayed,
];

export function isCanceledReservationStatus(status: number): boolean {
  return CANCELED_RESERVATION_STATUSES.includes(status);
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
  return (
    status === ReservationStatus.New || status === ReservationStatus.Accept
  );
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

export function buildReservationDetailsViewModelFromPublic(
  id: string,
  detail: ReservationPublicDetail,
  options?: { view?: string }
): ReservationDetailsViewModel {
  const services = publicReservationServices(detail);
  const primary = services[0];
  const isResultView = options?.view === 'info';
  const totalSell = services.reduce((sum, s) => sum + (s.sellPrice ?? 0), 0);

  return {
    id,
    title: primary?.serviceName?.trim() || undefined,
    date: formatReservationDate(detail.dateChosen),
    time: formatReservationTime(primary?.from, primary?.to),
    prepItems: buildPrepItemsFromPublicServices(services),
    companyName: detail.companyName?.trim() || undefined,
    sellPrice: totalSell > 0 ? totalSell : undefined,
    timelineStep: null,
    isCanceled: false,
    isResultView,
    showCancel: false,
    showReorder: false,
  };
}

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
