'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { BookingStepId } from '@/modules/services/booking.shared';

type StepLabels = Record<BookingStepId, string>;

const stepperGridClass: Record<number, string> = {
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
};

type BookingStepperProps = {
  steps: readonly BookingStepId[];
  currentStep: BookingStepId;
  labels: StepLabels;
};

export function BookingStepper({
  steps,
  currentStep,
  labels,
}: BookingStepperProps) {
  const currentIndex = Math.max(0, steps.indexOf(currentStep));

  return (
    <nav className='mb-6' aria-label='Booking progress'>
      <ol
        className={cn(
          'relative grid grid-cols-1 gap-0 max-md:overflow-hidden max-md:rounded-2xl max-md:border-2 max-md:border-[#e5e7f0] max-md:bg-white md:gap-4',
          stepperGridClass[steps.length] ?? 'md:grid-cols-4'
        )}
      >
        <div
          className='pointer-events-none absolute top-[19px] hidden h-0.5 bg-[#e5e7f0] md:block md:inset-s-[12%] md:inset-e-[12%]'
          aria-hidden
        />

        {steps.map((stepId, index) => {
          const isDone = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <li
              key={stepId}
              className={cn(
                'relative flex flex-col items-center gap-1 px-2 py-3 text-center max-md:flex-row max-md:items-center max-md:gap-3 max-md:border-b max-md:border-[#e5e7f0] max-md:px-4 max-md:py-3.5 max-md:text-start md:py-0',
                isActive && 'max-md:bg-[#f5f8ff]',
                index === steps.length - 1 && 'max-md:border-b-0'
              )}
            >
              <span
                className={cn(
                  'relative z-1 flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-extrabold transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  isDone && 'border-[#1e2364] bg-[#1e2364] text-white',
                  isActive &&
                    'border-[#00a8f1] bg-white text-[#00a8f1] shadow-[0_0_0_4px_rgba(0,168,241,0.15)]',
                  !isDone &&
                    !isActive &&
                    'border-[#e5e7f0] bg-white text-[#6b7196]'
                )}
                aria-hidden
              >
                {isDone ? (
                  <Check className='size-4 stroke-3' />
                ) : (
                  String(index + 1).padStart(2, '0')
                )}
              </span>
              <span
                className={cn(
                  'text-[13px] font-bold leading-tight md:text-[15px]',
                  isActive && 'text-[#00a8f1]',
                  isDone && 'text-[#1e2364]',
                  !isActive && !isDone && 'text-[#6b7196]'
                )}
              >
                {labels[stepId]}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
