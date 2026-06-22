import { cn } from '@/shared/lib/cn';
import type { SVGProps } from 'react';

export function ArrowIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.2}
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <path d='M5 12h14' />
      <path d='m12 5 7 7-7 7' />
    </svg>
  );
}
