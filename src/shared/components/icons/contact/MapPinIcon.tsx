import type { SVGProps } from 'react';

export function MapPinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden={true}
      {...props}
    >
      <path d='M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z' />
      <circle cx='12' cy='10' r='3' />
    </svg>
  );
}
