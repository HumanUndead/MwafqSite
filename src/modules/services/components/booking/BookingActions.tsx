'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button, buttonVariants } from '@/components/ui/button';
import { isRtl, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

type BookingActionsProps = {
  locale: Locale;
  cancelHref: string;
  cancelLabel: string;
  nextLabel: string;
  backLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
  nextDisabled?: boolean;
  showBack?: boolean;
  hideNext?: boolean;
};

export function BookingActions({
  locale,
  cancelHref,
  cancelLabel,
  nextLabel,
  backLabel,
  onNext,
  onBack,
  nextDisabled = false,
  showBack = false,
  hideNext = false,
}: BookingActionsProps) {
  const rtl = isRtl(locale);
  const NextArrow = rtl ? ArrowLeft : ArrowRight;

  return (
    <div className='flex items-center justify-end gap-3 border-t border-[#e5e7f0] pt-[18px]'>
      {showBack && onBack ? (
        <Button
          type='button'
          variant='outline'
          onClick={onBack}
          className='min-w-[84px] rounded-full border-2 border-[#1e2364] bg-white px-3.5 py-[11px] text-[13px] font-semibold text-[#1e2364] shadow-[inset_0_0_0_1px_#1e2364] hover:bg-[#1e2364] hover:text-white'
        >
          {backLabel}
        </Button>
      ) : (
        <Link
          href={cancelHref}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'inline-flex min-w-[84px] items-center justify-center rounded-full border-2 border-[#1e2364] bg-white px-3.5 py-[11px] text-[13px] font-semibold text-[#1e2364] shadow-[inset_0_0_0_1px_#1e2364] hover:bg-[#1e2364] hover:text-white'
          )}
        >
          {cancelLabel}
        </Link>
      )}

      {!hideNext && (
        <Button
          type='button'
          disabled={nextDisabled}
          onClick={onNext}
          className={cn(
            'inline-flex min-w-[84px] items-center justify-center gap-2 rounded-full bg-[#1e2364] px-3.5 py-[11px] text-[13px] font-semibold text-white hover:bg-[#233567] disabled:opacity-50'
          )}
        >
          {nextLabel}
          <NextArrow className='size-4' strokeWidth={2.4} aria-hidden />
        </Button>
      )}
    </div>
  );
}
