import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type PanelProps = ComponentPropsWithoutRef<'section'> & {
  /** Drop the inner padding, e.g. for a row list that runs edge to edge. */
  flush?: boolean;
};

/** The one surface for product pages: white, 1px border, 16px radius. Never nest. */
export function Panel({ flush = false, className, children, ...props }: PanelProps) {
  return (
    <section
      className={cn(
        'min-w-0 rounded-2xl border border-[#e5e7f0] bg-white',
        !flush && 'p-5 sm:p-6',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

interface PanelHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Heading level; panels sit under the page h1. */
  as?: 'h2' | 'h3';
  id?: string;
  className?: string;
}

/** Title row of a panel or page section, with an optional end-aligned action. */
export function PanelHeader({
  title,
  description,
  action,
  as: Heading = 'h2',
  id,
  className,
}: PanelHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className='min-w-0'>
        <Heading id={id} className='text-[17px] font-bold leading-6 text-[#1e2364]'>
          {title}
        </Heading>
        {description ? (
          <p className='mt-0.5 text-[13.5px] leading-5 text-[#6b7196]'>{description}</p>
        ) : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </div>
  );
}
