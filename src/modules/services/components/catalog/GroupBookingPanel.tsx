'use client';

import { CheckCircle2 } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { interpolate } from '@/shared/lib/interpolate';
import { catalogName } from '../../catalog.shared';
import { useBasketStore } from '../../store/basketStore';
import type { CatalogServiceGroup } from '../../types/catalog.types';
import { useCatalogActions } from './CatalogActionsProvider';
import { FavoriteButton } from './FavoriteButton';

/**
 * Detail-page CTA. Not selected → "Book this package". Already selected in
 * the basket (e.g. from the catalogue) → "Continue booking" + remove.
 */
export function GroupBookingPanel({ group }: { group: CatalogServiceGroup }) {
  const t = useTranslations('catalog');
  const locale = useLocale();
  const hydrated = useHydrated();
  const { bookGroup, continueToCheckout } = useCatalogActions();
  const isSelected = useBasketStore((state) => state.serviceGroup?.id === group.id);
  const clearServiceGroup = useBasketStore((state) => state.clearServiceGroup);
  const selected = hydrated && isSelected;

  const serviceCount = group.serviceGroupServices?.length ?? 0;

  return (
    <div className='flex flex-col gap-3 rounded-[20px] border-2 border-[#e5e7f0] bg-white p-4'>
      {selected ? (
        <p className='inline-flex items-center justify-center gap-1.5 rounded-full bg-[#e6f6fe] px-3 py-1.5 text-sm font-bold text-[#0090d1]'>
          <CheckCircle2 className='size-4' aria-hidden />
          {t.selectedGroup}
        </p>
      ) : (
        serviceCount > 0 && (
          <p className='text-center text-sm font-semibold text-[#6b7196]'>
            {interpolate(t.groupPackageNote, { count: serviceCount })}
          </p>
        )
      )}
      <div className='flex items-center gap-2'>
        <Button
          variant='brand'
          size='lg'
          type='button'
          className='h-12 flex-1 rounded-[14px]'
          disabled={serviceCount === 0}
          onClick={() =>
            selected
              ? continueToCheckout()
              : bookGroup({
                  id: group.id,
                  name: catalogName(group.translations, locale),
                  serviceCount,
                })
          }
        >
          {selected ? t.continueBooking : t.bookPackage}
        </Button>
        <FavoriteButton kind='groups' id={group.id} className='size-12' />
      </div>
      {selected && (
        <Button
          variant='ghost'
          size='sm'
          type='button'
          className='self-center text-[#6b7196]'
          onClick={clearServiceGroup}
        >
          {t.deselectGroup}
        </Button>
      )}
    </div>
  );
}
