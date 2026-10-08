import { Panel, Skeleton } from '@/shared/components/product';

/** Loading state matching `PersonalInfoView`: header, contact panel, summary. */
export function PersonalInfoSkeleton() {
  return (
    <div className='contents' aria-busy>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='flex flex-col gap-2.5'>
          <Skeleton className='h-7 w-56 sm:h-8' />
          <Skeleton className='h-4 w-72 max-w-full' />
        </div>
        <Skeleton className='h-11 w-full rounded-xl sm:w-36' />
      </div>

      <Panel>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='mt-2 h-3.5 w-32' />
        <div className='mt-5 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-[#eef0f7] pt-5 sm:grid-cols-2'>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className='flex flex-col gap-2'>
              <Skeleton className='h-3.5 w-24' />
              <Skeleton className='h-5 w-48 max-w-full' />
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <Skeleton className='h-5 w-32' />
        <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className='flex items-center gap-4 sm:flex-col sm:items-start sm:gap-2'>
              <Skeleton className='h-6 w-10' />
              <Skeleton className='h-9 w-28' />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
