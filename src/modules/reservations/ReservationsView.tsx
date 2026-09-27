'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { useAuthStore } from '@/modules/auth/store/authStore';
import {
  RelatedUserStatus,
  memberName,
  useFamily,
  useFamilySelectionStore,
} from '@/modules/family';
import {
  profileTabListClass,
  profileTabTriggerClass,
} from '@/modules/profile/tabStyles';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { Button, buttonVariants } from '@/shared/components/ui/Button';
import { MwafqPagination } from '@/shared/components/ui/MwafqPagination';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { OwnerSelect } from './components/OwnerSelect';
import { ReservationCard } from './components/ReservationCard';
import { useReservations } from './hooks/useReservations';
import type { ReservationsTab } from './types/reservations.types';

export function ReservationsView() {
  const t = useTranslations('reservations');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const user = useAuthStore((state) => state.user);
  const family = useFamily(!!user);
  const selectedMemberId = useFamilySelectionStore((state) => state.selectedMemberId);
  const setSelectedMemberId = useFamilySelectionStore((state) => state.setSelectedMemberId);

  const tab: ReservationsTab = searchParams.get('tab') === 'results' ? 'results' : 'exams';
  const upcoming = searchParams.get('upcoming') !== '0' && searchParams.get('filter') !== 'all';
  const pageNumber = Math.max(1, Number(searchParams.get('page')) || 1);

  const members = (family.data?.relatedToUsers ?? []).filter(
    (member) => member.status === RelatedUserStatus.Accepted
  );
  const ownerOptions = [
    ...(user ? [{ value: user.id, label: t.you }] : []),
    ...members.map((member) => ({ value: member.userId, label: memberName(member) })),
  ];
  const ownerId =
    hydrated && selectedMemberId && members.some((m) => m.userId === selectedMemberId)
      ? selectedMemberId
      : (user?.id ?? null);

  const { data, isLoading, isError, isFetching, refetch } = useReservations(
    { tab, upcoming, pageNumber, ownerId },
    hydrated
  );
  const items = data?.data ?? [];

  function setParams(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const emptyLabel =
    tab === 'results' ? t.empty.results : upcoming ? t.empty.upcoming : t.empty.exams;

  return (
    <section className='relative pt-2'>
      <ScrollReveal className='mb-7'>
        <h1 className='mb-2.5 text-[clamp(30px,4vw,44px)] font-extrabold leading-[1.1] tracking-[-1.4px] text-[#1e2364]'>
          {tab === 'results' ? t.titleResults : t.title}
        </h1>
        <p className='max-w-150 text-base leading-relaxed text-[#6b7196]'>{t.subtitle}</p>
      </ScrollReveal>

      <Tabs
        value={tab}
        onValueChange={(next) =>
          setParams({ tab: next === 'results' ? 'results' : null, page: null, upcoming: null })
        }
      >
        <TabsList variant='line' aria-label={t.tabsAriaLabel} className={profileTabListClass}>
          <TabsTrigger value='exams' className={cn(profileTabTriggerClass, 'flex-initial')}>
            {t.tabs.exams}
          </TabsTrigger>
          <TabsTrigger value='results' className={cn(profileTabTriggerClass, 'flex-initial')}>
            {t.tabs.results}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className='my-5 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap items-center gap-3'>
          {tab === 'exams' && (
            <button
              type='button'
              aria-pressed={upcoming}
              onClick={() => setParams({ upcoming: upcoming ? '0' : null, filter: null, page: null })}
              className={cn(
                'cursor-pointer rounded-full border-2 px-4 py-2 text-[13.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]',
                upcoming
                  ? 'border-[#1e2364] bg-[#1e2364] text-white'
                  : 'border-[#e5e7f0] bg-white text-[#6b7196] hover:text-[#1e2364]'
              )}
            >
              {t.upcomingOnly}
            </button>
          )}
          {data && (
            <p className='text-sm font-semibold text-[#6b7196]' aria-live='polite'>
              {interpolate(t.recordsCount, { count: data.totalRecords })}
            </p>
          )}
        </div>
        {hydrated && ownerId && (
          <OwnerSelect
            value={ownerId}
            options={ownerOptions}
            onChange={(value) => {
              setSelectedMemberId(value === user?.id ? null : value);
              setParams({ page: null });
            }}
          />
        )}
      </div>

      <div id='reservationsGrid' className={cn('min-h-50', isFetching && !isLoading && 'opacity-70')}>
        {!hydrated || isLoading ? (
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2' aria-hidden>
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className='h-[220px] animate-pulse rounded-[24px] bg-[#e5e7f0]' />
            ))}
          </div>
        ) : isError ? (
          <div className='flex flex-col items-center gap-3 rounded-[24px] border-2 border-dashed border-red-200 bg-white px-6 py-12 text-center' role='alert'>
            <p className='text-sm font-semibold text-red-600'>{t.loadError}</p>
            <Button variant='outline' type='button' onClick={() => void refetch()}>
              {t.retry}
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className='flex flex-col items-center gap-4 rounded-[24px] border-2 border-dashed border-[#e5e7f0] bg-white px-6 py-14 text-center'>
            <p className='text-[15px] font-semibold text-[#6b7196]'>{emptyLabel}</p>
            <Link
              href={getLocalizedRoute(locale, ROUTES.SERVICES)}
              className={buttonVariants({ variant: 'brand' })}
            >
              {t.newBooking}
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            {items.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <MwafqPagination
          page={pageNumber}
          totalPages={data.totalPages}
          onPageChange={(next) => setParams({ page: next <= 1 ? null : String(next) })}
          ariaLabel={t.pagination.ariaLabel}
          previousLabel={t.pagination.previous}
          nextLabel={t.pagination.next}
        />
      )}
    </section>
  );
}
