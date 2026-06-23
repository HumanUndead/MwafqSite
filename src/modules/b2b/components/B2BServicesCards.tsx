'use client';

import type { Dictionary } from '@/locales/types';
import { useB2BServiceScrollSpy } from '@/modules/b2b/hooks/useB2BServiceScrollSpy';
import { B2BServiceCapabilityCard } from './B2BServiceCapabilityCard';
import { B2BSharedServiceDashboard } from './B2BSharedServiceDashboard';
import {
  B2BServicesMobileView,
  useIsLgUp,
} from './B2BServicesMobileView';

interface Props {
  content: Dictionary['b2b']['services'];
  isRtl: boolean;
}

export function B2BServicesCards({ content, isRtl }: Props) {
  const cards = content.items.slice(0, 3);
  const isLgUp = useIsLgUp();
  const { activeIndex, containerRef, setItemRef } = useB2BServiceScrollSpy(
    cards.length,
    { enabled: isLgUp }
  );

  const dashboard = (
    <B2BSharedServiceDashboard
      items={cards}
      activeIndex={activeIndex}
      dashboard={content.dashboard}
    />
  );

  const sectionLabel = [content.titleLead, content.titleAccent]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <B2BServicesMobileView
        cards={cards}
        dashboard={content.dashboard}
        isRtl={isRtl}
        sectionLabel={sectionLabel}
      />

      <div className='hidden lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-10'>
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
          {dashboard}
        </aside>
      </div>
    </>
  );
}
