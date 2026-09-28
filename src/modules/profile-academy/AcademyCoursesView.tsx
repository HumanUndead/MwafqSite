'use client';

import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

import type { Locale } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { AcademyLanguagePicker } from '@/modules/academy/components/AcademyLanguagePicker';
import { GlassPanel } from '@/modules/academy/components/ui/AcademyGlass';
import { buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { ContinueLearningCard } from './components/ContinueLearningCard';
import {
  profileGlassClass,
  skyButtonClass,
  type ProfileAcademyCopy,
} from './components/enrolledCourse.shared';
import { EnrolledCourseCard } from './components/EnrolledCourseCard';
import type { AcademyCourseRow } from './types/academy.types';

/** Highest progress, then rank, then lowest id (mobile `pickResumeCourse`). */
function pickResume(courses: AcademyCourseRow[]): AcademyCourseRow | null {
  return (
    [...courses].sort(
      (a, b) => b.progress - a.progress || b.rank - a.rank || a.enrollmentId - b.enrollmentId
    )[0] ?? null
  );
}

function Group({
  title,
  courses,
  locale,
  t,
}: {
  title: string;
  courses: AcademyCourseRow[];
  locale: Locale;
  t: ProfileAcademyCopy;
}) {
  if (courses.length === 0) return null;
  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2.5'>
        <h3 className='text-xl font-bold text-[#1e2364]'>{title}</h3>
        <span className='inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#1e2364]/[0.06] px-2 text-xs font-semibold tabular-nums text-[#1e2364]'>
          {courses.length}
        </span>
      </div>
      <ul className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
        {courses.map((course) => (
          <li key={course.id} className='min-w-0'>
            <EnrolledCourseCard course={course} locale={locale} t={t} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export type AcademyCoursesViewProps = {
  courses?: readonly AcademyCourseRow[];
};

/** Studying zone: resume, awaiting payment, in progress, completed (mobile). */
export function AcademyCoursesView({ courses }: AcademyCoursesViewProps) {
  const rows = [...(courses ?? [])];
  const t = useTranslations('profileAcademy');
  const locale = useLocale() as Locale;

  const awaitingPayment = rows.filter((c) => c.awaitingPayment);
  const paid = rows.filter((c) => !c.awaitingPayment);
  const completed = paid.filter((c) => c.isCourseCompleted);
  const studying = paid.filter((c) => !c.isCourseCompleted);
  const resume = pickResume(studying.filter((c) => !c.isLocked));
  const inProgress = studying.filter((c) => c.id !== resume?.id);

  return (
    <section className='relative flex flex-col gap-8'>
      <header className='flex flex-wrap items-center justify-between gap-4'>
        <h2 className='text-[22px] font-bold leading-tight text-[#1e2364] sm:text-[28px]'>
          {t.title}
        </h2>
        <AcademyLanguagePicker />
      </header>

      {rows.length === 0 ? (
        <GlassPanel
          className={cn(
            'flex flex-col items-center gap-3 px-6 py-14 text-center',
            profileGlassClass
          )}
        >
          <span className='mb-1 inline-flex size-14 items-center justify-center rounded-2xl bg-[#00a8f1]/10 text-[#00a8f1]'>
            <GraduationCap className='size-7' aria-hidden />
          </span>
          <p className='text-xl font-bold text-[#1e2364]'>{t.emptyTitle}</p>
          <p className='max-w-md text-sm leading-6 text-[#6b7196]'>{t.emptyBody}</p>
          <Link
            href={`/${locale}/courses`}
            className={cn(
              buttonVariants({ variant: 'brand', size: 'lg', shape: 'pill' }),
              skyButtonClass,
              'mt-3'
            )}
          >
            {t.browseCourses}
          </Link>
        </GlassPanel>
      ) : (
        <>
          {resume && <ContinueLearningCard course={resume} locale={locale} t={t} />}
          <Group title={t.awaitingPayment} courses={awaitingPayment} locale={locale} t={t} />
          <Group title={t.inProgress} courses={inProgress} locale={locale} t={t} />
          <Group title={t.completed} courses={completed} locale={locale} t={t} />
        </>
      )}
    </section>
  );
}
