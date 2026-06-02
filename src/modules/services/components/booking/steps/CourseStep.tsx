'use client';

import { CourseCard } from '@/modules/services/components/booking/CourseCard';
import { useBookingCourses } from '@/modules/services/hooks/useBookingCourses';

type CourseStepLabels = {
  loading: string;
  empty: string;
  loadError: string;
  selectAriaLabel: string;
  priceLabel: string;
};

type CourseStepProps = {
  serviceGroupId: number;
  selectedCourseId: number | null;
  onSelect: (courseId: number) => void;
  labels: CourseStepLabels;
};

export function CourseStep({
  serviceGroupId,
  selectedCourseId,
  onSelect,
  labels,
}: CourseStepProps) {
  const { courses, loading, error } = useBookingCourses({ serviceGroupId });

  if (loading) {
    return (
      <div className='mb-6'>
        <p className='mb-3 text-[13px] text-[#6b7196]' role='status'>
          {labels.loading}
        </p>
        <div className='grid grid-cols-1 gap-[18px] sm:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='animate-pulse overflow-hidden rounded-[14px] border-2 border-[#e5e7f0]'
            >
              <div className='aspect-16/10 bg-[#f0f2f8]' />
              <div className='space-y-2 p-4'>
                <div className='h-4 w-3/4 rounded bg-[#f0f2f8]' />
                <div className='h-3 w-full rounded bg-[#f0f2f8]' />
                <div className='h-3 w-5/6 rounded bg-[#f0f2f8]' />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className='mb-6 rounded-lg bg-red-50 px-4 py-3 text-[13.5px] font-medium text-red-600'>
        {labels.loadError}
      </p>
    );
  }

  if (!courses.length) {
    return <p className='mb-6 text-[14.5px] text-[#6b7196]'>{labels.empty}</p>;
  }

  return (
    <ul
      className='mb-6 grid grid-cols-1 gap-[18px] sm:grid-cols-2'
      aria-label={labels.selectAriaLabel}
    >
      {courses.map((course) => (
        <li key={course.id}>
          <CourseCard
            id={course.id}
            name={course.name}
            description={course.description}
            price={course.price}
            fullImagePath={course.fullImagePath}
            isSelected={selectedCourseId === course.id}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}
