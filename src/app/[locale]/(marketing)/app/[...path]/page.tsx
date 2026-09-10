import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { AppLinkPage, buildAppLinkMetadata } from '@/modules/deep-linking';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';
import { ROUTES } from '@/shared/constants/routes';

interface RouteProps {
  params: Promise<{ locale: string; path: string[] }>;
}

/** Catch-all so every shared `/app/...` deep link has a real web fallback. */
function appRoute(path: string[]): string {
  return `${ROUTES.APP}/${path.map(encodeURIComponent).join('/')}`;
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { locale, path } = await params;
  if (!hasLocale(locale)) return {};

  return buildAppLinkMetadata(locale as Locale, appRoute(path));
}

export default async function AppLinkCatchAllRoute({ params }: RouteProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  return (
    <MarketingStickyHeaderOffset variant='hero'>
      <AppLinkPage locale={locale as Locale} />
    </MarketingStickyHeaderOffset>
  );
}
