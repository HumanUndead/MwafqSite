'use client';

import { cn } from '@/shared/lib/cn';

interface CourseProgressBarProps {
  /** 0-100. */
  value: number;
  className?: string;
  /** `dark` on the navy stage. */
  tone?: 'light' | 'dark';
}

export function CourseProgressBar({
  value,
  className,
  tone = 'light',
}: CourseProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full',
        tone === 'dark' ? 'bg-white/15' : 'bg-[#e5e7f0]',
        className
      )}
      role='progressbar'
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className='absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-[#00a8f1] to-[#5bc8ff] shadow-[0_0_12px_rgba(0,168,241,0.6)] transition-[width] duration-500 ease-out'
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
