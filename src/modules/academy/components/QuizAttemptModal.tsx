'use client';

import { localeToLangId } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { Skeleton, StatusBadge } from '@/shared/components/product';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { useQuizAttempt } from '../hooks/useQuiz';
import {
  PASS_THRESHOLD_PERCENT,
  formatQuizDate,
  getScorePercentage,
} from '../quizScoring.shared';
import { AttemptReview } from './results/QuizReviewList';

interface QuizAttemptModalProps {
  attemptId: number | null;
  onClose: () => void;
}

/** One past attempt: score and outcome, then the per-question review. */
export function QuizAttemptModal({
  attemptId,
  onClose,
}: QuizAttemptModalProps) {
  const t = useTranslations('academyQuiz');
  const locale = useLocale();
  const langId = localeToLangId[locale];
  const { data: attempt, isLoading } = useQuizAttempt(attemptId, locale);

  const total = attempt ? attempt.quizScore || attempt.qustions.length || 0 : 0;
  const percentage = attempt
    ? getScorePercentage(attempt.attemptScore, total)
    : 0;
  const passed = percentage >= PASS_THRESHOLD_PERCENT;

  return (
    <Modal
      open={attemptId !== null}
      onClose={onClose}
      title={t.attemptDetails}
      size='lg'
      className='flex max-h-[calc(100dvh-2rem)] max-w-2xl flex-col p-0 [&>h2]:mb-0 [&>h2]:px-5 [&>h2]:pt-5 sm:[&>h2]:px-6 sm:[&>h2]:pt-6'
    >
      {isLoading || !attempt ? (
        <div role='status' className='space-y-3 px-5 py-6 sm:px-6'>
          <span className='sr-only'>{t.loadingResults}</span>
          <Skeleton className='h-5 w-48' />
          <Skeleton className='h-20 w-full rounded-xl' />
          <Skeleton className='h-20 w-full rounded-xl' />
        </div>
      ) : (
        <>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[#eef0f7] px-5 pb-4 pt-2 sm:px-6'>
            <span className='text-[15px] font-bold text-[#1e2364]'>
              {t.score}:{' '}
              <bdi dir='ltr' className='tabular-nums'>
                {attempt.attemptScore}/{total} · {percentage}%
              </bdi>
            </span>
            <StatusBadge tone={passed ? 'success' : 'danger'}>
              {passed ? t.passed : t.notPassed}
            </StatusBadge>
            <span className='text-[13px] font-semibold text-[#6b7196]'>
              <bdi>{formatQuizDate(attempt.startTime, locale)}</bdi>
            </span>
          </div>
          {/* Focusable so keyboard users can scroll the review. */}
          <div
            role='region'
            aria-label={t.reviewAnswers}
            tabIndex={0}
            className='min-h-0 flex-1 overflow-y-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00a8f1]'
          >
            <AttemptReview attempt={attempt} langId={langId} />
          </div>
        </>
      )}
      <div className='flex justify-end border-t border-[#eef0f7] px-5 py-3 sm:px-6'>
        <Button
          type='button'
          variant='productSecondary'
          size='control'
          onClick={onClose}
          className='max-sm:w-full'
        >
          {t.close}
        </Button>
      </div>
    </Modal>
  );
}
