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

  return (
    <Link
      href={courseDetailPath(locale, course.id)}
      className='group relative flex min-h-full flex-col overflow-hidden rounded-[20px] border-2 border-[#e5e7f0] bg-white transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[#00a8f1] hover:bg-[#fbfcff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364] focus-visible:ring-offset-2'
    >
      <div className='relative flex h-50 items-center justify-center overflow-hidden bg-[#1e2364] max-[640px]:h-40'>
        {errored ? (
          <Image
            src='/demo-assets/logo.svg'
            alt=''
            width={80}
            height={80}
            className='h-20 w-20 object-contain brightness-0 invert opacity-30'
          />
        ) : (
          <Image
            src={imageUrl(course.fullImagePath, ImageSize.card)}
            alt=''
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw'
            className='object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105'
            onError={() => setErrored(true)}
          />
        )}
        {featured && (
          <span className='absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#0090d1]'>
            <Sparkles className='size-3.5' aria-hidden />
            {t.featured}
          </span>
        )}
      </div>
      <div className='flex flex-1 flex-col gap-2.5 px-5.5 pb-3.5 pt-5.5'>
        {course.categoryName && (
          <p className='text-[11.5px] font-bold uppercase tracking-wide text-[#00a8f1]'>
            {course.categoryName}
          </p>
        )}
        <h3 className='min-h-11 text-[17px] font-extrabold leading-[1.3] tracking-[-0.3px] text-[#1e2364]'>
          {title}
        </h3>
        {description && (
          <p className='line-clamp-2 text-[13px] leading-[1.55] text-[#6b7196]'>{description}</p>
        )}
        <div className='mt-auto flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-[#6b7196]'>
          {course.totalLectures !== undefined && (
            <span className='inline-flex items-center gap-1'>
              <BookOpen className='size-3.5' aria-hidden />
              {interpolate(t.lecturesCount, { count: course.totalLectures })}
            </span>
          )}
          {course.totalHours !== undefined && (
            <span className='inline-flex items-center gap-1'>
              <Clock className='size-3.5' aria-hidden />
              {courseDurationLabel(t, course.totalHours)}
            </span>
          )}
        </div>
      </div>
      <div className='flex items-center justify-between gap-2.5 border-t-2 border-[#eef0f7] px-5.5 pb-5.5 pt-3.5'>
        {course.paymentSettings === undefined ? (
          <span />
        ) : price.free ? (
          <span className='text-[15px] font-extrabold text-green-600'>{t.free}</span>
        ) : (
          <span className='inline-flex flex-col'>
            {price.label && (
              <span className='text-[11px] font-semibold text-[#6b7196]'>
                {price.label === 'fullPrice' ? t.fullPrice : t.startsFrom}
              </span>
            )}
            <SarAmount amount={price.amount} className='text-[15px] font-extrabold text-[#1e2364]' />
          </span>
        )}
        <span className='inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#00a8f1] px-4 py-2 text-xs font-bold text-white transition-all duration-300 group-hover:gap-3'>
          {t.carousel.enrollNow}
        </span>
      </div>
    </Link>
  );
}
