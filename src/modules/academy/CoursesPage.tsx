import type { Locale } from '@/i18n/config';
import { CourseCarousel } from '@/modules/auth/CourseCarousel';
import { fetchCourseCategoryList } from '@/modules/auth/server/courseCategoryListService';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';
import { getTranslationName } from '@/shared/lib/getTranslationName';
import { CoursesView } from './components/CoursesView';

type CoursesPageProps = {
  locale: Locale;
};

export async function CoursesPage({ locale }: CoursesPageProps) {
  const categories = await fetchCourseCategoryList();

  const carousels = categories.data.map((category) => (
    <CourseCarousel
      key={category.id}
      categoryId={category.id}
      categoryName={getTranslationName(category.translations, locale)}
      locale={locale}
    />
  ));

  return (
    <MarketingStickyHeaderOffset variant='filter'>
      <CoursesView categories={categories.data} locale={locale}>
        {carousels}
      </CoursesView>
    </MarketingStickyHeaderOffset>
  );
}
