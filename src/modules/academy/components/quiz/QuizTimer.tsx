import { Clock } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatClock } from './quizUi';

/** Countdown pill. Turns amber in the final minute. */
export function QuizTimer({
  seconds,
  low,
  label,
  tone = 'dark',
  className,
}: {
  seconds: number;
  low: boolean;
  label: string;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <div
      role='timer'
      aria-label={label}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ring-1 transition-colors motion-reduce:transition-none',
        tone === 'dark'
          ? low
            ? 'bg-amber-500/20 text-amber-200 ring-amber-400/50'
            : 'bg-white/10 text-white ring-white/15'
          : low
            ? 'bg-amber-50 text-amber-700 ring-amber-300'
            : 'bg-[#00a8f1]/10 text-[#1e2364] ring-[#00a8f1]/25',
        className
      )}
    >
      <Clock
        className={cn(
          'size-4',
          low
            ? tone === 'dark'
              ? 'text-amber-300'
              : 'text-amber-500'
            : 'text-[#00a8f1]'
        )}
        aria-hidden
      />
      <span dir='ltr'>{formatClock(seconds)}</span>
    </div>
  );
}
