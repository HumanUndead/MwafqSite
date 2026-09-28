'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  PageFilterSearchField,
  PageFilterSection,
} from '@/shared/components/filter';

/** Wait this long after the last keystroke before searching. */
const SEARCH_DEBOUNCE_MS = 500;

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

/**
 * Catalogue hero + search. Searches automatically once typing pauses (Enter
 * searches straight away). Keeps the other URL params (tab, favorites).
 */
export function FilterSection({ t, placeholder }: FilterSectionProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [packageName, setPackageName] = useState(
    searchParams.get('search') ?? ''
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  function runSearch(raw: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    const value = raw.trim();
    if (value === (searchParams.get('search') ?? '')) return;

    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('search', value);
    else params.delete('search');
    params.delete('page');
    const query = params.toString();
    // replace: typing shouldn't add a history entry per pause.
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function handleChange(value: string) {
    setPackageName(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runSearch(value), SEARCH_DEBOUNCE_MS);
  }

  return (
    <PageFilterSection
      titleLead={t.titleLead}
      titleAccent={t.titleAccent}
      subtitle={t.subtitle}
      gridClassName='grid-cols-1'
    >
      <PageFilterSearchField
        id='services-package-name'
        label={t.packageNameLabel}
        value={packageName}
        onChange={handleChange}
        placeholder={placeholder ?? t.packageNamePlaceholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') runSearch(packageName);
        }}
        className='min-w-0'
      />
    </PageFilterSection>
  );
}
