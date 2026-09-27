'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { catalogApi, catalogQueryKeys } from '../../api/catalogApi';
import { FAVORITES_LIMIT } from '../../catalog.shared';
import { useFavoritesStore } from '../../store/favoritesStore';
import type { CatalogKind } from '../../types/catalog.types';
import { CatalogGrid } from './CatalogGrid';

interface FavoritesCatalogProps {
  kind: CatalogKind;
  search?: string;
}

/** Favorites live in the browser, so this list is fetched client-side by ids. */
export function FavoritesCatalog({ kind, search }: FavoritesCatalogProps) {
  const t = useTranslations('catalog');
  const locale = useLocale();
  const hydrated = useHydrated();
  const ids = useFavoritesStore((state) => state[kind]);

  const query = {
    ids,
    search,
    pageNumber: 1,
    pageSize: FAVORITES_LIMIT,
  };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: catalogQueryKeys.list(kind, query, locale),
    queryFn: async () =>
      kind === 'services'
        ? (await catalogApi.listServices(query, locale)).data
        : (await catalogApi.listServiceGroups(query, locale)).data,
    enabled: hydrated && ids.length > 0,
  });

  if (!hydrated || (ids.length > 0 && isLoading)) {
    return (
      <div className='flex justify-center py-16'>
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex flex-col items-center gap-3 py-16 text-center'>
        <p className='text-sm font-semibold text-red-600'>{t.loadError}</p>
        <Button variant='outline' type='button' onClick={() => refetch()}>
          {t.retry}
        </Button>
      </div>
    );
  }

  // Keep the order the user favorited in, and drop ids the API no longer has.
  const items = ids.length
    ? (data?.data ?? []).filter((item) => ids.includes(item.id))
    : [];

  return (
    <CatalogGrid
      kind={kind}
      items={items}
      emptyLabel={search ? t.noResults : t.noFavorites}
    />
  );
}
