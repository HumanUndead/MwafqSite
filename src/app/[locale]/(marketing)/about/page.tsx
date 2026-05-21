import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { AboutPage } from '@/modules/about';
import { getAboutPageContent } from '@/modules/about/server/aboutContentService';

interface RouteProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.about.meta.title,
    description: dict.about.meta.description,
    openGraph: {
      title: dict.about.meta.title,
      description: dict.about.meta.description,
      type: 'website',
    },
  };
}

export default async function AboutRoute({ params }: RouteProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const content = await getAboutPageContent(locale as Locale, dict);
  return <AboutPage locale={locale as Locale} content={content} />;
}
