'use client'

import { cn } from '@/shared/lib/cn'
import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

let toastHandlers: ((msg: ToastMessage) => void)[] = []

function emit(message: string, type: ToastType) {
  const id = Math.random().toString(36).slice(2)
  toastHandlers.forEach(h => h({ id, message, type }))
}

export const toast = {
  success: (message: string) => emit(message, 'success'),
  error: (message: string) => emit(message, 'error'),
  info: (message: string) => emit(message, 'info'),
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
        <div
          key={t.id}
          className={cn(
            'rounded-lg border px-4 py-3 text-sm font-medium shadow-md',
            typeStyles[t.type]
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
