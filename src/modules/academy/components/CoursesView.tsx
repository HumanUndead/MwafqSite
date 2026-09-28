'use client';

import { type ReactNode, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Search } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { AcademyCategorySelect } from '@/modules/auth/components/AcademyCategorySelect';
import type { CourseCategoryListItem } from '@/modules/auth/courseCategory.types';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { AcademyLanguagePicker } from './AcademyLanguagePicker';
import { CourseSearchResults } from './CourseSearchResults';
import { AcademyStage, GlassPanel } from './ui/AcademyGlass';

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

const fieldLabelClassName = 'mb-2 block ps-1 text-[13px] font-semibold text-white/80';

const fieldControlClassName =
  'h-12 w-full rounded-2xl border border-transparent bg-white text-[15px] text-[#1e2364] shadow-[0_4px_16px_-8px_rgba(0,0,0,0.4)] transition-[border-color,box-shadow] duration-200 placeholder:text-[#6b7196]/80 focus:border-[#00a8f1] focus:outline-none focus:ring-[3px] focus:ring-[#00a8f1]/35';

export function CoursesView({
  categories,
  locale,
  children,
}: CoursesViewProps) {
  const t = useTranslations('academyCourses');
  const reduceMotion = useReducedMotion();
  const [activeFilters, setActiveFilters] = useState<ActiveFilters | null>(
    null
  );
  // Draft filter values; only applied when the search button is pressed.
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const handleSearch = (query: string, categoryId: string) => {
    setActiveFilters({ query, categoryId });
  };

  const isSearching = !!activeFilters;
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: reduceMotion ? 0 : 0.25 },
  };

  return (
    <>
      <div className='px-2 sm:px-3'>
        <AcademyStage
          className='rounded-[28px] sm:rounded-[36px]'
          innerClassName='py-10 sm:py-14 lg:py-20'
        >
          <div className='flex justify-end'>
            <AcademyLanguagePicker tone='dark' />
          </div>

          <div className='mx-auto mt-6 max-w-3xl text-center sm:mt-4'>
            <h1 className='text-[28px] font-bold leading-tight text-white sm:text-4xl sm:leading-[1.15]'>
              {t.filter.titleLead}{' '}
              <span className='text-[#00a8f1]'>{t.filter.titleAccent}</span>
            </h1>
            <p className='mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/70'>
              {t.filter.subtitle}
            </p>
          </div>

          <GlassPanel
            tone='dark'
            className='relative z-10 mx-auto mt-8 max-w-4xl p-3 sm:mt-10 sm:p-4'
          >
            <div className='grid items-end gap-3 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_auto]'>
              <div>
                <label htmlFor='bk-search' className={fieldLabelClassName}>
                  {t.filter.searchLabel}
                </label>
                <div className='relative'>
                  <Search
                    className='pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-[#6b7196]'
                    aria-hidden
                  />
                  <input
                    id='bk-search'
                    type='text'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.filter.searchPlaceholder}
                    className={cn(fieldControlClassName, 'pe-4 ps-12')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor='bk-section-trigger' className={fieldLabelClassName}>
                  {t.filter.sectionLabel}
                </label>
                <AcademyCategorySelect
                  categories={categories}
                  locale={locale}
                  id='bk-section-trigger'
                  label=''
                  placeholder={t.filter.sectionPlaceholder}
                  onValueChange={setSelectedCategoryId}
                  className='[&_[data-slot=select-trigger]]:!h-12 [&_[data-slot=select-trigger]]:rounded-2xl [&_[data-slot=select-trigger]]:border-transparent [&_[data-slot=select-trigger]]:px-4 [&_[data-slot=select-trigger]]:text-[15px]'
                />
              </div>

              <Button
                type='button'
                variant='brand'
                size='lg'
                onClick={() => handleSearch(searchQuery, selectedCategoryId)}
                className='h-12 w-full rounded-2xl bg-[#00a8f1] px-7 text-white hover:bg-[#0090d1] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#141848] md:col-span-2 lg:col-span-1 lg:w-auto'
              >
                <Search className='size-4' aria-hidden />
                {t.filter.searchBtn}
              </Button>
            </div>
          </GlassPanel>
        </AcademyStage>
      </div>

      <div className='pb-16 pt-4 sm:pt-6'>
        <AnimatePresence mode='wait'>
          {isSearching ? (
            <motion.div key='search' {...fade}>
              <CourseSearchResults
                query={activeFilters.query}
                categoryId={activeFilters.categoryId}
                locale={locale}
                onClear={() => setActiveFilters(null)}
              />
            </motion.div>
          ) : (
            <motion.div key='carousels' {...fade}>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
