import { cn } from '@/shared/lib/cn';
import type { SVGProps } from 'react';

export function BellIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.2}
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <path d='M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' />
      <path d='M13.73 21a2 2 0 0 1-3.46 0' />
    </svg>
  );
}
