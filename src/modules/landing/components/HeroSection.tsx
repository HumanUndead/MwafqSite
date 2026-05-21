'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { buttonVariants } from '@/shared/lib/variants';
import { ROUTES } from '@/shared/constants/routes';

export function HeroSection() {
  const locale = useLocale();
  const t = useTranslations('landing').hero;

  return (
    <section className='px-4 py-24 text-center sm:px-6'>
      <div className='mx-auto max-w-4xl'>
        <h1 className='text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
          {t.titlePrefix}{' '}
          <span className='text-blue-600'>{t.titleHighlight}</span>
        </h1>
        <p className='mx-auto mt-6 max-w-2xl text-lg text-gray-600'>
          {t.description}
        </p>
        <div className='mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
          <Link
            href={getLocalizedRoute(locale, ROUTES.REGISTER)}
            className={buttonVariants({
              variant: 'primary',
              size: 'lg',
              shape: 'default',
            })}
          >
            {t.primaryCta}
          </Link>
          <Link
            href={getLocalizedRoute(locale, ROUTES.ABOUT)}
            className={buttonVariants({
              variant: 'outline',
              size: 'lg',
              shape: 'default',
            })}
          >
            {t.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
