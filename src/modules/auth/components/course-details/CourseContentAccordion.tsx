'use client';

import { Accordion } from '@/components/ui/accordion';
import type { CourseLesson, CourseViewQuiz } from '@/modules/auth/course.types';
import { Panel, PanelHeader } from '@/shared/components/product';

import { CourseLessonAccordionItem } from './CourseLessonAccordionItem';
import { CourseQuizRow } from './CourseLectureRow';

export type CourseContentAccordionLabels = {
  title: string;
  meta: string;
  quiz: string;
  finalExam: string;
  quizzesAndExams: string;
  minutes: string;
  /** Optional `{{count}} lectures` template shown in each section header. */
  lectures?: string;
};

type CourseContentAccordionProps = {
  lessons: CourseLesson[];
  /** Course-level quizzes and final exams. */
  courseQuizzes?: CourseViewQuiz[];
  labels: CourseContentAccordionLabels;
};

/** Public curriculum: collapsible sections, then course-level quizzes/exams. */
export function CourseContentAccordion({
  lessons,
  courseQuizzes = [],
  labels,
}: CourseContentAccordionProps) {
  const defaultOpen = lessons.length > 0 ? [`lesson-${lessons[0]!.id}`] : undefined;

  return (
    <Panel flush aria-labelledby='course-content-title' className='overflow-hidden'>
      <PanelHeader
        id='course-content-title'
        title={labels.title}
        description={labels.meta}
        className='px-5 py-4 sm:px-6'
      />

      {lessons.length > 0 ? (
        <Accordion
          multiple
          defaultValue={defaultOpen}
          className='border-t border-[#eef0f7]'
        >
          {lessons.map((lesson) => (
            <CourseLessonAccordionItem key={lesson.id} lesson={lesson} labels={labels} />
          ))}
        </Accordion>
      ) : null}

      {courseQuizzes.length > 0 ? (
        <div className='border-t border-[#eef0f7]'>
          <h3 className='px-5 pb-1 pt-4 text-[15px] font-bold text-[#1e2364] sm:px-6'>
            {labels.quizzesAndExams}
          </h3>
          <ul className='pb-2'>
            {courseQuizzes.map((quiz) => (
              <CourseQuizRow key={quiz.id} quiz={quiz} labels={labels} />
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}
