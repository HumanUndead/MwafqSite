'use client';

import { cn } from '@/shared/lib/cn';
import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
  error,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const update = (index: number, char: string) => {
    const next = digits.map((d, i) => (i === index ? char : d)).join('');
    onChange(next);
    if (char && index < length - 1) inputsRef.current[index + 1]?.focus();
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
    <div className='flex justify-center gap-3'>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type='text'
          inputMode='numeric'
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => update(i, e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={cn(
            'size-12 rounded-lg border text-center text-lg font-semibold',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
            error
              ? 'border-red-500 text-red-600'
              : 'border-gray-300 text-gray-900',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        />
      ))}
    </div>
  );
}
