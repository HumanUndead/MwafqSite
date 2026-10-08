import { ChevronDown } from 'lucide-react';

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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

export function CourseLessonAccordionItem({ lesson, labels }: CourseLessonAccordionItemProps) {
  const duration = lessonDurationMinutes(lesson.lectures);
  const lectureCount = lesson.lectures.length;

  return (
    <AccordionItem value={`lesson-${lesson.id}`} className='border-[#eef0f7]'>
      <AccordionTrigger className='flex w-full items-center gap-3 rounded-none border-0 px-5 py-4 text-start text-[#1e2364] transition-colors duration-150 hover:bg-[#f7f8fb] hover:no-underline focus-visible:border-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00a8f1] sm:px-6 [&_[data-slot=accordion-trigger-icon]]:hidden'>
        <span className='min-w-0 flex-1'>
          <span className='block text-[15px] font-bold leading-6 wrap-break-word'>
            {lesson.name}
          </span>
          {lectureCount > 0 || duration > 0 ? (
            <span className='mt-0.5 flex flex-wrap gap-x-3 text-[13px] font-semibold text-[#6b7196]'>
              {lectureCount > 0 ? (
                <span>
                  {labels.lectures
                    ? interpolate(labels.lectures, { count: lectureCount })
                    : lectureCount}
                </span>
              ) : null}
              {duration > 0 ? (
                <span dir='ltr' className='tabular-nums'>
                  {formatCourseDuration(duration)}
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden
          className='size-5 shrink-0 text-[#6b7196] transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-180 motion-reduce:transition-none'
        />
      </AccordionTrigger>
      <AccordionContent className='pb-2'>
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
