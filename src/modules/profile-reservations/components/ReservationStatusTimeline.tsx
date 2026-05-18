'use client';

import { useTranslations } from '@/i18n/DictionaryProvider';
import { cn } from '@/shared/lib/cn';
import type { TimelineStepId } from '../reservationDetailsMapper';

const STEPS: TimelineStepId[] = ['new', 'accepted', 'progress', 'completed'];

type ReservationStatusTimelineProps = {
  currentStep: TimelineStepId;
};

export function ReservationStatusTimeline({
  currentStep,
}: ReservationStatusTimelineProps) {
  const t = useTranslations('profileReservations').detailPage.timeline;
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <div className='flex flex-row gap-0'>
      {STEPS.map((step, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div
            key={step}
            className='relative flex min-w-0 flex-1 flex-col items-center gap-3 text-center'
          >
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  'absolute inset-s-1/2 top-[9px] z-1 h-0.5 w-full',
                  isPast ? 'bg-[#00a8f1]' : 'bg-[#e5e7f0]'
                )}
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                'relative z-2 box-border size-5 shrink-0 rounded-full border-2 bg-white',
                isPast && 'border-[#00a8f1] bg-[#00a8f1]',
                isCurrent &&
                  'border-[#00a8f1] bg-[radial-gradient(circle_at_center,#00a8f1_0_4px,#fff_4.5px)]',
                !isPast && !isCurrent && 'border-[#e5e7f0]'
              )}
            />
            <span
              className={cn(
                'text-[15px] font-bold leading-tight tracking-[-0.2px]',
                isCurrent && 'text-[#00a8f1]',
                isPast && 'text-[#00a8f1]',
                !isPast && !isCurrent && 'text-[#6b7196]'
              )}
            >
              {t[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
