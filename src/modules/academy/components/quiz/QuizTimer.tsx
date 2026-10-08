import { Clock } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { formatClock, type QuizLabels } from './quizUi';

/** Remaining time. Neutral until `low`, then amber. Never announced per second. */
export function QuizTimer({
  seconds,
  low,
  label,
  className,
}: {
  seconds: number;
  low: boolean;
  label: string;
  className?: string;
}) {
  return (
    <div
      role='timer'
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] border px-3 text-[14px] font-semibold tabular-nums transition-colors duration-150 motion-reduce:transition-none',
        low
          ? 'border-amber-300 bg-amber-50 text-amber-900'
          : 'border-[#e5e7f0] bg-white text-[#1e2364]',
        className
      )}
    >
      <Clock
        className={cn('size-4', low ? 'text-amber-700' : 'text-[#6b7196]')}
        aria-hidden
      />
      <span
        className={cn(
          'text-[13px] max-md:sr-only',
          low ? 'text-amber-900' : 'text-[#6b7196]'
        )}
      >
        {label}
      </span>
      <bdi dir='ltr'>{formatClock(seconds)}</bdi>
    </div>
  );
}

/**
 * Screen-reader warnings at 5 minutes and 1 minute left. The text only changes
 * when a threshold is crossed, so the live region speaks twice at most.
 */
export function QuizTimeAnnouncer({
  seconds,
  totalSeconds,
  labels,
}: {
  seconds: number | null;
  totalSeconds: number;
  labels: QuizLabels;
}) {
  let message = '';
  if (seconds !== null && seconds > 0) {
    if (seconds <= 60 && totalSeconds > 60) message = labels.oneMinuteLeft;
    else if (seconds <= 300 && totalSeconds > 300)
      message = interpolate(labels.minutesLeft, { count: 5 });
  }
  return (
    <p aria-live='polite' className='sr-only'>
      {message}
    </p>
  );
}
