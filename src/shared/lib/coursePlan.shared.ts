/**
 * Course selling plans and the add-on selection sent to the backend.
 * Shared by the academy purchase and the optional course in checkout.
 */
export const CourseSellingPlan = {
  CourseOnly: 1,
  /** Course is required; certificate exam and SADAD exam are optional. */
  Separated: 2,
  /** Everything included. */
  Bulk: 4,
} as const;
export type CourseSellingPlan =
  (typeof CourseSellingPlan)[keyof typeof CourseSellingPlan];

/** Bitmask: course 1 · SADAD 2 · certificate exam 4. `0` = bulk / course only. */
export const CourseSelectedService = {
  BulkOrCourseOnly: 0,
  CourseOnly: 1,
  CoursePlusSadad: 3,
  CoursePlusCertified: 5,
  CoursePlusSadadPlusCertified: 7,
} as const;
export type CourseSelectedService =
  (typeof CourseSelectedService)[keyof typeof CourseSelectedService];

export interface CoursePricing {
  sellingPlan?: number | null;
  price?: number | null;
  certifiedExamPrice?: number | null;
  sadadPrice?: number | null;
}

export interface CourseAddOns {
  certified: boolean;
  sadad: boolean;
}

function n(value: number | null | undefined): number {
  return Number.isFinite(value) ? Number(value) : 0;
}

export function resolveSellingPlan(
  pricing: CoursePricing | null | undefined
): CourseSellingPlan {
  const plan = pricing?.sellingPlan;
  return plan === CourseSellingPlan.Separated || plan === CourseSellingPlan.Bulk
    ? plan
    : CourseSellingPlan.CourseOnly;
}

/** Total to pay for a plan and the chosen add-ons. */
export function coursePlanTotal(
  pricing: CoursePricing | null | undefined,
  addOns: CourseAddOns
): number {
  const plan = resolveSellingPlan(pricing);
  const price = n(pricing?.price);
  if (plan === CourseSellingPlan.Bulk) {
    return price + n(pricing?.certifiedExamPrice) + n(pricing?.sadadPrice);
  }
  if (plan === CourseSellingPlan.Separated) {
    return (
      price +
      (addOns.certified ? n(pricing?.certifiedExamPrice) : 0) +
      (addOns.sadad ? n(pricing?.sadadPrice) : 0)
    );
  }
  return price;
}

export function courseSelectedService(
  pricing: CoursePricing | null | undefined,
  addOns: CourseAddOns
): CourseSelectedService {
  if (resolveSellingPlan(pricing) !== CourseSellingPlan.Separated) {
    return CourseSelectedService.BulkOrCourseOnly;
  }
  if (addOns.sadad && addOns.certified) {
    return CourseSelectedService.CoursePlusSadadPlusCertified;
  }
  if (addOns.sadad) return CourseSelectedService.CoursePlusSadad;
  if (addOns.certified) return CourseSelectedService.CoursePlusCertified;
  return CourseSelectedService.CourseOnly;
}

/** Catalogue display price: bulk shows the sum, others the base price. */
export function courseDisplayPrice(
  pricing: CoursePricing | null | undefined
): { amount: number; label: 'fullPrice' | 'startsFrom' | null; free: boolean } {
  const plan = resolveSellingPlan(pricing);
  const amount =
    plan === CourseSellingPlan.Bulk
      ? coursePlanTotal(pricing, { certified: true, sadad: true })
      : n(pricing?.price);
  return {
    amount,
    free: amount <= 0,
    label:
      plan === CourseSellingPlan.Bulk
        ? 'fullPrice'
        : plan === CourseSellingPlan.Separated
          ? 'startsFrom'
          : null,
  };
}

/** Amount still owed on a pending enrolment (membership test, like mobile). */
export function courseAmountOwed(
  payment: CoursePricing & { selectedService?: number | null }
): number {
  const selected = payment.selectedService ?? 0;
  const withSadad = selected === 3 || selected === 7;
  const withCertified = selected === 5 || selected === 7;
  if (resolveSellingPlan(payment) === CourseSellingPlan.Bulk) {
    return coursePlanTotal(payment, { certified: true, sadad: true });
  }
  return (
    n(payment.price) +
    (withSadad ? n(payment.sadadPrice) : 0) +
    (withCertified ? n(payment.certifiedExamPrice) : 0)
  );
}
