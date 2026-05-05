import { cn } from '@/shared/lib/cn'
import type { HTMLAttributes } from 'react'

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-gray-100 bg-white p-6 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}
