import { Skeleton } from '@/shared/components/product';

/** Mirrors `ReservationRow` so the list doesn't jump when data lands. */
export function ReservationsListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul aria-hidden className='divide-y divide-[#eef0f7]'>
      {Array.from({ length: rows }, (_, index) => (
        <li
          key={index}
          className='flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6'
        >
          <div className='flex gap-2 sm:w-28 sm:shrink-0 sm:flex-col sm:gap-2'>
            <Skeleton className='h-5 w-24' />
            <Skeleton className='h-4 w-20' />
          </div>
          <div className='flex flex-1 flex-col gap-2'>
            <Skeleton className='h-5 w-1/2' />
            <Skeleton className='h-4 w-3/4' />
          </div>
          <div className='flex gap-2'>
            <Skeleton className='h-9 flex-1 rounded-[10px] sm:w-24 sm:flex-none' />
            <Skeleton className='h-9 flex-1 rounded-[10px] sm:w-28 sm:flex-none' />
          </div>
        </li>
      ))}
    </ul>
  );
}
