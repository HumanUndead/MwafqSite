import type { SVGProps } from 'react';

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
      className='h-3.5 w-3.5 text-[#00a8f1]'
      {...props}
    >
      <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26' />
    </svg>
  );
}
