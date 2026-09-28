import type { Locale } from '@/i18n/config';
import { getAcademyTranslations } from '@/i18n/academyDictionary';
import { CourseCarousel } from '@/modules/auth/CourseCarousel';
import { fetchCourseCategoryList } from '@/modules/auth/server/courseCategoryListService';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';
import { getTranslationName } from '@/shared/lib/getTranslationName';
import { CoursesView } from './components/CoursesView';
import { AcademyBackdrop } from './components/ui/AcademyGlass';
import { getAcademyLanguage } from './server/academyLanguage';

type CoursesPageProps = {
  locale: Locale;
};

export async function CoursesPage({ locale }: CoursesPageProps) {
  const culture = await getAcademyLanguage(locale);
  const [categories, t] = await Promise.all([
    fetchCourseCategoryList({ culture }),
    getAcademyTranslations(locale, 'academyCourses'),
  ]);

  const carousels = [
    <CourseCarousel
      key='featured'
      isFeatured
      categoryName={t.featuredTitle}
      locale={locale}
      culture={culture}
    />,
    ...categories.data.map((category) => (
      <CourseCarousel
        key={category.id}
        categoryId={category.id}
        categoryName={getTranslationName(category.translations, locale)}
        locale={locale}
        culture={culture}
      />
    )),
  ];

  return (
    <AcademyBackdrop>
      {/* The floating header is transparent with navy text at the top of the
          page, so the navy stage starts just below it as an inset panel. */}
      <MarketingStickyHeaderOffset
        variant='academy'
      >
        <CoursesView categories={categories.data} locale={locale}>
          {carousels}
        </CoursesView>
      </MarketingStickyHeaderOffset>
    </AcademyBackdrop>
  );
}
