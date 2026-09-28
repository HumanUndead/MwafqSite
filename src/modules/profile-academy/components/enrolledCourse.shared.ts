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

/** Sky call-to-action on top of the shared `brand` button. */
export const skyButtonClass =
  'bg-[#00a8f1] text-white hover:bg-[#0090d1] focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2';

/** Glass surface that still reads on the plain profile background. */
export const profileGlassClass = 'ring-1 ring-[#e5e7f0]/80';
