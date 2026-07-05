import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { DictionaryProvider } from '@/i18n/DictionaryProvider';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import { getDictionary } from '@/i18n/dictionaries';
import { hasLocale, locales, type Locale } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';
import { SITE_URL } from '@/shared/constants/config';
import { TokenValidator } from '@/modules/auth/components/TokenValidator';
import { JsonLd } from '@/shared/components/seo/JsonLd';

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
  const canonicalPath = getLocalizedRoute(resolvedLocale, ROUTES.HOME);

  return {
    title: {
      default: dict.site.title,
      template: `%s | ${dict.site.title}`,
    },
    description: dict.site.description,
    alternates: {
      canonical: canonicalPath,
      languages: Object.fromEntries(
        locales.map((loc) => [loc, getLocalizedRoute(loc, ROUTES.HOME)])
      ),
    },
    openGraph: {
      title: dict.site.title,
      description: dict.site.description,
      url: canonicalPath,
      siteName: dict.site.title,
      locale: resolvedLocale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.site.title,
      description: dict.site.description,
    },
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
  const homeUrl = `${SITE_URL}${getLocalizedRoute(locale as Locale, ROUTES.HOME)}`;

  return (
    <QueryProvider>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: dict.site.title,
          url: homeUrl,
          logo: `${SITE_URL}/favicon.ico`,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: dict.site.title,
          url: homeUrl,
          inLanguage: locale,
        }}
      />
      <DictionaryProvider dict={dict} locale={locale}>
        <TokenValidator />
        {children}
      </DictionaryProvider>
    </QueryProvider>
  );
}
