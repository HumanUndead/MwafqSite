import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Academy surfaces, aligned with the product UI (docs/product-ui.md): a mist
 * page, solid white panels with a 1px border, and a plain white page band.
 * Names are historical; `tone` is kept for call-site compatibility and no
 * longer switches to a dark style.
 */

type GlassTone = 'light' | 'dark';

/** Page ground: plain mist background. */
export function AcademyBackdrop({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative min-h-screen bg-[#f3f4f8]', className)}>{children}</div>
  );
}

type GlassPanelProps<T extends ElementType> = {
  as?: T;
  tone?: GlassTone;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

/** White panel. Same surface as `Panel` from `@/shared/components/product`. */
export function GlassPanel<T extends ElementType = 'div'>({
  as,
  tone,
  className,
  children,
  ...props
}: GlassPanelProps<T>) {
  void tone; // kept in the props so it isn't forwarded to the DOM
  const Component = as ?? 'div';
  return (
    <Component
      className={cn('rounded-2xl border border-[#e5e7f0] bg-white', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Top band of an academy page: white, bordered, standard container. */
export function AcademyStage({
  children,
  className,
  innerClassName,
}: {
  /** Ignored; the band no longer shows a blurred cover. */
  image?: string | null;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <section className={cn('border-b border-[#e5e7f0] bg-white text-[#1e2364]', className)}>
      <div className={cn('mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10', innerClassName)}>
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
          className='stroke-[#e5e7f0]'
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
          className='stroke-[#00a8f1] transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none'
        />
      </svg>
      <span className='absolute text-lg font-bold tabular-nums text-[#1e2364]'>{clamped}%</span>
    </div>
  );
}

/** Small icon + text fact (duration, lessons, level…). Plain text, no pill. */
export function StatChip({
  icon,
  children,
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
        'inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#4a5078] [&_svg]:size-4 [&_svg]:text-[#6b7196]',
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
      <h2 className='text-[19px] font-bold text-[#1e2364] sm:text-[20px]'>{children}</h2>
      {action}
    </div>
  );
}
