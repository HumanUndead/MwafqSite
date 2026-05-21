import type { ScrollRevealProps } from '@/shared/components/motion/ScrollReveal';

/** Default ScrollReveal settings for {@link MwafqPagination} (in-view, once). */
export const paginationScrollReveal = {
  variant: 'y',
  transitionDelay: 0.1,
} as const satisfies Pick<ScrollRevealProps, 'variant' | 'transitionDelay'>;
