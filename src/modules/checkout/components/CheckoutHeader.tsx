'use client';

import { X } from 'lucide-react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';

interface CheckoutHeaderProps {
  title: string;
  subtitle: string;
  step: number;
  total: number;
  onLeave: () => void;
}

export function CheckoutHeader({
  title,
  subtitle,
  step,
  total,
  onLeave,
}: CheckoutHeaderProps) {
  const t = useTranslations('checkout');
  const label = interpolate(t.stepOf, { step, total });

  return (
    <header className='mb-6'>
      <div className='mb-4 flex items-center justify-between gap-4'>
        <p className='text-[13px] font-bold uppercase tracking-wide text-[#6b7196]'>
          {label}
        </p>
        <button
          type='button'
          onClick={onLeave}
          aria-label={t.leaveAriaLabel}
          className='inline-flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-[#e5e7f0] bg-white text-[#1e2364] hover:bg-[#f3f4f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]'
        >
          <X className='size-5' aria-hidden />
        </button>
      </div>
      <div
        role='progressbar'
        aria-label={t.stepsAriaLabel}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-valuetext={label}
        className='mb-5 flex gap-1.5'
      >
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              index < step ? 'bg-[#00a8f1]' : 'bg-[#e5e7f0]'
            )}
          />
        ))}
      </div>
      <h1 className='text-[clamp(24px,3vw,34px)] font-extrabold leading-tight tracking-[-1px] text-[#1e2364]'>
        {title}
      </h1>
      <p className='mt-1.5 text-[15px] text-[#6b7196]'>{subtitle}</p>
    </header>
  );
}
