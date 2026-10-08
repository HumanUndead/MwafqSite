'use client';

import { cn } from '@/shared/lib/cn';
import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  /** Accessible label per box, e.g. (i) => `Digit ${i + 1} of 4`. */
  getDigitLabel?: (index: number) => string;
  /** Id of the element describing the error, linked via aria-describedby. */
  errorId?: string;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
  error,
  getDigitLabel,
  errorId,
  autoFocus,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const update = (index: number, raw: string) => {
    // Autofill / IME can drop several digits into one box.
    if (raw.length > 1) {
      const filled = raw.slice(0, length - index);
      const next = (digits.slice(0, index).join('') + filled).slice(0, length);
      onChange(next);
      inputsRef.current[Math.min(next.length, length - 1)]?.focus();
      return;
    }
    const next = digits.map((d, i) => (i === index ? raw : d)).join('');
    onChange(next);
    if (raw && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKey = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    // Codes read left to right in both languages.
    <div className='flex justify-center gap-2.5 sm:gap-3' dir='ltr' role='group'>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type='text'
          inputMode='numeric'
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          autoFocus={autoFocus && i === 0}
          maxLength={i === 0 ? length : 1}
          value={digit}
          disabled={disabled}
          aria-label={getDigitLabel?.(i)}
          aria-invalid={error || undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => update(i, e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'size-14 rounded-xl border bg-white text-center text-[22px] font-bold tabular-nums text-[#1e2364] transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-[#d9ddea] focus:border-[#1e2364] focus:ring-[#1e2364]/30',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        />
      ))}
    </div>
  );
}
