'use client'

import { cn } from '@/shared/lib/cn'
import { toastVariants } from '@/shared/lib/variants'
import type { VariantProps } from 'class-variance-authority'
import { useEffect, useState } from 'react'

type ToastType = NonNullable<VariantProps<typeof toastVariants>['type']>

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

let toastHandlers: ((msg: ToastMessage) => void)[] = []

function emit(message: string, type: ToastType) {
  const id = Math.random().toString(36).slice(2)
  toastHandlers.forEach(h => h({ id, message, type }))
}

export const toast = {
  success: (message: string) => emit(message, 'success'),
  error:   (message: string) => emit(message, 'error'),
  info:    (message: string) => emit(message, 'info'),
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts(prev => [...prev, msg])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== msg.id))
      }, 4000)
    }
    toastHandlers.push(handler)
    return () => {
      toastHandlers = toastHandlers.filter(h => h !== handler)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={cn(toastVariants({ type: t.type }))}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
