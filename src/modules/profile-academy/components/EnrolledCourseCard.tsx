'use client';

import { BookOpen, ChevronRight, CircleCheck, Clock, Lock, Wallet } from 'lucide-react';
import Link from 'next/link';

import type { Locale } from '@/i18n/config';
import { courseDurationLabel } from '@/modules/academy/components/AcademyCourseCard';
import { CourseProgressBar } from '@/modules/academy/components/CourseProgressBar';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import type { AcademyCourseRow } from '../types/academy.types';
import { enrolledCourseHref, type ProfileAcademyCopy } from './enrolledCourse.shared';
import { EnrolledCourseMedia } from './EnrolledCourseMedia';

const surfaceClass =
  'group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[#e5e7f0] bg-white';

/** Status pill over the cover: completed, awaiting payment, locked or progress. */
function StatusBadge({ course, t }: { course: AcademyCourseRow; t: ProfileAcademyCopy }) {
  const base =
    'absolute start-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur';
  if (course.isLocked && !course.awaitingPayment) {
    return (
      <span className={cn(base, 'bg-white/90 text-[#1e2364]')}>
        <Lock className='size-3.5' aria-hidden />
        {t.locked}
      </span>
    );
  }
  if (course.awaitingPayment) {
    return (
      <span className={cn(base, 'bg-amber-400/95 text-amber-950')}>
        <Wallet className='size-3.5' aria-hidden />
        {t.awaitingPayment}
      </span>
    );
  }
  if (course.isCourseCompleted) {
    return (
      <span className={cn(base, 'bg-emerald-500/95 text-white')}>
        <CircleCheck className='size-3.5' aria-hidden />
        {t.completed}
      </span>
    );
  }
  return (
    <span className={cn(base, 'bg-black/45 tabular-nums text-white')}>
      {interpolate(t.percentComplete, { percent: course.progress })}
    </span>
  );
}

/** Enrolled-course card ("My learning"): cover, title, facts, status, action. */
export function EnrolledCourseCard({
  course,
  locale,
  t,
}: {
  course: AcademyCourseRow;
  locale: Locale;
  t: ProfileAcademyCopy;
}) {
  const disabled = course.isLocked && !course.awaitingPayment;
  const action = course.awaitingPayment
    ? t.continuePayment
    : course.isCourseCompleted
      ? t.continueLearning
      : t.keepGoing;

  const body = (
    <>
      <EnrolledCourseMedia image={course.image} seed={course.courseId} title={course.title}>
        <StatusBadge course={course} t={t} />
      </EnrolledCourseMedia>

      <div className='flex flex-1 flex-col gap-3 p-4 sm:p-5'>
        <h4 className='line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug text-[#1e2364] transition-colors group-hover:text-[#0090d1] motion-reduce:transition-none'>
          {course.title}
        </h4>

        <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#6b7196]'>
          <span className='inline-flex items-center gap-1.5'>
            <BookOpen className='size-3.5' aria-hidden />
            {interpolate(t.lecturesCount, { count: course.totalLectures })}
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <Clock className='size-3.5' aria-hidden />
            {courseDurationLabel(t, course.totalHours)}
          </span>
        </div>

        <div className='mt-auto pt-1'>
          {course.awaitingPayment ? (
            <p className='flex items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200/70'>
              {t.stillToPay}
              <SarAmount amount={course.amountOwed} className='font-bold text-amber-900' />
            </p>
          ) : course.isCourseCompleted ? (
            <span className='inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700'>
              <CircleCheck className='size-4' aria-hidden />
              {t.courseCompleted}
            </span>
          ) : (
            <CourseProgressBar value={course.progress} className='h-1.5' />
          )}
        </div>
      </div>

      <div className='flex items-center justify-end gap-3 border-t border-[#eef0f7] px-4 py-3 sm:px-5'>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold transition-colors motion-reduce:transition-none',
            disabled
              ? 'text-[#6b7196]'
              : course.awaitingPayment
                ? 'bg-amber-100 text-amber-900 group-hover:bg-amber-200'
                : 'bg-[#00a8f1]/10 text-[#0090d1] group-hover:bg-[#00a8f1] group-hover:text-white'
          )}
        >
          {action}
          <ChevronRight className='size-4 rtl:rotate-180' aria-hidden />
        </span>
      </div>
    </>
  );

  if (disabled) {
    return (
      <div className={cn(surfaceClass, 'opacity-60')} aria-disabled>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={enrolledCourseHref(course, locale)}
      className={cn(
        surfaceClass,
        'transition duration-300 ease-out hover:-translate-y-1 hover:border-[#00a8f1]/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0'
      )}
    >
      {body}
    </Link>
  );
}

/** Placeholder matching `EnrolledCourseCard`. */
export function EnrolledCourseCardSkeleton() {
  return (
    <div className={cn(surfaceClass, 'animate-pulse motion-reduce:animate-none')} aria-hidden>
      <div className='aspect-video bg-[#e5e7f0]' />
      <div className='flex flex-1 flex-col gap-2.5 p-4 sm:p-5'>
        <div className='h-4 w-4/5 rounded-full bg-[#e5e7f0]' />
        <div className='h-3 w-1/2 rounded-full bg-[#eef0f7]' />
        <div className='mt-4 h-1.5 w-full rounded-full bg-[#e5e7f0]' />
      </div>
      <div className='flex justify-end border-t border-[#eef0f7] px-4 py-3 sm:px-5'>
        <div className='h-7 w-24 rounded-full bg-[#e5e7f0]' />
      </div>
    </div>
  );
}
