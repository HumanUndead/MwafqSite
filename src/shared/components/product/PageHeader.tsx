import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Primary page action(s). Stacks under the title on mobile. */
  actions?: ReactNode;
  className?: string;
}

/** Page title block: one h1, a short purpose line, and the page's main action. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className='min-w-0'>
        <h1 className='text-[24px] font-bold leading-tight text-[#1e2364] sm:text-[28px]'>
          {title}
        </h1>
        {description ? (
          <p className='mt-1.5 max-w-[60ch] text-[15px] leading-6 text-[#6b7196]'>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className='flex shrink-0 flex-wrap items-center gap-2 max-sm:[&>*]:flex-1'>
          {actions}
        </div>
      ) : null}
    </header>
  );
}
