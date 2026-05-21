import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { B2BPage } from '@/modules/b2b';
import { getB2BPageContent } from '@/modules/b2b/server/b2bContentService';

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
    title: dict.b2b.meta.title,
    description: dict.b2b.meta.description,
    openGraph: {
      title: dict.b2b.meta.title,
      description: dict.b2b.meta.description,
      type: 'website',
    },
  };
}

export default async function B2BRoute({ params }: RouteProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const content = await getB2BPageContent(locale as Locale, dict);
  return <B2BPage locale={locale as Locale} content={content} />;
}
