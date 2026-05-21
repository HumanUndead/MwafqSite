'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { config } from '@/shared/constants/config';
import { ROUTES } from '@/shared/constants/routes';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const navigation = useTranslations('navigation');

  return (
    <div className='flex min-h-screen'>
      <aside className='w-64 border-r border-gray-100 bg-white px-4 py-6'>
        <div className='mb-8 flex items-center justify-between gap-3'>
          <Link
            href={getLocalizedRoute(locale, ROUTES.HOME)}
            className='block text-xl font-bold text-gray-900'
          >
            {config.appName}
          </Link>
          <LanguageSwitcher />
        </div>
        <nav className='flex flex-col gap-1'>
          <Link
            href={getLocalizedRoute(locale, ROUTES.DASHBOARD)}
            className='rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100'
          >
            {navigation.dashboard}
          </Link>
        </nav>
      </aside>
      <main className='flex-1 bg-gray-50 p-8'>{children}</main>
    </div>
  );
}
