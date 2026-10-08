/**
 * Classes for shadcn `Tabs` (variant='line') on product pages: an underlined
 * row that scrolls sideways on narrow screens instead of wrapping.
 */
export const productTabsListClass =
  'h-auto group-data-[orientation=horizontal]/tabs:h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b border-[#e5e7f0] bg-transparent p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export const productTabsTriggerClass =
  'h-11 flex-none rounded-none border-0 bg-transparent px-0.5 text-[15px] font-semibold text-[#6b7196] shadow-none hover:text-[#1e2364] focus-visible:ring-2 focus-visible:ring-[#00a8f1] data-active:bg-transparent data-active:text-[#1e2364] data-active:shadow-none after:!bottom-[-1px] after:bg-[#00a8f1]';

/** Count next to a tab or filter label. */
export const productCountClass =
  'ms-1.5 inline-flex min-w-5 items-center justify-center rounded-md bg-[#f0f1f6] px-1.5 text-[12px] font-semibold tabular-nums text-[#4a5078]';
