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

export function ServiceCard({ href, title, description, rtl, index = 0, compact = false }: Props) {
  /* ── Mobile compact — L-shaped card (clip-path matches the brand logo) ── */
  if (compact) {
    /*
     * The Mwafq brand mark is an L-shape: full square with a rectangular
     * notch cut from the bottom-right (LTR) / bottom-left (RTL).
     * Proportions: the L "bar" is ~42% of the card dimension.
     *
     * clip-path polygon, LTR (notch bottom-right):
     *   top-left → top-right → right side down → notch inner corner →
     *   notch bottom → bottom-left → close
     */
    const clipPath = rtl
      ? 'polygon(0% 0%, 100% 0%, 100% 100%, 42% 100%, 42% 58%, 0% 58%)'
      : 'polygon(0% 0%, 100% 0%, 100% 58%, 58% 58%, 58% 100%, 0% 100%)';

    /*
     * Inner corner position: where the L bends.
     * LTR → x=58%, y=58% | RTL → x=42%, y=58%
     */
    const innerCornerStyle = rtl
      ? { top: '58%', left: '42%', transform: 'translate(-50%,-50%)' }
      : { top: '58%', left: '58%', transform: 'translate(-50%,-50%)' };

    return (
      <Link
        href={href}
        className='touch-manipulation transition-[filter,transform] duration-200 active:scale-[0.97] focus-visible:outline-none'
        style={{
          clipPath,
          filter: 'drop-shadow(0 1px 0 #e5e7f0) drop-shadow(0 8px 22px rgba(30,35,100,0.13))',
        }}
      >
        {/* White card body */}
        <div className='relative h-[190px] w-full bg-white'>

          {/* Cyan top stripe — full width */}
          <div className='absolute inset-x-0 top-0 h-[3px] bg-[#00a8f1]' />

          {/* L-corner mark (cyan) — top-left for LTR, top-right for RTL */}
          <div
            aria-hidden='true'
            className={cn(
              'pointer-events-none absolute top-0 z-2 h-7 w-7',
              rtl ? 'right-0 scale-x-[-1]' : 'left-0'
            )}
            style={{ backgroundImage: CORNER_SVG, backgroundSize: '100%', backgroundRepeat: 'no-repeat' }}
          />

          {/* Ghost index number — opposite corner from the foot */}
          <span
            aria-hidden='true'
            className={cn(
              'pointer-events-none absolute top-2 select-none text-[64px] font-black leading-none text-[#1e2364] opacity-[0.04]',
              rtl ? 'left-3' : 'right-3'
            )}
          >
            {String((typeof index === 'number' ? index : 0) + 1).padStart(2, '0')}
          </span>

          {/* Inner-corner accent dot — marks the bend of the L */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute z-10 size-3.5 rounded-full bg-[#00a8f1]/15 ring-2 ring-[#00a8f1]/30'
            style={innerCornerStyle}
          />

          {/* Title — upper area, padded away from L-corner */}
          <div className='absolute inset-x-0 top-8 px-4'>
            <h3 className='line-clamp-3 text-[12.5px] font-bold leading-[1.35] tracking-[-0.15px] text-[#1e2364]'>
              {title}
            </h3>
          </div>

          {/* Arrow — foot of the L */}
          <div
            aria-hidden='true'
            className={cn(
              'absolute bottom-3 inline-flex size-8 items-center justify-center rounded-full bg-[#00a8f1] text-white shadow-[0_4px_12px_rgba(0,168,241,0.35)]',
              rtl ? 'right-3' : 'left-3'
            )}
          >
            <ArrowIcon className={cn('size-3.5', rtl && 'rotate-180')} />
          </div>
        </div>
      </Link>
    );
  }

  /* ── Desktop card ────────────────────────────────────── */
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col overflow-hidden border-2 border-[#e5e7f0] bg-white',
        'rounded-[4px_28px_4px_28px]',
        rtl && 'rounded-[28px_4px_28px_4px]',
        'before:absolute before:top-0 before:left-0 before:right-0 before:h-2.5 before:bg-[#00a8f1] before:origin-left before:scale-x-0 before:content-[\'\'] before:transition-transform before:duration-500',
        'after:absolute after:bottom-0 after:left-0 after:top-7.5 after:w-2.5 after:bg-[#00a8f1] after:origin-top after:scale-y-0 after:content-[\'\'] after:transition-transform after:duration-500',
        rtl && [
          'before:origin-right before:left-auto before:right-7.5',
          'after:left-auto after:right-0',
        ],
        'px-6 pb-7 pt-12',
        'transition-all duration-400 hover:-translate-y-1 hover:bg-[#fbfcff] hover:before:scale-x-100 hover:after:scale-y-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364] focus-visible:ring-offset-2'
      )}
    >
      <div
        aria-hidden='true'
        className={cn('pointer-events-none absolute top-0 z-2 h-7.5 w-7.5', rtl ? 'right-0 scale-x-[-1]' : 'left-0')}
        style={{ backgroundImage: CORNER_SVG, backgroundSize: '100%', backgroundRepeat: 'no-repeat' }}
      />

      <div className='mb-2.5 min-h-11 text-[17px] font-bold leading-[1.3] tracking-[-0.3px] text-[#1e2364]'>
        {title}
      </div>

      {description && (
        <div className='mb-5 line-clamp-2 text-[13px] leading-[1.6] text-[#6b7196]'>
          {description}
        </div>
      )}

      <div className={cn('mt-auto flex items-center border-t-2 border-[#e5e7f0] pt-4', rtl ? 'justify-start' : 'justify-end')}>
        <span
          aria-hidden='true'
          className='inline-flex size-9 items-center justify-center rounded-full border-2 border-[#e5e7f0] bg-[#f7f8fb] text-[#1e2364] transition-all duration-400 group-hover:border-[#00a8f1] group-hover:bg-[#00a8f1] group-hover:text-white group-hover:shadow-md'
        >
          <ArrowIcon
            className={cn(
              'size-4 transition-transform duration-400',
              rtl ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
            )}
          />
        </span>
      </div>
    </Link>
  );
}
