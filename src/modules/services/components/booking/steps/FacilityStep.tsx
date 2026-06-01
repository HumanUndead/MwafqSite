'use client';

import { Building2, MapPin } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useBookingBranches } from '@/modules/services/hooks/useBookingBranches';
import type { ServiceProviderBranch } from '@/modules/services/types/booking.types';

type FacilityStepLabels = {
  loading: string;
  empty: string;
  loadError: string;
  selectAriaLabel: string;
};

type FacilityStepProps = {
  serviceGroupId: number;
  selectedBranch: ServiceProviderBranch | null;
  onSelect: (branch: ServiceProviderBranch) => void;
  labels: FacilityStepLabels;
};

export function FacilityStep({
  serviceGroupId,
  selectedBranch,
  onSelect,
  labels,
}: FacilityStepProps) {
  const { branches, loading, error } = useBookingBranches({ serviceGroupId });

  if (loading) {
    return (
      <div className='mb-6'>
        <p className='mb-3 text-[13px] text-[#6b7196]' role='status'>
          {labels.loading}
        </p>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='h-[72px] animate-pulse rounded-xl bg-[#f0f2f8]'
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

  if (!branches.length) {
    return <p className='mb-6 text-[14.5px] text-[#6b7196]'>{labels.empty}</p>;
  }

  return (
    <ul
      className='mb-6 grid max-h-[240px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2'
      aria-label={labels.selectAriaLabel}
    >
      {branches.map((branch) => {
        const isSelected = selectedBranch?.id === branch.id;
        return (
          <li key={branch.id}>
            <button
              type='button'
              onClick={() => onSelect(branch)}
              className={cn(
                'flex w-full items-center gap-3.5 rounded-xl border-2 px-[18px] py-4 text-start transition-colors duration-200',
                isSelected
                  ? 'border-[#00a8f1] bg-[#f0fbff]'
                  : 'border-[#e5e7f0] bg-[#f5f8ff] hover:border-[#00a8f1]/40'
              )}
              aria-pressed={isSelected}
            >
              <span
                className={cn(
                  'inline-flex size-9 shrink-0 items-center justify-center rounded-full',
                  isSelected
                    ? 'bg-[#00a8f1] text-white'
                    : 'bg-white text-[#1e2364]'
                )}
                aria-hidden
              >
                <Building2 className='size-[18px]' strokeWidth={1.8} />
              </span>
              <span className='min-w-0 flex-1'>
                <span className='block truncate text-[15px] font-bold leading-snug text-[#1e2364]'>
                  {branch.name}
                </span>
                {branch.address ? (
                  <span className='mt-0.5 flex items-center gap-1 text-[12.5px] text-[#6b7196]'>
                    <MapPin className='size-3 shrink-0' aria-hidden />
                    <span className='truncate'>{branch.address}</span>
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
