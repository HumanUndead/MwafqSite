'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';

interface StepFooterProps {
  ready: boolean;
  /** What's missing (not ready) or what comes next (ready). */
  hint: string;
  nextLabel?: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  busy?: boolean;
  /** Extra trailing content inside the primary button (e.g. total). */
  nextAccessory?: ReactNode;
}

/**
 * Sticky step actions. Next is never disabled: pressing it while the step
 * is incomplete flashes the hint instead, so the user learns what's missing.
 */
export function StepFooter({
  ready,
  hint,
  nextLabel,
  onNext,
  onBack,
  busy = false,
  nextAccessory,
}: StepFooterProps) {
  const t = useTranslations('checkout');
  const [flash, setFlash] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  function handleNext() {
    if (busy) return;
    if (ready) {
      onNext();
      return;
    }
    setFlash(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFlash(false), 1200);
  }

  return (
    <div className='sticky bottom-0 z-30 -mx-4 mt-8 border-t-2 border-[#e5e7f0] bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-[20px] sm:border-2'>
      <div className='flex items-center gap-3'>
        {onBack && (
          <Button variant='outline' type='button' onClick={onBack} className='shrink-0'>
            <ArrowLeft className='size-4 rtl:rotate-180' aria-hidden />
            <span className='max-[480px]:sr-only'>{t.back}</span>
          </Button>
        )}
        <p
          className={cn(
            'min-w-0 flex-1 truncate text-sm font-semibold transition-colors',
            flash ? 'text-red-600' : ready ? 'text-[#1e2364]' : 'text-[#6b7196]'
          )}
          aria-live='polite'
        >
          {hint}
        </p>
        <Button
          variant='brand'
          type='button'
          onClick={handleNext}
          loading={busy}
          aria-disabled={!ready}
          className={cn('shrink-0 rounded-[14px]', !ready && 'opacity-60')}
        >
          {nextLabel ?? t.next}
          {nextAccessory}
          {!busy && !nextAccessory && (
            <ArrowRight className='size-4 rtl:rotate-180' aria-hidden />
          )}
        </Button>
      </div>
    </div>
  );
}
