'use client';

import { lazy, Suspense, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isRtl } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { ReservationsChartIcon } from '@/shared/components/icons/profile';
import {
  ClipboardCheckIcon,
  ReservationsSearchIcon,
} from '@/shared/components/icons/reservations';
import { cn } from '@/shared/lib/cn';
import { MwafqPagination } from '@/shared/components/ui/MwafqPagination';
import { ReservationsExamsPanel } from './components/ReservationsExamsPanel';
import { ReservationsPanelSkeleton } from './components/ReservationsPanelSkeleton';
import {
  mapReservationToExamCard,
  mapReservationToResultCard,
  partitionReservations,
} from './mapReservations';
import type { Reservation } from './types/reservation.types';
import type { TabValue } from './types';

type MyReservationsViewProps = {
  reservations?: Reservation[];
  page?: number;
  totalPages?: number;
  initialTab?: TabValue;
};

const ReservationsResultsPanel = lazy(() =>
  import('./components/ReservationsResultsPanel').then((m) => ({
    default: m.ReservationsResultsPanel,
  }))
);

const tabTriggerClass =
  'relative gap-2.5 rounded-none border-0 bg-transparent py-3.5 text-[15px] font-bold text-[#6b7196] shadow-none ring-0 outline-none after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#00a8f1] after:transition-transform after:duration-350 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[#1e2364] data-active:bg-transparent data-active:text-[#00a8f1] data-active:shadow-none data-active:after:scale-x-100 dark:data-active:bg-transparent rtl:after:origin-right [&_svg]:size-[18px]';

export default function MyReservationsView({
  reservations = [],
  page = 1,
  totalPages = 0,
  initialTab = 'exams',
}: MyReservationsViewProps) {
  const locale = useLocale();
  const rtl = isRtl(locale);
  const chevronShift = rtl ? -4 : 4;
  const t = useTranslations('profileReservations');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<TabValue>(initialTab);

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(nextPage));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });

    const grid = document.getElementById('reservationsGrid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const getCards = () => {
    const { exams, results } = partitionReservations(reservations);
    return {
      examCards: exams.map(mapReservationToExamCard),
      resultCards: results.map(mapReservationToResultCard),
    };
  };
  const { examCards, resultCards } = getCards();

  return (
    <section className='relative pt-2'>
      <ScrollReveal className='mx-auto mb-9 max-w-[1200px]'>
        <h1 className='mb-2.5 text-[clamp(30px,4vw,44px)] font-extrabold leading-[1.1] tracking-[-1.4px] text-[#1e2364]'>
          {tab === 'results' ? t.titleResults : t.titleReservations}
        </h1>
        <p className='max-w-[600px] text-base leading-relaxed text-[#6b7196]'>
          {t.subtitle}
        </p>
      </ScrollReveal>

      <Tabs
        value={tab}
        onValueChange={(next) => {
          setTab(next as TabValue);
        }}
        className='mx-auto w-full max-w-[1200px] gap-0'
      >
        <ScrollReveal
          transitionDelay={0.12}
          className='mb-7 flex max-w-[1200px] flex-wrap items-end justify-between gap-6 border-b border-[#e5e7f0] max-[640px]:mb-3.5 max-[640px]:gap-3.5'
        >
          <label
            htmlFor='resSearch'
            className='group mb-2.5 flex min-w-[320px] max-w-full flex-1 items-center rounded-[28px] border-2 border-[#e5e7f0] bg-white px-[18px] py-[11px] transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] focus-within:border-[#00a8f1] max-[640px]:mb-0 max-[640px]:min-w-0 max-[640px]:w-full'
          >
            <Input
              id='resSearch'
              type='search'
              name='reservationsSearch'
              autoComplete='off'
              placeholder={t.searchPlaceholder}
              defaultValue=''
              prefix={
                <ReservationsSearchIcon className='size-[18px] shrink-0 text-[#6b7196] transition-colors group-focus-within:text-[#00a8f1]' />
              }
              affixWrapperClassName='h-auto min-h-0 w-full min-w-0 flex-1 border-0 bg-transparent p-0 shadow-none ring-0 focus-within:border-transparent focus-within:ring-0 gap-2.5'
              className={cn(
                'h-auto min-h-0 text-sm font-medium text-[#1e2364]',
                'placeholder:text-[#6b7196] placeholder:font-medium md:text-sm'
              )}
            />
          </label>

          <TabsList
            variant='line'
            aria-label={t.tabsListAriaLabel}
            className='mb-2.5 h-auto w-fit gap-9 bg-transparent p-0 max-[640px]:mb-0 max-[640px]:w-full max-[640px]:justify-start max-[640px]:gap-6'
          >
            <TabsTrigger
              value='exams'
              data-cursor
              className={cn(tabTriggerClass, 'flex-initial')}
            >
              <ReservationsChartIcon className='shrink-0' />
              {t.tabExaminations}
            </TabsTrigger>
            <TabsTrigger
              value='results'
              data-cursor
              className={cn(tabTriggerClass, 'flex-initial')}
            >
              <ClipboardCheckIcon className='shrink-0' />
              {t.tabResults}
            </TabsTrigger>
          </TabsList>
        </ScrollReveal>

        <div id='reservationsGrid' className='min-h-[200px]'>
          <TabsContent value='exams' className='mt-0 flex-1 outline-none'>
            <ReservationsExamsPanel
              cards={examCards}
              chevronShift={chevronShift}
              emptyMessage={t.emptyExams}
            />
          </TabsContent>

          <TabsContent value='results' className='mt-0 flex-1 outline-none'>
            <Suspense fallback={<ReservationsPanelSkeleton />}>
              <ReservationsResultsPanel
                cards={resultCards}
                emptyMessage={t.emptyResults}
              />
            </Suspense>
          </TabsContent>
        </div>

        <MwafqPagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className='mt-10'
          ariaLabel={t.pagination.ariaLabel}
          previousLabel={t.pagination.previous}
          nextLabel={t.pagination.next}
        />
      </Tabs>
    </section>
  );
}
