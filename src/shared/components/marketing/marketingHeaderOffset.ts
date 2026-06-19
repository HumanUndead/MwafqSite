import { cn } from '@/shared/lib/cn';

/**
 * Top padding below the fixed marketing `Header`.
 * Tune variants here when header height/spacing changes.
 */
export const marketingHeaderOffsetVariants = {
  /** Filter hero card (academy courses, services list). */
  filter: 'pt-[180px] max-[980px]:pt-[150px]',
  /** Standard marketing hero (about, contact). */
  hero: 'pt-40 sm:pt-44',
  /** Taller hero (B2B). */
  heroSpacious: 'pt-36 sm:pt-40 lg:pt-44',
  /** Home landing hero. */
  home: 'pt-44 max-[560px]:pt-24',
  /** Detail pages with breadcrumb (course, service group, profile). */
  detail: 'pt-[120px] sm:pt-[140px] md:pt-[180px]',
  /** Booking / buy flow. */
  detailRoomy: 'pt-[140px] md:pt-[180px]',
} as const;

export type MarketingHeaderOffsetVariant =
  keyof typeof marketingHeaderOffsetVariants;

export function marketingHeaderOffsetClass(
  variant: MarketingHeaderOffsetVariant,
  className?: string
) {
  return cn(marketingHeaderOffsetVariants[variant], className);
}
