'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import queryString from 'query-string';
import { useState } from 'react';

import {
  PageFilterSearchButton,
  PageFilterSearchField,
  PageFilterSection,
} from '@/shared/components/filter';

type FilterSectionProps = {
  t: {
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    packageNameLabel: string;
    packageNamePlaceholder: string;
    searchBtn: string;
  };
};

export function FilterSection({ t }: FilterSectionProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [packageName, setPackageName] = useState(
    searchParams.get('search') ?? ''
  );

  function handleSearch() {
    const params = queryString.stringify(
      { search: packageName, page: 1 },
      { skipNull: true, skipEmptyString: true }
    );
    router.push(params ? `${pathname}?${params}` : pathname);
  }

  return (
    <PageFilterSection
      titleLead={t.titleLead}
      titleAccent={t.titleAccent}
      subtitle={t.subtitle}
      gridClassName='grid-cols-[1fr_auto] max-[640px]:grid-cols-1 max-[640px]:gap-3.5'
    >
      <PageFilterSearchField
        id='services-package-name'
        label={t.packageNameLabel}
        value={packageName}
        onChange={setPackageName}
        placeholder={t.packageNamePlaceholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSearch();
        }}
        className='min-w-0'
      />

      <PageFilterSearchButton
        onClick={handleSearch}
        label={t.searchBtn}
        className='max-[640px]:w-full'
      />
    </PageFilterSection>
  );
}
