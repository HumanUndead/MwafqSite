'use client';

import { CalendarDays, Clock, MapPin, Navigation } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { buttonVariants } from '@/shared/components/ui/Button';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';
import { formatDateDMY } from '@/shared/lib/dates';
import { ImageSize, imageUrl } from '@/shared/lib/media';
import type { ReservationListItem } from '../types/reservations.types';
import { ReservationStatusBadge } from './ReservationStatusBadge';

export function ReservationCard({ reservation }: { reservation: ReservationListItem }) {
  const t = useTranslations('reservations');
  const locale = useLocale();
  const [logoFailed, setLogoFailed] = useState(false);
  const first = reservation.reservationServices?.[0];
  const detailsHref = `${getLocalizedRoute(locale, ROUTES.MY_RESERVATIONS)}/${reservation.id}`;
  const hasCoords =
    Number.isFinite(reservation.latitude) &&
    Number.isFinite(reservation.longitude) &&
    (reservation.latitude !== 0 || reservation.longitude !== 0);
  const serviceNames = (reservation.reservationServices ?? [])
    .map((service) => service.serviceName?.trim())
    .filter(Boolean);

  return (
    <article className='flex h-full flex-col gap-4 rounded-[24px] border-2 border-[#e5e7f0] bg-white p-5'>
      <div className='flex items-start gap-3'>
        <span className='relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#f3f4f8] text-lg font-extrabold text-[#1e2364]'>
          {reservation.serviceProviderBranchLogo && !logoFailed ? (
            <Image
              src={imageUrl(reservation.serviceProviderBranchLogo, ImageSize.thumb)}
              alt=''
              fill
              sizes='48px'
              className='object-contain p-1'
              onError={() => setLogoFailed(true)}
            />
          ) : (
            reservation.serviceProviderBranchName?.trim().charAt(0).toUpperCase()
          )}
        </span>
        <div className='min-w-0 flex-1'>
          <h2 className='text-[16px] font-extrabold leading-snug text-[#1e2364]'>
            {reservation.serviceProviderBranchName}
          </h2>
          {reservation.serviceProviderCityName && (
            <p className='flex items-center gap-1 text-xs text-[#6b7196]'>
              <MapPin className='size-3.5' aria-hidden />
              {reservation.serviceProviderCityName}
            </p>
          )}
        </div>
        <ReservationStatusBadge status={reservation.status} />
      </div>

      {serviceNames.length > 0 && (
        <p className='line-clamp-2 text-sm font-semibold text-[#1e2364]'>
          {serviceNames.join(' · ')}
        </p>
      )}

      <div className='flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#6b7196]'>
        <span className='inline-flex items-center gap-1.5'>
          <CalendarDays className='size-4 text-[#00a8f1]' aria-hidden />
          <span dir='ltr'>{formatDateDMY(reservation.dateChosen)}</span>
        </span>
        {first && (
          <span className='inline-flex items-center gap-1.5'>
            <Clock className='size-4 text-[#00a8f1]' aria-hidden />
            <span dir='ltr'>
              {first.timeFrom?.slice(0, 5)} – {first.timeTo?.slice(0, 5)}
            </span>
          </span>
        )}
      </div>

      <div className='mt-auto flex flex-wrap gap-2 border-t-2 border-[#eef0f7] pt-4'>
        <Link href={detailsHref} className={cn(buttonVariants({ variant: 'brand', size: 'sm' }))}>
          {t.view}
        </Link>
        {hasCoords && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${reservation.latitude},${reservation.longitude}`}
            target='_blank'
            rel='noopener noreferrer'
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <Navigation className='size-4' aria-hidden />
            {t.directions}
          </a>
        )}
      </div>
    </article>
  );
}
