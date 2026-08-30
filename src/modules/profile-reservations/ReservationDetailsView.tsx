'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRightSmIcon } from '@/shared/components/icons/academy';
import { CalendarIcon } from '@/shared/components/icons/profile';
import {
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
} from '@/shared/components/icons/reservations';
import { isRtl, type Locale } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';
import { ReorderAppointmentLink } from './components/ReorderAppointmentLink';
import { ReservationStatusTimeline } from './components/ReservationStatusTimeline';
import { EASE } from './constants';
import type { ReservationDetailsViewModel } from './reservationDetailsMapper';

type ReservationDetailsViewProps = {
  details: ReservationDetailsViewModel;
};

function InfoIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      className='size-[18px] shrink-0 text-[#1e2364]'
      aria-hidden
    >
      <circle cx='12' cy='12' r='10' />
      <line x1='12' y1='16' x2='12' y2='12' />
      <line x1='12' y1='8' x2='12.01' y2='8' />
    </svg>
  );
}

export default function ReservationDetailsView({
  details,
}: ReservationDetailsViewProps) {
  const locale = useLocale() as Locale;
  const rtl = isRtl(locale);
  const t = useTranslations('profileReservations').detailPage;

  const listHref = details.isResultView
    ? `/${locale}${ROUTES.MY_RESERVATIONS}?tab=results`
    : `/${locale}${ROUTES.MY_RESERVATIONS}`;

  return (
    <section className='relative pt-2'>
      <ScrollReveal className='mb-6'>
        <Link
          href={listHref}
          data-cursor
          className='group mb-5 inline-flex items-center gap-2 py-1.5 text-[14.5px] font-semibold text-[#6b7196] transition-colors hover:text-[#1e2364]'
        >
          <ChevronRightSmIcon
            className={cn(
              'size-4 rotate-180 transition-transform duration-250 rtl:rotate-0',
              rtl ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'
            )}
          />
          {details.isResultView ? t.backToResults : t.backToExaminations}
        </Link>
      </ScrollReveal>

      <ScrollReveal className='mb-16 px-1'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          {details.title ? (
            <h1 className='text-[clamp(24px,3vw,30px)] font-extrabold leading-tight tracking-[-0.6px] text-[#1e2364]'>
              {details.title}
            </h1>
          ) : null}

          {details.showReorder ? (
            <ReorderAppointmentLink className='inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[28px] border border-[#1e2364] bg-white px-[22px] text-sm font-bold text-[#1e2364]' />
          ) : null}
        </div>

        {details.timelineStep && !details.isResultView ? (
          <div className='mt-6 border-t border-[#e5e7f0] pt-6'>
            <ReservationStatusTimeline currentStep={details.timelineStep} />
          </div>
        ) : null}
      </ScrollReveal>

      <div className='grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]'>
        <ScrollReveal
          transitionDelay={0.12}
          className={cn(
            'relative rounded-[28px] border-2 border-[#e5e7f0] bg-white px-[30px] py-7',
            details.isCanceled && '[&_.detail-muted]:text-[#6b7196]'
          )}
        >
          <h2 className='detail-muted mb-5 text-[22px] font-extrabold tracking-[-0.4px] text-[#1e2364]'>
            {details.isResultView ? t.resultInformation : t.orderInformation}
          </h2>

          {details.isResultView ? (
            <div className='flex min-h-[320px] items-center justify-center rounded-[18px] border border-[#e5e7f0] bg-[#fafafb] px-6 text-center text-sm font-medium text-[#6b7196]'>
              {t.resultDocumentUnavailable}
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 gap-3.5 sm:grid-cols-2'>
                {details.companyName && (
                  <div className='flex flex-col gap-1'>
                    <span className='detail-muted text-[11px] font-bold uppercase tracking-[0.12em] text-[#6b7196]'>
                      {t.orderedBy}
                    </span>
                    <span className='detail-muted text-[15px] font-bold text-[#1e2364]'>
                      {details.companyName}
                    </span>
                  </div>
                )}
                {!!details.sellPrice && (
                  <div className='flex flex-col gap-1'>
                    <span className='detail-muted text-[11px] font-bold uppercase tracking-[0.12em] text-[#6b7196]'>
                      {t.price}
                    </span>
                    <span className='detail-muted text-[15px] font-bold text-[#1e2364]'>
                      {details.sellPrice}
                    </span>
                  </div>
                )}
              </div>

              {details.prepItems.length > 0 ? (
                <div className='mt-7 border-t border-[#e5e7f0] pt-7'>
                  <h3 className='detail-muted mb-3.5 inline-flex items-center gap-2.5 text-[22px] font-extrabold tracking-[-0.4px] text-[#1e2364]'>
                    <InfoIcon />
                    {t.preparation}
                  </h3>
                  <ul className='flex flex-col gap-2 ps-1'>
                    {details.prepItems.map((line, index) => (
                      <li
                        key={`${details.id}-prep-${index}`}
                        className="detail-muted flex items-start gap-2.5 text-[14.5px] font-medium leading-relaxed text-[#00a8f1] before:mt-2 before:size-1.5 before:shrink-0 before:rounded-full before:bg-[#00a8f1] before:content-['']"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </ScrollReveal>

        <ScrollReveal
          transitionDelay={0.24}
          className={cn(
            'rounded-[28px] border-2 border-[#e5e7f0] bg-white px-[30px] py-7 lg:sticky lg:top-[120px]',
            details.isCanceled && 'text-[#6b7196] [&_svg]:stroke-[#6b7196]'
          )}
        >
          <h2 className='mb-5 text-[22px] font-extrabold tracking-[-0.4px] text-[#1e2364]'>
            {t.orderDetails}
          </h2>

          <div className='flex flex-col gap-[18px]'>
            {details.hospital ? (
              <MetaRow
                icon={
                  <MapPinIcon className='size-[15px] shrink-0 text-[#00a8f1]' />
                }
              >
                {details.hospital}
              </MetaRow>
            ) : null}
            {details.date ? (
              <MetaRow
                icon={
                  <CalendarIcon className='size-[15px] shrink-0 text-[#00a8f1]' />
                }
              >
                {details.date}
              </MetaRow>
            ) : null}
            {details.time ? (
              <MetaRow
                icon={
                  <ClockIcon className='size-[15px] shrink-0 text-[#00a8f1]' />
                }
              >
                {details.time}
              </MetaRow>
            ) : null}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function MetaRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className='inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[#1e2364]'>
      {icon}
      <span className='truncate'>{children}</span>
    </span>
  );
}
