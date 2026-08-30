import type { SVGProps } from 'react';

export function FlexibilityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
      {...props}
    >
      <path d='M4 12c0-4.4 3.6-8 8-8' />
      <path d='M20 12c0 4.4-3.6 8-8 8' />
      <path d='M4 12l3-3M4 12l3 3' />
      <path d='M20 12l-3-3M20 12l-3 3' />
    </svg>
  );
}
