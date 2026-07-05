import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { buildPageMetadata } from '@/i18n/seo';
import { ROUTES } from '@/shared/constants/routes';
import { HomeHashScroll } from '@/modules/home/components/HomeHashScroll';
import { HomePage } from '@/modules/home/HomePage';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

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
    route: ROUTES.HOME,
    title: dict.seo.home.title,
    description: dict.seo.home.description,
  });
}

export default async function MarketingHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  return (
    <MarketingStickyHeaderOffset variant='home'>
      <HomeHashScroll />
      <HomePage locale={locale} />
    </MarketingStickyHeaderOffset>
  );
}
