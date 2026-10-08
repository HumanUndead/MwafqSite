'use client';

import { useRouter } from 'next/navigation';
import type { useTranslations } from '@/i18n/DictionaryProvider';
import { ErrorState, Panel, PanelHeader } from '@/shared/components/product';
import type { PersonalInfoStats } from '@/modules/profile-personal/personalStats.shared';

type StatsCopy = ReturnType<typeof useTranslations<'profilePersonal'>>['stats'];

/** Real activity counts in one compact panel; error + retry when the API failed. */
export function PersonalStatsSummary({
  stats,
  t,
}: {
  stats?: Partial<PersonalInfoStats>;
  t: StatsCopy;
}) {
  const router = useRouter();

  if (!stats) {
    return (
      <Panel>
        <PanelHeader title={t.heading} />
        <ErrorState
          title={t.loadError}
          retryLabel={t.retry}
          onRetry={() => router.refresh()}
          className='py-8'
        />
      </Panel>
    );
  }

  const items = [
    { key: 'reservations', value: stats.reservationsCount, copy: t.reservations },
    { key: 'ongoing', value: stats.coursesOngoingCount, copy: t.coursesOngoing },
    { key: 'finished', value: stats.coursesFinishedCount, copy: t.coursesFinished },
  ];

  return (
    <Panel aria-labelledby='personal-stats-heading'>
      <PanelHeader id='personal-stats-heading' title={t.heading} />
      <dl className='mt-4 grid grid-cols-1 divide-y divide-[#eef0f7] sm:grid-cols-3 sm:divide-x sm:divide-y-0'>
        {items.map((item) => (
          <div
            key={item.key}
            className='flex items-center gap-4 py-3 first:pt-0 last:pb-0 sm:flex-col sm:items-start sm:gap-2 sm:px-5 sm:py-0 sm:first:ps-0 sm:last:pe-0'
          >
            <dt className='min-w-0 text-[14px] font-semibold leading-5 text-[#1e2364]'>
              {item.copy.title}
              <span className='block text-[13px] font-normal text-[#6b7196]'>
                {item.copy.subtitle}
              </span>
            </dt>
            {/* Number reads first visually; dt stays first for valid markup. */}
            <dd className='order-first min-w-10 text-[22px] font-bold leading-none tabular-nums text-[#1e2364]'>
              {item.value ?? '—'}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
