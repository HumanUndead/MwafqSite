'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { locales } from './config';
import { useLocale } from './DictionaryProvider';
import { localizePathname } from './routing';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps = {}) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const nextLocale = locales.find((l) => l !== locale) ?? locales[0];

  const switchLocale = () => {
    const nextPathname = localizePathname(pathname, nextLocale);
    const query = searchParams.toString();
    router.replace(query ? `${nextPathname}?${query}` : nextPathname);
    router.refresh();
  };

  return (
    <button
      type='button'
      onClick={switchLocale}
      aria-label={`Switch to ${nextLocale.toUpperCase()}`}
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-bold tracking-wide text-[#1e2364]/65 transition-colors duration-200 hover:bg-[#1e2364]/8 hover:text-[#1e2364]',
        className
      )}
    >
      <svg
        viewBox='0 0 20 20'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='size-4 shrink-0'
        aria-hidden='true'
      >
        <circle cx='10' cy='10' r='8' />
        <path d='M10 2C10 2 7 6 7 10s3 8 3 8' />
        <path d='M10 2C10 2 13 6 13 10s-3 8-3 8' />
        <path d='M2 10h16' />
        <path d='M2.5 7h15M2.5 13h15' />
      </svg>
      {nextLocale.toUpperCase()}
    </button>
  );
}
