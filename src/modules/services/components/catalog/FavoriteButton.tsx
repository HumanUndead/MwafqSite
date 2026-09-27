'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { cn } from '@/shared/lib/cn';
import { useFavoritesStore } from '../../store/favoritesStore';
import type { CatalogKind } from '../../types/catalog.types';
import { useCatalogActions } from './CatalogActionsProvider';

interface FavoriteButtonProps {
  kind: CatalogKind;
  id: number;
  className?: string;
}

export function FavoriteButton({ kind, id, className }: FavoriteButtonProps) {
  const t = useTranslations('catalog');
  const hydrated = useHydrated();
  const { toggleFavorite } = useCatalogActions();
  const isFavorite = useFavoritesStore((state) => state[kind].includes(id));
  const active = hydrated && isFavorite;

  return (
    <button
      type='button'
      onClick={() => toggleFavorite(kind, id)}
      aria-pressed={active}
      aria-label={active ? t.favoriteRemove : t.favoriteAdd}
      title={active ? t.favoriteRemove : t.favoriteAdd}
      className={cn(
        'inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-[#e5e7f0] bg-white transition-colors hover:border-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364] focus-visible:ring-offset-2',
        className
      )}
    >
      <Heart
        className={cn(
          'size-4 transition-colors',
          active ? 'fill-red-500 text-red-500' : 'text-[#6b7196]'
        )}
        aria-hidden
      />
    </button>
  );
}
