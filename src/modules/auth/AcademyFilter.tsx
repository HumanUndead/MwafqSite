'use client';

import { useState } from 'react';

import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { AcademyCategorySelect } from '@/modules/auth/components/AcademyCategorySelect';
import type { CourseCategoryListItem } from '@/modules/auth/courseCategory.types';
import {
  PageFilterSearchButton,
  PageFilterSearchField,
  PageFilterSection,
} from '@/shared/components/filter';

type AcademyFilterProps = {
  categories: readonly CourseCategoryListItem[];
  locale: Locale;
  onSearch?: (query: string, categoryId: string) => void;
};

export function AcademyFilter({ categories, locale, onSearch }: AcademyFilterProps) {
  const t = useTranslations('academyCourses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const handleSearch = () => {
    onSearch?.(searchQuery, selectedCategoryId);
  };

  return (
    <PageFilterSection
      titleLead={t.filter.titleLead}
      titleAccent={t.filter.titleAccent}
      subtitle={t.filter.subtitle}
      showHeaderDivider
      gridClassName='grid-cols-[1.2fr_1.2fr_auto] max-[1024px]:grid-cols-[1fr_1fr] max-[640px]:grid-cols-1 max-[640px]:gap-3.5'
    >
      <AcademyCategorySelect
        categories={categories}
        locale={locale}
        id='bk-section-trigger'
        label={t.filter.sectionLabel}
        placeholder={t.filter.sectionPlaceholder}
        onValueChange={setSelectedCategoryId}
      />

      <PageFilterSearchField
        id='bk-search'
        label={t.filter.searchLabel}
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t.filter.searchPlaceholder}
      />

      {onSearch ? (
        <PageFilterSearchButton
          onClick={handleSearch}
          label={t.filter.searchBtn}
          className='max-[1024px]:col-span-2 max-[1024px]:w-full'
        />
      ) : (
        <PageFilterSearchButton
          href='#featuredCourses'
          label={t.filter.searchBtn}
          className='max-[1024px]:col-span-2 max-[1024px]:w-full'
        />
      )}
    </PageFilterSection>
  );
}
