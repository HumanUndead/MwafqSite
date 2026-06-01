import 'server-only';

import queryString from 'query-string';

import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  FetchServiceGroupListParams,
  ServiceGroupDetail,
  ServiceGroupListItem,
} from '../serviceGroup.types';

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
  filter?: { isMandatoryTest?: boolean }
): Promise<ServiceGroupDetail> {
  const params = queryString.stringify({ id, ...filter }, { skipNull: true });
  return fetchWithErrorHandling<ServiceGroupDetail>(
    `/api/Service/ServiceGroup/GetById?${params}`
  );
}
