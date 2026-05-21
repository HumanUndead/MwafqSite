'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { config } from '@/shared/constants/config';
import { ROUTES } from '@/shared/constants/routes';

export function Footer() {
  const locale = useLocale();
  const navigation = useTranslations('navigation');
  const footer = useTranslations('footer');
  const copyright = footer.copyright
    .replace('{{year}}', String(new Date().getFullYear()))
    .replace('Mwafq', config.appName);

  return (
    <footer className='border-t border-gray-100 bg-white'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6'>
        <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
          <p className='text-sm text-gray-500'>{copyright}</p>
          <div className='flex gap-6'>
            <Link
              href={getLocalizedRoute(locale, ROUTES.ABOUT)}
              className='text-sm text-gray-500 transition-colors hover:text-gray-900'
            >
              {navigation.about}
            </Link>
            <Link
              href={getLocalizedRoute(locale, ROUTES.CONTACT)}
              className='text-sm text-gray-500 transition-colors hover:text-gray-900'
            >
              {navigation.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
