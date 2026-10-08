import { ClipboardCheck, PlayCircle, Trophy } from 'lucide-react';

import type { CourseViewQuiz } from '@/modules/auth/course.types';
import { formatCourseDuration } from '@/modules/auth/courseDetails.shared';
import { interpolate } from '@/shared/lib/interpolate';

// Rows are not links: lectures open after enrolment.
const rowClass =
  'flex min-w-0 items-start gap-3 px-5 py-2.5 text-[14px] leading-6 text-[#4a5078] sm:px-6';
const iconClass = 'mt-0.5 size-[18px] shrink-0 text-[#6b7196]';
const durationClass = 'shrink-0 text-[13px] font-semibold text-[#6b7196] tabular-nums';

type CourseLectureRowProps = {
  name: string;
  /** Video length; shown on the end side when known. */
  minutes?: number | null;
};

export function CourseLectureRow({ name, minutes }: CourseLectureRowProps) {
  return (
    <li className={rowClass}>
      <PlayCircle className={iconClass} aria-hidden />
      <span className='min-w-0 flex-1 wrap-break-word'>{name}</span>
      {minutes && minutes > 0 ? (
        <span dir='ltr' className={durationClass}>
          {formatCourseDuration(minutes)}
        </span>
      ) : null}
    </li>
  );
}

type CourseQuizRowProps = {
  quiz: CourseViewQuiz;
  labels: { quiz: string; finalExam: string; minutes: string };
};

/** Quiz / exam row in the public curriculum. */
export function CourseQuizRow({ quiz, labels }: CourseQuizRowProps) {
  const minutes = quiz.timerMintues ?? quiz.timerMinutes ?? 0;
  const Icon = quiz.isExam ? Trophy : ClipboardCheck;
  return (
    <li className={rowClass}>
      <Icon className={iconClass} aria-hidden />
      <span className='min-w-0 flex-1'>
        <span className='block wrap-break-word'>{quiz.title}</span>
        <span className='block text-[13px] font-semibold text-[#6b7196]'>
          {quiz.isExam ? labels.finalExam : labels.quiz}
        </span>
      </span>
      {minutes > 0 ? (
        <span className={durationClass}>{interpolate(labels.minutes, { count: minutes })}</span>
      ) : null}
    </li>
  );
}
