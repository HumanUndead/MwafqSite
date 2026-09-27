'use client';

import { motion, useInView } from 'framer-motion';
import { BookOpen, Clock, Lock, PlayCircle, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

import type { Locale } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { AcademyLanguagePicker } from '@/modules/academy/components/AcademyLanguagePicker';
import { courseDurationLabel } from '@/modules/academy/components/AcademyCourseCard';
import { courseDetailPath, learnBasePath } from '@/modules/academy/learnRoutes.shared';
import { ChevronRightSmIcon } from '@/shared/components/icons/academy';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { buttonVariants } from '@/shared/components/ui/Button';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { stripHtmlTags } from '@/shared/lib/htmlText';
import { courseCardVariants, EASE } from './constants';
import type { AcademyCourseRow } from './types/academy.types';

type Copy = ReturnType<typeof useTranslations<'profileAcademy'>>;

function CourseProgressBar({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  return (
    <div ref={ref} className='h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#e5e7f0]'>
      <motion.div
        className='h-full rounded-full bg-[#00a8f1]'
        initial={{ width: 0 }}
        animate={inView ? { width: `${value}%` } : { width: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      />
    </div>
  );
}

/** Highest progress, then rank, then lowest id (mobile `pickResumeCourse`). */
function pickResume(courses: AcademyCourseRow[]): AcademyCourseRow | null {
  return (
    [...courses].sort(
      (a, b) => b.progress - a.progress || b.rank - a.rank || a.enrollmentId - b.enrollmentId
    )[0] ?? null
  );
}

function hrefFor(course: AcademyCourseRow, locale: Locale): string {
  if (course.awaitingPayment) {
    return `${courseDetailPath(locale, course.courseId)}?pay=${course.enrollmentId}`;
  }
  return learnBasePath(locale, course.enrollmentId, course.courseId);
}

function ResumeCard({ course, locale, t }: { course: AcademyCourseRow; locale: Locale; t: Copy }) {
  return (
    <article className='relative overflow-hidden rounded-[24px] bg-[#1e2364] p-6 text-white'>
      <div className='pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-[#00a8f1]/25 blur-2xl' aria-hidden />
      <h3 className='relative text-[clamp(20px,2.4vw,26px)] font-extrabold leading-tight'>{course.title}</h3>
      {course.lastLectureName && (
        <p className='relative mt-2 flex items-center gap-2 text-sm text-white/80'>
          <PlayCircle className='size-4 shrink-0' aria-hidden />
          {course.lastLectureName}
        </p>
      )}
      <div className='relative mt-5 flex items-center gap-3'>
        <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-white/20'>
          <div className='h-full rounded-full bg-[#00a8f1]' style={{ width: `${course.progress}%` }} />
        </div>
        <span className='text-sm font-semibold text-white/85'>
          {interpolate(t.percentComplete, { percent: course.progress })}
        </span>
      </div>
      <div className='relative mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/80'>
        <span className='inline-flex items-center gap-1.5'>
          <BookOpen className='size-4' aria-hidden />
          {interpolate(t.lecturesCount, { count: course.totalLectures })}
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <Clock className='size-4' aria-hidden />
          {courseDurationLabel(t, course.totalHours)}
        </span>
      </div>
      <Link
        href={hrefFor(course, locale)}
        className={cn(buttonVariants({ variant: 'brandInverse', size: 'lg' }), 'relative mt-6 w-full rounded-[14px]')}
      >
        {t.continueLearning}
      </Link>
    </article>
  );
}

function CourseCard({ course, locale, t }: { course: AcademyCourseRow; locale: Locale; t: Copy }) {
  const description = stripHtmlTags(course.description) ?? '';
  const body = (
    <>
      <div className='relative flex h-36 items-center justify-center overflow-hidden bg-[#1e2364]'>
        <Image
          src='/demo-assets/logo.svg'
          alt=''
          width={72}
          height={72}
          className='h-18 w-18 object-contain brightness-0 invert opacity-30'
        />
        {course.isLocked && (
          <span className='absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#1e2364]'>
            <Lock className='size-3.5' aria-hidden />
            {t.locked}
          </span>
        )}
      </div>
      <div className='flex flex-1 flex-col gap-2.5 px-5 pb-3 pt-5'>
        <h3 className='text-[17px] font-extrabold leading-[1.3] tracking-[-0.3px] text-[#1e2364]'>{course.title}</h3>
        {description && <p className='line-clamp-2 text-[13px] leading-[1.55] text-[#6b7196]'>{description}</p>}
        {course.awaitingPayment ? (
          <p className='mt-auto flex items-center gap-2 text-sm text-[#6b7196]'>
            {t.stillToPay}
            <SarAmount amount={course.amountOwed} className='font-extrabold text-[#1e2364]' />
          </p>
        ) : course.isCourseCompleted ? (
          <span className='mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700'>
            <Trophy className='size-3.5' aria-hidden />
            {t.courseCompleted}
          </span>
        ) : (
          <div className='mt-auto flex items-center gap-2.5'>
            <CourseProgressBar value={course.progress} />
            <span className='shrink-0 text-xs font-bold text-[#1e2364]'>{course.progress}%</span>
          </div>
        )}
      </div>
      <div className='flex items-center justify-end gap-2.5 border-t-2 border-[#eef0f7] px-5 pb-5 pt-3.5'>
        <span className='inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#00a8f1] px-4 py-2 text-xs font-bold text-white'>
          {course.awaitingPayment ? t.continuePayment : t.keepGoing}
          <ChevronRightSmIcon className='size-3 rtl:rotate-180' />
        </span>
      </div>
    </>
  );

  const className = 'group relative flex h-full flex-col overflow-hidden rounded-[20px] border-2 border-[#e5e7f0] bg-white';
  if (course.isLocked && !course.awaitingPayment) {
    return <div className={cn(className, 'opacity-60')} aria-disabled>{body}</div>;
  }
  return (
    <motion.div variants={courseCardVariants} initial='rest' whileHover='hover' className='h-full rounded-[20px]'>
      <Link href={hrefFor(course, locale)} className={cn(className, 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]')}>
        {body}
      </Link>
    </motion.div>
  );
}

function Group({ title, courses, locale, t }: { title: string; courses: AcademyCourseRow[]; locale: Locale; t: Copy }) {
  if (courses.length === 0) return null;
  return (
    <div>
      <h3 className='mb-3 text-[13px] font-bold uppercase tracking-wide text-[#6b7196]'>{title}</h3>
      <div className='grid grid-cols-3 gap-5.5 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1'>
        {courses.map((course) => (
          <ScrollReveal key={course.id} transitionDelay={course.transitionDelay} className='h-full'>
            <CourseCard course={course} locale={locale} t={t} />
          </ScrollReveal>
        ))}
      </div>
    </div>
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
    <section className='relative flex flex-col gap-8 pt-2'>
      <ScrollReveal className='flex flex-wrap items-center justify-between gap-4'>
        <h2 className='text-[clamp(22px,2vw,28px)] font-extrabold leading-[1.15] tracking-[-0.6px] text-[#1e2364]'>
          {t.title}
        </h2>
        <AcademyLanguagePicker />
      </ScrollReveal>

      {rows.length === 0 ? (
        <div className='flex flex-col items-center gap-3 rounded-[24px] border-2 border-dashed border-[#e5e7f0] bg-white px-6 py-14 text-center'>
          <p className='text-lg font-extrabold text-[#1e2364]'>{t.emptyTitle}</p>
          <p className='max-w-md text-sm leading-6 text-[#6b7196]'>{t.emptyBody}</p>
          <Link href={`/${locale}/courses`} className={buttonVariants({ variant: 'brand' })}>
            {t.browseCourses}
          </Link>
        </div>
      ) : (
        <>
          {resume && <ResumeCard course={resume} locale={locale} t={t} />}
          <Group title={t.awaitingPayment} courses={awaitingPayment} locale={locale} t={t} />
          <Group title={t.inProgress} courses={inProgress} locale={locale} t={t} />
          <Group title={t.completed} courses={completed} locale={locale} t={t} />
        </>
      )}
    </section>
  );
}
