import { cn } from '@/shared/lib/cn'
import { spinnerVariants } from '@/shared/lib/variants'
import type { VariantProps } from 'class-variance-authority'

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string
}

export function Spinner({ size, className }: SpinnerProps) {
  return (
    <span
      className={cn(spinnerVariants({ size }), className)}
      role="status"
      aria-label="Loading"
    />
  )
}
