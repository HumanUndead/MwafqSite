/** What a payment settles. Client-side only; the backend infers it from the order. */
export const PaymentTarget = {
  Reservation: 1,
  UserCourse: 2,
} as const;
export type PaymentTarget = (typeof PaymentTarget)[keyof typeof PaymentTarget];

export const ClientOrderItemType = {
  Service: 1,
  ServiceGroup: 2,
  Course: 3,
} as const;
export type ClientOrderItemType =
  (typeof ClientOrderItemType)[keyof typeof ClientOrderItemType];

export interface ClientOrderReservation {
  serviceProviderBranchId: number;
  /** `YYYY-MM-DD`. */
  dateChosen: string;
  /** Family member user id (GUID), or the signed-in user's id. */
  ownerId: string;
  reservationServices: {
    serviceProviderBranchServiceId: number;
    slotTimeId: number;
  }[];
}

export interface ClientOrderCourse {
  courseId: number;
  /** `CourseSelectedService` value. */
  selectedService: number;
}

/** Body of `POST Client/ClientOrder/CreateClientOrder`. */
export interface CreateClientOrderPayload {
  /** Omitted for a standalone course purchase. */
  reservation?: ClientOrderReservation;
  courses?: ClientOrderCourse[];
}

export interface CreateClientOrderResult {
  clientOrderId: string;
  total: number;
}

export interface ClientOrderItem {
  id: number;
  itemType: ClientOrderItemType;
  reservationId: string | null;
  userCourseId: number | null;
  selectedService: number;
  description: string;
  unitAmount: number;
  taxAmount: number;
  lineTotal: number;
  courseName: string | null;
}

export interface ClientOrder {
  id: string;
  items: ClientOrderItem[];
}

/** Value of `POST Payment/Payment/PaymentCreditCardPayment`. */
export interface CreditCardPaymentInit {
  pendingTransactionId: string;
  /** Major units, tax included, server computed. Charge exactly this. */
  amount: number;
  /** Moyasar publishable key. */
  pubKey: string;
}

export interface ConfirmPaymentPayload {
  paymentId: string;
  pendingTransactionId: string;
}

/** Client classification of a confirm call. */
export type PaymentOutcomeKind =
  | 'settled'
  | 'declined'
  | 'unverified'
  | 'blocked';

export type PaymentErrorKey =
  | 'unsupportedTarget'
  | 'targetMissing'
  | 'alreadySettled'
  | 'amountMismatch'
  | 'notOwned';

export interface PaymentOutcome {
  kind: PaymentOutcomeKind;
  /** Known business error, when the server returned one. */
  errorKey?: PaymentErrorKey;
}

/** Persisted record of a started payment, used to resume confirmation. */
export interface PendingPayment {
  pendingTransactionId: string;
  paymentId: string | null;
  targetType: PaymentTarget;
  targetId: string;
  amount: number;
  /** UTC ISO. */
  createdAt: string;
}
