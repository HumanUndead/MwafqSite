import { GetLocale } from '@/i18n/server';
import type { Locale } from '@/i18n/config';
import { fetchCourseList } from './server/courseListService';
import { CourseCarouselClient } from './CourseCarouselClient';

const localeToLangId: Record<Locale, number> = { en: 1, ar: 2 };

export type CourseCarouselProps = {
  categoryId?: number;
  categoryName: string;
  isFeatured?: boolean;
};

export async function CourseCarousel({
  categoryId,
  categoryName,
  isFeatured,
}: CourseCarouselProps) {
  const locale = await GetLocale();
  const langId = localeToLangId[locale];
  const courses = await fetchCourseList({ categoryId, featured: isFeatured });

  if (courses.data?.length === 0) return null;

  return (
    <CourseCarouselClient
      categoryName={categoryName}
      courses={courses.data}
      langId={langId}
    />
  );
}
