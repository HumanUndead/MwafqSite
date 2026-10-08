import { Panel, Skeleton } from '@/shared/components/product';

/** Mirrors the summary + services panels of the details page. */
export function ReservationDetailsSkeleton() {
  return (
    <div aria-busy className='flex flex-col gap-6'>
      <Skeleton className='h-8 w-56' />
      <Panel className='flex flex-col gap-5'>
        <div className='flex items-start justify-between gap-4'>
          <Skeleton className='h-6 w-1/2' />
          <Skeleton className='h-6 w-20' />
        </div>
        <div className='grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2'>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className='flex flex-col gap-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-5 w-40' />
            </div>
          ))}
        </div>
      </Panel>
      <Panel flush>
        <div className='px-5 pt-5 pb-3 sm:px-6'>
          <Skeleton className='h-6 w-32' />
        </div>
        <div className='divide-y divide-[#eef0f7] border-t border-[#eef0f7]'>
          {[0, 1].map((key) => (
            <div
              key={key}
              className='flex justify-between gap-4 px-5 py-4 sm:px-6'
            >
              <div className='flex flex-col gap-2'>
                <Skeleton className='h-5 w-48' />
                <Skeleton className='h-4 w-24' />
              </div>
              <Skeleton className='h-5 w-16' />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
