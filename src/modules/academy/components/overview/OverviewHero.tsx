import { ChevronRight, Clock, Layers, ListChecks, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Dictionary } from '@/locales/types';
import { buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { safeHtml } from '@/shared/lib/safeHtml';
import { CourseProgressBar } from '../CourseProgressBar';
import {
  AcademyStage,
  GlassPanel,
  ProgressRing,
  StatChip,
} from '../ui/AcademyGlass';

type PlayerT = Dictionary['academyPlayer'];

export interface OverviewHeroProps {
  t: PlayerT;
  title: string;
  description: string;
  image: string;
  tags: string[];
  duration: string;
  totalLectures: number;
  sectionsCount: number;
  totalItems: number;
  progress: number;
  completedCount: number;
  trackedCount: number;
  isRevisionAvailable?: boolean;
  revisionProgress?: number;
  myCoursesHref: string;
  resumeHref: string | null;
  hasLastLecture: boolean;
}

export function OverviewHero({
  t,
  title,
  description,
  image,
  tags,
  duration,
  totalLectures,
  sectionsCount,
  totalItems,
  progress,
  completedCount,
  trackedCount,
  isRevisionAvailable,
  revisionProgress,
  myCoursesHref,
  resumeHref,
  hasLastLecture,
}: OverviewHeroProps) {
  return (
    <div>
      <AcademyStage
        image={image}
        className='mx-2 rounded-[28px] sm:mx-3 sm:rounded-[36px]'
        innerClassName='py-8 lg:py-12'
      >
        <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12'>
          {/* Course identity */}
          <div className='min-w-0 space-y-6'>
            <nav
              aria-label={t.breadcrumbHome}
              className='flex flex-wrap items-center gap-1.5 text-[14px]'
            >
              <Link
                href={myCoursesHref}
                className='rounded-md text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]'
              >
                {t.breadcrumbHome}
              </Link>
              <ChevronRight
                aria-hidden
                className='size-4 text-white/40 rtl:rotate-180'
              />
              <span aria-current='page' className='font-semibold text-white'>
                {t.currentCourse}
              </span>
            </nav>

            <div className='space-y-4'>
              <h1 className='text-[28px] font-bold leading-tight text-white sm:text-[36px]'>
                {title}
              </h1>
              {description && (
                <div
                  className='max-w-3xl text-[16px] leading-relaxed text-white/75 [&_a]:text-[#5bc8ff] [&_a]:underline'
                  dangerouslySetInnerHTML={{ __html: safeHtml(description) }}
                />
              )}
            </div>

            <div className='flex flex-wrap gap-2'>
              {duration && (
                <StatChip tone='dark' icon={<Clock aria-hidden className='size-4 text-[#5bc8ff]' />}>
                  {duration}
                </StatChip>
              )}
              <StatChip tone='dark' icon={<Play aria-hidden className='size-4 text-[#5bc8ff]' />}>
                {totalLectures} {t.lectures}
              </StatChip>
              <StatChip tone='dark' icon={<Layers aria-hidden className='size-4 text-[#5bc8ff]' />}>
                {sectionsCount} {t.sections}
              </StatChip>
              <StatChip tone='dark' icon={<ListChecks aria-hidden className='size-4 text-[#5bc8ff]' />}>
                {totalItems} {t.itemsCount}
              </StatChip>
            </div>

            {tags.length > 0 && (
              <ul className='flex flex-wrap gap-2'>
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className='rounded-full border border-white/15 px-3 py-1 text-[12px] font-semibold text-white/70'
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Progress card */}
          <GlassPanel tone='dark' className='overflow-hidden'>
            <div className='relative hidden aspect-[16/8] w-full lg:block'>
              <Image
                src={image}
                alt={title}
                fill
                className='object-cover'
                sizes='360px'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-[#141848]/80 to-transparent' />
            </div>

            <div className='space-y-5 p-5 sm:p-6'>
              <div className='flex items-center gap-4'>
                <ProgressRing
                  value={progress}
                  size={88}
                  stroke={7}
                  label={t.yourProgress}
                />
                <div className='min-w-0 space-y-1'>
                  <p className='text-[16px] font-bold text-white'>
                    {t.yourProgress}
                  </p>
                  <p className='text-[14px] text-white/70'>
                    {completedCount} {t.of} {trackedCount} {t.completed}
                  </p>
                  <p className='text-[12px] text-white/55'>{t.keepGoing}</p>
                </div>
              </div>

              {isRevisionAvailable && (
                <div className='space-y-2 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10'>
                  <div className='flex items-center justify-between gap-3 text-[14px]'>
                    <span className='font-semibold text-white/85'>
                      {t.revisionProgress}
                    </span>
                    <span className='font-bold text-amber-400'>
                      {revisionProgress ?? 0}%
                    </span>
                  </div>
                  <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/15'>
                    <div
                      className='h-full rounded-full bg-amber-500 transition-[width] duration-500 ease-out'
                      style={{ width: `${revisionProgress ?? 0}%` }}
                    />
                  </div>
                </div>
              )}

              <CourseProgressBar value={progress} tone='dark' />

              {resumeHref && (
                <Link
                  href={resumeHref}
                  className={cn(
                    buttonVariants({ variant: 'brandInverse', size: 'lg', shape: 'pill' }),
                    'w-full focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141848] motion-safe:active:scale-[0.98]'
                  )}
                >
                  <Play aria-hidden className='size-5 rtl:rotate-180' />
                  {hasLastLecture ? t.continueLearning : t.startLearning}
                </Link>
              )}

            </div>
          </GlassPanel>
        </div>
      </AcademyStage>
    </div>
  );
}
