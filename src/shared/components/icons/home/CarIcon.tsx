import type { SVGProps } from 'react';

export function CarIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d='M5 16l1.2-4.1A2 2 0 0 1 8.12 10.5h7.76a2 2 0 0 1 1.92 1.4L19 16' />
      <path d='M4 16h16v2.2a.8.8 0 0 1-.8.8H18a1 1 0 0 1-1-1V16H7v2a1 1 0 0 1-1 1H4.8a.8.8 0 0 1-.8-.8z' />
      <circle cx='8' cy='16.5' r='1' fill='currentColor' stroke='none' />
      <circle cx='16' cy='16.5' r='1' fill='currentColor' stroke='none' />
    </svg>
  );
}
