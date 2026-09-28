'use client';

import { ClipboardCheck } from 'lucide-react';

import { Accordion } from '@/components/ui/accordion';
import {
  AcademySectionTitle,
  GlassPanel,
} from '@/modules/academy/components/ui/AcademyGlass';
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
  /** Optional `{{count}} lectures` template shown in each section header. */
  lectures?: string;
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
    <section aria-labelledby='course-content-title'>
      <AcademySectionTitle className='mb-1'>
        <span id='course-content-title'>{labels.title}</span>
      </AcademySectionTitle>
      <p className='mb-4 text-sm text-[#6b7196]'>{labels.meta}</p>

      {lessons.length > 0 ? (
        <GlassPanel className='overflow-hidden rounded-[20px]'>
          <Accordion multiple defaultValue={defaultOpen}>
            {lessons.map((lesson) => (
              <CourseLessonAccordionItem
                key={lesson.id}
                lesson={lesson}
                labels={labels}
              />
            ))}
          </Accordion>
        </GlassPanel>
      ) : null}

      {courseQuizzes.length > 0 && (
        <GlassPanel className='mt-4 overflow-hidden rounded-[20px]'>
          <p className='flex items-center gap-3 border-b border-[#e5e7f0] bg-white/40 px-4 py-4 text-base font-bold text-[#1e2364] sm:px-5'>
            <span
              aria-hidden
              className='flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200'
            >
              <ClipboardCheck className='size-4 text-amber-600' />
            </span>
            {labels.quizzesAndExams}
          </p>
          <ul className='bg-white/60 py-1.5 pb-2.5'>
            {courseQuizzes.map((quiz) => (
              <CourseQuizRow key={quiz.id} quiz={quiz} labels={labels} />
            ))}
          </ul>
        </GlassPanel>
      )}
    </section>
  );
}
