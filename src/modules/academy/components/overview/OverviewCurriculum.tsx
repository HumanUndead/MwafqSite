import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/locales/types';
import { Panel, PanelHeader, StatusBadge } from '@/shared/components/product';
import { interpolate } from '@/shared/lib/interpolate';
import { isCourseQuizLocked, isItemLocked } from '../../courseLocking.shared';
import type { CourseData, CourseItem, CoursePlayerLesson } from '../../types/player.types';
import { CurriculumItemRow, labelsFrom } from './CurriculumItemRow';

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

/** Enrolled curriculum: collapsible sections plus course-level quizzes / exams. */
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
  const rowProps = { locale, userCourseId, courseId, labels };
  // Open the section holding the resume item, else the first lesson.
  const currentSection = courseData.sections.find(
    (s) =>
      s.type === 'lesson' &&
      (s.data as CoursePlayerLesson).items.some((item) => isCurrent(item, currentItem))
  );
  const firstLesson = courseData.sections.find((s) => s.type === 'lesson');
  const openSection = (currentSection ?? firstLesson)?.data as CoursePlayerLesson | undefined;

  return (
    <Panel flush aria-labelledby='course-curriculum-title' className='overflow-hidden'>
      <PanelHeader
        id='course-curriculum-title'
        title={t.courseCurriculum}
        description={interpolate(t.sectionsItems, {
          sections: courseData.sections.length,
          items: totalItems,
        })}
        className='px-5 py-4 sm:px-6'
      />

      <Accordion
        multiple
        defaultValue={openSection ? [openSection.id] : []}
        className='divide-y divide-[#eef0f7] border-t border-[#eef0f7]'
      >
        {courseData.sections.map((section) => {
          if (section.type === 'lesson' || section.type === 'attachments') {
            const lesson = section.data as CoursePlayerLesson;
            const isAttachments = section.type === 'attachments';
            const completed = lesson.items.filter((i) => i.isCompleted).length;
            const minutes = lesson.items.reduce(
              (acc, i) => (i.type === 'attachment' ? acc : acc + (Number(i.duration) || 0)),
              0
            );
            const done =
              !isAttachments && lesson.items.length > 0 && completed === lesson.items.length;

            return (
              <AccordionItem key={lesson.id} value={lesson.id} className='border-b-0'>
                <AccordionPrimitive.Header>
                  <AccordionPrimitive.Trigger className='group flex w-full items-center gap-3 px-5 py-4 text-start transition-colors duration-150 hover:bg-[#f7f8fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00a8f1] sm:px-6'>
                    <span className='min-w-0 flex-1'>
                      <span className='block wrap-break-word text-[15px] font-bold leading-6 text-[#1e2364]'>
                        {isAttachments ? t.courseAttachments : lesson.title}
                      </span>
                      <span className='block text-[13px] text-[#6b7196]'>
                        {isAttachments ? (
                          <>
                            <bdi className='tabular-nums'>{lesson.items.length}</bdi> {t.files}
                          </>
                        ) : (
                          <>
                            {interpolate(t.progressSummary, {
                              completed,
                              total: lesson.items.length,
                            })}
                            {minutes > 0 && (
                              <>
                                {' · '}
                                <bdi className='tabular-nums'>{minutes}</bdi> {t.minutes}
                              </>
                            )}
                            {lesson.isRevision && <> · {t.revision}</>}
                          </>
                        )}
                      </span>
                    </span>
                    {done && <StatusBadge tone='success'>{t.completedBadge}</StatusBadge>}
                    <ChevronDown
                      aria-hidden
                      className='size-5 shrink-0 text-[#6b7196] transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none'
                    />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionContent className='p-0 [&_a]:no-underline [&_a]:hover:text-inherit [&_p]:mb-0'>
                  <ul className='divide-y divide-[#eef0f7] border-t border-[#eef0f7] bg-[#fafbfd]'>
                    {lesson.items
                      .slice()
                      .sort((a, b) => a.rank - b.rank)
                      .map((item, itemIndex) => (
                        <CurriculumItemRow
                          key={item.id}
                          item={item}
                          locked={
                            isAttachments ? false : isItemLocked(courseData, lesson.id, itemIndex)
                          }
                          current={isCurrent(item, currentItem)}
                          {...rowProps}
                        />
                      ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          }

          const quizItem = section.data as CourseItem;
          return (
            <ul key={`${section.type}-${quizItem.id}`}>
              <CurriculumItemRow
                item={{ ...quizItem, isExam: section.type === 'exam' || !!quizItem.isExam }}
                locked={isCourseQuizLocked(courseData, quizItem)}
                current={isCurrent(quizItem, currentItem)}
                {...rowProps}
              />
            </ul>
          );
        })}
      </Accordion>
    </Panel>
  );
}
