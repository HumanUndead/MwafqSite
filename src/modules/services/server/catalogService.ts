import 'server-only';

import { localeToLangId, type Locale } from '@/i18n/config';
import { upstreamRequest } from '@/shared/lib/upstream';
import { SERVICE_TARGET_B2C } from '../catalog.shared';
import type {
  CatalogListQuery,
  CatalogPage,
  CatalogService,
  CatalogServiceGroup,
} from '../types/catalog.types';

function listQuery(query: CatalogListQuery, locale: Locale) {
  return {
    OrderDirection: true,
    Target: SERVICE_TARGET_B2C,
    PageNumber: query.pageNumber ?? 1,
    PageSize: query.pageSize ?? 12,
    Search: query.search?.trim() || undefined,
    IsFeatured: query.isFeatured ? true : undefined,
    Ids: query.ids?.length ? query.ids : undefined,
    culture: locale,
  };
}

export function listCatalogServices(
  query: CatalogListQuery,
  locale: Locale
): Promise<CatalogPage<CatalogService>> {
  return upstreamRequest<CatalogPage<CatalogService>>({
    method: 'GET',
    path: '/api/Service/Service/List',
    query: listQuery(query, locale),
    fallbackMessage: 'Failed to load services',
  });
}

export function listCatalogServiceGroups(
  query: CatalogListQuery,
  locale: Locale
): Promise<CatalogPage<CatalogServiceGroup>> {
  return upstreamRequest<CatalogPage<CatalogServiceGroup>>({
    method: 'GET',
    path: '/api/Service/ServiceGroup/List',
    query: listQuery(query, locale),
    fallbackMessage: 'Failed to load service groups',
  });
}

export function getCatalogServiceGroup(
  id: number,
  locale: Locale
): Promise<CatalogServiceGroup> {
  return upstreamRequest<CatalogServiceGroup>({
    method: 'GET',
    path: '/api/Service/ServiceGroup/GetById',
    query: { Id: id, LangId: localeToLangId[locale], culture: locale },
    fallbackMessage: 'Failed to load service group',
  });
}

/** Empty page used when the upstream list fails, so the page still renders. */
export function emptyCatalogPage<T>(pageSize = 12): CatalogPage<T> {
  return { pageNumber: 1, pageSize, totalRecords: 0, totalPages: 0, data: [] };
}
