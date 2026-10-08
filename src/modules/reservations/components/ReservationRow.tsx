'use client';

import { Navigation } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { ReservationStatusBadge } from '@/modules/reservations/components/ReservationStatusBadge';
import type { ReservationListItem } from '@/modules/reservations/types/reservations.types';
import { buttonVariants } from '@/shared/components/ui/Button';
import { ROUTES } from '@/shared/constants/routes';
import { formatDateDMY } from '@/shared/lib/dates';

function hasCoordinates({ latitude, longitude }: ReservationListItem) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    (latitude !== 0 || longitude !== 0)
  );
}

/** One reservation in the list: when, where, what, status, actions. */
export function ReservationRow({
  reservation,
}: {
  reservation: ReservationListItem;
}) {
  const t = useTranslations('reservations');
  const locale = useLocale();
  const first = reservation.reservationServices?.[0];
  const detailsHref = `${getLocalizedRoute(locale, ROUTES.MY_RESERVATIONS)}/${reservation.id}`;
  const serviceNames = (reservation.reservationServices ?? [])
    .map((service) => service.serviceName?.trim())
    .filter(Boolean);
  const meta = [
    reservation.serviceProviderCityName,
    serviceNames.join(locale === 'ar' ? '، ' : ', '),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className='flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6'>
      <div className='flex items-baseline gap-x-2 tabular-nums sm:w-28 sm:shrink-0 sm:flex-col sm:gap-0.5'>
        <p className='text-[15px] font-bold text-[#1e2364]'>
          <bdi dir='ltr'>{formatDateDMY(reservation.dateChosen)}</bdi>
        </p>
        {first?.timeFrom ? (
          <p className='text-[13px] font-semibold text-[#6b7196]'>
            <bdi dir='ltr'>
              {first.timeFrom.slice(0, 5)}
              {first.timeTo ? ` – ${first.timeTo.slice(0, 5)}` : ''}
            </bdi>
          </p>
        ) : null}
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-x-2.5 gap-y-1'>
          <h2 className='min-w-0 break-words text-[15px] font-bold leading-6 text-[#1e2364]'>
            {reservation.serviceProviderBranchName}
          </h2>
          <ReservationStatusBadge status={reservation.status} />
        </div>
        {meta ? (
          <p className='mt-0.5 line-clamp-2 text-[14px] leading-6 text-[#6b7196]'>
            {meta}
          </p>
        ) : null}
      </div>

      <div className='flex shrink-0 gap-2 max-sm:[&>*]:flex-1'>
        {hasCoordinates(reservation) ? (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${reservation.latitude},${reservation.longitude}`}
            target='_blank'
            rel='noopener noreferrer'
            className={buttonVariants({
              variant: 'productText',
              size: 'compact',
            })}
          >
            <Navigation className='size-4' aria-hidden />
            {t.directions}
          </a>
        ) : null}
        <Link
          href={detailsHref}
          className={buttonVariants({
            variant: 'productSecondary',
            size: 'compact',
          })}
        >
          {t.view}
        </Link>
      </div>
    </li>
  );
}
