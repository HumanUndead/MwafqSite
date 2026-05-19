import { localeToLangId } from '@/i18n/config';
import { GetLocale } from '@/i18n/server';
import { AcademyFilter } from '@/modules/auth/AcademyFilter';
import { CourseCarousel } from '@/modules/auth/CourseCarousel';
import { fetchCourseCategoryList } from '@/modules/auth/server/courseCategoryListService';

const page = async () => {
  const categories = await fetchCourseCategoryList();
  const locale = await GetLocale();
  const langId = localeToLangId[locale];
  return (
    <div>
      <AcademyFilter categories={categories.data} langId={langId} />
      {categories.data.map((category) => (
        <CourseCarousel
          key={category.id}
          categoryId={category.id}
          categoryName={
            category.translations.find((t) => t.langId === langId)?.name ?? ''
          }
        />
      ))}
    </div>
  );
};

export default page;
