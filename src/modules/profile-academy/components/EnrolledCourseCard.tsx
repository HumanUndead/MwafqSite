'use client';

import { ChevronRight, CircleCheck, Lock } from 'lucide-react';
import Link from 'next/link';

import type { Locale } from '@/i18n/config';
import { CourseProgressBar } from '@/modules/academy/components/CourseProgressBar';
import { GlassPanel } from '@/modules/academy/components/ui/AcademyGlass';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { cn } from '@/shared/lib/cn';
import { stripHtmlTags } from '@/shared/lib/htmlText';
import type { AcademyCourseRow } from '../types/academy.types';
import {
  enrolledCourseHref,
  profileGlassClass,
  type ProfileAcademyCopy,
} from './enrolledCourse.shared';
import { EnrolledCourseMedia } from './EnrolledCourseMedia';

const surfaceClass = cn(
  'group relative flex h-full flex-col overflow-hidden rounded-[20px]',
  profileGlassClass
);

/** Enrolled-course card ("My learning"): cover, title, progress or status, action. */
export function EnrolledCourseCard({
  course,
  locale,
  t,
}: {
  course: AcademyCourseRow;
  locale: Locale;
  t: ProfileAcademyCopy;
}) {
  const description = stripHtmlTags(course.description) ?? '';
  const disabled = course.isLocked && !course.awaitingPayment;

  const body = (
    <>
      <EnrolledCourseMedia image={course.image}>
        {course.isLocked && (
          <span className='absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#1e2364] backdrop-blur'>
            <Lock className='size-3.5' aria-hidden />
            {t.locked}
          </span>
        )}
      </EnrolledCourseMedia>

      <div className='flex flex-1 flex-col gap-2 p-4 sm:p-5'>
        <h4 className='line-clamp-2 text-base font-bold leading-snug text-[#1e2364] transition-colors group-hover:text-[#0090d1] motion-reduce:transition-none'>
          {course.title}
        </h4>
        {description && (
          <p className='line-clamp-2 text-sm leading-6 text-[#6b7196]'>{description}</p>
        )}

        <div className='mt-auto pt-3'>
          {course.awaitingPayment ? (
            <p className='inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200/70'>
              {t.stillToPay}
              <SarAmount amount={course.amountOwed} className='font-bold text-amber-900' />
            </p>
          ) : course.isCourseCompleted ? (
            <span className='inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/70'>
              <CircleCheck className='size-4' aria-hidden />
              {t.courseCompleted}
            </span>
          ) : (
            <div className='flex items-center gap-3'>
              <CourseProgressBar value={course.progress} className='h-1.5 flex-1' />
              <span className='shrink-0 text-xs font-semibold tabular-nums text-[#1e2364]'>
                {course.progress}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className='flex items-center justify-end border-t border-[#e5e7f0] px-4 py-3 sm:px-5'>
        <span
          className={cn(
            'inline-flex items-center gap-1 text-sm font-semibold',
            disabled ? 'text-[#6b7196]' : 'text-[#00a8f1] group-hover:text-[#0090d1]'
          )}
        >
          {course.awaitingPayment ? t.continuePayment : t.keepGoing}
          <ChevronRight
            className='size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none rtl:rotate-180 rtl:group-hover:-translate-x-0.5'
            aria-hidden
          />
        </span>
      </div>
    </>
  );

  if (disabled) {
    return (
      <GlassPanel className={cn(surfaceClass, 'opacity-60')} aria-disabled>
        {body}
      </GlassPanel>
    );
  }

  return (
    <GlassPanel
      as={Link}
      href={enrolledCourseHref(course, locale)}
      className={cn(
        surfaceClass,
        'transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(30,35,100,0.35)] hover:ring-[#00a8f1]/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0'
      )}
    >
      {body}
    </GlassPanel>
  );
}

/** Placeholder matching `EnrolledCourseCard`. */
export function EnrolledCourseCardSkeleton() {
  return (
    <GlassPanel className={cn(surfaceClass, 'animate-pulse motion-reduce:animate-none')} aria-hidden>
      <div className='aspect-video bg-[#e5e7f0]' />
      <div className='flex flex-1 flex-col gap-2.5 p-4 sm:p-5'>
        <div className='h-4 w-4/5 rounded-full bg-[#e5e7f0]' />
        <div className='h-3 w-full rounded-full bg-[#eef0f7]' />
        <div className='h-3 w-2/3 rounded-full bg-[#eef0f7]' />
        <div className='mt-4 h-1.5 w-full rounded-full bg-[#e5e7f0]' />
      </div>
      <div className='flex justify-end border-t border-[#e5e7f0] px-4 py-3 sm:px-5'>
        <div className='h-4 w-20 rounded-full bg-[#e5e7f0]' />
      </div>
    </GlassPanel>
  );
}
