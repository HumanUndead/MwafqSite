'use client';

import { BookOpen } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import type { CourseCategoryListItem } from '@/modules/auth/courseCategory.types';
import { EmptyState, PageHeader, Panel } from '@/shared/components/product';
import { AcademyLanguagePicker } from './AcademyLanguagePicker';
import { CourseFilters } from './CourseFilters';
import { CourseSearchResults } from './CourseSearchResults';

type ActiveFilters = {
  query: string;
  categoryId: string;
};

type CoursesViewProps = {
  categories: readonly CourseCategoryListItem[];
  locale: Locale;
  /** Server-rendered category carousels passed as a slot. */
  children: ReactNode;
};

/**
 * Catalog: title + filters, then either the category rows (default) or the
 * search results once a search or category filter is applied.
 */
export function CoursesView({ categories, locale, children }: CoursesViewProps) {
  const t = useTranslations('academyCourses');
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [active, setActive] = useState<ActiveFilters | null>(null);

  const apply = (nextQuery: string, nextCategoryId: string) => {
    const trimmed = nextQuery.trim();
    setActive(
      trimmed || nextCategoryId ? { query: trimmed, categoryId: nextCategoryId } : null
    );
  };

  const clear = () => {
    setQuery('');
    setCategoryId('');
    setActive(null);
  };

  return (
    <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-16 pt-2 sm:px-6 lg:px-8 lg:pb-20'>
      <PageHeader
        title={t.filter.titleAccent}
        description={t.filter.subtitle}
        actions={<AcademyLanguagePicker />}
      />

      <CourseFilters
        categories={categories}
        locale={locale}
        query={query}
        categoryId={categoryId}
        onQueryChange={setQuery}
        onCategoryChange={(next) => {
          setCategoryId(next);
          apply(query, next);
        }}
        onSubmit={() => apply(query, categoryId)}
      />

      {active ? (
        <CourseSearchResults
          query={active.query}
          categoryId={active.categoryId}
          locale={locale}
          onClear={clear}
        />
      ) : (
        <div className='flex flex-col gap-10 pt-2'>
          {children}
          {/* Shown only when no category row rendered (all were empty). */}
          <Panel className='hidden first:block'>
            <EmptyState
              icon={<BookOpen aria-hidden />}
              title={t.empty.title}
              description={t.empty.hint}
            />
          </Panel>
        </div>
      )}
    </div>
  );
}
