'use client';

import { CheckCircle2, Circle, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { catalogDescription, catalogName } from '../../catalog.shared';
import { useBasketStore } from '../../store/basketStore';
import type { CatalogServiceGroup } from '../../types/catalog.types';
import { CatalogImage } from './CatalogImage';
import { useCatalogActions } from './CatalogActionsProvider';
import { FavoriteButton } from './FavoriteButton';
import { GroupServicesDialog } from './GroupServicesDialog';

export function ServiceGroupCard({ group }: { group: CatalogServiceGroup }) {
  const t = useTranslations('catalog');
  const locale = useLocale();
  const hydrated = useHydrated();
  const { toggleGroup } = useCatalogActions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const isSelected = useBasketStore(
    (state) => state.serviceGroup?.id === group.id
  );
  const selected = hydrated && isSelected;

  const name = catalogName(group.translations, locale);
  const description = catalogDescription(group.translations, locale);
  const serviceCount = group.serviceGroupServices?.length ?? 0;
  const detailHref = `${getLocalizedRoute(locale, ROUTES.SERVICES)}/${group.id}`;

  const select = (count = serviceCount) =>
    toggleGroup({ id: group.id, name, serviceCount: count });

  return (
    <article
      className={cn(
        'flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border-2 bg-white transition-colors',
        selected ? 'border-[#00a8f1]' : 'border-[#e5e7f0]'
      )}
    >
      <Link
        href={detailHref}
        className='relative block aspect-4/3 w-full bg-white'
      >
        <CatalogImage icon={group.icon} alt={name} className='p-12' />
      </Link>
      <div className='flex flex-1 flex-col gap-2 bg-[#f5f6fa] px-5 pb-3 pt-4'>
        <Link href={detailHref}>
          <h3 className='text-[16px] font-extrabold leading-tight text-[#1e2364] hover:text-[#00a8f1]'>
            {name}
          </h3>
        </Link>
        {description && (
          <p className='line-clamp-2 text-[12px] leading-normal text-[#6b7196]'>
            {description}
          </p>
        )}
        <button
          type='button'
          onClick={() => setDialogOpen(true)}
          className='mt-auto inline-flex cursor-pointer items-center gap-1.5 self-start rounded-full text-[12.5px] font-bold text-[#00a8f1] hover:text-[#0090d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]'
        >
          <ListChecks className='size-4' aria-hidden />
          {serviceCount > 0
            ? interpolate(t.groupServicesCount, { count: serviceCount })
            : t.viewServices}
          <span className='sr-only'>{t.viewServices}</span>
        </button>
      </div>
      <div className='mt-auto flex items-center justify-between gap-2 border-t-2 border-[#eef0f7] px-5 py-3'>
        <FavoriteButton kind='groups' id={group.id} />
        <button
          type='button'
          aria-pressed={selected}
          disabled={serviceCount === 0}
          onClick={() => select()}
          className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            selected
              ? 'bg-[#e6f6fe] text-[#0090d1]'
              : 'bg-[#1e2364] text-white hover:bg-[#2a3178]'
          )}
        >
          {selected ? (
            <CheckCircle2 className='size-4' aria-hidden />
          ) : (
            <Circle className='size-4' aria-hidden />
          )}
          {selected ? t.selectedGroup : t.selectGroup}
        </button>
      </div>

      <GroupServicesDialog
        groupId={dialogOpen ? group.id : null}
        selected={selected}
        onClose={() => setDialogOpen(false)}
        onToggleSelect={(count) => {
          select(count || serviceCount);
          setDialogOpen(false);
        }}
      />
    </article>
  );
}
