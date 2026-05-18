import { GetLocale } from '@/i18n/server';
import type { Locale } from '@/i18n/config';
import { fetchCourseList } from './server/courseListService';
import { CourseCarouselClient } from './CourseCarouselClient';

const localeToLangId: Record<Locale, number> = { en: 1, ar: 2 };

export type CourseCarouselProps = {
  categoryId?: number;
  categoryName: string;
  isFeatured?: boolean;
  /** Omit this course id from the carousel (e.g. current course on detail page). */
  excludeCourseId?: number;
};

export async function CourseCarousel({
  categoryId,
  categoryName,
  isFeatured,
  excludeCourseId,
}: CourseCarouselProps) {
  const locale = await GetLocale();
  const langId = localeToLangId[locale];
  const courses = await fetchCourseList({ categoryId, featured: isFeatured });

  const rows = !excludeCourseId
    ? courses.data
    : courses.data.filter((c) => c.id !== excludeCourseId);

  if (rows.length === 0) return null;

  return (
    <CourseCarouselClient
      categoryName={categoryName}
      courses={rows}
      langId={langId}
    />
  );
}
