'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  /** Overrides the search field placeholder (per catalogue tab). */
  placeholder?: string;
};

/** Catalogue hero + search. Keeps the other URL params (tab, favorites). */
export function FilterSection({ t, placeholder }: FilterSectionProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [packageName, setPackageName] = useState(
    searchParams.get('search') ?? ''
  );

  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString());
    const value = packageName.trim();
    if (value) params.set('search', value);
    else params.delete('search');
    params.delete('page');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
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
        placeholder={placeholder ?? t.packageNamePlaceholder}
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
