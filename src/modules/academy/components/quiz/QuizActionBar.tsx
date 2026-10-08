import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { interpolate } from '@/shared/lib/interpolate';
import { QuizTimer } from './QuizTimer';
import type { QuizLabels } from './quizUi';

/**
 * Previous / next / submit. Fixed to the bottom on phones (timer in the
 * middle, safe-area padding); an inline row under the question from `sm`.
 */
export function QuizActionBar({
  labels,
  isFirst,
  isLast,
  unansweredCount,
  submitting,
  submitError,
  timeLeft,
  lowTime,
  onPrevious,
  onNext,
  onSubmit,
}: {
  labels: QuizLabels;
  isFirst: boolean;
  isLast: boolean;
  unansweredCount: number;
  submitting: boolean;
  submitError: string;
  timeLeft: number | null;
  lowTime: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  const showTimer = timeLeft !== null && timeLeft > 0;
  return (
    <div className='fixed inset-x-0 bottom-0 z-30 border-t border-[#e5e7f0] bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:z-auto sm:mt-4 sm:border-0 sm:bg-transparent sm:p-0'>
      {submitError ? (
        <p
          role='alert'
          className='mb-2 break-words text-[14px] font-semibold leading-6 text-red-700 sm:mb-3'
        >
          {submitError}
        </p>
      ) : null}
      <div className='mx-auto flex max-w-5xl items-center gap-3'>
        <Button
          type='button'
          variant='productSecondary'
          size='control'
          onClick={onPrevious}
          disabled={isFirst}
          className='max-sm:px-3.5'
        >
          <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
          {labels.previous}
        </Button>

        <div className='flex min-w-0 flex-1 justify-center'>
          {showTimer ? (
            <QuizTimer
              seconds={timeLeft}
              low={lowTime}
              label={labels.timeLeft}
              className='sm:hidden'
            />
          ) : null}
          {isLast && unansweredCount > 0 ? (
            <p className='text-[13px] font-semibold text-[#6b7196] max-sm:hidden'>
              {interpolate(labels.unansweredCount, { count: unansweredCount })}
            </p>
          ) : null}
        </div>

        {isLast ? (
          <Button
            type='button'
            variant='product'
            size='control'
            onClick={onSubmit}
            loading={submitting}
            className='max-sm:px-4'
          >
            {submitting ? labels.submitting : labels.submit}
          </Button>
        ) : (
          <Button
            type='button'
            variant='product'
            size='control'
            onClick={onNext}
            className='max-sm:px-4'
          >
            {labels.next}
            <ChevronRight className='size-4 rtl:rotate-180' aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
