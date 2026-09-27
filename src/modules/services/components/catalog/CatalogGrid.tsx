'use client';

import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import type {
  CatalogKind,
  CatalogService,
  CatalogServiceGroup,
} from '../../types/catalog.types';
import { ServiceCard } from './ServiceCard';
import { ServiceGroupCard } from './ServiceGroupCard';

interface CatalogGridProps {
  kind: CatalogKind;
  items: (CatalogService | CatalogServiceGroup)[];
  emptyLabel: string;
}

export function CatalogGrid({ kind, items, emptyLabel }: CatalogGridProps) {
  if (items.length === 0) {
    return (
      <p className='rounded-[20px] border-2 border-dashed border-[#e5e7f0] bg-white px-6 py-16 text-center text-[15px] font-semibold text-[#6b7196]'>
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
      {items.map((item, index) => (
        <ScrollReveal
          key={item.id}
          className='h-full'
          transitionDelay={Math.min(index, 4) * 0.08}
        >
          {kind === 'services' ? (
            <ServiceCard service={item as CatalogService} />
          ) : (
            <ServiceGroupCard group={item as CatalogServiceGroup} />
          )}
        </ScrollReveal>
      ))}
    </div>
  );
}
