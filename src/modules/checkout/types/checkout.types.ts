import type { CoursePricing } from '@/shared/lib/coursePlan.shared';

/** `client/client/GetBranches` branch. */
export interface CheckoutBranch {
  id: number;
  name: string;
  address: string | null;
  logoPath: string | null;
  latitude: number;
  longitude: number;
  scheduleOffs: { date: string | null }[] | null;
  /** Basket total at this branch. */
  totalPrice: number;
  /** `CustomDays` bit flags the branch is closed on. */
  closingDays: number[] | null;
}

export interface CheckoutTimeSlot {
  slotTimeId: number;
  serviceProviderBranchServiceId: number;
  serviceId: number | null;
  serviceName: string | null;
  serviceGroupId: number | null;
  serviceGroupName: string | null;
  /** Net price. */
  price: number;
  /** VAT amount. */
  taxPrice: number;
  /** `HH:mm[:ss]`. */
  from: string;
  to: string;
}

/** Weekly pattern keyed by English weekday name (`Sunday`…). */
export interface CheckoutSlotDay {
  day: string;
  totalPrice: number | null;
  slotTimes: CheckoutTimeSlot[];
}

export interface CheckoutCourseTranslation {
  id: number;
  langId: number;
  courseId: number;
  name: string;
  description: string | null;
}

export interface CheckoutCourse {
  id: number;
  categoryName: string | null;
  fullImagePath: string | null;
  /** Audience flags: B2C = 1, B2B = 2, OSH = 4. */
  target?: number;
  paymentSettings: (CoursePricing & { id?: number }) | null;
  translations: CheckoutCourseTranslation[];
}

export type CheckoutStepId =
  | 'family'
  | 'facility'
  | 'time'
  | 'course'
  | 'confirm';

export interface CheckoutServiceSelection {
  serviceIds: number[];
  serviceNames: string[];
  serviceGroupId?: number;
}

export interface CheckoutFacility {
  branchId: number;
  name: string;
  isClosedToday: boolean;
  closingDays: number[];
  scheduleOffs: string[];
  price: number;
}

export interface CheckoutSelectedSlot {
  slotTimeId: number;
  serviceProviderBranchServiceId: number;
  label: string;
  from: string;
  to: string;
  price: number;
  taxPrice: number;
}

export interface CheckoutAppointment {
  /** `YYYY-MM-DD`. */
  dateChosen?: string;
  selectedSlots: CheckoutSelectedSlot[];
}

export interface CheckoutCourseSelection {
  courseId?: number;
  courseName?: string;
  selectedCertified: boolean;
  selectedSadad: boolean;
  selectedService?: number;
  courseTotalPrice?: number;
}

export interface CheckoutState {
  service: CheckoutServiceSelection | null;
  ownerId: string | null;
  facility: CheckoutFacility | null;
  appointment: CheckoutAppointment;
  course: CheckoutCourseSelection;
}
