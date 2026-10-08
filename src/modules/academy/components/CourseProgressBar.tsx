'use client';

import { cn } from '@/shared/lib/cn';

interface CourseProgressBarProps {
  /** 0-100. */
  value: number;
  className?: string;
  /** Kept for call-site compatibility; there is one (light) style. */
  tone?: 'light' | 'dark';
  /** Accessible name, e.g. "Your progress". */
  label?: string;
}

/** Thin progress track that fills from the start side. */
export function CourseProgressBar({ value, className, label }: CourseProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-[#e5e7f0]', className)}
      role='progressbar'
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className='absolute inset-y-0 start-0 rounded-full bg-[#00a8f1] transition-[width] duration-500 ease-out motion-reduce:transition-none'
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
