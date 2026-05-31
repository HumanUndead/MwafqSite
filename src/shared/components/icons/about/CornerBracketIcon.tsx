import type { SVGProps } from 'react';

export function CornerBracketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 48 48'
      fill='none'
      stroke='currentColor'
      strokeWidth={4}
      strokeLinecap='round'
      aria-hidden
      {...props}
    >
      <path d='M4 18 V4 H18' />
    </svg>
  );
}
