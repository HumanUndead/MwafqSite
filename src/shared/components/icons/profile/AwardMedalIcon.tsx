import type { SVGProps } from 'react';

export function AwardMedalIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx='12' cy='8' r='7' />
      <polyline points='8.21 13.89 7 23 12 20 17 23 15.79 13.88' />
    </svg>
  );
}
