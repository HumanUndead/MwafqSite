import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import {
  marketingHeaderOffsetClass,
  type MarketingHeaderOffsetVariant,
} from '@/shared/components/marketing/marketingHeaderOffset';

type MarketingStickyHeaderOffsetProps<T extends ElementType> = {
  as?: T;
  variant: MarketingHeaderOffsetVariant;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

export function MarketingStickyHeaderOffset<T extends ElementType = 'div'>({
  as,
  variant,
  className,
  children,
  ...props
}: MarketingStickyHeaderOffsetProps<T>) {
  const Component = as ?? 'div';

  return (
    <Component
      className={marketingHeaderOffsetClass(variant, className)}
      {...props}
    >
      {children}
    </Component>
  );
}
