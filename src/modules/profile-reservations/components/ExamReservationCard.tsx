'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRightSmIcon } from '@/shared/components/icons/academy';
import { CalendarIcon } from '@/shared/components/icons/profile';
import {
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
} from '@/shared/components/icons/reservations';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/lib/utils';
import { EASE } from '../constants';
import type { ExamCardData } from '../types';
import {
  btnOutline,
  btnPrimary,
  reservationCardClass,
  reservationCardContentClass,
  reservationCardFooterClass,
} from '../styles';
import { statusPillClass } from '../utils';
import { ReorderAppointmentLink } from './ReorderAppointmentLink';

type ExamReservationCardProps = {
  card: ExamCardData;
  index: number;
  chevronShift: number;
};

export function ExamReservationCard({
  card,
  index,
  chevronShift,
}: ExamReservationCardProps) {
  const locale = useLocale();
  const t = useTranslations('profileReservations');
  const detailsHref = `/${locale}${ROUTES.MY_RESERVATIONS}/${card.id}`;
  const hasLocation = Boolean(card.hospital);
  const hasSchedule = Boolean(card.date || card.time);
  const hasPrep = Boolean(card.prepItems?.length);
  const showFooterActions = card.cancelSlot !== 'hidden';

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
      <Card
        className={cn(
          reservationCardClass,
          card.status === 'canceled' && 'bg-[#f2f2f2]'
        )}
      >
        <CardContent className={reservationCardContentClass}>
          <div className='flex min-w-0 flex-1 flex-col gap-6'>
            <div className='flex flex-col gap-2.5'>
              {card.title ? (
                <h2 className='text-xl font-bold leading-snug tracking-[-0.35px] text-[#1e2364]'>
                  {card.title}
                </h2>
              ) : null}
              <span
                className={cn(
                  'inline-flex w-fit items-center rounded-full border px-3.5 py-1.5 text-xs font-medium tracking-wide',
                  statusPillClass(card.status)
                )}
              >
                {t.status[card.status]}
              </span>
            </div>

            {hasLocation || hasSchedule ? (
              <div className='flex flex-col gap-3 text-sm font-medium text-[#6b7196]'>
                {hasLocation ? (
                  <span className='inline-flex min-w-0 items-start gap-2'>
                    <MapPinIcon className='mt-0.5 size-4 shrink-0 text-sky-500' />
                    <span className='min-w-0 leading-snug'>{card.hospital}</span>
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

          {hasPrep ? (
            <div className='mt-5 border-t border-[#e5e7f0] pt-5'>
              <span className='inline-flex items-center gap-2.5 text-[15px] font-bold text-[#1e2364]'>
                <span
                  className='inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border border-[rgba(30,35,100,0.35)] text-[11px] font-extrabold leading-none'
                  aria-hidden
                >
                  i
                </span>
                {t.preparationConditions}
              </span>
              <ul className='mt-3 flex list-none flex-col gap-2.5 pl-0.5'>
                {card.prepItems!.map((line, lineIndex) => (
                  <li
                    key={`${card.id}-prep-${lineIndex}`}
                    className="flex items-start gap-2.5 text-[14.5px] font-medium leading-relaxed text-sky-500 before:mt-2 before:size-1.5 before:shrink-0 before:rounded-full before:bg-sky-500 before:content-['']"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>

        <CardFooter
          className={cn(
            reservationCardFooterClass,
            showFooterActions && 'max-[380px]:flex-col'
          )}
        >
          {card.cancelSlot === 'cancel' ? (
            <Link href='#' data-cursor className={cn(btnOutline, 'min-w-46')}>
              {t.cancelAppointment}
              <motion.span
                className='inline-flex size-4 shrink-0'
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <XMarkIcon className='size-4' />
              </motion.span>
            </Link>
          ) : null}
          {card.cancelSlot === 'reorder' ? (
            <ReorderAppointmentLink className={cn(btnOutline, 'min-w-46')} />
          ) : null}
          <Link href={detailsHref} data-cursor className={cn(btnPrimary, 'min-w-30')}>
            {t.detailsLabel}
            <motion.span
              className='inline-flex size-4 shrink-0'
              whileHover={{ x: chevronShift }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <ChevronRightSmIcon className='size-4 rtl:rotate-180' />
            </motion.span>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
