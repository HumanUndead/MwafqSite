'use client';

import { BookOpen, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import type { CourseListItem } from '@/modules/auth/course.types';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { courseDisplayPrice } from '@/shared/lib/coursePlan.shared';
import { getTranslationName } from '@/shared/lib/getTranslationName';
import { stripHtmlTags } from '@/shared/lib/htmlText';
import { interpolate } from '@/shared/lib/interpolate';
import { ImageSize, imageUrl } from '@/shared/lib/media';
import { courseDetailPath } from '../learnRoutes.shared';
import { StatChip } from './ui/AcademyGlass';

/** `N hours` from 1 hour, else `N minutes`. */
export function courseDurationLabel(
  t: { hours: string; minutes: string },
  totalHours: number | null | undefined
): string {
  const hours = Number(totalHours) || 0;
  return hours >= 1
    ? interpolate(t.hours, { count: Math.round(hours * 10) / 10 })
    : interpolate(t.minutes, { count: Math.round(hours * 60) });
}

interface AcademyCourseCardProps {
  course: CourseListItem;
  locale: Locale;
}

/** Catalogue card (mobile `CourseCard`): opens the course page. */
export function AcademyCourseCard({ course, locale }: AcademyCourseCardProps) {
  const t = useTranslations('academyCourses');
  const title = getTranslationName(course.translations ?? [], locale) || course.name || '';
  const description = stripHtmlTags(course.translations?.[0]?.description) ?? '';
  const [errored, setErrored] = useState(!course.fullImagePath);
  const price = courseDisplayPrice(course.paymentSettings);
  const featured = course.isFeatured ?? course.featured;
  const hasMeta = course.totalLectures !== undefined || course.totalHours !== undefined;

  return (
    <Link
      href={courseDetailPath(locale, course.id)}
      className='group relative flex h-full min-h-full flex-col overflow-hidden rounded-[20px] border border-white/70 bg-white/75 shadow-[0_8px_28px_-14px_rgba(30,35,100,0.22)] backdrop-blur-xl transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white hover:shadow-[0_28px_56px_-20px_rgba(30,35,100,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f4f8] motion-safe:hover:-translate-y-1.5'
    >
      <div className='relative flex aspect-video items-center justify-center overflow-hidden rounded-t-[20px] bg-[#1e2364]'>
        {errored ? (
          <Image
            src='/demo-assets/logo.svg'
            alt=''
            width={72}
            height={72}
            className='size-18 object-contain opacity-30 brightness-0 invert'
          />
        ) : (
          <Image
            src={imageUrl(course.fullImagePath, ImageSize.card)}
            alt=''
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            className='object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.06]'
            onError={() => setErrored(true)}
          />
        )}
        {featured && (
          <span className='absolute start-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-xs font-bold text-[#0090d1] shadow-sm backdrop-blur-md'>
            <Sparkles className='size-3.5' aria-hidden />
            {t.featured}
          </span>
        )}
      </div>

      <div className='flex flex-1 flex-col gap-2 px-5 pb-4 pt-4'>
        {course.categoryName && (
          <p className='truncate text-xs font-semibold text-[#0090d1]'>{course.categoryName}</p>
        )}
        <h3 className='line-clamp-2 min-h-11 text-base font-bold leading-[1.375] text-[#1e2364] transition-colors duration-200 group-hover:text-[#0090d1]'>
          {title}
        </h3>
        {description && (
          <p className='line-clamp-2 text-sm leading-normal text-[#6b7196]'>{description}</p>
        )}
        {hasMeta && (
          <div className='mt-auto flex flex-wrap gap-2 pt-2'>
            {course.totalLectures !== undefined && (
              <StatChip
                icon={<BookOpen className='size-3.5 text-[#00a8f1]' aria-hidden />}
                className='px-2.5 text-xs'
              >
                {interpolate(t.lecturesCount, { count: course.totalLectures })}
              </StatChip>
            )}
            {course.totalHours !== undefined && (
              <StatChip
                icon={<Clock className='size-3.5 text-[#00a8f1]' aria-hidden />}
                className='px-2.5 text-xs'
              >
                {courseDurationLabel(t, course.totalHours)}
              </StatChip>
            )}
          </div>
        )}
      </div>

      <div className='flex items-center justify-between gap-3 border-t border-[#e5e7f0] px-5 py-4'>
        {course.paymentSettings === undefined ? (
          <span />
        ) : price.free ? (
          <span className='inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200'>
            {t.free}
          </span>
        ) : (
          <span className='inline-flex min-w-0 flex-col'>
            {price.label && (
              <span className='text-xs font-semibold text-[#6b7196]'>
                {price.label === 'fullPrice' ? t.fullPrice : t.startsFrom}
              </span>
            )}
            <SarAmount amount={price.amount} className='text-xl font-bold text-[#1e2364]' />
          </span>
        )}
        <span className='inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-[#00a8f1] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 group-hover:bg-[#0090d1]'>
          {t.carousel.enrollNow}
        </span>
      </div>
    </Link>
  );
}
