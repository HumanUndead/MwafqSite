import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { ContactPage } from '@/modules/contact';
import { getContactPageContent } from '@/modules/contact/server/contactContentService';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

interface RouteProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const content = await getContactPageContent(locale as Locale);
  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      type: 'website',
    },
  };
}

export default async function ContactRoute({ params }: RouteProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const content = await getContactPageContent(locale as Locale);
  return (
    <MarketingStickyHeaderOffset variant='hero'>
      <ContactPage locale={locale as Locale} content={content} />
    </MarketingStickyHeaderOffset>
  );
}
