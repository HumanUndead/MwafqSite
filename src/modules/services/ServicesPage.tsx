'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from '@/i18n/DictionaryProvider';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { MwafqPagination } from '@/shared/components/ui/MwafqPagination';
import { FilterSection } from './components/FilterSection';
import { PackageCard } from './components/PackageCard';
import type { ServiceGroupListItem } from '../auth/serviceGroup.types';

type ServicesPageProps = {
  services: ServiceGroupListItem[];
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

      <section id='packagesGrid' className='relative px-0 pb-30 pt-7.5'>
        <div className='mx-auto max-w-330 px-4 md:px-7'>
          <div className='grid grid-cols-2 gap-5.5 sm:grid-cols-3 lg:grid-cols-4'>
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
