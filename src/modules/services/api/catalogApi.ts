import type { Locale } from '@/i18n/config';
import { http } from '@/shared/lib/http';
import type {
  CatalogKind,
  CatalogListQuery,
  CatalogPage,
  CatalogService,
  CatalogServiceGroup,
} from '../types/catalog.types';

function toSearch(query: CatalogListQuery, locale: Locale): string {
  const params = new URLSearchParams({ locale });
  if (query.pageNumber) params.set('pageNumber', String(query.pageNumber));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.search) params.set('search', query.search);
  if (query.isFeatured) params.set('featured', 'true');
  if (query.ids?.length) params.set('ids', query.ids.join(','));
  return params.toString();
}

export const catalogApi = {
  listServices: (query: CatalogListQuery, locale: Locale) =>
    http.get<CatalogPage<CatalogService>>(
      `/api/catalog/services?${toSearch(query, locale)}`
    ),
  listServiceGroups: (query: CatalogListQuery, locale: Locale) =>
    http.get<CatalogPage<CatalogServiceGroup>>(
      `/api/catalog/service-groups?${toSearch(query, locale)}`
    ),
  getServiceGroup: (id: number, locale: Locale) =>
    http.get<CatalogServiceGroup>(
      `/api/catalog/service-groups/${id}?locale=${locale}`
    ),
};

export const catalogQueryKeys = {
  all: ['catalog'] as const,
  list: (kind: CatalogKind, query: CatalogListQuery, locale: Locale) =>
    ['catalog', kind, locale, query] as const,
  group: (id: number, locale: Locale) =>
    ['catalog', 'group', id, locale] as const,
};
