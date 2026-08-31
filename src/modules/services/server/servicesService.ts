import 'server-only';

import queryString from 'query-string';

import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  FetchServiceListParams,
  ServiceDetail,
  ServiceListItem,
} from '../types/services.types';

const SERVICE_API_BASE_URL = 'https://api.mwafq.com';

export async function fetchServicesList(
  query: FetchServiceListParams = {}
): Promise<PaginatedResponse<ServiceListItem>> {
  const params = queryString.stringify(
    { pageNumber: 1, pageSize: 40, OrderDirection: true, ...query },
    { skipNull: true }
  );
  return fetchWithErrorHandling<PaginatedResponse<ServiceListItem>>(
    `${SERVICE_API_BASE_URL}/api/Service/Service/List?${params}`
  );
}

export async function fetchServiceById(id: number): Promise<ServiceDetail> {
  const params = queryString.stringify({ id }, { skipNull: true });
  return fetchWithErrorHandling<ServiceDetail>(
    `${SERVICE_API_BASE_URL}/api/Service/Service/GetById?${params}`
  );
}
