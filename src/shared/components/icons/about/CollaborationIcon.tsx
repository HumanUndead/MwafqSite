import type { SVGProps } from 'react';

export function CollaborationIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx='8' cy='8' r='3' />
      <circle cx='17' cy='8' r='3' />
      <path d='M3 20c0-3 2.5-5 5-5s5 2 5 5' />
      <path d='M12 20c0-3 2.2-5 5-5s5 2 5 5' />
    </svg>
  );
}
