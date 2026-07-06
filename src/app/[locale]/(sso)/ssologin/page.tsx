import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from '@/i18n/config';
import { SsoLoginView } from '@/modules/auth';

interface SsoLoginPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SsoLoginPage({ params }: SsoLoginPageProps) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  return (
    <Suspense>
      <SsoLoginView />
    </Suspense>
  );
}
