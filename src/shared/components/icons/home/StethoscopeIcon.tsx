import type { SVGProps } from 'react';

export function StethoscopeIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d='M6 4v5a3 3 0 0 0 6 0V4' />
      <path d='M9 12v2a5 5 0 0 0 10 0v-2.5' />
      <circle cx='19' cy='9' r='2' />
      <path d='M4 4v0' />
    </svg>
  );
}
