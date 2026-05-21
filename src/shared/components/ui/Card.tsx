import { cn } from '@/shared/lib/cn';
import { cardVariants } from '@/shared/lib/variants';
import type { VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ variant, className, children, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}
