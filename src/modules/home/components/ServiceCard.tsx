'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { ArrowIcon } from '@/shared/components/icons/home';

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

interface Props {
  href: string;
  title: string;
  description: string;
  rtl: boolean;
}

export function ServiceCard({ href, title, description, rtl }: Props) {
  const [active, setActive] = useState(false);
  // Monogram from the service name — Unicode-safe (handles Arabic).
  const monogram = ([...title.trim()][0] ?? '').toUpperCase();

  return (
    <Link
      href={href}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchCancel={() => setActive(false)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[24px] border bg-white p-5 transition-[transform,box-shadow,border-color] duration-400 sm:p-6',
        EASE,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364] focus-visible:ring-offset-2',
        active
          ? '-translate-y-1.5 border-[#00a8f1]/40 shadow-xl'
          : 'border-[#e5e7f0] shadow-sm'
      )}
    >
      {/* Radial brand glow — brightens on interaction (brand guideline: radial gradient) */}
      <span
        aria-hidden='true'
        className={cn(
          'pointer-events-none absolute -top-16 -inset-e-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,168,241,0.35),transparent_70%)] blur-2xl transition-opacity duration-500',
          active ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Gradient monogram tile */}
      <span
        aria-hidden='true'
        className={cn(
          'relative z-1 inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-linear-to-br from-[#1e2364] to-[#00a8f1] text-[22px] font-extrabold text-white shadow-md transition-transform duration-400 sm:h-14 sm:w-14 sm:text-[26px]',
          EASE,
          active && 'scale-110'
        )}
      >
        {monogram}
      </span>

      <h3 className='relative z-1 mt-4 text-[16px] font-bold leading-tight tracking-[-0.2px] text-[#1e2364] sm:text-[18px]'>
        {title}
      </h3>

      {description && (
        <p className='relative z-1 mt-2 hidden line-clamp-2 text-[13px] leading-[1.55] text-[#6b7196] md:block'>
          {description}
        </p>
      )}

      {/* Arrow affordance — pinned to the bottom, fills on interaction */}
      <span className='relative z-1 mt-auto flex items-center justify-end pt-5'>
        <span
          aria-hidden='true'
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-400',
            EASE,
            active ? 'bg-[#00a8f1] text-white' : 'bg-[#eef1f8] text-[#1e2364]'
          )}
        >
          <ArrowIcon
            className={cn(
              'h-4 w-4 transition-transform duration-400',
              EASE,
              rtl && 'rotate-180',
              active && (rtl ? '-translate-x-0.5' : 'translate-x-0.5')
            )}
          />
        </span>
      </span>
    </Link>
  );
}
