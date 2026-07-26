import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from '@/i18n/config';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface SsoLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Bare guest layout for the SSO callback — no header/footer chrome.
 * i18n/query/auth providers come from the parent `[locale]/layout`.
 */
export default async function SsoLayout({
  children,
  params,
}: SsoLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  return (
    <main className='flex min-h-screen flex-col bg-[#eeeeef] text-[#1e2364]'>
      {children}
    </main>
  );
}
