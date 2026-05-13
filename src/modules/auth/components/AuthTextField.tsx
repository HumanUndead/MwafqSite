'use client'

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface AuthTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: string
  error?: string
  hint?: string
  icon?: ReactNode
  prefix?: ReactNode
  suffix?: ReactNode
  inputClassName?: string
}

export const AuthTextField = forwardRef<HTMLInputElement, AuthTextFieldProps>(function AuthTextField(
  {
    label,
    error,
    hint,
    icon,
    prefix,
    suffix,
    className,
    inputClassName,
    id,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={inputId}
        className="px-1 text-[13px] font-bold tracking-[-0.01em] text-[#1e2364]"
      >
        {label}
      </label>
      <div
        className={cn(
          'flex h-[52px] items-center rounded-[14px] border bg-white px-3.5 transition-[border-color,box-shadow]',
          error
            ? 'border-red-400 shadow-[0_0_0_3px_rgba(220,38,38,0.08)]'
            : 'border-[#d9ddea] focus-within:border-[#1e2364] focus-within:shadow-[0_0_0_3px_rgba(30,35,100,0.08)]',
        )}
      >
        {icon ? <span className="me-3 text-[#a3a8c4]">{icon}</span> : null}
        {prefix ? (
          <span className="me-2 whitespace-nowrap text-sm font-semibold text-[#1e2364]">
            {prefix}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'min-w-0 flex-1 border-0 bg-transparent text-[14px] font-medium text-[#1e2364] outline-none placeholder:text-[#a3a8c4]',
            inputClassName,
          )}
          {...props}
        />
        {suffix ? <span className="ms-2 flex items-center">{suffix}</span> : null}
      </div>
      {error ? <p className="px-1 text-xs text-red-600">{error}</p> : null}
      {!error && hint ? <p className="px-1 text-xs text-[#6b7196]">{hint}</p> : null}
    </div>
  )
})
