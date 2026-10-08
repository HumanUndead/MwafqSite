import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { Dictionary } from '@/locales/types';
import { ErrorState, Panel, Skeleton } from '@/shared/components/product';

type PlayerT = Dictionary['academyPlayer'];

export const overviewContainerClass =
  'mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-16 pt-2 sm:px-6 lg:px-8 lg:pb-20';

/** Skeleton mirroring the overview: header, progress panel, curriculum + side panel. */
export function OverviewSkeleton({ t }: { t: PlayerT }) {
  return (
    <div role='status' aria-live='polite' aria-busy='true' className={overviewContainerClass}>
      <span className='sr-only'>{t.loading}</span>
      <div className='flex flex-col gap-3'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-8 w-3/4 max-w-xl' />
        <Skeleton className='h-4 w-full max-w-2xl' />
        <div className='flex gap-5'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-20' />
        </div>
      </div>

      <Panel>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8'>
          <div className='flex-1 space-y-3'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-2 w-full rounded-full' />
            <Skeleton className='h-3.5 w-28' />
          </div>
          <div className='space-y-3 lg:w-[360px]'>
            <Skeleton className='h-4 w-2/3' />
            <Skeleton className='h-11 w-full rounded-xl' />
          </div>
        </div>
      </Panel>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start'>
        <Panel flush className='overflow-hidden'>
          <div className='space-y-2 px-5 py-4 sm:px-6'>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-3.5 w-28' />
          </div>
          <div className='divide-y divide-[#eef0f7] border-t border-[#eef0f7]'>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className='space-y-2 px-5 py-4 sm:px-6'>
                <Skeleton className='h-4 w-2/3' />
                <Skeleton className='h-3.5 w-1/3' />
              </div>
            ))}
          </div>
        </Panel>
        <Panel className='space-y-3'>
          <Skeleton className='h-5 w-1/2' />
          <Skeleton className='h-3.5 w-full' />
          <Skeleton className='h-3.5 w-5/6' />
          <Skeleton className='h-3.5 w-4/6' />
        </Panel>
      </div>
    </div>
  );
}

/** Load failure: retry, or go back to the course list. */
export function OverviewNotFound({
  t,
  backHref,
  onRetry,
}: {
  t: PlayerT;
  backHref: string;
  onRetry?: () => void;
}) {
  return (
    <div className={overviewContainerClass}>
      <Link
        href={backHref}
        className='inline-flex w-fit items-center gap-1 rounded-md text-[14px] font-semibold text-[#0077ad] transition-colors duration-150 hover:text-[#1e2364] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]'
      >
        <ChevronLeft aria-hidden className='size-4 shrink-0 rtl:rotate-180' />
        {t.backToMyCourses}
      </Link>
      <Panel>
        <ErrorState
          title={t.notFoundTitle}
          description={t.notFoundMessage}
          retryLabel={t.retry}
          onRetry={onRetry}
        />
      </Panel>
    </div>
  );
}
