import { cn } from '@/shared/lib/cn';

/**
 * Content shell aligned with the fixed marketing `Header` pill:
 * same width breakpoints (`calc(100% - gutter)`, `max-w-350`).
 * Apply inner padding on child panels, not on this wrapper.
 */
export const marketingAlignedShellClass =
  'mx-auto w-[calc(100%-40px)] min-w-0 max-w-350 max-[1100px]:w-[calc(100%-24px)] max-[560px]:w-[calc(100%-16px)]';

/** @deprecated Prefer `marketingAlignedShellClass` + panel padding. */
export const marketingAlignedContainerClass =
  'mx-auto w-[calc(100%-40px)] min-w-0 max-w-350 px-5 max-[1100px]:w-[calc(100%-24px)] max-[1100px]:px-4 max-[560px]:w-[calc(100%-16px)] max-[560px]:px-3.5';

export function marketingAlignedShellClassName(className?: string) {
  return cn(marketingAlignedShellClass, className);
}

export function marketingAlignedContainerClassName(className?: string) {
  return cn(marketingAlignedContainerClass, className);
}
