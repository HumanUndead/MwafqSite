import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/** Label/value pairs. One column on mobile, two from `sm` up. */
export function InfoList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2', className)}>
      {children}
    </dl>
  );
}

export function InfoItem({
  label,
  children,
  wide = false,
}: {
  label: ReactNode;
  children: ReactNode;
  /** Span both columns (addresses, long text). */
  wide?: boolean;
}) {
  return (
    <div className={cn('min-w-0', wide && 'sm:col-span-2')}>
      <dt className='text-[13px] font-semibold text-[#6b7196]'>{label}</dt>
      <dd className='mt-1 break-words text-[15px] font-semibold leading-6 text-[#1e2364]'>
        {children}
      </dd>
    </div>
  );
}
