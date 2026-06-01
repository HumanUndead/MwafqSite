'use client';

import { BookOpen } from 'lucide-react';

import { cn } from '@/lib/utils';
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
        <div className='grid grid-cols-1 gap-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='h-[80px] animate-pulse rounded-xl bg-[#f0f2f8]'
            />
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
      className='mb-6 grid grid-cols-1 gap-3'
      aria-label={labels.selectAriaLabel}
    >
      {courses.map((course) => {
        const isSelected = selectedCourseId === course.id;
        return (
          <li key={course.id}>
            <button
              type='button'
              onClick={() => onSelect(course.id)}
              className={cn(
                'flex w-full items-start gap-3.5 rounded-xl border-2 px-[18px] py-4 text-start transition-colors duration-200',
                isSelected
                  ? 'border-[#00a8f1] bg-[#f0fbff]'
                  : 'border-[#e5e7f0] bg-[#f5f8ff] hover:border-[#00a8f1]/40'
              )}
              aria-pressed={isSelected}
            >
              <span
                className={cn(
                  'mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full',
                  isSelected
                    ? 'bg-[#00a8f1] text-white'
                    : 'bg-white text-[#1e2364]'
                )}
                aria-hidden
              >
                <BookOpen className='size-[18px]' strokeWidth={1.8} />
              </span>
              <span className='min-w-0 flex-1'>
                <span className='block text-[15px] font-bold leading-snug text-[#1e2364]'>
                  {course.name}
                </span>
                {course.description ? (
                  <span className='mt-0.5 block text-[12.5px] leading-relaxed text-[#6b7196]'>
                    {course.description}
                  </span>
                ) : null}
                {course.price ? (
                  <span className='mt-1 block text-[13px] font-semibold text-[#00a8f1]'>
                    {labels.priceLabel.replace(
                      '{{price}}',
                      String(course.price)
                    )}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
