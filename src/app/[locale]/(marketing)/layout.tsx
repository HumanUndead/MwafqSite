import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { FooterSection } from '@/modules/home/components/FooterSection';
import { getMenuContent } from '@/modules/home/server/menuContentService';
import { withAuthenticatedHeaderState } from '@/modules/auth/server/headerAuth';
import { getCurrentUser } from '@/modules/auth/server/authSession';
import { Header } from '@/shared/components/layout/Header';

interface MarketingLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function MarketingLayout({
  children,
  params,
}: MarketingLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const content = await getMenuContent(locale as Locale);
  const headerContent = withAuthenticatedHeaderState(
    content.header,
    currentUser,
    locale as Locale
  );

  return (
    <div className='flex min-h-screen flex-col'>
      <Header locale={locale as Locale} content={headerContent} />
      <main className='flex-1'>{children}</main>
      <FooterSection locale={locale as Locale} content={content.footer} />
    </div>
  );
}
