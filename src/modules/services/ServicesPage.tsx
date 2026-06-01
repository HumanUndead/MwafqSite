'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from '@/i18n/DictionaryProvider';
import { MwafqPagination } from '@/shared/components/ui/MwafqPagination';
import { FilterSection } from './components/FilterSection';
import { PackageCard } from './components/PackageCard';
import type { ServiceGroupListItem } from '../auth/serviceGroup.types';

type ServicesPageProps = {
  services: ServiceGroupListItem[];
  page: number;
  totalPages: number;
  isAuthenticated: boolean;
};

export function ServicesPage({
  services,
  page,
  totalPages,
  isAuthenticated,
}: ServicesPageProps) {
  const t = useTranslations('services');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(nextPage));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });

    const grid = document.getElementById('packagesGrid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <>
      <FilterSection t={t.filter} />

      <section id='packagesGrid' className='relative px-0 pb-[120px] pt-[30px]'>
        <div className='mx-auto max-w-[1320px] px-4 md:px-7'>
          <div className='flex flex-wrap items-stretch gap-[22px]'>
            {services.map((pkg, i) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                locale={locale}
                t={t.cards}
                delay={Math.min(i, 4) * 0.08}
                isAuthenticated={isAuthenticated}
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
