'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CalendarIcon } from '@/shared/components/icons/profile';
import {
  ClockIcon,
  DownloadIcon,
  EyeIcon,
  MapPinIcon,
} from '@/shared/components/icons/reservations';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/lib/utils';
import { EASE, EASE_BOUNCE } from '../constants';
import type { ResultCardData } from '../types';
import {
  btnOutline,
  btnPrimary,
  reservationCardClass,
  reservationCardContentClass,
  reservationCardFooterClass,
} from '../styles';

type ResultReservationCardProps = {
  card: ResultCardData;
  index: number;
};

export function ResultReservationCard({
  card,
  index,
}: ResultReservationCardProps) {
  const locale = useLocale();
  const t = useTranslations('profileReservations');
  const detailsHref = `/${locale}${ROUTES.MY_RESERVATIONS}/${card.id}?view=info`;
  const hasLocation = Boolean(card.hospital);
  const hasSchedule = Boolean(card.date || card.time);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 32 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          delay: index * 0.1,
          duration: 0.65,
          ease: EASE,
        },
      }}
      className='h-full'
    >
      <Card className={reservationCardClass}>
        <CardContent className={reservationCardContentClass}>
          <div className='flex min-w-0 flex-1 flex-col gap-6'>
            {card.title ? (
              <h2 className='text-xl font-bold leading-snug tracking-[-0.35px] text-[#1e2364]'>
                {card.title}
              </h2>
            ) : null}
            {hasLocation || hasSchedule ? (
              <div className='flex flex-col gap-3 text-sm font-medium text-[#6b7196]'>
                {hasLocation ? (
                  <span className='inline-flex min-w-0 items-start gap-2'>
                    <MapPinIcon className='mt-0.5 size-4 shrink-0 text-sky-500' />
                    <span className='min-w-0 leading-snug'>
                      {card.hospital}
                    </span>
                  </span>
                ) : null}
                {hasSchedule ? (
                  <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                    {card.date ? (
                      <span className='inline-flex min-w-0 items-center gap-2'>
                        <CalendarIcon className='size-4 shrink-0 text-sky-500' />
                        <span className='truncate'>{card.date}</span>
                      </span>
                    ) : null}
                    {card.time ? (
                      <span className='inline-flex min-w-0 items-center gap-2'>
                        <ClockIcon className='size-4 shrink-0 text-sky-500' />
                        <span className='truncate'>{card.time}</span>
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </CardContent>

        <CardFooter
          className={cn(
            reservationCardFooterClass,
            'translate-y-[5px] max-[380px]:flex-col'
          )}
        >
          <Link
            href={detailsHref}
            data-cursor
            className={cn(btnOutline, 'min-w-42')}
          >
            {t.viewInformation}
            <motion.span
              className='inline-flex size-4 shrink-0'
              whileHover={{
                scale: 1.22,
                transition: {
                  duration: 0.4,
                  ease: EASE_BOUNCE,
                },
              }}
            >
              <EyeIcon className='size-4' />
            </motion.span>
          </Link>
          <Link href='#' data-cursor className={cn(btnPrimary, 'min-w-30')}>
            {t.download}
            <motion.span
              className='inline-flex size-4 shrink-0'
              whileHover={{
                y: [0, 5, 0],
                transition: { duration: 0.55, ease: EASE },
              }}
            >
              <DownloadIcon className='size-4' />
            </motion.span>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
