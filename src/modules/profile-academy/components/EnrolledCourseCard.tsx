'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';

import type { Locale } from '@/i18n/config';
import { courseDurationLabel } from '@/modules/academy/components/AcademyCourseCard';
import { CourseProgressBar } from '@/modules/academy/components/CourseProgressBar';
import { StatusBadge, type StatusTone } from '@/shared/components/product';
import { buttonVariants } from '@/shared/components/ui/Button';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import type { AcademyCourseRow } from '../types/academy.types';
import { CourseCover } from './CourseCover';
import { enrolledCourseHref, type ProfileAcademyCopy } from './enrolledCourse.shared';

type CourseState = 'locked' | 'awaitingPayment' | 'completed' | 'inProgress';

function courseState(course: AcademyCourseRow): CourseState {
  if (course.awaitingPayment) return 'awaitingPayment';
  if (course.isLocked) return 'locked';
  if (course.isCourseCompleted) return 'completed';
  return 'inProgress';
}

const TONE: Record<CourseState, StatusTone> = {
  locked: 'neutral',
  awaitingPayment: 'warning',
  completed: 'success',
  inProgress: 'info',
};

/** Enrolled course in the grid: cover, status, title, facts, progress or amount due, action. */
export function EnrolledCourseCard({
  course,
  locale,
  t,
}: {
  course: AcademyCourseRow;
  locale: Locale;
  t: ProfileAcademyCopy;
}) {
  const state = courseState(course);
  const action =
    state === 'awaitingPayment'
      ? t.continuePayment
      : state === 'completed'
        ? t.reviewCourse
        : state === 'inProgress'
          ? t.resumeCourse
          : null;

  return (
    <article className='flex h-full flex-col overflow-hidden rounded-2xl border border-[#e5e7f0] bg-white'>
      <CourseCover
        image={course.image}
        sizes='(min-width: 1280px) 300px, (min-width: 640px) 45vw, 100vw'
      />

      <div className='flex flex-1 flex-col gap-2 p-4 sm:p-5'>
        <StatusBadge tone={TONE[state]}>
          {state === 'locked' ? <Lock className='size-3.5' aria-hidden /> : null}
          {t[state]}
        </StatusBadge>
        <h3
          className='line-clamp-2 break-words text-[15px] font-bold leading-6 text-[#1e2364]'
          title={course.title}
        >
          {course.title}
        </h3>
        <p className='text-[13px] font-semibold tabular-nums text-[#6b7196]'>
          {interpolate(t.lecturesCount, { count: course.totalLectures })}
          {' · '}
          {courseDurationLabel(t, course.totalHours)}
        </p>

        {state === 'awaitingPayment' ? (
          <p className='mt-auto flex items-center justify-between gap-3 pt-2 text-[14px] text-[#4a5078]'>
            {t.stillToPay}
            <SarAmount
              amount={course.amountOwed}
              className='font-bold tabular-nums text-[#1e2364]'
            />
          </p>
        ) : state === 'inProgress' || state === 'locked' ? (
          <div className='mt-auto flex flex-col gap-1.5 pt-2'>
            <span className='text-[13px] font-semibold tabular-nums text-[#1e2364]'>
              {interpolate(t.percentComplete, { percent: course.progress })}
            </span>
            <CourseProgressBar value={course.progress} className='h-1.5' />
          </div>
        ) : null}
      </div>

      {action ? (
        <div className='border-t border-[#eef0f7] px-4 py-3 sm:px-5'>
          <Link
            href={enrolledCourseHref(course, locale)}
            className={cn(
              buttonVariants({
                variant: state === 'awaitingPayment' ? 'product' : 'productSecondary',
                size: 'compact',
              }),
              'w-full max-sm:h-11'
            )}
          >
            {action}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
