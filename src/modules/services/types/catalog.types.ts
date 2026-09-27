import type { PaginatedResponse } from '@/shared/types/api.types';

export interface CatalogTranslation {
  id: number;
  langId: number;
  name: string;
  description: string | null;
}

/** `Service/Service/List` item. */
export interface CatalogService {
  id: number;
  icon: string | null;
  isFeatured?: boolean;
  translations: CatalogTranslation[];
}

export interface CatalogGroupService {
  id: number;
  serviceGroupId: number;
  serviceId: number;
  serviceName: string;
}

/** `Service/ServiceGroup/List` / `GetById` item (fields the site reads). */
export interface CatalogServiceGroup {
  id: number;
  icon: string | null;
  isFeatured?: boolean;
  translations: CatalogTranslation[];
  serviceGroupServices?: CatalogGroupService[];
}

export type CatalogKind = 'services' | 'groups';

export interface CatalogListQuery {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isFeatured?: boolean;
  ids?: number[];
}

export type CatalogPage<T> = PaginatedResponse<T>;
