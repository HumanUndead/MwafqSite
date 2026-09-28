import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/shared/lib/cn';
import { MEDIA_FALLBACK_IMAGE } from '@/shared/lib/media';

/**
 * Academy design primitives: a mist page with a soft sky/indigo glow, frosted
 * glass panels, and one dark "stage" hero. Every academy screen composes
 * these instead of hand-rolling surfaces, so the section reads as one system.
 */

/** Page ground: plain mist background. */
export function AcademyBackdrop({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative isolate min-h-screen bg-[#f3f4f8]', className)}>
      {children}
    </div>
  );
}

type GlassTone = 'light' | 'dark';

const glassTone: Record<GlassTone, string> = {
  light:
    'border border-white/70 bg-white/70 shadow-[0_8px_32px_-12px_rgba(30,35,100,0.18)] backdrop-blur-xl',
  dark: 'border border-white/15 bg-white/10 text-white shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl',
};

type GlassPanelProps<T extends ElementType> = {
  as?: T;
  tone?: GlassTone;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

/** Frosted surface. `light` on the mist page, `dark` on the stage. */
export function GlassPanel<T extends ElementType = 'div'>({
  as,
  tone = 'light',
  className,
  children,
  ...props
}: GlassPanelProps<T>) {
  const Component = as ?? 'div';
  return (
    <Component className={cn('rounded-[24px]', glassTone[tone], className)} {...props}>
      {children}
    </Component>
  );
}

/**
 * The academy's signature hero: deep navy with an optional blurred course
 * image and a sky glow. Content sits in the standard container.
 */
export function AcademyStage({
  image,
  children,
  className,
  innerClassName,
}: {
  image?: string | null;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <section
      className={cn(
        'relative isolate overflow-hidden bg-[#141848] text-white',
        className
      )}
    >
      {/* The fallback logo is not a cover photo: never blur it in. */}
      {image && image !== MEDIA_FALLBACK_IMAGE ? (
        <Image
          src={image}
          alt=''
          fill
          priority
          sizes='100vw'
          className='-z-20 scale-110 object-cover opacity-30 blur-2xl'
        />
      ) : null}
      <div
        aria-hidden
        className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(0,168,241,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(91,99,214,0.35),transparent_60%)]'
      />
      <div
        aria-hidden
        className='absolute inset-0 -z-10 bg-gradient-to-b from-[#1e2364]/60 to-[#141848]'
      />
      <div
        className={cn(
          'mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14',
          innerClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Circular progress (0–100) with the value in the middle. */
export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  tone = 'dark',
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: GlassTone;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className='relative inline-flex shrink-0 items-center justify-center'
      style={{ width: size, height: size }}
      role='progressbar'
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg width={size} height={size} className='-rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          strokeWidth={stroke}
          className={tone === 'dark' ? 'stroke-white/15' : 'stroke-[#e5e7f0]'}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          strokeWidth={stroke}
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className='stroke-[#00a8f1] transition-[stroke-dashoffset] duration-700 ease-out'
        />
      </svg>
      <span
        className={cn(
          'absolute text-lg font-bold',
          tone === 'dark' ? 'text-white' : 'text-[#1e2364]'
        )}
      >
        {clamped}%
      </span>
    </div>
  );
}

/** Small icon + text fact (duration, lessons, level…). */
export function StatChip({
  icon,
  children,
  tone = 'light',
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  tone?: GlassTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold',
        tone === 'dark'
          ? 'bg-white/10 text-white/90 ring-1 ring-white/15'
          : 'bg-white/80 text-[#1e2364] ring-1 ring-[#e5e7f0]',
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Section heading used inside the academy body. */
export function AcademySectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-3', className)}>
      <h2 className='text-xl font-bold text-[#1e2364] sm:text-2xl'>{children}</h2>
      {action}
    </div>
  );
}
