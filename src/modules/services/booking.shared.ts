import type { Locale } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';
import { getTranslation } from '@/shared/lib/getTranslationName';
import type { EntityTranslation } from '@/shared/types/entity-translation.types';
import type { ServiceGroupCourseOption } from '@/modules/services/types/booking.types';
import { CourseListItem } from '../auth/course.types';

export const BOOKING_STEP_IDS = [
  'examinations',
  'course',
  'facility',
  'time',
  'payment',
] as const;

export type BookingStepId = (typeof BOOKING_STEP_IDS)[number];

export function getBookingSteps(serviceGroup: {
  courses: unknown[] | null | undefined;
}): BookingStepId[] {
  const hasCourses = !!serviceGroup.courses?.length;
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
  return `${getLocalizedRoute(locale, ROUTES.SERVICES)}/${serviceGroupId}`;
}

export function plainTextFromHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function mapServiceGroupCourseToOption(
  course: CourseListItem,
  localeOrLangId: Locale | number
): ServiceGroupCourseOption {
  const translation = getTranslation(
    course.translations as unknown as EntityTranslation[],
    localeOrLangId
  );
  const description = translation?.description
    ? plainTextFromHtml(translation.description)
    : null;

  return {
    id: course.id,
    name: translation?.name?.trim() ?? '',
    description: description || null,
    price: null,
    fullImagePath: course.fullImagePath ?? '',
  };
}

export function mapServiceGroupCoursesToOptions(
  courses: CourseListItem[],
  localeOrLangId: Locale | number
): ServiceGroupCourseOption[] {
  console.log('🚀 ~ mapServiceGroupCoursesToOptions ~ courses:', courses);
  return courses
    .filter((course) => course.status)
    .map((course) => mapServiceGroupCourseToOption(course, localeOrLangId));
}
