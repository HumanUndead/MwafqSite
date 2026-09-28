import { ContinueLearningCardSkeleton } from './ContinueLearningCard';
import { EnrolledCourseCardSkeleton } from './EnrolledCourseCard';

/** Loading state for `AcademyCoursesView` (e.g. a route `loading.tsx`). */
export function AcademyCoursesSkeleton() {
  return (
    <section className='flex flex-col gap-8' aria-busy>
      <div className='flex items-center justify-between gap-4'>
        <div className='h-8 w-64 max-w-[70%] animate-pulse rounded-full bg-[#e5e7f0] motion-reduce:animate-none' />
        <div className='h-10 w-28 animate-pulse rounded-full bg-[#e5e7f0] motion-reduce:animate-none' />
      </div>
      <ContinueLearningCardSkeleton />
      <div className='flex flex-col gap-4'>
        <div className='h-6 w-40 animate-pulse rounded-full bg-[#e5e7f0] motion-reduce:animate-none' />
        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 3 }, (_, i) => (
            <EnrolledCourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
