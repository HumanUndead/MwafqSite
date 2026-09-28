'use client';

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Hash,
  Loader2,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { Button, buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { useQuizAttempts } from '../hooks/useQuiz';
import { localeToLangId } from '@/i18n/config';
import {
  PASS_THRESHOLD_PERCENT,
  formatDuration,
  getScorePercentage,
} from '../quizScoring.shared';
import type { QuizAttemptDetail, QuizData } from '../types/quiz.types';
import {
  AcademyBackdrop,
  AcademyStage,
  ProgressRing,
  StatChip,
} from './ui/AcademyGlass';
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

/** Stage-friendly button overrides (focus ring must read on navy). */
const stageFocus =
  'focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#141848]';
const stagePrimary = cn(
  'bg-[#00a8f1] text-white hover:bg-[#0090d1] focus:ring-0 focus:ring-offset-0',
  stageFocus
);
const stageSecondary = cn(
  'border border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white focus:ring-0 focus:ring-offset-0',
  stageFocus
);

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
  const wrong = attempt ? Math.max(0, total - attempt.attemptScore) : 0;
  const attemptNumber = history.data
    ? (history.data.totalRecords ?? earlierAttempts.length + 1)
    : null;

  return (
    <AcademyBackdrop>
      <AcademyStage innerClassName='max-w-4xl'>
        <p className='text-sm font-semibold text-white/70'>
          {quiz.title || t.resultsTitle}
        </p>

        {!attempt ? (
          <div className='flex flex-col items-center gap-4 py-12 text-center' role='status'>
            <Loader2 className='size-10 text-[#00a8f1] motion-safe:animate-spin' aria-hidden />
            <p className='text-base text-white/80'>{t.loadingResults}</p>
          </div>
        ) : (
          <div className='mt-6 flex flex-col items-center gap-8 text-center sm:flex-row sm:items-center sm:gap-10 sm:text-start'>
            <div className='flex flex-col items-center gap-2'>
              <ProgressRing
                value={percentage}
                size={152}
                stroke={12}
                label={`${t.yourScore}: ${percentage}%`}
              />
              <span className='text-sm text-white/70'>{t.yourScore}</span>
            </div>

            <div className='min-w-0 flex-1'>
              <p className='text-sm text-white/70'>{t.quizCompleted}</p>
              <div role='status' className='mt-1'>
                <h1 className='flex items-center justify-center gap-2 text-[28px] font-bold leading-tight sm:justify-start sm:text-4xl'>
                  {passed ? (
                    <CheckCircle2 className='size-8 shrink-0 text-emerald-400' aria-hidden />
                  ) : (
                    <XCircle className='size-8 shrink-0 text-red-400' aria-hidden />
                  )}
                  {passed ? t.passedTitle : t.failedTitle}
                </h1>
                <p className='mt-2 max-w-xl text-base leading-relaxed text-white/80'>
                  {passed
                    ? interpolate(t.passedBody, { percentage })
                    : interpolate(t.failedBody, {
                        percentage,
                        threshold: PASS_THRESHOLD_PERCENT,
                      })}
                </p>
              </div>

              <p className='mt-4 text-white/70'>
                <span className='text-sm'>{t.score} </span>
                <span className='text-xl font-bold text-white' dir='ltr'>
                  {attempt.attemptScore}/{total}
                </span>
              </p>

              <ul className='mt-4 flex flex-wrap justify-center gap-2 sm:justify-start'>
                <li>
                  <StatChip
                    tone='dark'
                    icon={<CheckCircle2 className='size-4 text-emerald-400' aria-hidden />}
                  >
                    {t.correctAnswers}: {attempt.attemptScore}
                  </StatChip>
                </li>
                <li>
                  <StatChip
                    tone='dark'
                    icon={<XCircle className='size-4 text-red-400' aria-hidden />}
                  >
                    {t.wrongAnswers}: {wrong}
                  </StatChip>
                </li>
                <li>
                  <StatChip
                    tone='dark'
                    icon={<Clock className='size-4 text-[#00a8f1]' aria-hidden />}
                  >
                    {t.duration}:{' '}
                    <span dir='ltr'>{formatDuration(attempt.startTime, attempt.endTime)}</span>
                  </StatChip>
                </li>
                {attemptNumber !== null && (
                  <li>
                    <StatChip
                      tone='dark'
                      icon={<Hash className='size-4 text-[#00a8f1]' aria-hidden />}
                    >
                      {t.attempt} {attemptNumber}
                    </StatChip>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className='mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:flex-wrap sm:items-center'>
          {attempt && passed ? (
            <Link
              href={nextHref}
              className={cn(buttonVariants({ variant: 'brand', size: 'lg', shape: 'pill' }), stagePrimary)}
            >
              {t.continueNext}
              <ArrowRight className='size-4 rtl:rotate-180' aria-hidden />
            </Link>
          ) : (
            <Button
              variant='brand'
              size='lg'
              shape='pill'
              onClick={onRetake}
              type='button'
              className={stagePrimary}
            >
              <RotateCcw className='size-4' aria-hidden />
              {t.retake}
            </Button>
          )}
          {attempt && !passed && passedBefore && (
            <Link
              href={nextHref}
              className={cn(buttonVariants({ variant: 'outline', size: 'lg', shape: 'pill' }), stageSecondary)}
            >
              {t.continueAnyway}
            </Link>
          )}
          <Button
            variant='outline'
            size='lg'
            shape='pill'
            onClick={onBackToCourse}
            type='button'
            className={cn(stageSecondary, 'sm:ms-auto border-transparent bg-transparent')}
          >
            {t.backToCourse}
          </Button>
        </div>
      </AcademyStage>

      {attempt && (
        <div className='mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14'>
          <QuizReviewList attempt={attempt} langId={langId} />
        </div>
      )}
    </AcademyBackdrop>
  );
}
