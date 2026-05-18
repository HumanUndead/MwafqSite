import type { AcademyCourseRow } from './types/academy.types';

export const EASE = [0.22, 1, 0.36, 1] as const;

export const courseCardVariants = {
  rest: {
    y: 0,
    borderColor: '#e5e7f0',
    backgroundColor: '#ffffff',
  },
  hover: {
    y: -4,
    borderColor: '#00a8f1',
    backgroundColor: '#fbfcff',
    transition: { duration: 0.35, ease: EASE },
  },
} as const;

export const courseMediaVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.06,
    transition: { duration: 0.5, ease: EASE },
  },
} as const;
