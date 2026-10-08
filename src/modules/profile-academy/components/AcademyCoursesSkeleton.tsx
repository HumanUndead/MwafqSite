import { Panel, Skeleton } from '@/shared/components/product';

function CourseCardSkeleton() {
  return (
    <div className='flex flex-col overflow-hidden rounded-2xl border border-[#e5e7f0] bg-white'>
      <Skeleton className='aspect-video rounded-none' />
      <div className='flex flex-col gap-2.5 p-4 sm:p-5'>
        <Skeleton className='h-5 w-20' />
        <Skeleton className='h-4 w-4/5' />
        <Skeleton className='h-3.5 w-1/2' />
        <Skeleton className='mt-2 h-1.5 w-full' />
      </div>
      <div className='border-t border-[#eef0f7] px-4 py-3 sm:px-5'>
        <Skeleton className='h-11 w-full rounded-[10px] sm:h-9' />
      </div>
    </div>
  );
}

/** Loading state for `AcademyCoursesView`: header, resume panel, tabs, card grid. */
export function AcademyCoursesSkeleton() {
  return (
    <div className='contents' aria-busy>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='flex flex-col gap-2.5'>
          <Skeleton className='h-7 w-64 max-w-full sm:h-8' />
          <Skeleton className='h-4 w-80 max-w-full' />
        </div>
        <Skeleton className='h-11 w-full rounded-full sm:w-44' />
      </div>

      <Panel>
        <div className='grid gap-5 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:items-center md:gap-6'>
          <Skeleton className='aspect-video rounded-xl' />
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <Skeleton className='h-3.5 w-28' />
              <Skeleton className='h-6 w-3/4' />
              <Skeleton className='h-4 w-1/2' />
            </div>
            <Skeleton className='h-2 w-full' />
            <Skeleton className='h-11 w-full rounded-xl sm:w-40' />
          </div>
        </div>
      </Panel>

      <div className='flex flex-col gap-5'>
        <div className='flex h-11 items-center gap-6 border-b border-[#e5e7f0]'>
          {['w-12', 'w-24', 'w-28', 'w-20'].map((w) => (
            <Skeleton key={w} className={`h-4 shrink-0 ${w}`} />
          ))}
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 3 }, (_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
