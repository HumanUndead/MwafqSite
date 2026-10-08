import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';

/** Pulse block for layout-matched loading states. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-md bg-[#eceef5] motion-reduce:animate-none', className)}
    />
  );
}

interface EmptyStateProps {
  /** A lucide icon element; skip it when it adds nothing. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** What is empty, and the one thing the user can do about it. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      {icon ? (
        <span className='mb-4 inline-flex size-12 items-center justify-center rounded-full bg-[#f0f1f6] text-[#4a5078] [&_svg]:size-6'>
          {icon}
        </span>
      ) : null}
      <p className='text-[16px] font-bold text-[#1e2364]'>{title}</p>
      {description ? (
        <p className='mt-1 max-w-[44ch] text-[14px] leading-6 text-[#6b7196]'>{description}</p>
      ) : null}
      {action ? <div className='mt-5'>{action}</div> : null}
    </div>
  );
}

interface ErrorStateProps {
  title: ReactNode;
  description?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

/** Load failure with a recovery action. Announced to screen readers. */
export function ErrorState({ title, description, retryLabel, onRetry, className }: ErrorStateProps) {
  return (
    <div
      role='alert'
      className={cn('flex flex-col items-center px-6 py-12 text-center', className)}
    >
      <span className='mb-4 inline-flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600'>
        <AlertCircle className='size-6' aria-hidden />
      </span>
      <p className='text-[16px] font-bold text-[#1e2364]'>{title}</p>
      {description ? (
        <p className='mt-1 max-w-[44ch] text-[14px] leading-6 text-[#6b7196]'>{description}</p>
      ) : null}
      {onRetry && retryLabel ? (
        <Button
          type='button'
          variant='productSecondary'
          size='control'
          className='mt-5'
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

/** Inline notice above content (e.g. limited access). Not for load errors. */
export function Notice({
  tone = 'info',
  children,
  className,
}: {
  tone?: 'info' | 'warning';
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      role='status'
      className={cn(
        'rounded-xl border px-4 py-3 text-[14px] font-semibold leading-6',
        tone === 'warning'
          ? 'border-amber-200 bg-amber-50 text-amber-900'
          : 'border-[#bfe8fb] bg-[#f0faff] text-[#00577f]',
        className
      )}
    >
      {children}
    </p>
  );
}
