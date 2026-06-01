import type { Locale } from '@/i18n/config';

/** Base path for an enrolled course's player. */
export function learnBasePath(
  locale: Locale,
  userCourseId: number | string,
  courseId: number | string
): string {
  return `/${locale}/courses/learn/${userCourseId}/${courseId}`;
}

export function lecturePath(
  locale: Locale,
  userCourseId: number | string,
  courseId: number | string,
  lectureId: number | string
): string {
  return `${learnBasePath(locale, userCourseId, courseId)}/lecture/${lectureId}`;
}

export function quizPath(
  locale: Locale,
  userCourseId: number | string,
  courseId: number | string,
  quizId: number | string
): string {
  return `${learnBasePath(locale, userCourseId, courseId)}/quiz/${quizId}`;
}

export function quizHistoryPath(
  locale: Locale,
  userCourseId: number | string,
  courseId: number | string,
  quizId: number | string,
  lessonId?: string | null
): string {
  const base = `${quizPath(locale, userCourseId, courseId, quizId)}/history`;
  return lessonId ? `${base}?lessonId=${lessonId}` : base;
}

/** Public course detail page. */
export function courseDetailPath(
  locale: Locale,
  courseId: number | string
): string {
  return `/${locale}/courses/${courseId}`;
}
