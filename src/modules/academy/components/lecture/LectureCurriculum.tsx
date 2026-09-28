'use client';

import {
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Lock,
  PlayCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import type { Dictionary } from '@/locales/types';
import { cn } from '@/shared/lib/cn';
import { CourseProgressBar } from '../CourseProgressBar';
import { isCourseQuizLocked, isItemLocked } from '../../courseLocking.shared';
import { lecturePath, quizPath } from '../../learnRoutes.shared';
import type {
  CourseData,
  CourseItem,
  CoursePlayerLesson,
} from '../../types/player.types';
import { GlassPanel } from '../ui/AcademyGlass';

interface LectureCurriculumProps {
  courseData: CourseData | null;
  courseName: string;
  currentLectureId: number;
  /** Local completion of the current lecture (ahead of the cached detail). */
  currentCompleted: boolean;
  locale: Locale;
  userCourseId: number;
  courseId: number;
}

/** Sticky course-content sidebar: progress + lessons with item states. */
export function LectureCurriculum({
  courseData,
  courseName,
  currentLectureId,
  currentCompleted,
  locale,
  userCourseId,
  courseId,
}: LectureCurriculumProps) {
  const t = useTranslations('academyPlayer');
  const currentKey = String(currentLectureId);

  const isCurrent = (item: CourseItem) =>
    item.type === 'lecture' && item.id === currentKey;
  const isDone = (item: CourseItem) =>
    item.isCompleted || (isCurrent(item) && currentCompleted);

  const progress = Math.round(courseData?.currentProgress ?? 0);

  return (
    <GlassPanel
      as='aside'
      aria-label={t.courseCurriculum}
      className='flex flex-col overflow-hidden lg:sticky lg:top-[110px] lg:max-h-[calc(100vh-130px)]'
    >
      <div className='border-b border-[#e5e7f0] p-5'>
        <p className='text-sm font-semibold text-[#6b7196]'>
          {t.courseCurriculum}
        </p>
        <h2 className='mt-1 line-clamp-2 text-base font-bold text-[#1e2364]'>
          {courseName}
        </h2>
        <div className='mt-4 flex items-center justify-between gap-3 text-sm'>
          <span className='font-semibold text-[#6b7196]'>{t.yourProgress}</span>
          <span className='font-bold text-[#00a8f1]'>{progress}%</span>
        </div>
        <CourseProgressBar value={progress} className='mt-2' />
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto p-3'>
        {!courseData ? (
          <div className='space-y-2 p-2' aria-hidden>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className='h-11 animate-pulse rounded-2xl bg-[#e5e7f0]/70 motion-reduce:animate-none'
              />
            ))}
          </div>
        ) : (
          <div className='space-y-2'>
            {courseData.sections.map((section, sectionIndex) => {
              if (section.type === 'attachments') return null;

              if (section.type === 'lesson') {
                const lesson = section.data as CoursePlayerLesson;
                const items = [...lesson.items].sort((a, b) => a.rank - b.rank);
                const done = items.filter(isDone).length;
                const containsCurrent = items.some(isCurrent);

                return (
                  <details
                    key={`lesson-${lesson.id}`}
                    open={containsCurrent}
                    className='group rounded-2xl'
                  >
                    <summary
                      className={cn(
                        'flex cursor-pointer list-none items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] [&::-webkit-details-marker]:hidden',
                        containsCurrent && 'bg-white/60'
                      )}
                    >
                      <span className='flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1e2364]/5 text-sm font-bold text-[#1e2364]'>
                        {sectionIndex + 1}
                      </span>
                      <span className='min-w-0 flex-1'>
                        <span className='flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1e2364]'>
                          <span className='min-w-0'>{lesson.title}</span>
                          {lesson.isRevision ? (
                            <span className='rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600 ring-1 ring-amber-100'>
                              {t.revision}
                            </span>
                          ) : null}
                        </span>
                        <span className='mt-0.5 block text-xs text-[#6b7196]'>
                          {done} {t.of} {items.length} {t.completed}
                        </span>
                      </span>
                      <ChevronDown
                        className='size-4 shrink-0 text-[#6b7196] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none'
                        aria-hidden
                      />
                    </summary>
                    <ul className='mt-1 space-y-1 pb-2'>
                      {items.map((item, itemIndex) => (
                        <li key={`${item.type}-${item.id}`}>
                          <CurriculumRow
                            item={item}
                            current={isCurrent(item)}
                            done={isDone(item)}
                            locked={isItemLocked(courseData, lesson.id, itemIndex)}
                            href={itemHref(item)}
                            labels={t}
                          />
                        </li>
                      ))}
                    </ul>
                  </details>
                );
              }

              const quizItem = section.data as CourseItem;
              return (
                <CurriculumRow
                  key={`${section.type}-${quizItem.id}`}
                  item={quizItem}
                  current={false}
                  done={quizItem.isCompleted}
                  locked={isCourseQuizLocked(courseData, quizItem)}
                  href={itemHref(quizItem)}
                  isExam={section.type === 'exam' || quizItem.isExam}
                  labels={t}
                />
              );
            })}
          </div>
        )}
      </div>
    </GlassPanel>
  );

  function itemHref(item: CourseItem): string {
    return item.type === 'quiz'
      ? quizPath(locale, userCourseId, courseId, item.id)
      : lecturePath(locale, userCourseId, courseId, item.id);
  }
}

type CurriculumLabels = Dictionary['academyPlayer'];

function CurriculumRow({
  item,
  current,
  done,
  locked,
  href,
  isExam,
  labels: t,
}: {
  item: CourseItem;
  current: boolean;
  done: boolean;
  locked: boolean;
  href: string;
  isExam?: boolean;
  labels: CurriculumLabels;
}) {
  const TypeIcon = item.type === 'quiz' ? ClipboardCheck : PlayCircle;
  const typeLabel =
    item.type === 'quiz' ? (isExam ? t.exam : t.quiz) : t.lecture;

  const body = (
    <>
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-xl',
          current
            ? 'bg-[#00a8f1] text-white'
            : 'bg-white text-[#6b7196] ring-1 ring-[#e5e7f0]'
        )}
      >
        <TypeIcon className='size-4' aria-hidden />
        <span className='sr-only'>{typeLabel}</span>
      </span>
      <span className='min-w-0 flex-1'>
        <span
          className={cn(
            'line-clamp-2 text-sm',
            current ? 'font-bold text-[#1e2364]' : 'font-semibold',
            locked ? 'text-[#6b7196]' : 'text-[#1e2364]'
          )}
        >
          {item.title}
        </span>
        <span className='mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#6b7196]'>
          {item.duration ? (
            <span>
              {item.duration} {t.minutes}
            </span>
          ) : null}
          {isExam ? (
            <span className='rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-600'>
              {t.exam}
            </span>
          ) : null}
          {item.isExtraLecture ? (
            <span className='rounded-full bg-[#00a8f1]/10 px-2 py-0.5 font-semibold text-[#0090d1]'>
              {t.extraContent}
            </span>
          ) : null}
          {item.isRevision ? (
            <span className='rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-600'>
              {t.revision}
            </span>
          ) : null}
        </span>
      </span>
      <span className='shrink-0'>
        {done ? (
          <CheckCircle2 className='size-5 text-emerald-500' aria-label={t.completedBadge} />
        ) : locked ? (
          <Lock className='size-4 text-amber-500' aria-label={t.locked} />
        ) : null}
      </span>
    </>
  );

  const rowClass = cn(
    'flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors',
    current && 'bg-[#00a8f1]/10 ring-1 ring-[#00a8f1]/30'
  );

  if (locked && !current) {
    return (
      <div className={cn(rowClass, 'cursor-not-allowed opacity-70')} aria-disabled='true'>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={cn(
        rowClass,
        !current && 'hover:bg-white/80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]'
      )}
    >
      {body}
    </Link>
  );
}
