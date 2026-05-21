import { notFound } from 'next/navigation';
import { hasLocale } from '@/i18n/config';
import { HomePage } from '@/modules/home/HomePage';

export default async function MarketingHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  return <HomePage locale={locale} />;
}
