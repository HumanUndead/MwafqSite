import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from '@/i18n/config';
import { withAuthenticatedHeaderState } from '@/modules/auth/server/headerAuth';
import { getCurrentUser } from '@/modules/auth/server/authSession';
import { FooterSection } from '@/modules/home/components/FooterSection';
import { Header } from '@/shared/components/layout/Header';
import { getMenuContent } from '@/modules/home/server/menuContentService';

interface AuthLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AuthLayout({
  children,
  params,
}: AuthLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }
  const [currentUser, content] = await Promise.all([
    getCurrentUser(),
    getMenuContent(locale),
  ]);

  const headerContent = withAuthenticatedHeaderState(
    content.header,
    currentUser,
    locale
  );

  return (
    <div className='flex min-h-screen flex-col bg-[#eeeeef] text-[#1e2364]'>
      <Header locale={locale} content={headerContent} />
      <main className='flex-1'>{children}</main>
      <FooterSection locale={locale} content={content.footer} />
    </div>
  );
}
