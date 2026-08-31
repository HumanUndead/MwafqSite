import 'server-only';

import queryString from 'query-string';

import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  FetchServiceGroupListParams,
  ServiceGroupDetail,
  ServiceGroupListItem,
} from '../serviceGroup.types';
import type { ServiceListItem } from '@/modules/services/types/services.types';
import { Locale, localeToLangId } from '@/i18n/config';

/** Adapts a ServiceGroup item to the `ServiceListItem` shape shared UI (`ServicesPage`, `PackageCard`) expects. */
export function serviceGroupToServiceListItem(
  group: ServiceGroupListItem
): ServiceListItem {
  return {
    id: group.id,
    serviceTypeId: 0,
    isAvailable: true,
    type: group.target,
    sla: group.sla ?? 0,
    serviceTime: 0,
    isRequired: false,
    isRequiredAttachment: false,
    isMandatoryTest: group.isMandatoryTest,
    status: true,
    target: group.target,
    icon: group.icon,
    isFeatured: group.isFeatured,
    translations: group.translations.map((tr) => ({
      id: tr.id,
      serviceId: tr.serviceGroupId,
      name: tr.name,
      description: tr.description,
      langId: tr.langId,
    })),
    serviceType: '',
    pricing: group.serviceGroupClassificationPricings.map((p) => ({
      id: p.id,
      serviceId: p.serviceGroupId,
      serviceProviderClassificationId: p.serviceProviderClassificationId,
      serviceProviderClassificationName: p.classificationName,
      price: p.price,
    })),
  };
}

/** ServiceGroup endpoints only — always served from this origin, independent of `MWAFQ_API_BASE_URL`. */
const SERVICE_GROUP_API_BASE_URL = 'https://api.mwafq.com';

export async function fetchServiceGroupsList(
  query: FetchServiceGroupListParams
): Promise<PaginatedResponse<ServiceGroupListItem>> {
  const params = queryString.stringify(
    { Target: '1', ...query },
    { skipNull: true }
  );
  return fetchWithErrorHandling<PaginatedResponse<ServiceGroupListItem>>(
    new URL(
      `/api/Service/ServiceGroup/List?${params}`,
      SERVICE_GROUP_API_BASE_URL
    ).toString()
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
    new URL(
      `/api/Service/ServiceGroup/GetById?${params}`,
      SERVICE_GROUP_API_BASE_URL
    ).toString()
  );
}
