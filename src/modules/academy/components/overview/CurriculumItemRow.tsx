import { FileQuestion, Lock, Paperclip, PlayCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/locales/types';
import { StatusBadge } from '@/shared/components/product';
import { buttonVariants } from '@/shared/components/ui/Button';
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
    exam: t.finalExam,
    attachment: t.attachment,
    upNext: t.upNext,
  };
}

function typeLabel(item: CourseItem, labels: PlayerLabels) {
  if (item.type === 'lecture') return labels.lecture;
  if (item.type === 'quiz') return item.isExam ? labels.exam : labels.quiz;
  return labels.attachment;
}

function TypeIcon({ item, locked }: { item: CourseItem; locked: boolean }) {
  const className = 'mt-0.5 size-5 shrink-0';
  if (locked) return <Lock aria-hidden className={cn(className, 'text-[#9aa0bd]')} />;
  if (item.type === 'lecture') return <PlayCircle aria-hidden className={cn(className, 'text-[#6b7196]')} />;
  if (item.type === 'quiz') {
    const Icon = item.isExam ? Trophy : FileQuestion;
    return <Icon aria-hidden className={cn(className, 'text-[#6b7196]')} />;
  }
  return <Paperclip aria-hidden className={cn(className, 'text-[#6b7196]')} />;
}

/**
 * One curriculum row. State reads as text on the end side: locked, completed,
 * or "up next" for the item the resume button opens.
 */
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
  const minutes = Number(item.duration) || 0;

  const inner = (
    <div className='flex min-w-0 flex-1 items-start gap-3'>
      <TypeIcon item={item} locked={locked} />
      <div className='min-w-0 flex-1'>
        <p
          className={cn(
            'wrap-break-word text-[14px] font-semibold leading-6',
            locked ? 'text-[#6b7196]' : 'text-[#1e2364] group-hover/item:underline group-hover/item:underline-offset-4'
          )}
        >
          {item.title}
        </p>
        <p className='text-[13px] text-[#6b7196]'>
          {typeLabel(item, labels)}
          {item.type !== 'attachment' && minutes > 0 && (
            <>
              {' · '}
              <bdi className='tabular-nums'>{minutes}</bdi> {labels.minutes}
            </>
          )}
          {item.isExtraLecture && <> · {labels.extraContent}</>}
          {item.isRevision && <> · {labels.revision}</>}
        </p>
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
    'group/item flex min-w-0 flex-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2';

  const status = locked ? (
    <StatusBadge>{labels.locked}</StatusBadge>
  ) : item.isCompleted ? (
    <StatusBadge tone='success'>{labels.completedBadge}</StatusBadge>
  ) : current ? (
    <StatusBadge tone='info'>{labels.upNext}</StatusBadge>
  ) : null;

  const showHistory = !locked && item.type === 'quiz';

  return (
    <li
      className={cn(
        'relative flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6',
        current && !locked && 'bg-[#f0faff]'
      )}
    >
      {current && !locked && (
        <span aria-hidden className='absolute inset-y-0 start-0 w-[3px] bg-[#00a8f1]' />
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

      {status || showHistory ? (
        <div className='flex shrink-0 items-center gap-2 ps-8 sm:ps-0'>
          {status}
          {showHistory && (
            <Link
              href={quizHistoryPath(locale, userCourseId, courseId, item.id, item.lessonId)}
              className={buttonVariants({ variant: 'productText', size: 'compact' })}
            >
              {labels.history}
            </Link>
          )}
        </div>
      ) : null}
    </li>
  );
}
