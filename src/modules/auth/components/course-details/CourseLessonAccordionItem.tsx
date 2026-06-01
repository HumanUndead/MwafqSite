import { ChevronDown } from 'lucide-react';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { CourseLesson } from '@/modules/auth/course.types';
import {
  formatCourseDuration,
  lessonDurationMinutes,
} from '@/modules/auth/courseDetails.shared';

import { CourseLectureRow } from './CourseLectureRow';

type CourseLessonAccordionItemProps = {
  lesson: CourseLesson;
};

export function CourseLessonAccordionItem({
  lesson,
}: CourseLessonAccordionItemProps) {
  const duration = lessonDurationMinutes(lesson.lectures);

  return (
    <AccordionItem
      value={`lesson-${lesson.id}`}
      className='border-b border-[#e5e7f0] last:border-b-0'
    >
      <AccordionTrigger className='flex w-full items-center justify-between gap-3 rounded-none border-0 bg-[#eef0f7] px-[18px] py-3.5 text-[14.5px] font-bold text-[#1e2364] hover:bg-[#e8ebf3] hover:no-underline focus-visible:ring-[#00a8f1]/20 [&_[data-slot=accordion-trigger-icon]]:hidden'>
        <span className='flex min-w-0 flex-1 items-center gap-2.5 text-left'>
          <ChevronDown className='size-4 shrink-0 text-[#1e2364] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-aria-expanded/accordion-trigger:rotate-180' />
          {lesson.name}
        </span>
        {duration > 0 ? (
          <span className='text-[13px] font-semibold text-[#6b7196]'>
            {formatCourseDuration(duration)}
          </span>
        ) : null}
      </AccordionTrigger>
      <AccordionContent className='bg-white py-1 pb-2.5'>
        <ul>
          {lesson.lectures.map((lecture) => (
            <CourseLectureRow key={lecture.id} name={lecture.name} />
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
