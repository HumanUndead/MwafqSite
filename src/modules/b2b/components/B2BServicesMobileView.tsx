'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import type { Dictionary } from '@/locales/types';
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

export function B2BServicesMobileView({
  cards,
  dashboard,
  isRtl,
  sectionLabel,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const activeCard = cards[activeIndex] ?? cards[0];

  return (
    <div className='lg:hidden'>
      <div
        role='tablist'
        aria-label={sectionLabel}
        className='mb-4 grid grid-cols-3 gap-1 rounded-full bg-[#e8e9ef] p-1'
      >
        {cards.map((item, index) => (
          <Button
            key={item.title}
            type='button'
            role='tab'
            aria-selected={activeIndex === index}
            variant='ghost'
            onClick={() => setActiveIndex(index)}
            className={cn(
              'h-auto min-h-11 rounded-full px-1.5 py-2 text-[9px] font-extrabold leading-[1.2] tracking-[-0.2px] sm:min-h-12 sm:px-2 sm:text-[10px]',
              activeIndex === index
                ? 'bg-white text-[#1e2364] shadow-sm'
                : 'text-[#6b7196] hover:bg-transparent'
            )}
          >
            <span className='line-clamp-2'>{item.title}</span>
          </Button>
        ))}
      </div>

      <motion.div
        key={activeIndex}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        role='tabpanel'
      >
        <B2BServiceCapabilityCard
          item={activeCard}
          isRtl={isRtl}
          isActive
        />
      </motion.div>

      <div className='mt-4' aria-live='polite' aria-atomic='true'>
        <B2BSharedServiceDashboard
          items={cards}
          activeIndex={activeIndex}
          dashboard={dashboard}
        />
      </div>
    </div>
  );
}

export function useIsLgUp() {
  const [isLgUp, setIsLgUp] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');

    const update = () => setIsLgUp(media.matches);
    update();
    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);

  return isLgUp;
}
