import type { CoursePaymentSettings } from './types/payment.types';

/** Course selling plan (upstream `paymentSettings.sellingPlan`). */
export enum CoursePaymentMode {
  CourseOnly = 1,
  Saprted = 2,
  Bulk = 4,
}

/** Bitmask sent as `SelectedService` to CreateUserCourse. */
export enum SelectedService {
  None = 0,
  Course = 1,
  Sadad = 2,
  Arkan = 4,
}

/**
 * Map a selling plan + add-on selections to the `SelectedService` bitmask.
 *
 * - CourseOnly / Bulk → None (0)
 * - Saprted → Course(1) | Sadad(2) | Arkan(4)
 */
export function resolveSelectedService(
  sellingPlan: number,
  includeSadad: boolean,
  includeArkan: boolean
): number {
  if (sellingPlan === CoursePaymentMode.Saprted) {
    let service = SelectedService.Course;
    if (includeSadad) service |= SelectedService.Sadad;
    if (includeArkan) service |= SelectedService.Arkan;
    return service;
  }
  return SelectedService.None;
}

/** Total price to charge for the chosen plan + add-ons. */
export function computeTotalPrice(
  settings: CoursePaymentSettings | undefined,
  includeSadad: boolean,
  includeArkan: boolean
): number {
  if (!settings) return 0;

  const price = settings.price || 0;
  const sadad = settings.sadadPrice || 0;
  const cert = settings.certifiedExamPrice || 0;

  if (settings.sellingPlan === CoursePaymentMode.Bulk) {
    return price + sadad + cert;
  }
  if (settings.sellingPlan === CoursePaymentMode.Saprted) {
    return price + (includeSadad ? sadad : 0) + (includeArkan ? cert : 0);
  }
  return price;
}
