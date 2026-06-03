import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { AboutPage } from '@/modules/about';
import { getAboutPageContent } from '@/modules/about/server/aboutContentService';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

interface RouteProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const content = await getAboutPageContent(locale as Locale);
  return {
    title: content.meta.title,
    description: content.meta.description,
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      type: 'website',
    },
  };
}

export default async function AboutRoute({ params }: RouteProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const content = await getAboutPageContent(locale as Locale);
  return (
    <MarketingStickyHeaderOffset variant='hero'>
      <AboutPage locale={locale as Locale} content={content} />
    </MarketingStickyHeaderOffset>
  );
}
