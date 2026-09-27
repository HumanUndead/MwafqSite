'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { MwafqPagination } from '@/shared/components/ui/MwafqPagination';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import {
  scrollToSectionIdWithRetries,
  sectionScrollMarginClass,
} from '@/shared/lib/scrollToSection';
import { FilterSection } from './components/FilterSection';
import { BasketBar } from './components/catalog/BasketBar';
import { CatalogActionsProvider } from './components/catalog/CatalogActionsProvider';
import { CatalogGrid } from './components/catalog/CatalogGrid';
import { CatalogToolbar } from './components/catalog/CatalogToolbar';
import { FavoritesCatalog } from './components/catalog/FavoritesCatalog';
import type {
  CatalogKind,
  CatalogService,
  CatalogServiceGroup,
} from './types/catalog.types';

const GRID_ID = 'packagesGrid';

type ServicesPageProps = {
  kind: CatalogKind;
  favoritesOnly: boolean;
  search: string;
  items: (CatalogService | CatalogServiceGroup)[];
  page: number;
  totalPages: number;
  totalRecords: number;
  loadFailed: boolean;
};

export function ServicesPage({
  kind,
  favoritesOnly,
  search,
  items,
  page,
  totalPages,
  totalRecords,
  loadFailed,
}: ServicesPageProps) {
  const t = useTranslations('services');
  const catalogT = useTranslations('catalog');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPage = useRef<number | null>(null);

  useEffect(() => {
    if (prevPage.current === null) {
      prevPage.current = page;
      if (page > 1) scrollToSectionIdWithRetries(GRID_ID);
      return;
    }
    if (prevPage.current === page) return;
    prevPage.current = page;
    scrollToSectionIdWithRetries(GRID_ID);
  }, [page]);

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete('page');
    else params.set('page', String(nextPage));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    scrollToSectionIdWithRetries(GRID_ID);
  }

  const resultsLabel =
    favoritesOnly || loadFailed
      ? null
      : interpolate(
          kind === 'services'
            ? catalogT.resultsServices
            : catalogT.resultsGroups,
          { count: totalRecords }
        );

  return (
    <CatalogActionsProvider>
      <FilterSection
        key={kind}
        t={t.filter}
        placeholder={
          kind === 'services'
            ? catalogT.searchServicesPlaceholder
            : catalogT.searchGroupsPlaceholder
        }
      />

      <section className='relative px-0 pb-30 pt-7.5'>
        <div className='mx-auto max-w-330 px-4 md:px-7'>
          <CatalogToolbar
            kind={kind}
            favoritesOnly={favoritesOnly}
            resultsLabel={resultsLabel}
          />

          <div id={GRID_ID} className={cn(sectionScrollMarginClass)}>
            {favoritesOnly ? (
              <FavoritesCatalog kind={kind} search={search} />
            ) : loadFailed ? (
              <p
                className='rounded-[20px] border-2 border-dashed border-red-200 bg-white px-6 py-16 text-center text-[15px] font-semibold text-red-600'
                role='alert'
              >
                {catalogT.loadError}
              </p>
            ) : (
              <CatalogGrid
                kind={kind}
                items={items}
                emptyLabel={search ? catalogT.noResults : catalogT.empty}
              />
            )}
          </div>

          {!favoritesOnly && (
            <MwafqPagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              ariaLabel={t.pagination.ariaLabel}
              previousLabel={t.pagination.previous}
              nextLabel={t.pagination.next}
            />
          )}
        </div>
      </section>

      <BasketBar />
    </CatalogActionsProvider>
  );
}
