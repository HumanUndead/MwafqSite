'use client';

import { Check, MapPin } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ServiceProviderBranch } from '@/modules/services/types/booking.types';

type FacilityListItemProps = {
  branch: ServiceProviderBranch;
  isSelected: boolean;
  listMode: boolean;
  onSelect: () => void;
};

export function FacilityListItem({
  branch,
  isSelected,
  listMode,
  onSelect,
}: FacilityListItemProps) {
  return (
    <button
      type='button'
      role='option'
      aria-selected={isSelected}
      onClick={onSelect}
      className={cn(
        'relative block w-full cursor-pointer text-start font-[inherit] transition-[background,border-color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
        listMode
          ? cn(
              'rounded-[14px] border-2 border-[#e5e7f0] bg-white px-[18px] py-4',
              'hover:border-[#00a8f1] hover:-translate-y-0.5',
              isSelected &&
                'border-[#00a8f1] shadow-[inset_0_0_0_1px_#00a8f1]'
            )
          : cn(
              'mb-1 rounded-xl border-2 border-transparent px-3.5 py-3',
              'hover:bg-[#eef0f7]',
              isSelected && 'border-[#00a8f1] bg-[#00a8f1]/6'
            )
      )}
    >
      <span className='flex items-start gap-2.5'>
        <span
          className={cn(
            'mt-px inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-200',
            listMode ? 'size-9 bg-[#eef0f7]' : 'size-7 bg-[#eef0f7]',
            isSelected ? 'bg-[#00a8f1] text-white' : 'text-[#6b7196]'
          )}
          aria-hidden
        >
          <MapPin className={cn(listMode ? 'size-4' : 'size-3.5')} strokeWidth={2} />
        </span>
        <span className='min-w-0 flex-1 pe-7'>
          <span
            className={cn(
              'block font-extrabold leading-snug tracking-[-0.1px] text-[#1e2364]',
              listMode ? 'text-[15px]' : 'text-[13.5px]'
            )}
          >
            {branch.name}
          </span>
          {branch.address ? (
            <span
              className={cn(
                'mt-0.5 block font-medium leading-snug text-[#6b7196]',
                listMode ? 'text-[12.5px]' : 'text-[11.5px]'
              )}
            >
              {branch.address}
            </span>
          ) : null}
        </span>
      </span>
      <span
        className={cn(
          'absolute inset-e-2.5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-[#00a8f1] text-white transition-[opacity,transform] duration-200',
          listMode ? 'size-6' : 'size-[22px]',
          isSelected
            ? 'scale-100 opacity-100'
            : 'scale-60 opacity-0'
        )}
        aria-hidden
      >
        <Check className={cn(listMode ? 'size-3.5' : 'size-3')} strokeWidth={3} />
      </span>
    </button>
  );
}
