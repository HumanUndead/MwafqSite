'use client';

import { cn } from '@/shared/lib/cn';

interface CourseProgressBarProps {
  /** 0-100. */
  value: number;
  className?: string;
}

export function CourseProgressBar({
  value,
  className,
}: CourseProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        'relative h-3 w-full overflow-hidden rounded-full bg-gray-200',
        className
      )}
      role='progressbar'
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className='absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-[#1e2364] to-[#00a8f1] transition-[width] duration-500 ease-out'
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
