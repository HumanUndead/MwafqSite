'use client';

import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { Button, buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { useQuizAttempts } from '../hooks/useQuiz';
import {
  PASS_THRESHOLD_PERCENT,
  formatDuration,
  formatQuizDate,
  getScorePercentage,
} from '../quizScoring.shared';
import { learnBasePath, quizPath } from '../learnRoutes.shared';
import type { UserQuizAttempt } from '../types/quiz.types';
import { QuizAttemptModal } from './QuizAttemptModal';
import {
  AcademyBackdrop,
  AcademyStage,
  GlassPanel,
  ProgressRing,
} from './ui/AcademyGlass';

const ATTEMPTS_PAGE_SIZE = 8;

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f4f8]';

interface QuizHistoryProps {
  userCourseId: number;
  courseId: number;
  quizId: number;
  lessonId?: string | null;
}

export function QuizHistory({
  userCourseId,
  courseId,
  quizId,
  lessonId,
}: QuizHistoryProps) {
  const t = useTranslations('academyQuiz');
  const locale = useLocale();
  const user = useAuthStore((state) => state.user);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Server-side paging (mobile `UserQuizAttempt/List` + PageNumber/PageSize).
  const { data, isLoading } = useQuizAttempts({
    userId: user?.id ?? '',
    quizId,
    userCourseId,
    lessonId,
    locale,
    pageNumber: currentPage,
    pageSize: ATTEMPTS_PAGE_SIZE,
  });

  const attempts: UserQuizAttempt[] = data?.data ?? data?.attempts ?? [];
  const fallbackTotal = data?.quizScore ?? 0;
  const totalRecords = data?.totalRecords ?? attempts.length;
  const totalPages = Math.max(
    1,
    data?.totalPages ?? Math.ceil(totalRecords / ATTEMPTS_PAGE_SIZE)
  );
  const pageStart = (currentPage - 1) * ATTEMPTS_PAGE_SIZE;
  const pageAttempts = attempts;
  // Best score is only meaningful when every attempt is on this one page.
  const bestPercentage =
    attempts.length > 0 && totalPages === 1
      ? Math.max(
          ...attempts.map((attempt) =>
            getScorePercentage(
              attempt.attemptScore,
              attempt.quizScore || fallbackTotal
            )
          )
        )
      : null;

  return (
    <AcademyBackdrop>
      <AcademyStage innerClassName='py-8 lg:py-10'>
        <div className='flex flex-wrap items-center gap-4 sm:gap-6'>
          <Link
            href={learnBasePath(locale, userCourseId, courseId)}
            className='flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#141848]'
            aria-label={t.backToCourse}
          >
            <ChevronLeft className='size-5 rtl:rotate-180' aria-hidden />
          </Link>
          <div className='min-w-0 flex-1'>
            {data?.quizName ? (
              <>
                <p className='text-sm text-white/70'>{t.historyTitle}</p>
                <h1 className='mt-1 text-xl font-bold leading-tight sm:text-[28px]'>
                  {data.quizName}
                </h1>
              </>
            ) : (
              <h1 className='text-xl font-bold leading-tight sm:text-[28px]'>
                {t.historyTitle}
              </h1>
            )}
          </div>
          {bestPercentage !== null && (
            <div className='flex items-center gap-3'>
              <ProgressRing
                value={bestPercentage}
                size={72}
                stroke={6}
                label={`${t.score}: ${bestPercentage}%`}
              />
              <span className='text-sm text-white/70'>{t.score}</span>
            </div>
          )}
        </div>
      </AcademyStage>

      <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
        {isLoading ? (
          <div className='flex items-center justify-center py-20' role='status'>
            <Loader2 className='size-10 text-[#00a8f1] motion-safe:animate-spin' aria-hidden />
            <span className='sr-only'>{t.loading}</span>
          </div>
        ) : attempts.length === 0 ? (
          <GlassPanel className='mx-auto max-w-md p-10 text-center'>
            <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#1e2364]/[0.06]'>
              <FileText className='size-8 text-[#6b7196]' aria-hidden />
            </div>
            <h2 className='mb-4 text-xl font-bold text-[#1e2364]'>
              {t.noAttempts}
            </h2>
            <Link
              href={quizPath(locale, userCourseId, courseId, quizId)}
              className={cn(
                buttonVariants({ variant: 'brand', size: 'lg', shape: 'pill' }),
                'bg-[#00a8f1] hover:bg-[#0090d1] focus:ring-0 focus:ring-offset-0',
                focusRing
              )}
            >
              {t.start}
              <ChevronRight className='size-5 rtl:rotate-180' aria-hidden />
            </Link>
          </GlassPanel>
        ) : (
          <>
            <ol className='space-y-3'>
              {pageAttempts.map((attempt, pageIndex) => {
                const index = pageStart + pageIndex;
                const id = attempt.id ?? attempt.attemptId ?? null;
                const total = attempt.quizScore || fallbackTotal;
                const percentage = getScorePercentage(
                  attempt.attemptScore,
                  total
                );
                // Newest first: number attempts chronologically.
                const attemptNumber = Math.max(1, totalRecords - index);
                const passed = percentage >= PASS_THRESHOLD_PERCENT;

                const content = (
                  <>
                    <ProgressRing
                      value={percentage}
                      size={60}
                      stroke={5}
                      tone='light'
                      label={`${t.score}: ${percentage}%`}
                    />
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='text-base font-bold text-[#1e2364]'>
                          {t.attempt} #{attemptNumber}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
                            passed
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : 'bg-red-50 text-red-700 ring-red-200'
                          )}
                        >
                          {passed ? (
                            <CheckCircle2 className='size-3.5' aria-hidden />
                          ) : (
                            <XCircle className='size-3.5' aria-hidden />
                          )}
                          {passed ? t.passed : t.failed}
                        </span>
                      </div>
                      <p className='mt-1 text-sm text-[#6b7196]'>
                        <span className='sr-only'>{t.date}: </span>
                        {formatQuizDate(attempt.startTime, locale)}
                      </p>
                      <div className='mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#6b7196]'>
                        <span className='inline-flex items-center gap-1.5'>
                          <Award className='size-4 text-[#00a8f1]' aria-hidden />
                          {t.score}:{' '}
                          <span className='font-semibold text-[#1e2364]' dir='ltr'>
                            {attempt.attemptScore}
                            {total > 0 ? `/${total}` : ''}
                          </span>
                        </span>
                        <span className='inline-flex items-center gap-1.5'>
                          <Clock className='size-4 text-[#00a8f1]' aria-hidden />
                          {t.duration}:{' '}
                          <span className='font-semibold text-[#1e2364]' dir='ltr'>
                            {formatDuration(attempt.startTime, attempt.endTime)}
                          </span>
                        </span>
                      </div>
                    </div>
                    {id !== null && (
                      <span className='hidden shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-[#00a8f1] transition-colors group-hover:bg-[#00a8f1]/10 sm:inline-flex'>
                        {t.viewDetails}
                        <ChevronRight className='size-4 rtl:rotate-180' aria-hidden />
                      </span>
                    )}
                    {id !== null && (
                      <ChevronRight
                        className='size-5 shrink-0 text-[#00a8f1] sm:hidden rtl:rotate-180'
                        aria-hidden
                      />
                    )}
                  </>
                );

                return (
                  <li key={id ?? index}>
                    {id !== null ? (
                      <GlassPanel
                        as='button'
                        type='button'
                        onClick={() => setSelectedAttemptId(id)}
                        aria-label={`${t.viewDetails}: ${t.attempt} #${attemptNumber}`}
                        className={cn(
                          'group flex w-full items-center gap-4 rounded-2xl p-4 text-start transition-colors hover:border-[#00a8f1]/40 hover:bg-white/90 sm:p-5',
                          focusRing
                        )}
                      >
                        {content}
                      </GlassPanel>
                    ) : (
                      <GlassPanel className='flex items-center gap-4 rounded-2xl p-4 sm:p-5'>
                        {content}
                      </GlassPanel>
                    )}
                  </li>
                );
              })}
            </ol>

            {totalPages > 1 && (
              <GlassPanel
                as='nav'
                aria-label={t.historyTitle}
                className='mt-6 flex items-center justify-between gap-3 rounded-full px-3 py-2'
              >
                <Button
                  variant='ghost'
                  size='sm'
                  shape='pill'
                  type='button'
                  className={cn('text-[#1e2364] focus:ring-0 focus:ring-offset-0', focusRing)}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                >
                  <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
                  {t.previous}
                </Button>
                <span className='text-sm font-semibold text-[#6b7196]' aria-live='polite'>
                  {t.attemptsPage
                    .replace('{{current}}', String(currentPage))
                    .replace('{{total}}', String(totalPages))}
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  shape='pill'
                  type='button'
                  className={cn('text-[#1e2364] focus:ring-0 focus:ring-offset-0', focusRing)}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  {t.next}
                  <ChevronRight className='size-4 rtl:rotate-180' aria-hidden />
                </Button>
              </GlassPanel>
            )}
          </>
        )}
      </div>

      <QuizAttemptModal
        attemptId={selectedAttemptId}
        onClose={() => setSelectedAttemptId(null)}
      />
    </AcademyBackdrop>
  );
}
