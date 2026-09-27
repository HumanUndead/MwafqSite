'use client';

import { Accordion } from '@/components/ui/accordion';
import type { CourseLesson, CourseViewQuiz } from '@/modules/auth/course.types';

import { CourseLessonAccordionItem } from './CourseLessonAccordionItem';
import { CourseQuizRow } from './CourseLectureRow';

export type CourseContentAccordionLabels = {
  title: string;
  meta: string;
  quiz: string;
  finalExam: string;
  quizzesAndExams: string;
  minutes: string;
};

type CourseContentAccordionProps = {
  lessons: CourseLesson[];
  /** Course-level quizzes and final exams. */
  courseQuizzes?: CourseViewQuiz[];
  labels: CourseContentAccordionLabels;
};

export function CourseContentAccordion({
  lessons,
  courseQuizzes = [],
  labels,
}: CourseContentAccordionProps) {
  const defaultOpen =
    lessons.length > 0 ? [`lesson-${lessons[0]!.id}`] : undefined;

  return (
    <div>
      <div className='mb-3 inline-block text-[19px] font-extrabold tracking-[-0.3px] text-[#1e2364]'>
        {labels.title}
      </div>
      <p className='mb-3.5 text-[13px] text-[#6b7196]'>{labels.meta}</p>

      <Accordion
        multiple
        defaultValue={defaultOpen}
        className='overflow-hidden rounded-xl border border-[#e5e7f0] bg-white'
      >
        {lessons.map((lesson) => (
          <CourseLessonAccordionItem key={lesson.id} lesson={lesson} labels={labels} />
        ))}
      </Accordion>

      {courseQuizzes.length > 0 && (
        <div className='mt-4 overflow-hidden rounded-xl border border-[#e5e7f0] bg-white'>
          <p className='bg-[#eef0f7] px-[18px] py-3.5 text-[14.5px] font-bold text-[#1e2364]'>
            {labels.quizzesAndExams}
          </p>
          <ul className='py-1 pb-2.5'>
            {courseQuizzes.map((quiz) => (
              <CourseQuizRow key={quiz.id} quiz={quiz} labels={labels} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
