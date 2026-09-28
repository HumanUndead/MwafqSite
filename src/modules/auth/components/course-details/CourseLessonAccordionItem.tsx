import { ChevronDown, Clock, PlayCircle } from 'lucide-react';

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
import { interpolate } from '@/shared/lib/interpolate';

import { CourseLectureRow, CourseQuizRow } from './CourseLectureRow';

type CourseLessonAccordionItemProps = {
  lesson: CourseLesson;
  labels: {
    quiz: string;
    finalExam: string;
    minutes: string;
    /** Optional `{{count}} lectures` template for the section header. */
    lectures?: string;
  };
};

export function CourseLessonAccordionItem({
  lesson,
  labels,
}: CourseLessonAccordionItemProps) {
  const duration = lessonDurationMinutes(lesson.lectures);
  const lectureCount = lesson.lectures.length;

  return (
    <AccordionItem
      value={`lesson-${lesson.id}`}
      className='border-b border-[#e5e7f0] last:border-b-0'
    >
      <AccordionTrigger className='flex w-full items-center gap-3 rounded-none border-0 bg-white/40 px-4 py-4 text-start text-[#1e2364] transition-colors hover:bg-white/80 hover:no-underline focus-visible:border-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00a8f1] aria-expanded:bg-white/80 motion-reduce:transition-none sm:px-5 [&_[data-slot=accordion-trigger-icon]]:hidden'>
        <span
          aria-hidden
          className='flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1e2364]/5 ring-1 ring-[#e5e7f0]'
        >
          <ChevronDown className='size-4 text-[#1e2364] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-aria-expanded/accordion-trigger:rotate-180 motion-reduce:transition-none' />
        </span>
        <span className='min-w-0 flex-1 text-base font-bold leading-snug wrap-break-word'>
          {lesson.name}
        </span>
        <span className='flex shrink-0 flex-col items-end gap-1 text-xs font-semibold text-[#6b7196] sm:flex-row sm:items-center sm:gap-3'>
          {lectureCount > 0 ? (
            <span className='inline-flex items-center gap-1'>
              <PlayCircle className='size-3.5' aria-hidden />
              {labels.lectures
                ? interpolate(labels.lectures, { count: lectureCount })
                : lectureCount}
            </span>
          ) : null}
          {duration > 0 ? (
            <span className='inline-flex items-center gap-1 tabular-nums'>
              <Clock className='size-3.5' aria-hidden />
              {formatCourseDuration(duration)}
            </span>
          ) : null}
        </span>
      </AccordionTrigger>
      <AccordionContent className='border-t border-[#e5e7f0]/70 bg-white/60 py-1.5 pb-2.5'>
        <ul>
          {lesson.lectures.map((lecture) => (
            <CourseLectureRow
              key={lecture.id}
              name={lecture.name}
              minutes={lecture.videoLengthInMinutes}
            />
          ))}
          {(lesson.quizzes ?? []).map((quiz) => (
            <CourseQuizRow key={`quiz-${quiz.id}`} quiz={quiz} labels={labels} />
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
