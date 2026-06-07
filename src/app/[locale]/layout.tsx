import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { DictionaryProvider } from '@/i18n/DictionaryProvider';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import { getDictionary } from '@/i18n/dictionaries';
import { hasLocale, locales, type Locale } from '@/i18n/config';
import { TokenValidator } from '@/modules/auth/components/TokenValidator';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = hasLocale(locale) ? locale : locales[0];
  const dict = await getDictionary(resolvedLocale);

  return {
    title: dict.site.title,
    description: dict.site.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <QueryProvider>
      <DictionaryProvider dict={dict} locale={locale}>
        <TokenValidator />
        {children}
      </DictionaryProvider>
    </QueryProvider>
  );
}
