'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { cn } from '@/shared/lib/cn';
import type { CatalogKind } from '../../types/catalog.types';

interface CatalogToolbarProps {
  kind: CatalogKind;
  favoritesOnly: boolean;
  resultsLabel: string | null;
}

function hrefWith(
  pathname: string,
  current: URLSearchParams,
  changes: Record<string, string | null>
): string {
  const params = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  params.delete('page');
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Services / groups tabs, favorites chip and the results count. */
export function CatalogToolbar({
  kind,
  favoritesOnly,
  resultsLabel,
}: CatalogToolbarProps) {
  const t = useTranslations('catalog');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabs: { key: CatalogKind; label: string }[] = [
    { key: 'services', label: t.tabs.services },
    { key: 'groups', label: t.tabs.groups },
  ];

  return (
    <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <nav
          aria-label={t.tabsAriaLabel}
          className='inline-flex rounded-full border-2 border-[#e5e7f0] bg-white p-1'
        >
          {tabs.map((tab) => {
            const active = tab.key === kind;
            return (
              <Link
                key={tab.key}
                href={hrefWith(pathname, searchParams, {
                  tab: tab.key === 'services' ? null : tab.key,
                  search: null,
                })}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-full px-4 py-2 text-[13.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]',
                  active
                    ? 'bg-[#1e2364] text-white'
                    : 'text-[#6b7196] hover:text-[#1e2364]'
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href={hrefWith(pathname, searchParams, {
            favorites: favoritesOnly ? null : '1',
          })}
          aria-pressed={favoritesOnly}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-[13.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]',
            favoritesOnly
              ? 'border-red-200 bg-red-50 text-red-600'
              : 'border-[#e5e7f0] bg-white text-[#6b7196] hover:text-[#1e2364]'
          )}
        >
          <Heart
            className={cn('size-4', favoritesOnly && 'fill-red-500')}
            aria-hidden
          />
          {t.favoritesOnly}
        </Link>
      </div>
      {resultsLabel && (
        <p className='text-sm font-semibold text-[#6b7196]' aria-live='polite'>
          {resultsLabel}
        </p>
      )}
    </div>
  );
}
