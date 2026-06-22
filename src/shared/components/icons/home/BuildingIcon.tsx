import type { SVGProps } from 'react';

export function BuildingIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d='M4 20h16' />
      <path d='M7 20V6.8A1.8 1.8 0 0 1 8.8 5h6.4A1.8 1.8 0 0 1 17 6.8V20' />
      <path d='M10 9h.01M14 9h.01M10 12h.01M14 12h.01' />
      <path d='M11 20v-3h2v3' />
    </svg>
  );
}
