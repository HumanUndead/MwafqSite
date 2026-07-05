import type { Metadata } from 'next';
import { GetLocale } from '@/i18n/server';
import { getDictionary } from '@/i18n/dictionaries';
import { buildPageMetadata } from '@/i18n/seo';
import { hasLocale, type Locale } from '@/i18n/config';
import { ROUTES } from '@/shared/constants/routes';
import { CoursesPage } from '@/modules/academy/CoursesPage';

interface RouteProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale as Locale);
  return buildPageMetadata({
    locale: locale as Locale,
    route: ROUTES.COURSES,
    title: dict.seo.courses.title,
    description: dict.seo.courses.description,
  });
}

const page = async () => {
  const locale = await GetLocale();
  return <CoursesPage locale={locale} />;
};

export default page;
