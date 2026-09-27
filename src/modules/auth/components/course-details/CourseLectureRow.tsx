import { ClipboardCheck, Lock, Play, Trophy } from 'lucide-react';

import type { CourseViewQuiz } from '@/modules/auth/course.types';
import { interpolate } from '@/shared/lib/interpolate';

type CourseLectureRowProps = {
  name: string;
};

export function CourseLectureRow({ name }: CourseLectureRowProps) {
  return (
    <li className='flex min-w-0 items-center gap-3 px-[18px] py-2 ps-11 text-[13.5px] wrap-break-word text-[#6b7196]'>
      <Play className='size-4 shrink-0 fill-[#00a8f1] text-[#00a8f1]' aria-hidden />
      <span className='min-w-0 flex-1'>{name}</span>
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
    <li className='flex min-w-0 items-center gap-3 px-[18px] py-2 ps-11 text-[13.5px] wrap-break-word text-[#6b7196]'>
      <Icon className={quiz.isExam ? 'size-4 shrink-0 text-amber-500' : 'size-4 shrink-0 text-[#00a8f1]'} aria-hidden />
      <span className='min-w-0 flex-1'>
        {quiz.title}
        <span className='ms-2 text-xs font-semibold text-[#9aa0bd]'>
          {quiz.isExam ? labels.finalExam : labels.quiz}
          {minutes > 0 ? ` · ${interpolate(labels.minutes, { count: minutes })}` : ''}
        </span>
      </span>
      <Lock className='size-3.5 shrink-0 text-[#9aa0bd]' aria-hidden />
    </li>
  );
}
