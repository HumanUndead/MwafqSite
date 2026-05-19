'use client';

import { useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/shared/lib/cn';

type AcademyTitleUnderlineProps = {
  className?: string;
};

export function AcademyTitleUnderline({ className }: AcademyTitleUnderlineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const inView = useInView(pathRef, { once: true, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <svg
      className={cn(
        'pointer-events-none absolute bottom-[-12px] left-0 right-0 block h-3 w-full',
        className
      )}
      viewBox='0 0 240 12'
      preserveAspectRatio='none'
      aria-hidden
    >
      <path
        ref={pathRef}
        className='fill-none stroke-[#00dec9] stroke-4 stroke-linecap-round'
        d='M2 8 Q 60 1 120 6 T 238 5'
        style={
          prefersReducedMotion
            ? { strokeDashoffset: 0 }
            : {
                strokeDasharray: 600,
                strokeDashoffset: inView ? 0 : 600,
                transition:
                  'stroke-dashoffset 1.6s cubic-bezier(0.59, 0.06, 0.1, 1)',
              }
        }
      />
    </svg>
  );
}
