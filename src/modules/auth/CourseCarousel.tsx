import type { Locale } from '@/i18n/config';
import { fetchCourseList } from './server/courseListService';
import { CourseCarouselClient } from './CourseCarouselClient';

export type CourseCarouselProps = {
  categoryId?: number;
  categoryName: string;
  locale: Locale;
  isFeatured?: boolean;
  /** Omit this course id from the carousel (e.g. current course on detail page). */
  excludeCourseId?: number;
  /** Academy content language. */
  culture?: string;
};

export async function CourseCarousel({
  categoryId,
  categoryName,
  locale,
  isFeatured,
  excludeCourseId,
  culture,
}: CourseCarouselProps) {
  const courses = await fetchCourseList({
    categoryId,
    featured: isFeatured,
    culture,
  });

  const rows = !excludeCourseId
    ? courses.data
    : courses.data.filter((c) => c.id !== excludeCourseId);

  if (rows.length === 0) return null;

  return (
    <CourseCarouselClient
      categoryName={categoryName}
      courses={rows}
      locale={locale}
    />
  );
}
