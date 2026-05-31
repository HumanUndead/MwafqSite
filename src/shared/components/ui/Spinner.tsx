import { cn } from '@/shared/lib/cn';
import { spinnerVariants } from '@/shared/lib/variants';
import type { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export function Spinner({ size, className }: SpinnerProps) {
  return (
    <Loader2
      className={cn(spinnerVariants({ size }), className)}
      role='status'
      aria-label='Loading'
    />
  );
}
