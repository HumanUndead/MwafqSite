import type { SVGProps } from 'react';

export function ChevronDownSmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.5}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
      {...props}
    >
      <polyline points='6 9 12 15 18 9' />
    </svg>
  );
}
