export interface ServiceProviderBranchScheduleOff {
  date: string | null;
}

export interface ServiceProviderBranch {
  id: number;
  name: string;
  address: string;
  logoPath: string;
  latitude: number;
  longitude: number;
  totalPrice: number;
  scheduleOffs: ServiceProviderBranchScheduleOff[];
  closingDays: number[];
}

export interface BookingTimeSlot {
  slotTimeId: number;
  serviceProviderBranchServiceId: number;
  price: number;
  taxPrice: number;
  serviceId: number | null;
  serviceName: string | null;
  serviceGroupId: number | null;
  serviceGroupName: string | null;
  from: string;
  to: string;
}

export interface SlotDayGroup {
  day: string;
  totalPrice: number;
  slotTimes: BookingTimeSlot[];
}

/** Unwrapped `value` from GetWeeklyAvailableTimeSlotsForBranch. */
export interface WeeklyAvailableTimeSlotsValue {
  slotTimesGroupedByDay: SlotDayGroup[];
}

export interface ServiceGroupCourseTranslation {
  id: number;
  langId: number;
  courseId: number;
  name: string;
  description: string;
  tags: string;
  whatYouWillLearn: string;
  attachment: string;
  reviewText: string | null;
  isReviewActive: boolean;
}

export interface ServiceGroupCoursePaymentSettings {
  id: number;
  sellingPlan: number;
  price: number;
  certifiedExamPrice: number;
  sadadPrice: number;
}

/** Raw course item from `GetServiceGroupCourses`. */
export interface ServiceGroupCourse {
  id: number;
  rank: number;
  status: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  target: number;
  fullImagePath: string;
  paymentSettings: ServiceGroupCoursePaymentSettings | null;
  translations: ServiceGroupCourseTranslation[];
}

export interface ServiceGroupCourseOption {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  fullImagePath: string;
}

export interface CreateReservationInput {
  serviceProviderBranchId: number;
  dateChosen?: string;
  ownerId: string;
  slots: BookingTimeSlot[];
  courseId?: number;
}
