'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { AlertCircle, SearchX, X } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { interpolate } from '@/shared/lib/interpolate';
import { fetchCourseListClient } from '@/modules/academy/api/courseListApi';
import { AcademyCourseCard } from './AcademyCourseCard';
import { GlassPanel } from './ui/AcademyGlass';

const PAGE_SIZE = 12;

const gridClassName = 'grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4';

type CourseSearchResultsProps = {
  query: string;
  categoryId: string;
  locale: Locale;
  onClear: () => void;
};

/** Placeholder shaped like `AcademyCourseCard`. */
function CourseCardSkeleton() {
  return (
    <div
      aria-hidden
      className='overflow-hidden rounded-[20px] border border-white/70 bg-white/70 shadow-[0_8px_28px_-14px_rgba(30,35,100,0.18)] backdrop-blur-xl motion-safe:animate-pulse'
    >
      <div className='aspect-video bg-[#e5e7f0]' />
      <div className='space-y-3 px-5 pb-4 pt-4'>
        <div className='h-3 w-1/3 rounded-full bg-[#e5e7f0]' />
        <div className='h-4 w-11/12 rounded-full bg-[#e5e7f0]' />
        <div className='h-4 w-2/3 rounded-full bg-[#e5e7f0]' />
        <div className='flex gap-2 pt-2'>
          <div className='h-6 w-24 rounded-full bg-[#e5e7f0]' />
          <div className='h-6 w-20 rounded-full bg-[#e5e7f0]' />
        </div>
      </div>
      <div className='flex items-center justify-between border-t border-[#e5e7f0] px-5 py-4'>
        <div className='h-6 w-20 rounded-full bg-[#e5e7f0]' />
        <div className='h-9 w-24 rounded-full bg-[#e5e7f0]' />
      </div>
    </div>
  );
}

const clearButtonClassName =
  'border-white/70 bg-white/70 text-[#1e2364] shadow-[0_4px_16px_-8px_rgba(30,35,100,0.2)] backdrop-blur-xl hover:bg-white focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2';

export function CourseSearchResults({
  query,
  categoryId,
  locale,
  onClear,
}: CourseSearchResultsProps) {
  const t = useTranslations('academyCourses');

  const results = useInfiniteQuery({
    queryKey: ['academy-courses', query, categoryId],
    queryFn: ({ pageParam }) =>
      fetchCourseListClient({
        keyword: query || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        pageNumber: pageParam,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pageNumber < last.totalPages ? last.pageNumber + 1 : undefined,
  });

  const courses = results.data?.pages.flatMap((page) => page.data) ?? [];
  const total = results.data?.pages[0]?.totalRecords ?? 0;

  return (
    <section className='py-8 lg:py-10'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
          <h2 className='min-h-7 text-xl font-bold text-[#1e2364]' aria-live='polite'>
            {results.isSuccess ? (
              interpolate(t.resultsCount, { count: total })
            ) : results.isPending ? (
              <span className='block h-6 w-28 rounded-full bg-[#e5e7f0] motion-safe:animate-pulse' />
            ) : null}
          </h2>
          <Button
            variant='outline'
            size='sm'
            shape='pill'
            type='button'
            onClick={onClear}
            className={clearButtonClassName}
          >
            <X className='size-4' aria-hidden />
            {t.clearSearch}
          </Button>
        </div>

        {results.isPending ? (
          <div className={gridClassName}>
            {Array.from({ length: 8 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : results.isError ? (
          <GlassPanel
            role='alert'
            className='mx-auto flex max-w-xl flex-col items-center gap-3 px-6 py-12 text-center'
          >
            <span className='flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-100'>
              <AlertCircle className='size-6' aria-hidden />
            </span>
            <p className='text-base font-semibold text-red-600'>{t.search.error}</p>
          </GlassPanel>
        ) : courses.length === 0 ? (
          <GlassPanel className='mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-12 text-center'>
            <span className='flex size-14 items-center justify-center rounded-full bg-[#00a8f1]/10 text-[#00a8f1] ring-1 ring-[#00a8f1]/20'>
              <SearchX className='size-7' aria-hidden />
            </span>
            <p className='max-w-sm text-base leading-relaxed text-[#6b7196]'>
              {t.search.noResults}
            </p>
            <Button
              variant='brand'
              size='md'
              shape='pill'
              type='button'
              onClick={onClear}
              className='focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2'
            >
              {t.clearSearch}
            </Button>
          </GlassPanel>
        ) : (
          <div className={gridClassName}>
            {courses.map((course) => (
              <AcademyCourseCard key={course.id} course={course} locale={locale} />
            ))}
          </div>
        )}

        {results.hasNextPage && (
          <div className='mt-10 flex justify-center'>
            <Button
              variant='brandOutline'
              size='lg'
              shape='pill'
              type='button'
              loading={results.isFetchingNextPage}
              onClick={() => void results.fetchNextPage()}
              className='min-w-44 border bg-white/70 backdrop-blur-xl hover:bg-white focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2 motion-reduce:hover:translate-y-0'
            >
              {t.loadMore}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
