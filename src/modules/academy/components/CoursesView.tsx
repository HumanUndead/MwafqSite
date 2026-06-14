'use client';

import { type ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import type { Locale } from '@/i18n/config';
import { AcademyFilter } from '@/modules/auth/AcademyFilter';
import type { CourseCategoryListItem } from '@/modules/auth/courseCategory.types';
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

export function CoursesView({
  categories,
  locale,
  children,
}: CoursesViewProps) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters | null>(
    null
  );

  const handleSearch = (query: string, categoryId: string) => {
    setActiveFilters({ query, categoryId });
  };

  const isSearching = !!activeFilters;

  return (
    <>
      <AcademyFilter
        categories={categories}
        locale={locale}
        onSearch={handleSearch}
      />

      <AnimatePresence mode='wait'>
        {isSearching ? (
          <motion.div
            key='search'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <CourseSearchResults
              query={activeFilters.query}
              categoryId={activeFilters.categoryId}
              locale={locale}
            />
          </motion.div>
        ) : (
          <motion.div
            key='carousels'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
