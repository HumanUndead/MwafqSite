'use client';

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { CheckCircle2, ChevronDown, ClipboardCheck, Lock, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type Ref } from 'react';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import type { Dictionary } from '@/locales/types';
import { Panel, Skeleton } from '@/shared/components/product';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { CourseProgressBar } from '../CourseProgressBar';
import { isCourseQuizLocked, isItemLocked } from '../../courseLocking.shared';
import { lecturePath, quizPath } from '../../learnRoutes.shared';
import type { CourseData, CourseItem, CoursePlayerLesson } from '../../types/player.types';

type CurriculumLabels = Dictionary['academyPlayer'];

interface LectureCurriculumProps {
  courseData: CourseData | null;
  courseName: string;
  currentLectureId: number;
  /** Local completion of the current lecture (ahead of the cached detail). */
  currentCompleted: boolean;
  locale: Locale;
  userCourseId: number;
  courseId: number;
  className?: string;
}

/**
 * Course content: progress and lessons with each item's state. A sticky
 * side panel on desktop; a collapsed panel under the lecture on mobile.
 */
export function LectureCurriculum({
  courseData,
  courseName,
  currentLectureId,
  currentCompleted,
  locale,
  userCourseId,
  courseId,
  className,
}: LectureCurriculumProps) {
  const t = useTranslations('academyPlayer');
  const listId = useId();
  const headingId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLAnchorElement>(null);
  const currentKey = String(currentLectureId);
  const loaded = courseData !== null;

  // Bring the current lecture into view inside the scrolling side panel.
  useEffect(() => {
    const list = listRef.current;
    const row = currentRef.current;
    if (!loaded || !list || !row) return;
    list.scrollTop = Math.max(0, row.offsetTop - 96);
  }, [loaded]);

  const isCurrent = (item: CourseItem) => item.type === 'lecture' && item.id === currentKey;
  const isDone = (item: CourseItem) => item.isCompleted || (isCurrent(item) && currentCompleted);
  const itemHref = (item: CourseItem) =>
    item.type === 'quiz'
      ? quizPath(locale, userCourseId, courseId, item.id)
      : lecturePath(locale, userCourseId, courseId, item.id);

  const progress = Math.round(courseData?.currentProgress ?? 0);
  const currentLessonIds =
    courseData?.sections
      .filter((section) => section.type === 'lesson')
      .map((section) => section.data as CoursePlayerLesson)
      .filter((lesson) => lesson.items.some(isCurrent))
      .map((lesson) => lesson.id) ?? [];

  return (
    <aside aria-labelledby={headingId} className={className}>
      <Panel flush className='flex flex-col overflow-hidden lg:max-h-[calc(100vh-130px)]'>
        <div className='border-b border-[#eef0f7] px-5 py-4'>
          <div className='flex items-center justify-between gap-3'>
            <h2 id={headingId} className='text-[17px] font-bold leading-6 text-[#1e2364]'>
              {t.courseCurriculum}
            </h2>
            <Button
              type='button'
              variant='productText'
              size='compact'
              aria-expanded={mobileOpen}
              aria-controls={listId}
              onClick={() => setMobileOpen((open) => !open)}
              className='-me-2 lg:hidden'
            >
              {mobileOpen ? t.hideCurriculum : t.showCurriculum}
              <ChevronDown
                className={cn('size-4', mobileOpen && 'rotate-180')}
                aria-hidden
              />
            </Button>
          </div>
          <p className='mt-1 break-words text-[14px] font-semibold leading-6 text-[#4a5078]'>
            {courseName}
          </p>
          <div className='mt-3 flex items-center justify-between gap-3 text-[13px] font-semibold'>
            <span className='text-[#6b7196]'>{t.yourProgress}</span>
            <bdi className='tabular-nums text-[#1e2364]'>{progress}%</bdi>
          </div>
          <CourseProgressBar value={progress} className='mt-2' />
        </div>

        <div
          id={listId}
          ref={listRef}
          className={cn('relative min-h-0 flex-1 overflow-y-auto lg:block', !mobileOpen && 'max-lg:hidden')}
        >
          {!courseData ? (
            <div className='flex flex-col gap-2 p-5'>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className='h-11 w-full rounded-xl' />
              ))}
            </div>
          ) : (
            <Accordion multiple defaultValue={currentLessonIds} className='divide-y divide-[#eef0f7]'>
              {courseData.sections.map((section, sectionIndex) => {
                if (section.type === 'attachments') return null;

                if (section.type === 'lesson') {
                  const lesson = section.data as CoursePlayerLesson;
                  const items = [...lesson.items].sort((a, b) => a.rank - b.rank);
                  const done = items.filter(isDone).length;
                  const allDone = items.length > 0 && done === items.length;

                  return (
                    <AccordionItem
                      key={`lesson-${lesson.id}`}
                      value={lesson.id}
                      className='not-last:border-b-0'
                    >
                      <AccordionPrimitive.Header>
                        <AccordionPrimitive.Trigger className='group flex w-full cursor-pointer items-start gap-3 px-5 py-3.5 text-start transition-colors duration-150 hover:bg-[#f7f8fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00a8f1]'>
                          <span
                            className={cn(
                              'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-[13px] font-bold tabular-nums',
                              allDone ? 'bg-green-50 text-green-700' : 'bg-[#f0f1f6] text-[#4a5078]'
                            )}
                          >
                            {allDone ? (
                              <CheckCircle2 className='size-4' aria-label={t.completedBadge} />
                            ) : (
                              sectionIndex + 1
                            )}
                          </span>
                          <span className='min-w-0 flex-1'>
                            <span className='block break-words text-[14px] font-bold leading-6 text-[#1e2364]'>
                              {lesson.title}
                            </span>
                            <span className='block text-[12.5px] font-semibold tabular-nums text-[#6b7196]'>
                              {interpolate(t.progressSummary, {
                                completed: done,
                                total: items.length,
                              })}
                              {lesson.isRevision ? ` · ${t.revision}` : null}
                            </span>
                          </span>
                          <ChevronDown
                            className='mt-1 size-4 shrink-0 text-[#6b7196] group-aria-expanded:rotate-180'
                            aria-hidden
                          />
                        </AccordionPrimitive.Trigger>
                      </AccordionPrimitive.Header>
                      <AccordionContent className='pb-2 [&_a]:no-underline [&_a]:hover:text-inherit [&_p:not(:last-child)]:mb-0'>
                        <ul>
                          {items.map((item, itemIndex) => (
                            <li key={`${item.type}-${item.id}`}>
                              <CurriculumRow
                                item={item}
                                current={isCurrent(item)}
                                done={isDone(item)}
                                locked={isItemLocked(courseData, lesson.id, itemIndex)}
                                lockReason={
                                  lesson.isRevision || item.isRevision
                                    ? t.lockedRevisionHint
                                    : t.lockedHint
                                }
                                href={itemHref(item)}
                                rowRef={isCurrent(item) ? currentRef : undefined}
                                labels={t}
                              />
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  );
                }

                const quizItem = section.data as CourseItem;
                const isExam = section.type === 'exam' || Boolean(quizItem.isExam);
                return (
                  <div key={`${section.type}-${quizItem.id}`} className='py-1'>
                    <CurriculumRow
                      item={quizItem}
                      current={false}
                      done={quizItem.isCompleted}
                      locked={isCourseQuizLocked(courseData, quizItem)}
                      lockReason={
                        quizItem.isRevision
                          ? t.lockedRevisionHint
                          : isExam
                            ? t.lockedExamHint
                            : t.lockedHint
                      }
                      href={itemHref(quizItem)}
                      isExam={isExam}
                      labels={t}
                    />
                  </div>
                );
              })}
            </Accordion>
          )}
        </div>
      </Panel>
    </aside>
  );
}

function CurriculumRow({
  item,
  current,
  done,
  locked,
  lockReason,
  href,
  isExam,
  rowRef,
  labels: t,
}: {
  item: CourseItem;
  current: boolean;
  done: boolean;
  locked: boolean;
  lockReason: string;
  href: string;
  isExam?: boolean;
  rowRef?: Ref<HTMLAnchorElement>;
  labels: CurriculumLabels;
}) {
  const isQuiz = item.type === 'quiz';
  const typeLabel = isQuiz ? (isExam ? t.exam : t.quiz) : t.lecture;
  const blocked = locked && !current;

  const StatusIcon = done ? CheckCircle2 : blocked ? Lock : isQuiz ? ClipboardCheck : PlayCircle;
  const statusLabel = done ? t.completedBadge : blocked ? t.locked : undefined;

  const body = (
    <>
      {current ? (
        <span aria-hidden className='absolute inset-y-1.5 start-0 w-[3px] rounded-e-full bg-[#00a8f1]' />
      ) : null}
      <span className='flex size-7 shrink-0 items-center justify-center'>
        <StatusIcon
          className={cn(
            'size-[18px]',
            done ? 'text-green-600' : current ? 'text-[#0077ad]' : 'text-[#6b7196]'
          )}
          aria-hidden
        />
      </span>
      <span className='min-w-0 flex-1'>
        <span
          className={cn(
            'block break-words text-[14px] leading-6',
            current ? 'font-bold text-[#1e2364]' : 'font-semibold',
            blocked ? 'text-[#6b7196]' : 'text-[#1e2364]'
          )}
        >
          {item.title}
        </span>
        <span className='block text-[12.5px] font-semibold text-[#6b7196]'>
          {blocked ? (
            <>
              {t.locked} · {lockReason}
            </>
          ) : (
            <>
              {typeLabel}
              {item.duration ? (
                <>
                  {' · '}
                  <bdi className='tabular-nums'>{item.duration}</bdi> {t.minutes}
                </>
              ) : null}
              {item.isExtraLecture ? ` · ${t.extraContent}` : null}
              {item.isRevision ? ` · ${t.revision}` : null}
              {statusLabel ? <span className='sr-only'> · {statusLabel}</span> : null}
            </>
          )}
        </span>
      </span>
    </>
  );

  const rowClass = 'relative flex items-start gap-3 px-5 py-2.5';

  if (blocked) {
    return <div className={cn(rowClass, 'cursor-not-allowed')}>{body}</div>;
  }

  return (
    <Link
      ref={rowRef}
      href={href}
      aria-current={current ? 'page' : undefined}
      className={cn(
        rowClass,
        'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00a8f1]',
        current ? 'bg-[#f0faff]' : 'hover:bg-[#f7f8fb]'
      )}
    >
      {body}
    </Link>
  );
}
