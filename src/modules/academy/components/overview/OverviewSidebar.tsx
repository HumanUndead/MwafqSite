import { Award, CheckCircle2, Clock, FileText, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import type { Dictionary } from '@/locales/types';
import { buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { safeHtml } from '@/shared/lib/safeHtml';
import type { EnrolledLastLecture } from '../../types/course.types';
import { GlassPanel } from '../ui/AcademyGlass';

type PlayerT = Dictionary['academyPlayer'];

export function OverviewSidebar({
  t,
  lastLecture,
  lastLectureHref,
  whatYouLearn,
  progress,
  sectionsCount,
  totalItems,
  totalLectures,
  courseCompleted = false,
}: {
  t: PlayerT;
  lastLecture: EnrolledLastLecture | null;
  lastLectureHref: string | null;
  whatYouLearn: string[];
  progress: number;
  sectionsCount: number;
  totalItems: number;
  totalLectures: number;
  courseCompleted?: boolean;
}) {
  return (
    <div className='space-y-5'>
      {lastLecture && lastLectureHref && (
        <GlassPanel as='section' className='p-5' aria-labelledby='overview-last-lecture'>
          <p className='flex items-center gap-2 text-[12px] font-semibold text-[#6b7196]'>
            <Clock aria-hidden className='size-4 text-[#00a8f1]' />
            {t.lastWatched}
          </p>
          <h2
            id='overview-last-lecture'
            className='mt-2 text-[16px] font-bold leading-snug text-[#1e2364]'
          >
            {lastLecture.name || `${t.lecture} ${lastLecture.id}`}
          </h2>
          {lastLecture.description && (
            <div
              className='mt-1.5 line-clamp-2 text-[14px] text-[#6b7196]'
              dangerouslySetInnerHTML={{ __html: safeHtml(lastLecture.description) }}
            />
          )}
          <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#6b7196]'>
            <span className='inline-flex items-center gap-1'>
              <Play aria-hidden className='size-3.5 rtl:rotate-180' />
              {lastLecture.videoLengthInMinutes} {t.minutes}
            </span>
            {lastLecture.textContent && (
              <span className='inline-flex items-center gap-1'>
                <FileText aria-hidden className='size-3.5' />
                {t.hasContent}
              </span>
            )}
          </div>
          <Link
            href={lastLectureHref}
            className={cn(
              buttonVariants({ variant: 'brand', size: 'md', shape: 'pill' }),
              courseCompleted
                ? 'mt-4 w-full border border-[#e5e7f0] bg-white text-[#1e2364] hover:bg-[#f3f4f8]'
                : 'mt-4 w-full bg-[#00a8f1] hover:bg-[#0090d1]',
              'focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]'
            )}
          >
            {courseCompleted ? (
              <RotateCcw aria-hidden className='size-4' />
            ) : (
              <Play aria-hidden className='size-4 rtl:rotate-180' />
            )}
            {courseCompleted ? t.reviewCourse : t.continueLearning}
          </Link>
        </GlassPanel>
      )}

      {whatYouLearn.length > 0 && (
        <GlassPanel as='section' className='p-5' aria-labelledby='overview-what-you-learn'>
          <h2
            id='overview-what-you-learn'
            className='flex items-center gap-2 text-[16px] font-bold text-[#1e2364]'
          >
            <Award aria-hidden className='size-5 text-[#00a8f1]' />
            {t.whatYouLearn}
          </h2>
          <ul className='mt-4 space-y-2.5'>
            {whatYouLearn.map((item, index) => (
              <li key={index} className='flex items-start gap-2.5'>
                <CheckCircle2 aria-hidden className='mt-0.5 size-4 shrink-0 text-emerald-500' />
                <span className='text-[14px] leading-relaxed text-[#1e2364]/85'>{item}</span>
              </li>
            ))}
          </ul>
        </GlassPanel>
      )}

      <GlassPanel as='section' className='p-5' aria-labelledby='overview-course-stats'>
        <h2 id='overview-course-stats' className='text-[16px] font-bold text-[#1e2364]'>
          {t.courseStats}
        </h2>
        <dl className='mt-3 divide-y divide-[#e5e7f0] text-[14px]'>
          <div className='flex items-center justify-between py-2.5'>
            <dt className='text-[#6b7196]'>{t.completion}</dt>
            <dd className='font-bold text-[#00a8f1]'>{progress}%</dd>
          </div>
          <div className='flex items-center justify-between py-2.5'>
            <dt className='text-[#6b7196]'>{t.lectures}</dt>
            <dd className='font-semibold text-[#1e2364]'>{totalLectures}</dd>
          </div>
          <div className='flex items-center justify-between py-2.5'>
            <dt className='text-[#6b7196]'>{t.sectionsCount}</dt>
            <dd className='font-semibold text-[#1e2364]'>{sectionsCount}</dd>
          </div>
          <div className='flex items-center justify-between py-2.5'>
            <dt className='text-[#6b7196]'>{t.itemsCount}</dt>
            <dd className='font-semibold text-[#1e2364]'>{totalItems}</dd>
          </div>
        </dl>
      </GlassPanel>
    </div>
  );
}
