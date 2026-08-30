'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from '@/i18n/DictionaryProvider';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { MwafqPagination } from '@/shared/components/ui/MwafqPagination';
import { cn } from '@/shared/lib/cn';
import {
  scrollToSectionIdWithRetries,
  sectionScrollMarginClass,
} from '@/shared/lib/scrollToSection';
import { FilterSection } from './components/FilterSection';
import { PackageCard } from './components/PackageCard';
import type { ServiceListItem } from './types/services.types';

function scrollToPackagesGrid() {
  scrollToSectionIdWithRetries('packagesGrid');
}

type ServicesPageProps = {
  services: ServiceListItem[];
  page: number;
  totalPages: number;
};

export function ServicesPage({
  services,
  page,
  totalPages,
}: ServicesPageProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const t = useTranslations('services');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPage = useRef<number | null>(null);

  useEffect(() => {
    if (prevPage.current === null) {
      prevPage.current = page;
      if (page > 1) scrollToPackagesGrid();
      return;
    }

    if (prevPage.current === page) return;

    prevPage.current = page;
    scrollToPackagesGrid();
  }, [page]);

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(nextPage));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    scrollToPackagesGrid();
  }

  return (
    <>
      <FilterSection t={t.filter} />

      <section className='relative px-0 pb-30 pt-7.5'>
        <div className='mx-auto max-w-330 px-4 md:px-7'>
          <div
            id='packagesGrid'
            className={cn(
              'grid grid-cols-2 gap-5.5 sm:grid-cols-3 lg:grid-cols-4',
              sectionScrollMarginClass
            )}
          >
            {services.map((pkg, i) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                locale={locale}
                t={t.cards}
                delay={Math.min(i, 4) * 0.08}
                isAuthenticated={isAuthenticated}
                hidePrice
              />
            ))}
          </div>

          <MwafqPagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            ariaLabel={t.pagination.ariaLabel}
            previousLabel={t.pagination.previous}
            nextLabel={t.pagination.next}
          />
        </div>
      </section>
    </>
  );
}
