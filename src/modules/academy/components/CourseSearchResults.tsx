'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { SearchX } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { EmptyState, ErrorState, Panel, Skeleton } from '@/shared/components/product';
import { Button } from '@/shared/components/ui/Button';
import { interpolate } from '@/shared/lib/interpolate';
import { fetchCourseListClient } from '@/modules/academy/api/courseListApi';
import { AcademyCourseCard } from './AcademyCourseCard';

const PAGE_SIZE = 12;

const gridClassName = 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4';

type CourseSearchResultsProps = {
  query: string;
  categoryId: string;
  locale: Locale;
  onClear: () => void;
};

/** Placeholder shaped like `AcademyCourseCard`. */
export function CourseCardSkeleton() {
  return (
    <div aria-hidden className='overflow-hidden rounded-2xl border border-[#e5e7f0] bg-white'>
      <Skeleton className='aspect-video rounded-none' />
      <div className='space-y-2.5 p-4'>
        <Skeleton className='h-3.5 w-1/3' />
        <Skeleton className='h-4 w-11/12' />
        <Skeleton className='h-4 w-2/3' />
        <div className='flex gap-4 pt-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-16' />
        </div>
      </div>
      <div className='flex h-14 items-center justify-end border-t border-[#eef0f7] px-4'>
        <Skeleton className='h-5 w-20' />
      </div>
    </div>
  );
}

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
    <section aria-labelledby='academy-results-title' className='flex flex-col gap-4'>
      <div className='flex min-h-9 items-center justify-between gap-3'>
        {results.isPending ? (
          <Skeleton className='h-5 w-24' />
        ) : (
          <h2
            id='academy-results-title'
            className='text-[17px] font-bold text-[#1e2364]'
            aria-live='polite'
          >
            {results.isSuccess ? interpolate(t.resultsCount, { count: total }) : null}
          </h2>
        )}
        <Button type='button' variant='productText' size='compact' onClick={onClear}>
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
        <Panel>
          <ErrorState
            title={t.search.error}
            retryLabel={t.search.retry}
            onRetry={() => void results.refetch()}
          />
        </Panel>
      ) : courses.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<SearchX aria-hidden />}
            title={t.search.emptyTitle}
            description={t.search.emptyHint}
            action={
              <Button type='button' variant='productSecondary' size='control' onClick={onClear}>
                {t.clearSearch}
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className={gridClassName}>
          {courses.map((course) => (
            <AcademyCourseCard key={course.id} course={course} locale={locale} />
          ))}
        </div>
      )}

      {results.hasNextPage && (
        <div className='flex justify-center pt-4'>
          <Button
            type='button'
            variant='productSecondary'
            size='control'
            loading={results.isFetchingNextPage}
            onClick={() => void results.fetchNextPage()}
            className='min-w-40 max-sm:w-full'
          >
            {t.loadMore}
          </Button>
        </div>
      )}
    </section>
  );
}
