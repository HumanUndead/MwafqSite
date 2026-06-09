/** Upstream payment + enrollment envelopes (Moyasar credit-card flow). */

export interface CreateUserCourseResponse {
  /** The created userCourseId. */
  value: number;
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; message: string };
}

export interface PubKey {
  pubkey: string;
}

export interface PaymentInitData {
  pendingTransactionId: string;
  amount: number;
  pubKey: PubKey;
}

export interface StartPaymentResponse {
  value: PaymentInitData;
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; message: string };
}

export interface CheckPaymentStatusResponse {
  /** true = payment completed, false = not completed. */
  value: boolean;
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; message: string };
}

export interface StartPaymentPayload {
  userCourseId: number;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  address: string;
  country: string;
}

/** Pricing settings exposed on a course (`CourseViewItem.paymentSettings`). */
export interface CoursePaymentSettings {
  id: number;
  sellingPlan: number;
  price: number;
  certifiedExamPrice: number;
  sadadPrice: number;
}
