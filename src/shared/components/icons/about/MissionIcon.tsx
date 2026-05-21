import type { SVGProps } from 'react';

export function MissionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
      {...props}
    >
      <circle cx='12' cy='12' r='9' />
      <circle cx='12' cy='12' r='5' />
      <circle cx='12' cy='12' r='1.5' fill='currentColor' />
      <path d='M21 3 L13 11' />
      <path d='M18 3h3v3' />
    </svg>
  );
}
