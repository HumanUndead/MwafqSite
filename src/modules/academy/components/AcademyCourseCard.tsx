'use client';

import { BookOpen, Clock } from 'lucide-react';
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

/** Catalog card: cover, category, title, facts, price. The whole card opens the course. */
export function AcademyCourseCard({ course, locale }: AcademyCourseCardProps) {
  const t = useTranslations('academyCourses');
  const title = getTranslationName(course.translations ?? [], locale) || course.name || '';
  const description = stripHtmlTags(course.translations?.[0]?.description) ?? '';
  const [errored, setErrored] = useState(!course.fullImagePath);
  const price = courseDisplayPrice(course.paymentSettings);
  const hasMeta = course.totalLectures !== undefined || course.totalHours !== undefined;

  return (
    <Link
      href={courseDetailPath(locale, course.id)}
      title={title}
      className='group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e5e7f0] bg-white transition-colors duration-150 hover:border-[#c9cee3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f4f8]'
    >
      <div className='relative flex aspect-video items-center justify-center bg-[#eceef5]'>
        {errored ? (
          <Image
            src='/demo-assets/logo.svg'
            alt=''
            width={64}
            height={64}
            className='size-16 object-contain opacity-25'
          />
        ) : (
          <Image
            src={imageUrl(course.fullImagePath, ImageSize.card)}
            alt=''
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
            className='object-cover'
            onError={() => setErrored(true)}
          />
        )}
      </div>

      <div className='flex flex-1 flex-col gap-1.5 p-4'>
        {course.categoryName && (
          <p className='line-clamp-1 text-[13px] font-semibold text-[#6b7196]'>
            {course.categoryName}
          </p>
        )}
        <h3 className='line-clamp-2 text-[16px] font-bold leading-6 text-[#1e2364] group-hover:underline group-hover:decoration-[#1e2364]/30 group-hover:underline-offset-4'>
          {title}
        </h3>
        {description && (
          <p className='line-clamp-2 text-[14px] leading-6 text-[#6b7196]'>{description}</p>
        )}
        {hasMeta && (
          <div className='mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2'>
            {course.totalLectures !== undefined && (
              <StatChip icon={<BookOpen aria-hidden />} className='text-[13px]'>
                {interpolate(t.lecturesCount, { count: course.totalLectures })}
              </StatChip>
            )}
            {course.totalHours !== undefined && (
              <StatChip icon={<Clock aria-hidden />} className='text-[13px]'>
                {courseDurationLabel(t, course.totalHours)}
              </StatChip>
            )}
          </div>
        )}
      </div>

      {course.paymentSettings !== undefined && (
        <div className='flex min-h-14 items-center justify-between gap-3 border-t border-[#eef0f7] px-4 py-3'>
          {price.free ? (
            <span className='text-[16px] font-bold text-[#1e2364]'>{t.free}</span>
          ) : (
            <>
              <span className='text-[13px] font-semibold text-[#6b7196]'>
                {price.label === 'fullPrice'
                  ? t.fullPrice
                  : price.label === 'startsFrom'
                    ? t.startsFrom
                    : null}
              </span>
              <SarAmount amount={price.amount} className='text-[17px] font-bold text-[#1e2364]' />
            </>
          )}
        </div>
      )}
    </Link>
  );
}
