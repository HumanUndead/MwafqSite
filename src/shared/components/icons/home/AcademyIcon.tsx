import type { SVGProps } from 'react';

export function AcademyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.9}
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-8 w-8'
      {...props}
    >
      <path d='M2 9.5 12 5l10 4.5-10 4.5-10-4.5Z' />
      <path d='M6 11.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5' />
      <path d='M21 9.5v5' />
    </svg>
  );
}
