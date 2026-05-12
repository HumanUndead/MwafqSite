'use client'

import { cn } from '@/shared/lib/cn'
import { modalVariants } from '@/shared/lib/variants'
import type { VariantProps } from 'class-variance-authority'
import { useEffect, type ReactNode } from 'react'

interface ModalProps extends VariantProps<typeof modalVariants> {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, size, className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(modalVariants({ size }), className)}>
        {title && (
          <h2 className="mb-4 text-xl font-semibold text-gray-900">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
