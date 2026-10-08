'use client';

import { useTranslations } from '@/i18n/DictionaryProvider';
import { ErrorState, Skeleton } from '@/shared/components/product';

/** Row placeholders for a flush Panel list. Mirrors `MemberRow`. */
export function FamilyListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul aria-hidden className='divide-y divide-[#eef0f7]'>
      {Array.from({ length: rows }, (_, index) => (
        <li
          key={index}
          className='flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6'
        >
          <div className='flex flex-1 items-center gap-3'>
            <Skeleton className='size-11 rounded-full' />
            <Skeleton className='h-5 w-40' />
          </div>
          <div className='flex gap-2'>
            <Skeleton className='h-9 flex-1 rounded-[10px] sm:w-24 sm:flex-none' />
            <Skeleton className='h-9 flex-1 rounded-[10px] sm:w-24 sm:flex-none' />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Load failure inside a Panel. */
export function FamilyLoadError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations('family');
  return (
    <ErrorState title={t.loadError} retryLabel={t.retry} onRetry={onRetry} />
  );
}
