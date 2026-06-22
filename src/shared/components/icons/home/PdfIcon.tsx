import type { SVGProps } from 'react';

export function PdfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.1}
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-5 w-5'
      {...props}
    >
      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
      <polyline points='14 2 14 8 20 8' />
      <path d='M8 13h1.3a1.7 1.7 0 1 0 0-3.4H8V16' />
      <path d='M12 16v-6h1.2a2.3 2.3 0 0 1 0 4.6H12' />
      <path d='M17 13h-2.5' />
      <path d='M14.5 16v-6' />
    </svg>
  );
}
