import type { NextRequest } from 'next/server';
import { resolveLocale } from '@/i18n/routing';
import type { CatalogListQuery } from '@/modules/services/types/catalog.types';
import { toPositiveInt } from '@/shared/lib/upstream';

const MAX_PAGE_SIZE = 50;

export function readCatalogQuery(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const ids = params
    .getAll('ids')
    .flatMap((value) => value.split(','))
    .map(toPositiveInt)
    .filter((id): id is number => id !== null);

  const query: CatalogListQuery = {
    pageNumber: toPositiveInt(params.get('pageNumber')) ?? 1,
    pageSize: Math.min(toPositiveInt(params.get('pageSize')) ?? 12, MAX_PAGE_SIZE),
    search: params.get('search') ?? undefined,
    isFeatured: params.get('featured') === 'true',
    ids,
  };
  return { query, locale: resolveLocale(params.get('locale')) };
}
