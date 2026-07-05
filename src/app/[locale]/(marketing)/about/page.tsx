import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { buildPageMetadata } from '@/i18n/seo';
import { ROUTES } from '@/shared/constants/routes';
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
  const content = await getAboutPageContent(locale as Locale);
  return buildPageMetadata({
    locale: locale as Locale,
    route: ROUTES.ABOUT,
    title: content.meta.title,
    description: content.meta.description,
  });
}

export default async function AboutRoute({ params }: RouteProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const content = await getAboutPageContent(locale as Locale);
  // No header offset here: the page opens with a full-bleed 100dvh video hero
  // (the fixed header is hidden over it and reappears on scroll).
  return <AboutPage locale={locale as Locale} content={content} />;
}
