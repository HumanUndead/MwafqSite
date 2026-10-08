import type { Locale } from '@/i18n/config';
import type { useTranslations } from '@/i18n/DictionaryProvider';
import { courseDetailPath, learnBasePath } from '@/modules/academy/learnRoutes.shared';
import type { AcademyCourseRow } from '../types/academy.types';

export type ProfileAcademyCopy = ReturnType<typeof useTranslations<'profileAcademy'>>;

/** Pending payment goes back to the course page checkout; otherwise the player. */
export function enrolledCourseHref(course: AcademyCourseRow, locale: Locale): string {
  if (course.awaitingPayment) {
    return `${courseDetailPath(locale, course.courseId)}?pay=${course.enrollmentId}`;
  }
  return learnBasePath(locale, course.enrollmentId, course.courseId);
}
