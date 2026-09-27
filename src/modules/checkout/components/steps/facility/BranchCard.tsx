'use client';

import { CheckCircle2, Circle, MapPin, Navigation } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { ImageSize, imageUrl } from '@/shared/lib/media';
import { haversineKm } from '../../../checkout.shared';
import type { CheckoutBranch } from '../../../types/checkout.types';
import { WorkingDays } from './WorkingDays';

interface BranchCardProps {
  branch: CheckoutBranch;
  selected: boolean;
  userLocation: { lat: number; lng: number } | null;
  onSelect: () => void;
}

function hasCoords(branch: CheckoutBranch): boolean {
  return Number.isFinite(branch.latitude) && Number.isFinite(branch.longitude);
}

export function BranchCard({ branch, selected, userLocation, onSelect }: BranchCardProps) {
  const t = useTranslations('checkout');
  const [logoFailed, setLogoFailed] = useState(false);
  const distance =
    userLocation && hasCoords(branch)
      ? haversineKm(userLocation, { lat: branch.latitude, lng: branch.longitude })
      : null;
  const directionsHref = hasCoords(branch)
    ? `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`
    : null;

  return (
    <li
      className={cn(
        'rounded-[20px] border-2 bg-white transition-colors',
        selected ? 'border-[#00a8f1] bg-[#f5fbff]' : 'border-[#e5e7f0]'
      )}
    >
      <button
        type='button'
        role='radio'
        aria-checked={selected}
        onClick={onSelect}
        className='flex w-full cursor-pointer items-start gap-3 rounded-[18px] p-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]'
      >
        <span className='relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#f3f4f8] text-lg font-extrabold text-[#1e2364]'>
          {branch.logoPath && !logoFailed ? (
            <Image
              src={imageUrl(branch.logoPath, ImageSize.thumb)}
              alt=''
              fill
              sizes='48px'
              className='object-contain p-1'
              onError={() => setLogoFailed(true)}
            />
          ) : (
            branch.name.trim().charAt(0).toUpperCase()
          )}
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-[15px] font-extrabold text-[#1e2364]'>{branch.name}</span>
          {branch.address && (
            <span className='mt-0.5 flex items-start gap-1 text-[12.5px] text-[#6b7196]'>
              <MapPin className='mt-0.5 size-3.5 shrink-0' aria-hidden />
              {branch.address}
            </span>
          )}
          {distance !== null && (
            <span className='mt-0.5 block text-[12px] font-semibold text-[#00a8f1]'>
              {interpolate(t.facility.distance, { km: distance.toFixed(2) })}
            </span>
          )}
          <span className='mt-2 block'>
            <WorkingDays closingDays={branch.closingDays ?? []} />
          </span>
        </span>
        <span className='flex shrink-0 flex-col items-end gap-2'>
          {selected ? (
            <CheckCircle2 className='size-5 text-[#00a8f1]' aria-hidden />
          ) : (
            <Circle className='size-5 text-[#c7cbe0]' aria-hidden />
          )}
          <SarAmount amount={branch.totalPrice} className='text-[15px] font-extrabold text-[#1e2364]' />
        </span>
      </button>
      {directionsHref && (
        <div className='border-t-2 border-[#eef0f7] px-4 py-2'>
          <a
            href={directionsHref}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 text-[13px] font-bold text-[#00a8f1] hover:text-[#0090d1]'
          >
            <Navigation className='size-3.5' aria-hidden />
            {t.facility.directions}
          </a>
        </div>
      )}
    </li>
  );
}
