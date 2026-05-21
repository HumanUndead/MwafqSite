import type { Locale } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';

export const BOOKING_STEP_IDS = [
  'examinations',
  'course',
  'facility',
  'time',
] as const;

export type BookingStepId = (typeof BOOKING_STEP_IDS)[number];

export function getBookingSteps(serviceGroup: {
  courses: unknown[] | null | undefined;
}): BookingStepId[] {
  const hasCourses = (serviceGroup.courses?.length ?? 0) > 0;
  return BOOKING_STEP_IDS.filter((step) => step !== 'course' || hasCourses);
}

export function getServiceGroupDetailPath(
  locale: Locale,
  serviceGroupId: number
): string {
  return `${getLocalizedRoute(locale, ROUTES.SERVICES)}/${serviceGroupId}`;
}

export function getServiceGroupBuyPath(
  locale: Locale,
  serviceGroupId: number
): string {
  return `${getLocalizedRoute(locale, ROUTES.SERVICES)}/${serviceGroupId}/buy`;
}

export function plainTextFromHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
