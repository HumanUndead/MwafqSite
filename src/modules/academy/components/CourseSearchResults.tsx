'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { interpolate } from '@/shared/lib/interpolate';
import { fetchCourseListClient } from '@/modules/academy/api/courseListApi';
import { AcademyCourseCard } from './AcademyCourseCard';

const PAGE_SIZE = 12;

type CourseSearchResultsProps = {
  query: string;
  categoryId: string;
  locale: Locale;
  onClear: () => void;
};

function CourseCardSkeleton() {
  return (
    <div className='animate-pulse overflow-hidden rounded-[20px] border-2 border-[#e5e7f0] bg-white'>
      <div className='h-50 bg-[#e5e7f0]' />
      <div className='space-y-3 p-5.5'>
        <div className='h-4 w-3/4 rounded bg-[#e5e7f0]' />
        <div className='h-3 w-full rounded bg-[#e5e7f0]' />
        <div className='h-3 w-2/3 rounded bg-[#e5e7f0]' />
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
    <section className='py-7.5 last:pb-30'>
      <div className='mx-auto max-w-330 px-4 md:px-7'>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
          <p className='text-sm font-semibold text-[#6b7196]' aria-live='polite'>
            {results.isSuccess ? interpolate(t.resultsCount, { count: total }) : ''}
          </p>
          <Button variant='outline' size='sm' type='button' onClick={onClear}>
            <X className='size-4' aria-hidden />
            {t.clearSearch}
          </Button>
        </div>

        {results.isPending ? (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : results.isError ? (
          <p className='py-16 text-center text-[15px] text-[#6b7196]' role='alert'>
            {t.search.error}
          </p>
        ) : courses.length === 0 ? (
          <p className='py-16 text-center text-[15px] text-[#6b7196]'>
            {t.search.noResults}
          </p>
        ) : (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {courses.map((course) => (
              <AcademyCourseCard key={course.id} course={course} locale={locale} />
            ))}
          </div>
        )}

        {results.hasNextPage && (
          <div className='mt-8 flex justify-center'>
            <Button
              variant='outline'
              type='button'
              loading={results.isFetchingNextPage}
              onClick={() => void results.fetchNextPage()}
            >
              {t.loadMore}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
