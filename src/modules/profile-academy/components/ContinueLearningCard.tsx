'use client';

import Link from 'next/link';

import type { Locale } from '@/i18n/config';
import { courseDurationLabel } from '@/modules/academy/components/AcademyCourseCard';
import { CourseProgressBar } from '@/modules/academy/components/CourseProgressBar';
import { Panel } from '@/shared/components/product';
import { buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import type { AcademyCourseRow } from '../types/academy.types';
import { CourseCover } from './CourseCover';
import { enrolledCourseHref, type ProfileAcademyCopy } from './enrolledCourse.shared';

/** The course to resume: cover, title, last lecture, progress and one action. */
export function ContinueLearningCard({
  course,
  locale,
  t,
}: {
  course: AcademyCourseRow;
  locale: Locale;
  t: ProfileAcademyCopy;
}) {
  return (
    <Panel aria-labelledby='continue-learning-heading'>
      <div className='grid gap-5 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:items-center md:gap-6'>
        <CourseCover
          image={course.image}
          sizes='(min-width: 768px) 280px, 100vw'
          className='rounded-xl'
        />

        <div className='flex min-w-0 flex-col gap-4'>
          <div className='min-w-0'>
            <h2
              id='continue-learning-heading'
              className='text-[13px] font-semibold text-[#6b7196]'
            >
              {t.continueLearning}
            </h2>
            <h3 className='mt-1 break-words text-[18px] font-bold leading-7 text-[#1e2364]'>
              {course.title}
            </h3>
            {course.lastLectureName ? (
              <p className='mt-1 break-words text-[14px] leading-6 text-[#6b7196]'>
                {interpolate(t.lastLecture, { name: course.lastLectureName })}
              </p>
            ) : null}
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[13px] font-semibold'>
              <span className='tabular-nums text-[#1e2364]'>
                {interpolate(t.percentComplete, { percent: course.progress })}
              </span>
              <span className='tabular-nums text-[#6b7196]'>
                {interpolate(t.lecturesCount, { count: course.totalLectures })}
                {' · '}
                {courseDurationLabel(t, course.totalHours)}
              </span>
            </div>
            <CourseProgressBar value={course.progress} />
          </div>

          <Link
            href={enrolledCourseHref(course, locale)}
            className={cn(
              buttonVariants({ variant: 'product', size: 'control' }),
              'w-full transition-colors duration-150 sm:w-fit'
            )}
          >
            {t.resumeCourse}
          </Link>
        </div>
      </div>
    </Panel>
  );
}
