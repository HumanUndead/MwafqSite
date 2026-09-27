import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from '@/i18n/config';
import { AcademyScope } from '@/modules/academy/AcademyScope';
import { isFeatureOn } from '@/shared/lib/featureToggles';

interface AcademyLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Academy pages follow the academy language (en/ar/ur/ne/bn/hi) and are
 * hidden when the dashboard turns the academy off (`enable:academy`).
 */
export default async function AcademyLayout({ children, params }: AcademyLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  if (!(await isFeatureOn('academy'))) notFound();
  return <AcademyScope locale={locale}>{children}</AcademyScope>;
}
