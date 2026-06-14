'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import { localeToLangId, type Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import type { CourseListItem } from '@/modules/auth/course.types';
import {
  ChevronRightSmIcon,
  StarFilledSmIcon,
} from '@/shared/components/icons/academy';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { getTranslationName } from '@/shared/lib/getTranslationName';
import { fetchCourseListClient } from '@/modules/academy/api/courseListApi';

type CourseSearchResultsProps = {
  query: string;
  categoryId: string;
  locale: Locale;
};

function CourseCardSkeleton() {
  return (
    <div className='animate-pulse rounded-[20px] border-2 border-[#e5e7f0] bg-white overflow-hidden'>
      <div className='h-50 bg-[#e5e7f0]' />
      <div className='p-5.5 space-y-3'>
        <div className='h-4 bg-[#e5e7f0] rounded w-3/4' />
        <div className='h-3 bg-[#e5e7f0] rounded w-full' />
        <div className='h-3 bg-[#e5e7f0] rounded w-2/3' />
      </div>
    </div>
  );
}

function CourseCard({
  course,
  locale,
  labels,
}: {
  course: CourseListItem;
  locale: Locale;
  labels: { enrollNow: string; reviewsCount: string };
}) {
  const title = getTranslationName(course.translations, locale);
  const langId = localeToLangId[locale];
  const translation =
    course.translations.length === 1
      ? course.translations[0]
      : (course.translations.find((tr) => tr.langId === langId) ??
        course.translations[0]);
  const description = translation?.description ?? '';

  const [errored, setErrored] = useState(!course.fullImagePath);

  return (
    <article className='group relative flex min-h-full flex-col overflow-hidden rounded-[20px] border-2 border-[#e5e7f0] bg-white transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[#00a8f1] hover:bg-[#fbfcff]'>
      <div className='relative flex h-50 items-center justify-center overflow-hidden bg-[#1e2364] max-[640px]:h-40'>
        {errored ? (
          <Image
            src='/demo-assets/logo.svg'
            alt={title}
            width={80}
            height={80}
            className='h-20 w-20 object-contain brightness-0 invert opacity-30'
          />
        ) : (
          <Image
            src={`${MWAFQ_API_BASE_URL}/${course.fullImagePath}.png`}
            alt={title}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw'
            className='object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105'
            onError={() => setErrored(true)}
          />
        )}
      </div>
      <div className='flex flex-1 flex-col gap-2.5 px-5.5 pb-3.5 pt-5.5'>
        <h3 className='min-h-11 text-[17px] font-extrabold leading-[1.3] tracking-[-0.3px] text-[#1e2364]'>
          {title}
        </h3>
        <p
          className='min-h-9.5 text-[13px] leading-[1.55] text-[#6b7196]'
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
      <div className='flex items-center justify-between gap-2.5 border-t-2 border-[#eef0f7] px-5.5 pb-5.5 pt-3.5'>
        <span className='inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1e2364]'>
          <span className='inline-flex text-[#1e2364]'>
            <StarFilledSmIcon className='size-3.5' />
          </span>
          4.5{' '}
          <span className='font-semibold text-[#6b7196]'>
            {labels.reviewsCount.replace('{{count}}', '0')}
          </span>
        </span>
        <span className='inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#00a8f1] px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:gap-3'>
          {labels.enrollNow}
          <ChevronRightSmIcon className='size-3 transition-transform duration-300 rtl:rotate-180' />
        </span>
      </div>
    </article>
  );
}

export function CourseSearchResults({
  query,
  categoryId,
  locale,
}: CourseSearchResultsProps) {
  const t = useTranslations('academyCourses');

  const { data, isPending, isError } = useQuery({
    queryKey: ['academy-courses', query, categoryId],
    queryFn: () =>
      fetchCourseListClient({
        keyword: query || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        pageSize: 30,
      }),
  });

  const courses = data?.data ?? [];
  const loading = isPending;
  const error = isError;

  return (
    <section className='py-7.5 last:pb-30'>
      <div className='mx-auto max-w-330 px-4 md:px-7'>
        <AnimatePresence mode='wait'>
          {loading ? (
            <motion.div
              key='skeleton'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : error ? (
            <motion.p
              key='error'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='py-16 text-center text-[15px] text-[#6b7196]'
            >
              {t.search.error}
            </motion.p>
          ) : courses.length === 0 ? (
            <motion.p
              key='empty'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='py-16 text-center text-[15px] text-[#6b7196]'
            >
              {t.search.noResults}
            </motion.p>
          ) : (
            <motion.div
              key='results'
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
            >
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  locale={locale}
                  labels={{
                    enrollNow: t.carousel.enrollNow,
                    reviewsCount: t.carousel.reviewsCount,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
