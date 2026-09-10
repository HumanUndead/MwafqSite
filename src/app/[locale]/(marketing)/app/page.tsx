import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { AppLinkPage, buildAppLinkMetadata } from '@/modules/deep-linking';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';
import { ROUTES } from '@/shared/constants/routes';

interface RouteProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};

  return buildAppLinkMetadata(locale as Locale, ROUTES.APP);
}

export default async function AppLinkRoute({ params }: RouteProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  return (
    <MarketingStickyHeaderOffset variant='hero'>
      <AppLinkPage locale={locale as Locale} />
    </MarketingStickyHeaderOffset>
  );
}
