import { GetLocale } from '@/i18n/server';
import { AcademyFilter } from '@/modules/auth/AcademyFilter';
import { CourseCarousel } from '@/modules/auth/CourseCarousel';
import { fetchCourseCategoryList } from '@/modules/auth/server/courseCategoryListService';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';
import { getTranslationName } from '@/shared/lib/getTranslationName';

const page = async () => {
  const categories = await fetchCourseCategoryList();
  const locale = await GetLocale();
  return (
    <MarketingStickyHeaderOffset variant='filter'>
      <AcademyFilter categories={categories.data} locale={locale} />
      {categories.data.map((category) => (
        <CourseCarousel
          key={category.id}
          categoryId={category.id}
          categoryName={getTranslationName(category.translations, locale)}
          locale={locale}
        />
      ))}
    </MarketingStickyHeaderOffset>
  );
};

export default page;
