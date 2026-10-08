import { ChevronLeft, Clock, Layers, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import type { Dictionary } from '@/locales/types';
import { Panel, StatusBadge } from '@/shared/components/product';
import { buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { safeHtml } from '@/shared/lib/safeHtml';
import { CourseProgressBar } from '../CourseProgressBar';
import { StatChip } from '../ui/AcademyGlass';

type PlayerT = Dictionary['academyPlayer'];

export interface OverviewHeroProps {
  t: PlayerT;
  title: string;
  description: string;
  duration: string;
  totalLectures: number;
  sectionsCount: number;
  progress: number;
  completedCount: number;
  trackedCount: number;
  isRevisionAvailable?: boolean;
  revisionProgress?: number;
  myCoursesHref: string;
  resumeHref: string | null;
  hasLastLecture: boolean;
  /** The course is finished: completed state instead of "continue". */
  courseCompleted?: boolean;
  /** The item the resume button opens, shown as "Up next". */
  upNext?: { title: string; type: 'lecture' | 'quiz'; minutes: number } | null;
}

/** Page header (back link, title, facts) and the progress / resume panel. */
export function OverviewHero({
  t,
  title,
  description,
  duration,
  totalLectures,
  sectionsCount,
  progress,
  completedCount,
  trackedCount,
  isRevisionAvailable,
  revisionProgress,
  myCoursesHref,
  resumeHref,
  hasLastLecture,
  upNext,
  courseCompleted = false,
}: OverviewHeroProps) {
  const shownProgress = Math.round(courseCompleted ? 100 : progress);

  return (
    <>
      <header className='flex flex-col gap-3'>
        <Link
          href={myCoursesHref}
          className='inline-flex w-fit items-center gap-1 rounded-md text-[14px] font-semibold text-[#0077ad] transition-colors duration-150 hover:text-[#1e2364] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]'
        >
          <ChevronLeft aria-hidden className='size-4 shrink-0 rtl:rotate-180' />
          {t.breadcrumbHome}
        </Link>
        <h1 className='wrap-break-word text-[24px] font-bold leading-tight text-[#1e2364] sm:text-[28px]'>
          {title}
        </h1>
        {description && (
          <div
            className='max-w-[70ch] text-[15px] leading-7 text-[#4a5078] [&_a]:text-[#0077ad] [&_a]:underline [&_p]:m-0'
            dangerouslySetInnerHTML={{ __html: safeHtml(description) }}
          />
        )}
        <div className='flex flex-wrap gap-x-5 gap-y-2'>
          {duration && (
            <StatChip icon={<Clock aria-hidden />}>
              <span dir='ltr'>{duration}</span>
            </StatChip>
          )}
          <StatChip icon={<PlayCircle aria-hidden />}>
            <bdi className='tabular-nums'>{totalLectures}</bdi> {t.lectures}
          </StatChip>
          <StatChip icon={<Layers aria-hidden />}>
            <bdi className='tabular-nums'>{sectionsCount}</bdi> {t.sections}
          </StatChip>
        </div>
      </header>

      <Panel aria-labelledby='overview-progress-title'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-baseline justify-between gap-3'>
              <h2 id='overview-progress-title' className='text-[17px] font-bold text-[#1e2364]'>
                {t.yourProgress}
              </h2>
              <span dir='ltr' className='text-[15px] font-bold tabular-nums text-[#1e2364]'>
                {shownProgress}%
              </span>
            </div>
            <CourseProgressBar value={shownProgress} label={t.yourProgress} className='mt-3' />
            <p className='mt-2 text-[13px] font-semibold text-[#6b7196]'>
              {interpolate(t.progressSummary, { completed: completedCount, total: trackedCount })}
            </p>

            {isRevisionAvailable && (
              <div className='mt-4 border-t border-[#eef0f7] pt-4'>
                <div className='flex items-baseline justify-between gap-3'>
                  <span className='text-[14px] font-semibold text-[#1e2364]'>
                    {t.revisionProgress}
                  </span>
                  <span dir='ltr' className='text-[14px] font-bold tabular-nums text-[#1e2364]'>
                    {Math.round(revisionProgress ?? 0)}%
                  </span>
                </div>
                <CourseProgressBar
                  value={revisionProgress ?? 0}
                  label={t.revisionProgress}
                  className='mt-2 h-1.5'
                />
              </div>
            )}
          </div>

          <div className='border-t border-[#eef0f7] pt-5 lg:w-[360px] lg:shrink-0 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0'>
            {courseCompleted ? (
              <div className='flex flex-col gap-3'>
                <StatusBadge tone='success'>{t.courseCompleted}</StatusBadge>
                <p className='text-[14px] leading-6 text-[#6b7196]'>{t.courseCompletedHint}</p>
                {resumeHref && (
                  <Link
                    href={resumeHref}
                    className={cn(
                      buttonVariants({ variant: 'productSecondary', size: 'control' }),
                      'w-full'
                    )}
                  >
                    {t.reviewCourse}
                  </Link>
                )}
              </div>
            ) : (
              <div className='flex flex-col gap-3'>
                {upNext && (
                  <div className='min-w-0'>
                    <p className='text-[13px] font-semibold text-[#6b7196]'>{t.upNext}</p>
                    <p className='mt-0.5 line-clamp-2 text-[15px] font-bold leading-6 text-[#1e2364]'>
                      {upNext.title}
                    </p>
                    <p className='text-[13px] text-[#6b7196]'>
                      {upNext.type === 'quiz' ? t.quiz : t.lecture}
                      {upNext.minutes > 0 && (
                        <>
                          {' · '}
                          <bdi className='tabular-nums'>{upNext.minutes}</bdi> {t.minutes}
                        </>
                      )}
                    </p>
                  </div>
                )}
                {resumeHref && (
                  <Link
                    href={resumeHref}
                    className={cn(buttonVariants({ variant: 'product', size: 'control' }), 'w-full')}
                  >
                    {hasLastLecture ? t.continueLearning : t.startLearning}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </Panel>
    </>
  );
}
