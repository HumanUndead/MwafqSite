import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { QuizTimer } from './QuizTimer';
import type { QuizLabels } from './quizUi';

/**
 * Previous / next / submit. Pinned to the bottom of the viewport on mobile
 * (with the timer between the buttons), an inline row under the card from sm.
 */
export function QuizActionBar({
  labels,
  isFirst,
  isLast,
  allAnswered,
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
  allAnswered: boolean;
  submitting: boolean;
  submitError: string;
  timeLeft: number | null;
  lowTime: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className='fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/85 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgba(30,35,100,0.25)] backdrop-blur-xl sm:static sm:z-auto sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none'>
      {submitError && (
        <p
          role='alert'
          className='mb-2 text-center text-sm font-semibold text-red-600 sm:mb-3 sm:text-start'
        >
          {submitError}
        </p>
      )}
      <div className='mx-auto flex max-w-3xl items-center justify-between gap-3'>
        <Button
          variant='outline'
          shape='pill'
          size='lg'
          className='border-[#e5e7f0] bg-white/80 px-4 text-[#1e2364] hover:bg-white focus:ring-[#00a8f1] sm:px-6'
          onClick={onPrevious}
          disabled={isFirst}
          type='button'
        >
          <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
          {labels.previous}
        </Button>

        {timeLeft !== null && timeLeft > 0 && (
          <QuizTimer
            seconds={timeLeft}
            low={lowTime}
            label={labels.timeLeft}
            tone='light'
            className='sm:hidden'
          />
        )}

        {isLast ? (
          <Button
            variant='brand'
            shape='pill'
            size='lg'
            className='bg-[#00a8f1] px-5 hover:bg-[#0090d1] focus:ring-[#00a8f1] sm:px-8'
            onClick={onSubmit}
            loading={submitting}
            disabled={!allAnswered}
            type='button'
          >
            {submitting ? labels.submitting : labels.submit}
          </Button>
        ) : (
          <Button
            variant='brand'
            shape='pill'
            size='lg'
            className='px-5 sm:px-8'
            onClick={onNext}
            type='button'
          >
            {labels.next}
            <ChevronRight className='size-4 rtl:rotate-180' aria-hidden />
          </Button>
        )}
      </div>
      {isLast && !allAnswered && (
        <p className='mt-2 text-center text-xs font-semibold text-amber-600 sm:text-end'>
          {labels.answerAllRequired}
        </p>
      )}
    </div>
  );
}
