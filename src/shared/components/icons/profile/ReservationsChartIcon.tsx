import type { SVGProps } from 'react';

export function ReservationsChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={true}
      {...props}
    >
      <polyline points="3 12 6 12 9 4 15 20 18 12 21 12" />
    </svg>
  );
}
