'use client';

import { Check, Plus } from 'lucide-react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { cn } from '@/shared/lib/cn';
import { useBasketStore, type BasketItem } from '../../store/basketStore';
import { useCatalogActions } from './CatalogActionsProvider';

interface BasketToggleButtonProps {
  item: BasketItem;
  className?: string;
}

/** Add / remove an individual service in the basket. */
export function BasketToggleButton({ item, className }: BasketToggleButtonProps) {
  const t = useTranslations('catalog');
  const hydrated = useHydrated();
  const { toggleService } = useCatalogActions();
  const inBasket = useBasketStore((state) =>
    state.services.some((entry) => entry.id === item.id)
  );
  const active = hydrated && inBasket;

  return (
    <button
      type='button'
      onClick={() => toggleService(item)}
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364] focus-visible:ring-offset-2',
        active
          ? 'bg-green-50 text-green-700 hover:bg-green-100'
          : 'bg-[#1e2364] text-white hover:bg-[#2a3178]',
        className
      )}
    >
      {active ? (
        <Check className='size-4' aria-hidden />
      ) : (
        <Plus className='size-4' aria-hidden />
      )}
      <span>{active ? t.inBasket : t.addToBasket}</span>
      {active && <span className='sr-only'>{t.removeFromBasket}</span>}
    </button>
  );
}
