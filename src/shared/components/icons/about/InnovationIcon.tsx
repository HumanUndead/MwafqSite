import type { SVGProps } from 'react';

export function InnovationIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d='M9 18h6' />
      <path d='M10 21h4' />
      <path d='M12 2a6 6 0 0 0-4 10.5c.6.55 1 1.4 1 2.3V16h6v-1.2c0-.9.4-1.75 1-2.3A6 6 0 0 0 12 2z' />
    </svg>
  );
}
