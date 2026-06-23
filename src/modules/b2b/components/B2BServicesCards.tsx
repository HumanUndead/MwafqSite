'use client';

import type { Dictionary } from '@/locales/types';
import { useB2BServiceScrollSpy } from '@/modules/b2b/hooks/useB2BServiceScrollSpy';
import { B2BServiceCapabilityCard } from './B2BServiceCapabilityCard';
import { B2BSharedServiceDashboard } from './B2BSharedServiceDashboard';

interface Props {
  content: Dictionary['b2b']['services'];
  isRtl: boolean;
}

export function B2BServicesCards({ content, isRtl }: Props) {
  const cards = content.items.slice(0, 3);
  const { activeIndex, containerRef, setItemRef } = useB2BServiceScrollSpy(
    cards.length
  );

  const dashboard = (
    <B2BSharedServiceDashboard
      items={cards}
      activeIndex={activeIndex}
      dashboard={content.dashboard}
    />
  );

  return (
    <>
      <div className='lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-10'>
        <div
          ref={containerRef}
          className='-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none snap-x snap-mandatory lg:mx-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0'
          aria-label={content.titleLead}
        >
          {cards.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              ref={setItemRef(index)}
              className='min-w-[min(84vw,300px)] shrink-0 snap-center lg:min-h-[55dvh] lg:min-w-0 lg:scroll-mt-28'
            >
              <div className='lg:sticky lg:top-28'>
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
          className='hidden lg:sticky lg:top-28 lg:z-10 lg:block lg:self-start'
          aria-live='polite'
          aria-atomic='true'
        >
          {dashboard}
        </aside>
      </div>

      <div
        className='sticky top-28 z-10 mt-4 lg:hidden'
        aria-live='polite'
        aria-atomic='true'
      >
        {dashboard}
      </div>
    </>
  );
}
