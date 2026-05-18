/** Upstream `Reservation.status` flags. */
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

export type ReservationStatusValue =
  (typeof ReservationStatus)[keyof typeof ReservationStatus];
