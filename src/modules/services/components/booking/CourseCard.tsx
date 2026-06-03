'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { CheckSmIcon } from '@/shared/components/icons/academy/CheckSmIcon';
import { SarIcon } from '@/shared/components/icons/booking/SarIcon';

export type CourseCardProps = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  fullImagePath: string;
  isSelected: boolean;
  onSelect: (id: number) => void;
};

export function CourseCard({
  id,
  name,
  description,
  price,
  fullImagePath,
  isSelected,
  onSelect,
}: CourseCardProps) {
  const imageSrc = fullImagePath
    ? `${MWAFQ_API_BASE_URL}/${fullImagePath}.png`
    : '/demo-assets/logo.svg';

  return (
    <Button
      onClick={() => onSelect(id)}
      aria-pressed={isSelected}
      className={cn(
        'h-auto w-full flex-col overflow-hidden rounded-[14px] border-2 bg-white p-0 font-normal whitespace-normal text-start transition-all duration-250',
        isSelected
          ? 'border-[#00a8f1] shadow-[inset_0_0_0_1px_#00a8f1]'
          : 'border-[#e5e7f0] hover:-translate-y-0.5 hover:border-[#00a8f1]'
      )}
    >
      <div className='relative aspect-16/10 w-full overflow-hidden bg-[#eef0f7]'>
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes='(max-width: 640px) 100vw, 50vw'
          className={cn(
            'transition-transform duration-500 group-hover/button:scale-[1.04]',
            fullImagePath ? 'object-cover' : 'object-contain p-6'
          )}
        />
        <span
          aria-hidden
          className={cn(
            'absolute inset-e-2.5 top-2.5 inline-flex size-[26px] items-center justify-center rounded-full bg-[#00a8f1] text-white transition-all duration-250',
            isSelected ? 'scale-100 opacity-100' : 'scale-[0.6] opacity-0'
          )}
        >
          <CheckSmIcon className='size-3.5' />
        </span>
      </div>

      <div className='flex w-full flex-1 flex-col gap-1.5 px-4 pb-4 pt-3.5'>
        <span className='block text-[14.5px] font-extrabold leading-snug tracking-[-0.2px] text-[#1e2364]'>
          {name}
        </span>
        {description ? (
          <span className='block text-[12px] font-medium leading-relaxed text-[#6b7196]'>
            {description}
          </span>
        ) : null}
        {price ? (
          <div className='mt-1.5 flex items-center justify-end gap-1'>
            <span className='text-[18px] font-extrabold leading-none tracking-[-0.4px] text-[#1e2364]'>
              {price}
            </span>
            <SarIcon className='size-[15px] text-[#1e2364]' />
          </div>
        ) : null}
      </div>
    </Button>
  );
}
