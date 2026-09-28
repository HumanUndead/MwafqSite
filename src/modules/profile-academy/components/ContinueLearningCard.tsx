'use client';

import { BookOpen, Clock, PlayCircle } from 'lucide-react';
import Link from 'next/link';

import type { Locale } from '@/i18n/config';
import { courseDurationLabel } from '@/modules/academy/components/AcademyCourseCard';
import { CourseProgressBar } from '@/modules/academy/components/CourseProgressBar';
import { GlassPanel, StatChip } from '@/modules/academy/components/ui/AcademyGlass';
import { buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import type { AcademyCourseRow } from '../types/academy.types';
import {
  enrolledCourseHref,
  profileGlassClass,
  skyButtonClass,
  type ProfileAcademyCopy,
} from './enrolledCourse.shared';
import { EnrolledCourseMedia } from './EnrolledCourseMedia';

/** Highlight for the course to resume: cover beside title, progress and CTA. */
export function ContinueLearningCard({
  course,
  locale,
  t,
}: {
  course: AcademyCourseRow;
  locale: Locale;
  t: ProfileAcademyCopy;
}) {
  const href = enrolledCourseHref(course, locale);

  return (
    <GlassPanel
      as='article'
      className={cn(
        'group grid gap-5 border border-[#e5e7f0] bg-white p-3 sm:p-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-6',
        profileGlassClass
      )}
    >
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className='block overflow-hidden rounded-[18px]'
      >
        <EnrolledCourseMedia image={course.image} seed={course.courseId} title={course.title} size='lg' />
      </Link>

      <div className='flex min-w-0 flex-col gap-4 px-1 pb-1 md:py-2 md:pe-3'>
        <div className='flex flex-col gap-2'>
          <h3 className='text-xl font-bold leading-snug text-[#1e2364] sm:text-[28px] sm:leading-tight'>
            {course.title}
          </h3>
          {course.lastLectureName && (
            <p className='flex items-center gap-2 text-sm text-[#6b7196]'>
              <PlayCircle className='size-4 shrink-0 text-[#00a8f1]' aria-hidden />
              <span className='line-clamp-1'>{course.lastLectureName}</span>
            </p>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          <CourseProgressBar value={course.progress} />
          <span className='text-sm font-semibold text-[#1e2364]'>
            {interpolate(t.percentComplete, { percent: course.progress })}
          </span>
        </div>

        <div className='flex flex-wrap gap-2'>
          <StatChip icon={<BookOpen className='size-4 text-[#6b7196]' aria-hidden />}>
            {interpolate(t.lecturesCount, { count: course.totalLectures })}
          </StatChip>
          <StatChip icon={<Clock className='size-4 text-[#6b7196]' aria-hidden />}>
            {courseDurationLabel(t, course.totalHours)}
          </StatChip>
        </div>

        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: 'brand', size: 'lg', shape: 'pill' }),
            skyButtonClass,
            'mt-auto w-full sm:w-fit sm:min-w-52'
          )}
        >
          <PlayCircle className='size-5' aria-hidden />
          {t.continueLearning}
        </Link>
      </div>
    </GlassPanel>
  );
}

/** Placeholder matching `ContinueLearningCard`. */
export function ContinueLearningCardSkeleton() {
  return (
    <GlassPanel
      aria-hidden
      className={cn(
        'grid animate-pulse gap-5 p-3 motion-reduce:animate-none sm:p-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-6',
        profileGlassClass
      )}
    >
      <div className='aspect-video rounded-[18px] bg-[#e5e7f0]' />
      <div className='flex flex-col gap-4 px-1 pb-1 md:py-2'>
        <div className='h-6 w-3/4 rounded-full bg-[#e5e7f0]' />
        <div className='h-3.5 w-1/2 rounded-full bg-[#eef0f7]' />
        <div className='h-2 w-full rounded-full bg-[#e5e7f0]' />
        <div className='flex gap-2'>
          <div className='h-7 w-28 rounded-full bg-[#eef0f7]' />
          <div className='h-7 w-24 rounded-full bg-[#eef0f7]' />
        </div>
        <div className='mt-auto h-12 w-full rounded-full bg-[#e5e7f0] sm:w-52' />
      </div>
    </GlassPanel>
  );
}
