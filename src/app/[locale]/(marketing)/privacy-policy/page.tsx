import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { buildPageMetadata } from '@/i18n/seo';
import { ROUTES } from '@/shared/constants/routes';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';
import { getPrivacyPolicyContent, PrivacyPolicyPage } from '@/modules/legal';

interface RouteProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const content = getPrivacyPolicyContent(locale as Locale);
  return buildPageMetadata({
    locale: locale as Locale,
    route: ROUTES.PRIVACY_POLICY,
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function PrivacyPolicyRoute({ params }: RouteProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  return (
    <MarketingStickyHeaderOffset variant='detail'>
      <PrivacyPolicyPage locale={locale as Locale} />
    </MarketingStickyHeaderOffset>
  );
}
