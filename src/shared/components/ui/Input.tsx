import { cn } from '@/shared/lib/cn';
import { inputVariants, labelVariants } from '@/shared/lib/variants';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const messageId = inputId ? `${inputId}-message` : undefined;
  const message = error || hint;

  return (
    <div className='flex flex-col gap-1'>
      {label && (
        <label htmlFor={inputId} className={labelVariants()}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cn(
          inputVariants({ state: error ? 'error' : 'default' }),
          className
        )}
        {...props}
      />
      {error && (
        <p id={messageId} className='text-xs text-red-600'>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={messageId} className='text-xs text-gray-500'>
          {hint}
        </p>
      )}
    </div>
  );
});
