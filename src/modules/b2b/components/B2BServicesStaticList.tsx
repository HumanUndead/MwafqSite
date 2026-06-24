'use client';

import type { Dictionary } from '@/locales/types';
import { useB2BServiceScrollSpy } from '@/modules/b2b/hooks/useB2BServiceScrollSpy';
import {
  B2BServiceCapabilityCard,
  type B2BServiceItem,
} from './B2BServiceCapabilityCard';
import { B2BSharedServiceDashboard } from './B2BSharedServiceDashboard';

interface Props {
  cards: B2BServiceItem[];
  dashboard: Dictionary['b2b']['services']['dashboard'];
  isRtl: boolean;
  sectionLabel: string;
}

/**
 * Reduced-motion / fallback desktop layout: a sticky vertical list with a
 * scroll-spy driving the shared dashboard. No 3D, no scroll pinning.
 */
export function B2BServicesStaticList({
  cards,
  dashboard,
  isRtl,
  sectionLabel,
}: Props) {
  const { activeIndex, containerRef, setItemRef } = useB2BServiceScrollSpy(
    cards.length,
    { enabled: true }
  );

  return (
    <div className='grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start gap-10'>
      <div
        ref={containerRef}
        className='flex flex-col gap-3'
        aria-label={sectionLabel}
      >
        {cards.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            ref={setItemRef(index)}
            className='w-full scroll-mt-28 lg:min-h-[55dvh]'
          >
            <div className='sticky top-28'>
              <B2BServiceCapabilityCard
                item={item}
                isRtl={isRtl}
                isActive={activeIndex === index}
              />
            </div>
          </div>
        ))}
      </div>

      <aside
        className='sticky top-28 z-10 self-start'
        aria-live='polite'
        aria-atomic='true'
      >
        <B2BSharedServiceDashboard
          items={cards}
          activeIndex={activeIndex}
          dashboard={dashboard}
        />
      </aside>
    </div>
  );
}
