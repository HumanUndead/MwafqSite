'use client';

import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { useAuthStore } from '@/modules/auth/store/authStore';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Panel,
  PanelHeader,
  Skeleton,
  StatusBadge,
} from '@/shared/components/product';
import { Button, buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
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
import { AcademyBackdrop } from './ui/AcademyGlass';

const ATTEMPTS_PAGE_SIZE = 8;

interface QuizHistoryProps {
  userCourseId: number;
  courseId: number;
  quizId: number;
  lessonId?: string | null;
}

/** Past attempts at one quiz, newest first; open one to review it. */
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
  const { data, isLoading, isError, refetch } = useQuizAttempts({
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
  const startHref = quizPath(locale, userCourseId, courseId, quizId);

  return (
    <AcademyBackdrop>
      <div className='mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10'>
        <div>
          <Link
            href={learnBasePath(locale, userCourseId, courseId)}
            className={cn(
              buttonVariants({ variant: 'productText', size: 'compact' }),
              '-ms-3.5 mb-2'
            )}
          >
            <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
            {t.backToCourse}
          </Link>
          <PageHeader
            title={data?.quizName || t.historyTitle}
            description={t.historyDescription}
            actions={
              attempts.length > 0 ? (
                <Link
                  href={startHref}
                  className={buttonVariants({ variant: 'product', size: 'control' })}
                >
                  {t.retake}
                </Link>
              ) : null
            }
          />
        </div>

        <Panel flush aria-labelledby='quiz-history-list'>
          <PanelHeader
            id='quiz-history-list'
            title={t.historyTitle}
            description={
              bestPercentage !== null ? (
                <>
                  {t.bestScore}:{' '}
                  <bdi dir='ltr' className='tabular-nums'>
                    {bestPercentage}%
                  </bdi>
                </>
              ) : undefined
            }
            className='border-b border-[#eef0f7] px-5 py-4 sm:px-6'
          />

          {isLoading ? (
            <HistorySkeleton label={t.loading} />
          ) : isError ? (
            <ErrorState
              title={t.loadError}
              retryLabel={t.retry}
              onRetry={() => void refetch()}
            />
          ) : attempts.length === 0 ? (
            <EmptyState
              icon={<FileText aria-hidden />}
              title={t.noAttempts}
              action={
                <Link
                  href={startHref}
                  className={buttonVariants({ variant: 'product', size: 'control' })}
                >
                  {t.start}
                </Link>
              }
            />
          ) : (
            <ol className='divide-y divide-[#eef0f7]'>
              {attempts.map((attempt, pageIndex) => {
                const id = attempt.id ?? attempt.attemptId ?? null;
                const total = attempt.quizScore || fallbackTotal;
                const percentage = getScorePercentage(attempt.attemptScore, total);
                // Newest first: number attempts chronologically.
                const attemptNumber = Math.max(1, totalRecords - (pageStart + pageIndex));
                const passed = percentage >= PASS_THRESHOLD_PERCENT;
                const title = interpolate(t.attemptNumber, { count: attemptNumber });

                return (
                  <li
                    key={id ?? pageIndex}
                    className='flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6'
                  >
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='text-[15px] font-bold text-[#1e2364]'>{title}</span>
                        <StatusBadge tone={passed ? 'success' : 'danger'}>
                          {passed ? t.passed : t.notPassed}
                        </StatusBadge>
                      </div>
                      <p className='mt-1 text-[13px] font-semibold text-[#6b7196]'>
                        <span className='sr-only'>{t.date}: </span>
                        <bdi>{formatQuizDate(attempt.startTime, locale)}</bdi>
                        <span aria-hidden> · </span>
                        <span className='sr-only'>{t.duration}: </span>
                        <bdi dir='ltr'>{formatDuration(attempt.startTime, attempt.endTime)}</bdi>
                      </p>
                    </div>
                    <p className='text-[15px] font-bold text-[#1e2364] sm:text-end'>
                      <span className='sr-only'>{t.score}: </span>
                      <bdi dir='ltr' className='tabular-nums'>
                        {attempt.attemptScore}
                        {total > 0 ? `/${total}` : ''} · {percentage}%
                      </bdi>
                    </p>
                    {id !== null ? (
                      <Button
                        type='button'
                        variant='productSecondary'
                        size='compact'
                        onClick={() => setSelectedAttemptId(id)}
                        aria-label={`${t.viewDetails}: ${title}`}
                        className='max-sm:w-full'
                      >
                        {t.viewDetails}
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          )}

          {!isLoading && !isError && totalPages > 1 ? (
            <nav
              aria-label={t.historyTitle}
              className='flex items-center justify-between gap-3 border-t border-[#eef0f7] px-5 py-3 sm:px-6'
            >
              <Button
                type='button'
                variant='productSecondary'
                size='compact'
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
                {t.previous}
              </Button>
              <span
                className='text-[13px] font-semibold tabular-nums text-[#6b7196]'
                aria-live='polite'
              >
                {interpolate(t.attemptsPage, {
                  current: currentPage,
                  total: totalPages,
                })}
              </span>
              <Button
                type='button'
                variant='productSecondary'
                size='compact'
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                {t.next}
                <ChevronRight className='size-4 rtl:rotate-180' aria-hidden />
              </Button>
            </nav>
          ) : null}
        </Panel>
      </div>

      <QuizAttemptModal
        attemptId={selectedAttemptId}
        onClose={() => setSelectedAttemptId(null)}
      />
    </AcademyBackdrop>
  );
}

function HistorySkeleton({ label }: { label: string }) {
  return (
    <div role='status' className='divide-y divide-[#eef0f7]'>
      <span className='sr-only'>{label}</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className='flex items-center gap-6 px-5 py-4 sm:px-6'>
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-4 w-56' />
          </div>
          <Skeleton className='h-9 w-28 rounded-[10px] max-sm:hidden' />
        </div>
      ))}
    </div>
  );
}
