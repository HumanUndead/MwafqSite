import type { SVGProps } from 'react';

export function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden={true}
      {...props}
    >
      <rect x='2' y='4' width='20' height='16' rx='2' />
      <polyline points='22,4 12,13 2,4' />
    </svg>
  );
}
