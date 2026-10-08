import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

// All pairs pass WCAG AA for 12px semibold text.
const TONE: Record<StatusTone, string> = {
  neutral: 'bg-[#f0f1f6] text-[#4a5078]',
  info: 'bg-[#e6f6fe] text-[#00699a]',
  success: 'bg-green-50 text-green-800',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-700',
};

/** Small status label. Text carries the meaning; color only reinforces it. */
export function StatusBadge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-semibold leading-5',
        TONE[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
