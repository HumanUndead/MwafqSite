import { ClipboardCheck, Lock, PlayCircle, Trophy } from 'lucide-react';

import type { CourseViewQuiz } from '@/modules/auth/course.types';
import { formatCourseDuration } from '@/modules/auth/courseDetails.shared';
import { interpolate } from '@/shared/lib/interpolate';
import { cn } from '@/shared/lib/cn';

const rowClass =
  'flex min-w-0 items-center gap-3 py-2.5 pe-4 ps-5 text-sm text-[#4a4f78] sm:pe-5 sm:ps-14';

type CourseLectureRowProps = {
  name: string;
  /** Video length; shown on the end side when known. */
  minutes?: number | null;
};

export function CourseLectureRow({ name, minutes }: CourseLectureRowProps) {
  return (
    <li className={rowClass}>
      <PlayCircle className='size-[18px] shrink-0 text-[#00a8f1]' strokeWidth={2} aria-hidden />
      <span className='min-w-0 flex-1 wrap-break-word'>{name}</span>
      {minutes && minutes > 0 ? (
        <span className='shrink-0 text-xs font-semibold text-[#6b7196] tabular-nums'>
          {formatCourseDuration(minutes)}
        </span>
      ) : null}
      <Lock className='size-3.5 shrink-0 text-[#9aa0bd]' aria-hidden />
    </li>
  );
}

type CourseQuizRowProps = {
  quiz: CourseViewQuiz;
  labels: { quiz: string; finalExam: string; minutes: string };
};

/** Locked quiz / exam row in the public curriculum. */
export function CourseQuizRow({ quiz, labels }: CourseQuizRowProps) {
  const minutes = quiz.timerMintues ?? quiz.timerMinutes ?? 0;
  const Icon = quiz.isExam ? Trophy : ClipboardCheck;
  return (
    <li className={rowClass}>
      <Icon
        className={cn(
          'size-[18px] shrink-0',
          quiz.isExam ? 'text-amber-500' : 'text-[#00a8f1]'
        )}
        strokeWidth={2}
        aria-hidden
      />
      <span className='flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1'>
        <span className='min-w-0 wrap-break-word'>{quiz.title}</span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            quiz.isExam
              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
              : 'bg-[#00a8f1]/10 text-[#0077ab] ring-1 ring-[#00a8f1]/20'
          )}
        >
          {quiz.isExam ? labels.finalExam : labels.quiz}
        </span>
      </span>
      {minutes > 0 ? (
        <span className='shrink-0 text-xs font-semibold text-[#6b7196] tabular-nums'>
          {interpolate(labels.minutes, { count: minutes })}
        </span>
      ) : null}
      <Lock className='size-3.5 shrink-0 text-[#9aa0bd]' aria-hidden />
    </li>
  );
}
