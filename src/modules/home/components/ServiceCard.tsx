'use client';

import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import { ArrowIcon } from '@/shared/components/icons/home';

const CORNER_SVG = `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath d='M 0 0 L 30 0 L 30 10 L 10 10 L 10 30 L 0 30 Z' fill='%2300a8f1'/%3E%3C/svg%3E")`;

interface Props {
  href: string;
  title: string;
  description: string;
  iconKey?: string | null;
  rtl: boolean;
  index?: number;
  compact?: boolean;
}

export function ServiceCard({
  href,
  title,
  description,
  rtl,
  compact = false,
}: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex h-full min-h-0 flex-col overflow-hidden border-2 border-[#e5e7f0] bg-white',
        compact
          ? 'min-h-[220px] rounded-[4px_22px_4px_22px] px-4 pb-5 pt-10 active:scale-[0.98] touch-manipulation'
          : 'rounded-[4px_28px_4px_28px] px-6 pb-7 pt-12 transition-all duration-400 hover:-translate-y-1 hover:bg-[#fbfcff]',
        rtl && (compact ? 'rounded-[22px_4px_22px_4px]' : 'rounded-[28px_4px_28px_4px]'),
        compact
          ? ''
          : [
              'before:absolute before:top-0 before:left-0 before:right-0 before:h-2.5 before:origin-left before:scale-x-0 before:bg-[#00a8f1] before:content-[\'\'] before:transition-transform before:duration-500',
              'after:absolute after:bottom-0 after:left-0 after:top-7.5 after:w-2.5 after:origin-top after:scale-y-0 after:bg-[#00a8f1] after:content-[\'\'] after:transition-transform after:duration-500',
              'hover:before:scale-x-100 hover:after:scale-y-100',
              rtl && [
                'before:origin-right before:left-auto before:right-7.5',
                'after:left-auto after:right-0',
              ],
            ],
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364] focus-visible:ring-offset-2'
      )}
    >
      <div
        aria-hidden='true'
        className={cn(
          'pointer-events-none absolute top-0 z-2',
          compact ? 'h-6 w-6' : 'h-7.5 w-7.5',
          rtl ? 'right-0 scale-x-[-1]' : 'left-0'
        )}
        style={{
          backgroundImage: CORNER_SVG,
          backgroundSize: '100%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div
        className={cn(
          'font-bold leading-[1.3] tracking-[-0.3px] text-[#1e2364]',
          compact
            ? 'mb-2 min-h-10 text-[14px] leading-[1.35]'
            : 'mb-2.5 min-h-11 text-[17px]'
        )}
      >
        {title}
      </div>

      {description ? (
        <div
          className={cn(
            'line-clamp-2 text-[#6b7196]',
            compact ? 'mb-4 text-[12px] leading-[1.55]' : 'mb-5 text-[13px] leading-[1.6]'
          )}
        >
          {description}
        </div>
      ) : (
        <div className={compact ? 'mb-4' : 'mb-5'} />
      )}

      <div
        className={cn(
          'mt-auto flex items-center border-t-2 border-[#e5e7f0]',
          compact ? 'pt-3.5' : 'pt-4',
          rtl ? 'justify-start' : 'justify-end'
        )}
      >
        <span
          aria-hidden='true'
          className={cn(
            'inline-flex items-center justify-center rounded-full border-2 border-[#e5e7f0] bg-[#f7f8fb] text-[#1e2364]',
            compact
              ? 'size-8'
              : 'size-9 transition-all duration-400 group-hover:border-[#00a8f1] group-hover:bg-[#00a8f1] group-hover:text-white group-hover:shadow-md'
          )}
        >
          <ArrowIcon
            className={cn(
              compact ? 'size-3.5' : 'size-4 transition-transform duration-400',
              rtl && 'rotate-180',
              !compact && rtl && 'group-hover:-translate-x-0.5',
              !compact && !rtl && 'group-hover:translate-x-0.5'
            )}
          />
        </span>
      </div>
    </Link>
  );
}
