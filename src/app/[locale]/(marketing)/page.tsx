import { notFound } from 'next/navigation';
import { hasLocale } from '@/i18n/config';
import { HomeHashScroll } from '@/modules/home/components/HomeHashScroll';
import { HomePage } from '@/modules/home/HomePage';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

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
