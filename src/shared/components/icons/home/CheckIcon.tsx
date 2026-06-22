import type { SVGProps } from 'react';

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.6}
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-[18px] w-[18px]'
      {...props}
    >
      <polyline points='20 6 9 17 4 12' />
    </svg>
  );
}
