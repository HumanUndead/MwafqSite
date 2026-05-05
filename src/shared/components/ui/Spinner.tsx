import { cn } from '@/shared/lib/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'size-4', md: 'size-6', lg: 'size-10' }

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
