import 'server-only';

import queryString from 'query-string';

import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  FetchServiceGroupListParams,
  ServiceGroupDetail,
  ServiceGroupListItem,
} from '../serviceGroup.types';
import { Locale, localeToLangId } from '@/i18n/config';

export async function fetchServiceGroupsList(
  query: FetchServiceGroupListParams
): Promise<PaginatedResponse<ServiceGroupListItem>> {
  const params = queryString.stringify(query, { skipNull: true });
  return fetchWithErrorHandling<PaginatedResponse<ServiceGroupListItem>>(
    `/api/Service/ServiceGroup/List?${params}`
  );
}

export async function fetchServiceGroupById(
  id: number,
  filter?: { isMandatoryTest?: boolean; locale?: Locale }
): Promise<ServiceGroupDetail> {
  const langId = localeToLangId[filter?.locale ?? 'en'];
  const params = queryString.stringify(
    { id, langId, ...filter },
    { skipNull: true }
  );
  return fetchWithErrorHandling<ServiceGroupDetail>(
    `/api/Service/ServiceGroup/GetById?${params}`
  );
}
