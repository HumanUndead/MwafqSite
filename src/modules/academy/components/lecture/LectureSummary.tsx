'use client';

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import type { Dictionary } from '@/locales/types';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import type { NavItem } from '../../types/player.types';
import { GlassPanel, StatChip } from '../ui/AcademyGlass';

const navLinkBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2';

/** Lecture title, facts and the prev / complete / next action row. */
export function LectureSummary({
  lessonName,
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
  const nextLabel = next?.type === 'quiz' ? t.goToQuiz : t.next;
  const prevLabel = prev?.type === 'quiz' ? t.previousQuiz : t.previous;

  return (
    <GlassPanel className='p-5 sm:p-7'>
      <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
        <div className='min-w-0 space-y-3'>
          {lessonName ? (
            <p className='text-sm font-semibold text-[#00a8f1]'>{lessonName}</p>
          ) : null}
          <h1 className='text-xl font-bold leading-snug text-[#1e2364] sm:text-[28px] sm:leading-tight'>
            {title}
          </h1>
          <div className='flex flex-wrap gap-2'>
            <StatChip icon={<Clock className='size-3.5 text-[#00a8f1]' aria-hidden />}>
              {minutes} {t.minutes}
            </StatChip>
            {isRevision ? (
              <StatChip
                icon={<RotateCcw className='size-3.5' aria-hidden />}
                className='bg-amber-50 text-amber-600 ring-amber-100'
              >
                {t.revision}
              </StatChip>
            ) : null}
          </div>
        </div>

        {canMarkManually ? (
          <Button
            variant='brand'
            size='lg'
            shape='pill'
            type='button'
            className='w-full shrink-0 focus-visible:ring-2 focus-visible:ring-[#00a8f1] sm:w-auto'
            loading={marking}
            onClick={onMarkComplete}
          >
            <CheckCircle2 className='size-5' aria-hidden />
            {t.markComplete}
          </Button>
        ) : isCompleted ? (
          <span className='inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-600 ring-1 ring-emerald-100'>
            <CheckCircle2 className='size-5 text-emerald-500' aria-hidden />
            {t.completed}
          </span>
        ) : null}
      </div>

      {prev || next ? (
        <nav
          aria-label={t.lectureProgress}
          className='mt-6 flex flex-col gap-3 border-t border-[#e5e7f0] pt-5 sm:flex-row sm:items-center sm:justify-between'
        >
          {prev && prevHref ? (
            <Link
              href={prevHref}
              className={cn(
                navLinkBase,
                'bg-white/80 text-[#1e2364] ring-1 ring-[#e5e7f0] hover:bg-white hover:ring-[#00a8f1]/40'
              )}
            >
              <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
              {prevLabel}
            </Link>
          ) : (
            <span className='hidden sm:block' />
          )}

          {next ? (
            isCompleted && nextHref ? (
              <Link
                href={nextHref}
                className={cn(
                  navLinkBase,
                  'bg-[#00a8f1] text-white shadow-[0_8px_24px_-10px_rgba(0,168,241,0.8)] hover:bg-[#0090d1]'
                )}
              >
                {nextLabel}
                <ChevronRight className='size-4 rtl:rotate-180' aria-hidden />
              </Link>
            ) : (
              <div className='flex flex-col items-stretch gap-2 sm:flex-row sm:items-center'>
                <span className='inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-600 sm:order-first'>
                  <Lock className='size-3.5' aria-hidden />
                  {t.completeToUnlock}
                </span>
                <span
                  aria-disabled='true'
                  title={t.completeToUnlock}
                  className={cn(
                    navLinkBase,
                    'cursor-not-allowed bg-[#e5e7f0] text-[#6b7196]'
                  )}
                >
                  {nextLabel}
                  <ChevronRight className='size-4 rtl:rotate-180' aria-hidden />
                </span>
              </div>
            )
          ) : null}
        </nav>
      ) : null}
    </GlassPanel>
  );
}
