'use client';

import { useLocale } from '@/i18n/DictionaryProvider';
import { catalogDescription, catalogName } from '../../catalog.shared';
import type { CatalogService } from '../../types/catalog.types';
import { BasketToggleButton } from './BasketToggleButton';
import { CatalogImage } from './CatalogImage';
import { FavoriteButton } from './FavoriteButton';

export function ServiceCard({ service }: { service: CatalogService }) {
  const locale = useLocale();
  const name = catalogName(service.translations, locale);
  const description = catalogDescription(service.translations, locale);

  return (
    <article className='flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border-2 border-[#e5e7f0] bg-white'>
      <div className='relative aspect-4/3 w-full bg-white'>
        <CatalogImage icon={service.icon} alt={name} className='p-12' />
      </div>
      <div className='flex flex-1 flex-col gap-2 bg-[#f5f6fa] px-5 pb-3 pt-4'>
        <h3 className='text-[16px] font-extrabold leading-tight text-[#1e2364]'>
          {name}
        </h3>
        {description && (
          <p className='line-clamp-2 text-[12px] leading-normal text-[#6b7196]'>
            {description}
          </p>
        )}
      </div>
      <div className='mt-auto flex items-center justify-between gap-2 border-t-2 border-[#eef0f7] px-5 py-3'>
        <FavoriteButton kind='services' id={service.id} />
        <BasketToggleButton item={{ id: service.id, name }} />
      </div>
    </article>
  );
}
