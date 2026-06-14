import { GetLocale } from '@/i18n/server';
import { CoursesPage } from '@/modules/academy/CoursesPage';

const page = async () => {
  const locale = await GetLocale();
  return <CoursesPage locale={locale} />;
};

export default page;
