'use client';

import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
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
import { OwnerSelect } from '@/modules/reservations/components/OwnerSelect';
import { ReservationRow } from '@/modules/reservations/components/ReservationRow';
import { ReservationsListSkeleton } from '@/modules/reservations/components/ReservationsListSkeleton';
import { useReservations } from '@/modules/reservations/hooks/useReservations';
import type { ReservationsTab } from '@/modules/reservations/types/reservations.types';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Panel,
  productTabsListClass,
  productTabsTriggerClass,
} from '@/shared/components/product';
import { buttonVariants } from '@/shared/components/ui/Button';
import { MwafqPagination } from '@/shared/components/ui/MwafqPagination';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';

export function ReservationsView() {
  const t = useTranslations('reservations');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const user = useAuthStore((state) => state.user);
  const family = useFamily(!!user);
  const selectedMemberId = useFamilySelectionStore(
    (state) => state.selectedMemberId
  );
  const setSelectedMemberId = useFamilySelectionStore(
    (state) => state.setSelectedMemberId
  );

  const tab: ReservationsTab =
    searchParams.get('tab') === 'results' ? 'results' : 'exams';
  const upcoming =
    searchParams.get('upcoming') !== '0' &&
    searchParams.get('filter') !== 'all';
  const pageNumber = Math.max(1, Number(searchParams.get('page')) || 1);

  const members = (family.data?.relatedToUsers ?? []).filter(
    (member) => member.status === RelatedUserStatus.Accepted
  );
  const ownerOptions = [
    ...(user ? [{ value: user.id, label: t.you }] : []),
    ...members.map((member) => ({
      value: member.userId,
      label: memberName(member),
    })),
  ];
  const ownerId =
    hydrated &&
    selectedMemberId &&
    members.some((m) => m.userId === selectedMemberId)
      ? selectedMemberId
      : (user?.id ?? null);

  const { data, isLoading, isError, isFetching, refetch } = useReservations(
    { tab, upcoming, pageNumber, ownerId },
    hydrated
  );
  const items = data?.data ?? [];
  const loading = !hydrated || isLoading;

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
    tab === 'results'
      ? t.empty.results
      : upcoming
        ? t.empty.upcoming
        : t.empty.exams;

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title={tab === 'results' ? t.titleResults : t.title}
        description={t.subtitle}
      />

      <div className='flex flex-col gap-4'>
        <Tabs
          value={tab}
          onValueChange={(next) =>
            setParams({
              tab: next === 'results' ? 'results' : null,
              page: null,
              upcoming: null,
            })
          }
        >
          <TabsList
            variant='line'
            aria-label={t.tabsAriaLabel}
            className={productTabsListClass}
          >
            <TabsTrigger value='exams' className={productTabsTriggerClass}>
              {t.tabs.exams}
            </TabsTrigger>
            <TabsTrigger value='results' className={productTabsTriggerClass}>
              {t.tabs.results}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3'>
          <div className='flex flex-wrap items-center gap-x-5 gap-y-1'>
            {tab === 'exams' && (
              <label className='inline-flex h-11 cursor-pointer items-center gap-2.5 text-[14px] font-semibold text-[#1e2364]'>
                <Checkbox
                  checked={upcoming}
                  onCheckedChange={() =>
                    setParams({
                      upcoming: upcoming ? '0' : null,
                      filter: null,
                      page: null,
                    })
                  }
                  className='size-[18px] rounded-[5px] border-[#b9bed3] bg-white focus-visible:ring-2 focus-visible:ring-[#00a8f1]/40 data-checked:border-[#1e2364] data-checked:bg-[#1e2364] data-checked:text-white'
                />
                {t.upcomingOnly}
              </label>
            )}
            <p
              className='text-[13px] font-semibold tabular-nums text-[#6b7196]'
              aria-live='polite'
            >
              {data
                ? interpolate(t.recordsCount, { count: data.totalRecords })
                : null}
            </p>
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
      </div>

      <Panel
        flush
        id='reservationsGrid'
        aria-busy={loading || isFetching}
        className={cn(isFetching && !loading && 'opacity-70')}
      >
        {loading ? (
          <ReservationsListSkeleton />
        ) : isError ? (
          <ErrorState
            title={t.loadError}
            retryLabel={t.retry}
            onRetry={() => void refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<CalendarDays aria-hidden />}
            title={emptyLabel}
            description={t.empty.description}
            action={
              <Link
                href={getLocalizedRoute(locale, ROUTES.SERVICES)}
                className={buttonVariants({
                  variant: 'product',
                  size: 'control',
                })}
              >
                {t.newBooking}
              </Link>
            }
          />
        ) : (
          <ul className='divide-y divide-[#eef0f7]'>
            {items.map((reservation) => (
              <ReservationRow key={reservation.id} reservation={reservation} />
            ))}
          </ul>
        )}
      </Panel>

      {data && data.totalPages > 1 && (
        <MwafqPagination
          page={pageNumber}
          totalPages={data.totalPages}
          onPageChange={(next) =>
            setParams({ page: next <= 1 ? null : String(next) })
          }
          ariaLabel={t.pagination.ariaLabel}
          previousLabel={t.pagination.previous}
          nextLabel={t.pagination.next}
          reveal={false}
        />
      )}
    </div>
  );
}
