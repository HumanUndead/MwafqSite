'use client';

import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { localeToLangId } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { useAuthStore } from '@/modules/auth/store/authStore';
import {
  InfoItem,
  InfoList,
  Panel,
  Skeleton,
} from '@/shared/components/product';
import { Button, buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { useQuizAttempts } from '../hooks/useQuiz';
import {
  PASS_THRESHOLD_PERCENT,
  formatDuration,
  getScorePercentage,
} from '../quizScoring.shared';
import type { QuizAttemptDetail, QuizData } from '../types/quiz.types';
import { AcademyBackdrop } from './ui/AcademyGlass';
import { QuizReviewList } from './results/QuizReviewList';

interface QuizResultsProps {
  quiz: QuizData;
  attempt: QuizAttemptDetail | null;
  userCourseId: number;
  /** Next topic (or the course page when this was the last). */
  nextHref: string;
  onRetake: () => void;
  onBackToCourse: () => void;
}

/** Pass/fail, score against the pass mark, the next step, then the review. */
export function QuizResults({
  quiz,
  attempt,
  userCourseId,
  nextHref,
  onRetake,
  onBackToCourse,
}: QuizResultsProps) {
  const t = useTranslations('academyQuiz');
  const locale = useLocale();
  const langId = localeToLangId[locale];
  const user = useAuthStore((state) => state.user);
  const history = useQuizAttempts({
    userId: user?.id ?? '',
    quizId: quiz.id,
    userCourseId,
    locale,
    enabled: attempt !== null,
  });

  // The runner may be scrolled down; the result starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const total = attempt ? attempt.quizScore || attempt.qustions.length || 0 : 0;
  const percentage = attempt ? getScorePercentage(attempt.attemptScore, total) : 0;
  const passed = percentage >= PASS_THRESHOLD_PERCENT;
  const earlierAttempts = (history.data?.data ?? history.data?.attempts ?? []).filter(
    (entry) => (entry.id ?? entry.attemptId) !== attempt?.id
  );
  const passedBefore = earlierAttempts.some(
    (entry) =>
      getScorePercentage(entry.attemptScore, history.data?.quizScore || total) >=
      PASS_THRESHOLD_PERCENT
  );
  const attemptNumber = history.data
    ? (history.data.totalRecords ?? earlierAttempts.length + 1)
    : null;

  return (
    <AcademyBackdrop>
      <div className='mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10'>
        <Panel className='sm:p-7'>
          <p className='break-words text-[13px] font-semibold text-[#6b7196]'>
            {quiz.title || t.resultsTitle}
          </p>

          <div role='status' aria-live='polite'>
            {!attempt ? (
              <ResultSkeleton label={t.loadingResults} />
            ) : (
              <>
                <h1
                  className='mt-2 flex items-center gap-2.5 text-[24px] font-bold leading-tight text-[#1e2364] sm:text-[28px]'
                >
                  {passed ? (
                    <CheckCircle2 className='size-7 shrink-0 text-green-700' aria-hidden />
                  ) : (
                    <XCircle className='size-7 shrink-0 text-red-600' aria-hidden />
                  )}
                  {passed ? t.passedTitle : t.failedTitle}
                </h1>
                <p className='mt-2 max-w-[60ch] text-[15px] leading-6 text-[#4a5078]'>
                  {passed
                    ? interpolate(t.passedBody, { percentage })
                    : interpolate(t.failedBody, {
                        percentage,
                        threshold: PASS_THRESHOLD_PERCENT,
                      })}
                </p>
              </>
            )}
          </div>

          {attempt ? (
            <>
              <ScoreBar percentage={percentage} passed={passed} />
              <InfoList className='mt-6 border-t border-[#eef0f7] pt-5'>
                <InfoItem label={t.score}>
                  <bdi dir='ltr' className='tabular-nums'>
                    {attempt.attemptScore}/{total} · {percentage}%
                  </bdi>
                </InfoItem>
                <InfoItem label={t.passMarkLabel}>
                  <bdi dir='ltr' className='tabular-nums'>
                    {PASS_THRESHOLD_PERCENT}%
                  </bdi>
                </InfoItem>
                <InfoItem label={t.duration}>
                  <bdi dir='ltr' className='tabular-nums'>
                    {formatDuration(attempt.startTime, attempt.endTime)}
                  </bdi>
                </InfoItem>
                {attemptNumber !== null ? (
                  <InfoItem label={t.attempt}>
                    <span className='tabular-nums'>{attemptNumber}</span>
                  </InfoItem>
                ) : null}
              </InfoList>
            </>
          ) : null}

          <div className='mt-6 flex flex-col gap-3 border-t border-[#eef0f7] pt-5 sm:flex-row sm:flex-wrap sm:items-center'>
            {attempt && passed ? (
              <Link
                href={nextHref}
                className={buttonVariants({ variant: 'product', size: 'control' })}
              >
                {t.continueNext}
              </Link>
            ) : (
              <Button
                type='button'
                variant='product'
                size='control'
                onClick={onRetake}
              >
                <RotateCcw className='size-4' aria-hidden />
                {t.retake}
              </Button>
            )}
            {attempt && !passed && passedBefore ? (
              <Link
                href={nextHref}
                className={buttonVariants({
                  variant: 'productSecondary',
                  size: 'control',
                })}
              >
                {t.continueAnyway}
              </Link>
            ) : null}
            <Button
              type='button'
              variant='productText'
              size='control'
              onClick={onBackToCourse}
              className='sm:ms-auto'
            >
              {t.backToCourse}
            </Button>
          </div>
        </Panel>

        {attempt ? <QuizReviewList attempt={attempt} langId={langId} /> : null}
      </div>
    </AcademyBackdrop>
  );
}

/** Score fill with a tick at the pass mark. Numbers are in the list below. */
function ScoreBar({ percentage, passed }: { percentage: number; passed: boolean }) {
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <div aria-hidden className='relative mt-5 h-2.5 rounded-full bg-[#eef0f7]'>
      <div
        className={cn(
          'absolute inset-y-0 start-0 rounded-full',
          passed ? 'bg-green-600' : 'bg-[#1e2364]'
        )}
        style={{ width: `${clamped}%` }}
      />
      <div
        className='absolute -top-1 h-[18px] w-0.5 rounded-full bg-[#4a5078]'
        style={{ insetInlineStart: `${PASS_THRESHOLD_PERCENT}%` }}
      />
    </div>
  );
}

function ResultSkeleton({ label }: { label: string }) {
  return (
    <div className='mt-2'>
      <span className='sr-only'>{label}</span>
      <Skeleton className='h-8 w-56' />
      <Skeleton className='mt-3 h-4 w-full max-w-md' />
      <Skeleton className='mt-6 h-2.5 w-full rounded-full' />
    </div>
  );
}
