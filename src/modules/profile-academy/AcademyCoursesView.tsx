'use client';

import { CircleCheck, GraduationCap, PlayCircle, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';

import type { Locale } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { AcademyLanguagePicker } from '@/modules/academy/components/AcademyLanguagePicker';
import { GlassPanel } from '@/modules/academy/components/ui/AcademyGlass';
import { buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
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

type FilterKey = 'all' | 'inProgress' | 'awaitingPayment' | 'completed';

/** Count tile in the summary header. */
function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone: 'sky' | 'amber' | 'emerald';
}) {
  return (
    <div className='flex items-center gap-3 rounded-[18px] bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur sm:p-4'>
      <span
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-xl',
          tone === 'sky' && 'bg-[#00a8f1]/20 text-[#5bc8ff]',
          tone === 'amber' && 'bg-amber-400/20 text-amber-300',
          tone === 'emerald' && 'bg-emerald-400/20 text-emerald-300'
        )}
      >
        {icon}
      </span>
      <div className='min-w-0'>
        <p className='text-2xl font-bold leading-none tabular-nums text-white'>{value}</p>
        <p className='mt-1 truncate text-xs font-semibold text-white/70'>{label}</p>
      </div>
    </div>
  );
}

function SummaryHeader({
  total,
  inProgress,
  awaitingPayment,
  completed,
  t,
}: {
  total: number;
  inProgress: number;
  awaitingPayment: number;
  completed: number;
  t: ProfileAcademyCopy;
}) {
  return (
    <header className='relative isolate overflow-hidden rounded-[28px] bg-[#141848] p-5 text-white sm:p-7'>
      <div
        aria-hidden
        className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(0,168,241,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(91,99,214,0.35),transparent_60%)]'
      />
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h2 className='text-[22px] font-bold leading-tight sm:text-[28px]'>{t.title}</h2>
          {total > 0 ? (
            <>
              <p className='mt-2 text-sm font-semibold text-[#5bc8ff]'>
                {interpolate(t.coursesCount, { count: total })}
              </p>
              <p className='mt-1 max-w-xl text-sm leading-6 text-white/70'>
                {t.subtitle}
              </p>
            </>
          ) : (
            <p className='mt-2 max-w-xl text-sm leading-6 text-white/70'>
              {t.emptyTitle}
            </p>
          )}
        </div>
        <AcademyLanguagePicker tone='dark' />
      </div>

      {total > 0 && (
        <div className='mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3'>
          <StatTile
            tone='sky'
            icon={<PlayCircle className='size-5' aria-hidden />}
            label={t.inProgress}
            value={inProgress}
          />
          <StatTile
            tone='amber'
            icon={<Wallet className='size-5' aria-hidden />}
            label={t.awaitingPayment}
            value={awaitingPayment}
          />
          <StatTile
            tone='emerald'
            icon={<CircleCheck className='size-5' aria-hidden />}
            label={t.completed}
            value={completed}
          />
        </div>
      )}
    </header>
  );
}

export type AcademyCoursesViewProps = {
  courses?: readonly AcademyCourseRow[];
};

/**
 * "My learning": a summary header with counts, the course to resume, then
 * every course filtered by status (all / in progress / awaiting payment /
 * completed). Grouping and resume rules match the mobile app.
 */
export function AcademyCoursesView({ courses }: AcademyCoursesViewProps) {
  const rows = [...(courses ?? [])];
  const t = useTranslations('profileAcademy');
  const locale = useLocale() as Locale;

  const awaitingPayment = rows.filter((c) => c.awaitingPayment);
  const paid = rows.filter((c) => !c.awaitingPayment);
  const completed = paid.filter((c) => c.isCourseCompleted);
  const studying = paid.filter((c) => !c.isCourseCompleted);
  const resume = pickResume(studying.filter((c) => !c.isLocked));

  const lists: Record<FilterKey, AcademyCourseRow[]> = {
    all: [...studying, ...awaitingPayment, ...completed],
    inProgress: studying,
    awaitingPayment,
    completed,
  };
  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: t.all },
    { key: 'inProgress', label: t.inProgress },
    { key: 'awaitingPayment', label: t.awaitingPayment },
    { key: 'completed', label: t.completed },
  ];
  const [filter, setFilter] = useState<FilterKey>('all');
  const visible = lists[filter];

  return (
    <section className='relative flex flex-col gap-7'>
      <SummaryHeader
        total={rows.length}
        inProgress={studying.length}
        awaitingPayment={awaitingPayment.length}
        completed={completed.length}
        t={t}
      />

      {rows.length === 0 ? (
        <GlassPanel
          className={cn(
            'flex flex-col items-center gap-3 border border-[#e5e7f0] bg-white px-6 py-14 text-center',
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
          {resume && (
            <section className='flex flex-col gap-3'>
              <h3 className='text-lg font-bold text-[#1e2364]'>{t.continueLearning}</h3>
              <ContinueLearningCard course={resume} locale={locale} t={t} />
            </section>
          )}

          <section className='flex flex-col gap-4'>
            <div
              role='tablist'
              aria-label={t.filterLabel}
              className='flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]'
            >
              {filters.map((item) => {
                const active = item.key === filter;
                const count = lists[item.key].length;
                return (
                  <button
                    key={item.key}
                    type='button'
                    role='tab'
                    aria-selected={active}
                    aria-controls='my-courses-panel'
                    onClick={() => setFilter(item.key)}
                    className={cn(
                      'inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] motion-reduce:transition-none',
                      active
                        ? 'border-[#1e2364] bg-[#1e2364] text-white'
                        : 'border-[#e5e7f0] bg-white text-[#6b7196] hover:border-[#1e2364]/30 hover:text-[#1e2364]'
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums',
                        active ? 'bg-white/20 text-white' : 'bg-[#1e2364]/[0.06] text-[#1e2364]'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div id='my-courses-panel' role='tabpanel'>
              {visible.length === 0 ? (
                <p className='rounded-[22px] border border-dashed border-[#d9ddea] bg-white/60 px-6 py-10 text-center text-sm font-semibold text-[#6b7196]'>
                  {t.emptyFilter}
                </p>
              ) : (
                <ul className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
                  {visible.map((course) => (
                    <li key={course.id} className='min-w-0'>
                      <EnrolledCourseCard course={course} locale={locale} t={t} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
