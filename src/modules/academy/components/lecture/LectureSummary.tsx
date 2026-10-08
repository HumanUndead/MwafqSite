'use client';

import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Lock } from 'lucide-react';
import Link from 'next/link';
import { useId } from 'react';
import type { Dictionary } from '@/locales/types';
import { Panel, StatusBadge } from '@/shared/components/product';
import { Button, buttonVariants } from '@/shared/components/ui/Button';
import { interpolate } from '@/shared/lib/interpolate';
import { cn } from '@/shared/lib/cn';
import type { NavItem } from '../../types/player.types';
import type { LecturePosition } from './lecturePosition';

/** Where the lecture sits, its title and status, and prev / complete / next. */
export function LectureSummary({
  lessonName,
  position,
  title,
  minutes,
  isRevision,
  isCompleted,
  canMarkManually,
  marking,
  onMarkComplete,
  prev,
  next,
  prevHref,
  nextHref,
  labels: t,
}: {
  lessonName?: string | null;
  position: LecturePosition | null;
  title: string;
  minutes: number;
  isRevision: boolean;
  isCompleted: boolean;
  canMarkManually: boolean;
  marking: boolean;
  onMarkComplete: () => void;
  prev: NavItem | null;
  next: NavItem | null;
  prevHref: string | null;
  nextHref: string | null;
  labels: Dictionary['academyLecture'];
}) {
  const lockReasonId = useId();
  const nextLabel = next?.type === 'quiz' ? t.goToQuiz : t.next;
  const prevLabel = prev?.type === 'quiz' ? t.previousQuiz : t.previous;
  const nextOpen = isCompleted && Boolean(nextHref);

  return (
    <Panel>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          {lessonName || position ? (
            <p className='flex flex-wrap items-center gap-x-2 text-[13px] font-semibold text-[#6b7196]'>
              {lessonName ? <span className='min-w-0 break-words'>{lessonName}</span> : null}
              {lessonName && position ? <span aria-hidden>·</span> : null}
              {position ? (
                <span className='tabular-nums'>
                  {interpolate(t.position, {
                    current: position.current,
                    total: position.total,
                  })}
                </span>
              ) : null}
            </p>
          ) : null}
          <h1 className='mt-1 break-words text-[22px] font-bold leading-8 text-[#1e2364] sm:text-[24px]'>
            {title}
          </h1>
          <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-semibold text-[#4a5078]'>
            {minutes > 0 ? (
              <span className='inline-flex items-center gap-1.5'>
                <Clock className='size-4 text-[#6b7196]' aria-hidden />
                <bdi className='tabular-nums'>{minutes}</bdi> {t.minutes}
              </span>
            ) : null}
            {isRevision ? <span>{t.revision}</span> : null}
            {isCompleted ? (
              <StatusBadge tone='success'>
                <CheckCircle2 className='size-3.5' aria-hidden />
                {t.completed}
              </StatusBadge>
            ) : null}
          </div>
        </div>

        {canMarkManually ? (
          <Button
            variant='product'
            size='control'
            type='button'
            className='shrink-0 max-sm:w-full'
            loading={marking}
            onClick={onMarkComplete}
          >
            {marking ? t.marking : t.markComplete}
          </Button>
        ) : null}
      </div>

      {prev || next ? (
        <nav
          aria-label={t.lectureProgress}
          className='mt-5 border-t border-[#eef0f7] pt-5'
        >
          <div className='flex flex-wrap items-center gap-3'>
            {prev && prevHref ? (
              <Link
                href={prevHref}
                className={cn(
                  buttonVariants({ variant: 'productSecondary', size: 'control' }),
                  'max-sm:flex-1'
                )}
              >
                <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
                {prevLabel}
              </Link>
            ) : null}

            {next ? (
              <div className='ms-auto flex items-center gap-3 max-sm:flex-1'>
                {!nextOpen ? (
                  <p
                    id={lockReasonId}
                    className='hidden items-center gap-1.5 text-[13px] font-semibold text-[#6b7196] sm:inline-flex'
                  >
                    <Lock className='size-4' aria-hidden />
                    {t.completeToUnlock}
                  </p>
                ) : null}
                {nextOpen && nextHref ? (
                  <Link
                    href={nextHref}
                    className={cn(
                      buttonVariants({ variant: 'product', size: 'control' }),
                      'max-sm:flex-1'
                    )}
                  >
                    {nextLabel}
                    <ChevronRight className='size-4 rtl:rotate-180' aria-hidden />
                  </Link>
                ) : (
                  <Button
                    type='button'
                    variant='productSecondary'
                    size='control'
                    disabled
                    aria-describedby={lockReasonId}
                    className='max-sm:flex-1'
                  >
                    {nextLabel}
                    <ChevronRight className='size-4 rtl:rotate-180' aria-hidden />
                  </Button>
                )}
              </div>
            ) : null}
          </div>

          {next && !nextOpen ? (
            <p className='mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#6b7196] sm:hidden'>
              <Lock className='size-4' aria-hidden />
              {t.completeToUnlock}
            </p>
          ) : null}
        </nav>
      ) : null}
    </Panel>
  );
}
