import type { SVGProps } from 'react';

export function CheckSmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={3}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
      {...props}
    >
      <polyline points='20 6 9 17 4 12' />
    </svg>
  );
}
