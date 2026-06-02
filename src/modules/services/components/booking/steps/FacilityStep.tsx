'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';
import { List, Map } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useBookingBranches } from '@/modules/services/hooks/useBookingBranches';
import type { ServiceProviderBranch } from '@/modules/services/types/booking.types';

import { FacilityListItem } from './FacilityListItem';

const FacilityMapPanel = dynamic(
  () =>
    import('./FacilityMapPanel').then((mod) => ({
      default: mod.FacilityMapPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className='h-full min-h-[200px] w-full animate-pulse bg-[#eaf3f8]' />
    ),
  }
);

type FacilityViewMode = 'map' | 'list';

type FacilityStepLabels = {
  loading: string;
  empty: string;
  loadError: string;
  selectAriaLabel: string;
  viewMap: string;
  viewList: string;
  viewModeAriaLabel: string;
  yourLocation: string;
  locationFallback: string;
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
  const [viewMode, setViewMode] = useState<FacilityViewMode>('map');
  const listRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (branch: ServiceProviderBranch) => {
      onSelect(branch);
      if (viewMode === 'map') {
        requestAnimationFrame(() => {
          const item = listRef.current?.querySelector(
            `[data-branch-id="${branch.id}"]`
          );
          item?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
    },
    [onSelect, viewMode]
  );

  if (loading) {
    return (
      <div className='mb-6'>
        <p className='mb-3 text-[13px] text-[#6b7196]' role='status'>
          {labels.loading}
        </p>
        <div className='mb-[18px] h-10 w-[200px] animate-pulse rounded-[30px] bg-[#eef0f7]' />
        <div className='h-[460px] animate-pulse rounded-[18px] border-2 border-[#e5e7f0] bg-[#f0f2f8] max-md:h-[320px]' />
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

  const isListMode = viewMode === 'list';

  return (
    <div className='mb-6'>
      <div
        className='mb-[18px] inline-flex gap-0.5 rounded-[30px] bg-[#eef0f7] p-1'
        role='tablist'
        aria-label={labels.viewModeAriaLabel}
      >
        <button
          type='button'
          role='tab'
          aria-selected={!isListMode}
          onClick={() => setViewMode('map')}
          className={cn(
            'inline-flex items-center gap-2 rounded-[30px] px-[18px] py-2 text-[13px] font-bold transition-[background,color] duration-200',
            !isListMode
              ? 'bg-white text-[#1e2364] shadow-[inset_0_0_0_1px_#e5e7f0]'
              : 'text-[#6b7196] hover:text-[#1e2364]'
          )}
        >
          <Map className='size-3.5 shrink-0' aria-hidden />
          {labels.viewMap}
        </button>
        <button
          type='button'
          role='tab'
          aria-selected={isListMode}
          onClick={() => setViewMode('list')}
          className={cn(
            'inline-flex items-center gap-2 rounded-[30px] px-[18px] py-2 text-[13px] font-bold transition-[background,color] duration-200',
            isListMode
              ? 'bg-white text-[#1e2364] shadow-[inset_0_0_0_1px_#e5e7f0]'
              : 'text-[#6b7196] hover:text-[#1e2364]'
          )}
        >
          <List className='size-3.5 shrink-0' aria-hidden />
          {labels.viewList}
        </button>
      </div>

      <div
        className={cn(
          'mb-6',
          isListMode
            ? 'h-auto'
            : 'grid h-[460px] grid-cols-1 gap-0 overflow-hidden rounded-[18px] border-2 border-[#e5e7f0] bg-white max-lg:grid-rows-[240px_1fr] max-lg:h-[580px] lg:grid-cols-[280px_1fr] lg:gap-3.5'
        )}
      >
        <div
          ref={listRef}
          role='listbox'
          aria-label={labels.selectAriaLabel}
          className={cn(
            isListMode
              ? 'grid max-h-[276px] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-[#e5e7f0] [&::-webkit-scrollbar-track]:bg-transparent'
              : 'overflow-y-auto border-b-2 border-[#e5e7f0] bg-white p-1.5 max-lg:max-h-none lg:border-b-0 lg:border-e-2 lg:border-[#e5e7f0] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-[#e5e7f0] [&::-webkit-scrollbar-track]:bg-transparent'
          )}
        >
          {branches.map((branch) => (
            <div key={branch.id} data-branch-id={branch.id}>
              <FacilityListItem
                branch={branch}
                isSelected={selectedBranch?.id === branch.id}
                listMode={isListMode}
                onSelect={() => handleSelect(branch)}
              />
            </div>
          ))}
        </div>

        {!isListMode ? (
          <div className='relative min-h-[200px] max-lg:min-h-[240px]'>
            <FacilityMapPanel
              branches={branches}
              selectedBranchId={selectedBranch?.id ?? null}
              userLocationLabel={labels.yourLocation}
              userLocationFallbackLabel={labels.locationFallback}
              onSelect={handleSelect}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
