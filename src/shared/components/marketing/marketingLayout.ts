import { cn } from '@/shared/lib/cn';

/** Max width for the fixed header pill — grows on ultra-wide viewports. */
export const marketingHeaderMaxWidthClass =
  'max-w-350 min-[1920px]:max-w-[min(94vw,2280px)] min-[2560px]:max-w-[min(96vw,2680px)]';

/** Max width for homepage / marketing section content. */
export const marketingSectionMaxWidthClass =
  'max-w-330 min-[1920px]:max-w-[min(94vw,2400px)] min-[2560px]:max-w-[min(96vw,2800px)]';

/**
 * Content shell aligned with the fixed marketing `Header` pill:
 * same width breakpoints (`calc(100% - gutter)`, `marketingHeaderMaxWidthClass`).
 * Apply inner padding on child panels, not on this wrapper.
 */
export const marketingAlignedShellClass = cn(
  'mx-auto w-[calc(100%-40px)] min-w-0 max-[1100px]:w-[calc(100%-24px)] max-[560px]:w-[calc(100%-16px)]',
  marketingHeaderMaxWidthClass
);

/** Homepage section inner container — centered, fluid on ultra-wide screens. */
export const marketingSectionShellClass = cn(
  'mx-auto w-full min-w-0',
  marketingSectionMaxWidthClass
);

/** @deprecated Prefer `marketingAlignedShellClass` + panel padding. */
export const marketingAlignedContainerClass = cn(
  marketingAlignedShellClass,
  'px-5 max-[1100px]:px-4 max-[560px]:px-3.5'
);

/** Hero / page title — fluid on large viewports. */
export const marketingHeroTitleClass =
  'text-[clamp(30px,4.5vw,52px)] min-[1920px]:text-[clamp(56px,4.2vw,96px)] min-[2560px]:text-[clamp(68px,4.8vw,112px)]';

/** Section h2 — fluid on large viewports. */
export const marketingSectionHeadingClass =
  'text-[clamp(32px,4.5vw,56px)] min-[1920px]:text-[clamp(56px,3.4vw,84px)] min-[2560px]:text-[clamp(64px,3.8vw,96px)]';

/** Muted lead / body copy under headings. */
export const marketingLeadTextClass =
  'text-[15px] min-[1920px]:text-[clamp(18px,1.1vw,28px)] min-[2560px]:text-[clamp(22px,1.2vw,32px)]';

/** Hero subtitle — scales up on large / ultra-wide viewports. */
export const marketingHeroLeadClass =
  'text-[17.5px] lg:text-[19px] min-[1920px]:text-[clamp(22px,1.35vw,38px)] min-[1920px]:leading-[1.6] min-[2560px]:text-[clamp(28px,1.5vw,44px)]';

/** Hero CTA buttons — scale with viewport past 1920px. */
export const marketingHeroCtaClass =
  'min-[1920px]:px-9 min-[1920px]:py-5 min-[1920px]:text-[18px] min-[2560px]:px-11 min-[2560px]:py-6 min-[2560px]:text-[20px]';

/** Header nav link text. */
export const marketingHeaderNavLinkClass =
  'text-[17px] min-[1920px]:text-[20px] min-[2560px]:text-[22px]';

/** Header auth buttons. */
export const marketingHeaderButtonClass =
  'h-10 px-5 text-[14px] min-[1920px]:h-12 min-[1920px]:px-7 min-[1920px]:text-[16px] min-[2560px]:h-14 min-[2560px]:px-8 min-[2560px]:text-[18px]';

/** Inline stat numbers (hero footer, etc.). */
export const marketingInlineStatValueClass =
  'text-[22px] sm:text-[28px] md:text-[30px] min-[1920px]:text-[clamp(36px,3vw,64px)] min-[2560px]:text-[clamp(44px,3.5vw,80px)]';

/** Inline stat labels. */
export const marketingInlineStatLabelClass =
  'text-[11px] sm:text-[12.5px] min-[1920px]:text-[clamp(14px,1vw,22px)] min-[2560px]:text-[clamp(16px,1.1vw,26px)]';

export function marketingAlignedShellClassName(className?: string) {
  return cn(marketingAlignedShellClass, className);
}

export function marketingAlignedContainerClassName(className?: string) {
  return cn(marketingAlignedContainerClass, className);
}

export function marketingSectionShellClassName(className?: string) {
  return cn(marketingSectionShellClass, className);
}
