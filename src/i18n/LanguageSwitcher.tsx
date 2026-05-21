'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { localeLabels, locales } from './config';
import { useLocale, useTranslations } from './DictionaryProvider';
import { localizePathname } from './routing';

interface LanguageSwitcherProps {
  className?: string;
  optionClassName?: string;
  activeOptionClassName?: string;
  inactiveOptionClassName?: string;
}

export function LanguageSwitcher({
  className,
  optionClassName,
  activeOptionClassName,
  inactiveOptionClassName,
}: LanguageSwitcherProps = {}) {
  const locale = useLocale();
  const t = useTranslations('localeSwitcher');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const switchLocale = (nextLocale: (typeof locales)[number]) => {
    if (nextLocale === locale) {
      return;
    }

    const nextPathname = localizePathname(pathname, nextLocale);
    const query = searchParams.toString();
    router.replace(query ? `${nextPathname}?${query}` : nextPathname);
    router.refresh();
  };

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-lg border border-gray-200 p-0.5',
        className
      )}
      aria-label={t.label}
    >
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={cn(
            'cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors select-none',
            optionClassName,
            loc === locale
              ? cn('bg-blue-600 text-white', activeOptionClassName)
              : cn('text-gray-500 hover:text-gray-900', inactiveOptionClassName)
          )}
          aria-current={loc === locale ? 'true' : undefined}
          type='button'
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
