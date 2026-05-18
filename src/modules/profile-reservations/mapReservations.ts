import { ReservationStatus } from './reservationStatus';
import {
  buildPrepItems,
  formatReservationDate,
  formatReservationTime,
} from './reservationFormat';
import type { Reservation } from './types/reservation.types';
import type { ExamCardData, ExamStatus, ResultCardData } from './types';

export function mapReservationToExamStatus(status: number): ExamStatus {
  switch (status) {
    case ReservationStatus.Cancel:
    case ReservationStatus.Reject:
    case ReservationStatus.NoShow:
    case ReservationStatus.Delayed:
      return 'canceled';
    case ReservationStatus.InProgress:
    case ReservationStatus.CheckIn:
      return 'progress';
    default:
      return 'new';
  }
}

export function mapReservationToCancelSlot(
  status: number
): ExamCardData['cancelSlot'] {
  switch (status) {
    case ReservationStatus.Cancel:
    case ReservationStatus.Reject:
    case ReservationStatus.NoShow:
    case ReservationStatus.Delayed:
      return 'reorder';
    case ReservationStatus.InProgress:
    case ReservationStatus.CheckIn:
    case ReservationStatus.Complete:
      return 'hidden';
    case ReservationStatus.New:
    case ReservationStatus.Accept:
      return 'cancel';
    default:
      return 'hidden';
  }
}

export function mapReservationToExamCard(
  reservation: Reservation
): ExamCardData {
  const service = reservation.reservationServices?.[0];
  const prepItems = buildPrepItems(reservation);

  return {
    id: reservation.id,
    title: service?.serviceName,
    status: mapReservationToExamStatus(reservation.status),
    hospital: reservation.serviceProviderBranchName,
    date: formatReservationDate(reservation.dateChosen),
    time: formatReservationTime(service?.timeFrom, service?.timeTo),
    prepItems: prepItems.length > 0 ? prepItems : undefined,
    cancelSlot: mapReservationToCancelSlot(reservation.status),
  };
}

export function mapReservationToResultCard(
  reservation: Reservation
): ResultCardData {
  const service = reservation.reservationServices?.[0];

  return {
    id: reservation.id,
    title: service?.serviceName?.trim() || undefined,
    hospital: reservation.serviceProviderBranchName?.trim() || undefined,
    date: formatReservationDate(reservation.dateChosen),
    time: formatReservationTime(service?.timeFrom, service?.timeTo),
  };
}

export function partitionReservations(reservations: Reservation[]): {
  exams: Reservation[];
  results: Reservation[];
} {
  return {
    exams: reservations,
    results: reservations.filter((r) => r.isFit),
  };
}
