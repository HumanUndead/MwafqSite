import {
  CheckCircle2,
  Clock,
  Download,
  FileQuestion,
  History,
  Lock,
  Paperclip,
  Play,
} from 'lucide-react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/locales/types';
import { cn } from '@/shared/lib/cn';
import { attachmentUrl } from '@/shared/lib/media';
import { lecturePath, quizHistoryPath, quizPath } from '../../learnRoutes.shared';
import type { CourseItem } from '../../types/player.types';

export type PlayerLabels = ReturnType<typeof labelsFrom>;

export function labelsFrom(t: Dictionary['academyPlayer']) {
  return {
    locked: t.locked,
    completedBadge: t.completedBadge,
    minutes: t.minutes,
    history: t.history,
    extraContent: t.extraContent,
    revision: t.revision,
    lecture: t.lecture,
    quiz: t.quiz,
    attachment: t.attachment,
  };
}

export const historyLinkClass =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#1e2364] ring-1 ring-[#e5e7f0] transition-colors hover:text-[#00a8f1] hover:ring-[#00a8f1]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]';

export function CurriculumItemRow({
  item,
  locked,
  current,
  locale,
  userCourseId,
  courseId,
  labels,
}: {
  item: CourseItem;
  locked: boolean;
  current: boolean;
  locale: Locale;
  userCourseId: number;
  courseId: number;
  labels: PlayerLabels;
}) {
  const typeLabel =
    item.type === 'lecture'
      ? labels.lecture
      : item.type === 'quiz'
        ? labels.quiz
        : labels.attachment;

  const TypeIcon =
    item.type === 'lecture' ? Play : item.type === 'quiz' ? FileQuestion : Paperclip;

  const icon = locked ? (
    <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500 ring-1 ring-amber-200'>
      <Lock aria-hidden className='size-4' />
    </span>
  ) : item.isCompleted ? (
    <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'>
      <CheckCircle2 aria-hidden className='size-5' />
    </span>
  ) : (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full ring-1 transition-colors',
        current
          ? 'bg-[#00a8f1] text-white ring-[#00a8f1]'
          : 'bg-white text-[#6b7196] ring-[#e5e7f0] group-hover/item:text-[#00a8f1]'
      )}
    >
      <TypeIcon aria-hidden className={cn('size-4', item.type === 'lecture' && 'rtl:rotate-180')} />
    </span>
  );

  const inner = (
    <div className='flex min-w-0 flex-1 items-center gap-3'>
      {icon}
      <div className='min-w-0 flex-1'>
        <p
          className={cn(
            'line-clamp-2 text-[14px] font-semibold transition-colors',
            locked
              ? 'text-[#6b7196]'
              : current
                ? 'text-[#0090d1]'
                : 'text-[#1e2364] group-hover/item:text-[#00a8f1]'
          )}
        >
          {item.title}
        </p>
        <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#6b7196]'>
          <span>{typeLabel}</span>
          {item.duration && item.type !== 'attachment' && (
            <span className='inline-flex items-center gap-1'>
              <Clock aria-hidden className='size-3.5' />
              {item.duration} {labels.minutes}
            </span>
          )}
          {item.isExtraLecture && (
            <span className='rounded-full bg-[#00a8f1]/10 px-2 py-0.5 font-semibold text-[#0090d1]'>
              {labels.extraContent}
            </span>
          )}
          {item.isRevision && (
            <span className='rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700 ring-1 ring-amber-200'>
              {labels.revision}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const href =
    item.type === 'lecture'
      ? lecturePath(locale, userCourseId, courseId, item.id)
      : item.type === 'quiz'
        ? quizPath(locale, userCourseId, courseId, item.id)
        : item.path
          ? attachmentUrl(item.path)
          : '#';

  const linkClass =
    'group/item flex min-w-0 flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]';

  return (
    <li
      className={cn(
        'relative flex flex-col gap-3 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:px-5',
        locked ? 'bg-[#f3f4f8]/60' : current ? 'bg-[#00a8f1]/[0.07]' : 'hover:bg-white/80'
      )}
    >
      {current && !locked && (
        <span aria-hidden className='absolute inset-y-2 start-0 w-1 rounded-e-full bg-[#00a8f1]' />
      )}
      {locked ? (
        inner
      ) : item.type === 'attachment' ? (
        <a href={href} target='_blank' rel='noopener noreferrer' className={linkClass}>
          {inner}
        </a>
      ) : (
        <Link href={href} className={linkClass} aria-current={current ? 'step' : undefined}>
          {inner}
        </Link>
      )}

      <div className='flex shrink-0 items-center gap-2 ps-12 sm:ps-0'>
        {!locked && item.type === 'quiz' && (
          <Link
            href={quizHistoryPath(locale, userCourseId, courseId, item.id, item.lessonId)}
            className={historyLinkClass}
          >
            <History aria-hidden className='size-3.5' />
            {labels.history}
          </Link>
        )}
        {locked ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-700 ring-1 ring-amber-200'>
            <Lock aria-hidden className='size-3' />
            {labels.locked}
          </span>
        ) : item.isCompleted ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200'>
            <CheckCircle2 aria-hidden className='size-3.5' />
            {labels.completedBadge}
          </span>
        ) : item.type === 'attachment' ? (
          <Download aria-hidden className='size-4 text-[#00a8f1]' />
        ) : null}
      </div>
    </li>
  );
}
