import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import {
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Download,
  History,
  Layers,
  ListChecks,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/locales/types';
import { cn } from '@/shared/lib/cn';
import { isCourseQuizLocked, isItemLocked } from '../../courseLocking.shared';
import { quizHistoryPath, quizPath } from '../../learnRoutes.shared';
import type {
  CourseData,
  CourseItem,
  CoursePlayerLesson,
} from '../../types/player.types';
import { AcademySectionTitle, GlassPanel, StatChip } from '../ui/AcademyGlass';
import { CurriculumItemRow, historyLinkClass, labelsFrom } from './CurriculumItemRow';

type PlayerT = Dictionary['academyPlayer'];

interface OverviewCurriculumProps {
  t: PlayerT;
  courseData: CourseData;
  totalItems: number;
  locale: Locale;
  userCourseId: number;
  courseId: number;
  currentItem?: CourseItem;
}

function isCurrent(item: CourseItem, current?: CourseItem) {
  return !!current && current.id === item.id && current.type === item.type;
}

export function OverviewCurriculum({
  t,
  courseData,
  totalItems,
  locale,
  userCourseId,
  courseId,
  currentItem,
}: OverviewCurriculumProps) {
  const labels = labelsFrom(t);

  return (
    <section aria-labelledby='course-curriculum-title'>
      <AcademySectionTitle
        className='flex-wrap'
        action={
          <div className='flex flex-wrap gap-2'>
            <StatChip icon={<Layers aria-hidden className='size-4 text-[#00a8f1]' />}>
              {courseData.sections.length} {t.sectionsCount}
            </StatChip>
            <StatChip icon={<ListChecks aria-hidden className='size-4 text-[#00a8f1]' />}>
              {totalItems} {t.itemsCount}
            </StatChip>
          </div>
        }
      >
        <span id='course-curriculum-title'>{t.courseCurriculum}</span>
      </AcademySectionTitle>

      <GlassPanel className='overflow-hidden'>
        <Accordion
          multiple
          defaultValue={courseData.sections
            .filter((s) => s.type === 'lesson')
            .slice(0, 1)
            .map((s) => (s.data as CoursePlayerLesson).id)}
          className='divide-y divide-[#e5e7f0]'
        >
          {courseData.sections.map((section, sectionIndex) => {
            if (section.type === 'lesson' || section.type === 'attachments') {
              const lesson = section.data as CoursePlayerLesson;
              const completed = lesson.items.filter((i) => i.isCompleted).length;
              const isAttachments = section.type === 'attachments';
              const minutes = lesson.items.reduce(
                (acc, i) =>
                  i.type === 'attachment' ? acc : acc + (Number(i.duration) || 0),
                0
              );
              const pct = lesson.items.length
                ? (completed / lesson.items.length) * 100
                : 0;
              const done = !isAttachments && lesson.items.length > 0 && completed === lesson.items.length;

              return (
                <AccordionItem key={lesson.id} value={lesson.id} className='border-b-0'>
                  <AccordionPrimitive.Header>
                    <AccordionPrimitive.Trigger className='group w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00a8f1]'>
                      <div className='flex items-center gap-4 px-4 py-4 transition-colors group-hover:bg-white/60 sm:px-5'>
                        <span
                          className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-xl text-[14px] font-bold ring-1',
                            done
                              ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
                              : 'bg-[#1e2364]/5 text-[#1e2364] ring-[#e5e7f0]'
                          )}
                        >
                          {isAttachments ? (
                            <Download aria-hidden className='size-5 text-[#00a8f1]' />
                          ) : done ? (
                            <CheckCircle2 aria-hidden className='size-5' />
                          ) : (
                            sectionIndex + 1
                          )}
                        </span>
                        <div className='min-w-0 flex-1'>
                          <h3 className='flex flex-wrap items-center gap-2 text-[16px] font-bold text-[#1e2364]'>
                            {isAttachments ? t.courseAttachments : lesson.title}
                            {lesson.isRevision && (
                              <span className='rounded-full bg-amber-50 px-2 py-0.5 text-[12px] font-semibold text-amber-700 ring-1 ring-amber-200'>
                                {t.revision}
                              </span>
                            )}
                          </h3>
                          <div className='mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[#6b7196]'>
                            <span>
                              {isAttachments
                                ? `${lesson.items.length} ${t.files}`
                                : `${completed} ${t.of} ${lesson.items.length} ${t.completed}`}
                            </span>
                            {!isAttachments && minutes > 0 && (
                              <span className='inline-flex items-center gap-1'>
                                <Clock aria-hidden className='size-3.5' />
                                {minutes} {t.minutes}
                              </span>
                            )}
                            {!isAttachments && (
                              <span className='h-1 w-24 overflow-hidden rounded-full bg-[#e5e7f0]'>
                                <span
                                  className={cn(
                                    'block h-full rounded-full transition-[width] duration-300',
                                    done ? 'bg-emerald-500' : 'bg-[#00a8f1]'
                                  )}
                                  style={{ width: `${pct}%` }}
                                />
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronDown
                          aria-hidden
                          className='size-5 shrink-0 text-[#6b7196] transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none'
                        />
                      </div>
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionContent className='p-0 [&_a]:no-underline [&_a]:hover:text-inherit [&_p]:mb-0'>
                    <ul className='divide-y divide-[#e5e7f0]/80 border-t border-[#e5e7f0] bg-[#f3f4f8]/50'>
                      {lesson.items
                        .slice()
                        .sort((a, b) => a.rank - b.rank)
                        .map((item, itemIndex) => (
                          <CurriculumItemRow
                            key={item.id}
                            item={item}
                            locked={
                              isAttachments
                                ? false
                                : isItemLocked(courseData, lesson.id, itemIndex)
                            }
                            current={isCurrent(item, currentItem)}
                            locale={locale}
                            userCourseId={userCourseId}
                            courseId={courseId}
                            labels={labels}
                          />
                        ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            }

            const quizItem = section.data as CourseItem;
            return (
              <CourseQuizRow
                key={`${section.type}-${quizItem.id}`}
                t={t}
                quizItem={quizItem}
                locked={isCourseQuizLocked(courseData, quizItem)}
                isExam={section.type === 'exam' || !!quizItem.isExam}
                current={isCurrent(quizItem, currentItem)}
                locale={locale}
                userCourseId={userCourseId}
                courseId={courseId}
              />
            );
          })}
        </Accordion>
      </GlassPanel>
    </section>
  );
}

function CourseQuizRow({
  t,
  quizItem,
  locked,
  isExam,
  current,
  locale,
  userCourseId,
  courseId,
}: {
  t: PlayerT;
  quizItem: CourseItem;
  locked: boolean;
  isExam: boolean;
  current: boolean;
  locale: Locale;
  userCourseId: number;
  courseId: number;
}) {
  const body = (
    <div className='flex min-w-0 flex-1 items-center gap-4'>
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
          locked
            ? 'bg-amber-50 text-amber-500 ring-amber-200'
            : quizItem.isCompleted
              ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
              : current
                ? 'bg-[#00a8f1] text-white ring-[#00a8f1]'
                : 'bg-[#1e2364] text-white ring-[#1e2364]'
        )}
      >
        {locked ? (
          <Lock aria-hidden className='size-5' />
        ) : quizItem.isCompleted ? (
          <CheckCircle2 aria-hidden className='size-5' />
        ) : (
          <ClipboardCheck aria-hidden className='size-5' />
        )}
      </span>
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <h3
            className={cn(
              'text-[16px] font-bold transition-colors',
              locked ? 'text-[#6b7196]' : 'text-[#1e2364] group-hover/quiz:text-[#00a8f1]'
            )}
          >
            {quizItem.title}
          </h3>
          {isExam && (
            <span className='rounded-full bg-[#1e2364]/5 px-2 py-0.5 text-[12px] font-semibold text-[#1e2364] ring-1 ring-[#1e2364]/15'>
              {t.exam}
            </span>
          )}
          {quizItem.isRevision && (
            <span className='rounded-full bg-amber-50 px-2 py-0.5 text-[12px] font-semibold text-amber-700 ring-1 ring-amber-200'>
              {t.revision}
            </span>
          )}
        </div>
        <div className='mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#6b7196]'>
          <span className='inline-flex items-center gap-1'>
            <Clock aria-hidden className='size-3.5' />
            {quizItem.duration} {t.minutes}
          </span>
          {!locked && isExam && (
            <span className='font-semibold text-[#1e2364]'>{t.finalExam}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:px-5',
        locked
          ? 'cursor-not-allowed bg-[#f3f4f8]/60'
          : current
            ? 'bg-[#00a8f1]/[0.07]'
            : 'hover:bg-white/60'
      )}
    >
      {current && !locked && (
        <span aria-hidden className='absolute inset-y-2 start-0 w-1 rounded-e-full bg-[#00a8f1]' />
      )}
      {locked ? (
        body
      ) : (
        <Link
          href={quizPath(locale, userCourseId, courseId, quizItem.id)}
          className='group/quiz flex min-w-0 flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]'
          aria-current={current ? 'step' : undefined}
        >
          {body}
        </Link>
      )}
      <div className='flex shrink-0 items-center gap-2 ps-14 sm:ps-0'>
        {!locked && (
          <Link
            href={quizHistoryPath(locale, userCourseId, courseId, quizItem.id)}
            className={historyLinkClass}
          >
            <History aria-hidden className='size-3.5' />
            {t.history}
          </Link>
        )}
        {locked ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-700 ring-1 ring-amber-200'>
            <Lock aria-hidden className='size-3' />
            {t.locked}
          </span>
        ) : quizItem.isCompleted ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200'>
            <CheckCircle2 aria-hidden className='size-3.5' />
            {t.completedBadge}
          </span>
        ) : (
          <span className='rounded-full bg-[#00a8f1]/10 px-2.5 py-1 text-[12px] font-semibold text-[#0090d1]'>
            {t.start}
          </span>
        )}
      </div>
    </div>
  );
}
