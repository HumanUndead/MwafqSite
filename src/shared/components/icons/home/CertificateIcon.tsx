import type { SVGProps } from 'react';

export function CertificateIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d='M7 5.5h10A1.5 1.5 0 0 1 18.5 7v7A1.5 1.5 0 0 1 17 15.5H7A1.5 1.5 0 0 1 5.5 14V7A1.5 1.5 0 0 1 7 5.5Z' />
      <path d='M8.5 9.5h7M8.5 12h4.5' />
      <path d='M10 15.5v3l2-1.2 2 1.2v-3' />
    </svg>
  );
}
