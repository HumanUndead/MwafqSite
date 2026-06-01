'use client';

import { Accordion } from '@/components/ui/accordion';
import type { CourseLesson } from '@/modules/auth/course.types';

import { CourseLessonAccordionItem } from './CourseLessonAccordionItem';

export type CourseContentAccordionLabels = {
  title: string;
  meta: string;
};

type CourseContentAccordionProps = {
  lessons: CourseLesson[];
  labels: CourseContentAccordionLabels;
};

export function CourseContentAccordion({
  lessons,
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
        type='multiple'
        defaultValue={defaultOpen}
        className='overflow-hidden rounded-xl border border-[#e5e7f0] bg-white'
      >
        {lessons.map((lesson) => (
          <CourseLessonAccordionItem key={lesson.id} lesson={lesson} />
        ))}
      </Accordion>
    </div>
  );
}
