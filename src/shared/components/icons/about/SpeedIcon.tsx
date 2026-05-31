import type { SVGProps } from 'react';

export function SpeedIcon(props: SVGProps<SVGSVGElement>) {
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
      <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />
    </svg>
  );
}
