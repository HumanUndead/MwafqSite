import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { ContactPage } from '@/modules/contact';

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
    title: dict.contact.meta.title,
    description: dict.contact.meta.description,
    openGraph: {
      title: dict.contact.meta.title,
      description: dict.contact.meta.description,
      type: 'website',
    },
  };
}

export default async function ContactRoute({ params }: RouteProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  return <ContactPage locale={locale as Locale} content={dict.contact} />;
}
