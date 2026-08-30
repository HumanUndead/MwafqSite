import type {
  PaginatedResponse,
  UpstreamApiResponse,
} from '@/shared/types/api.types';

export interface ServiceTranslation {
  id: number;
  serviceId: number;
  name: string;
  description: string | null;
  langId: number;
}

export interface ServicePricing {
  id: number;
  serviceId: number;
  serviceProviderClassificationId: number;
  serviceProviderClassificationName: string;
  price: number;
}

/** A single service item from `GET /api/Service/Service/List`. */
export interface ServiceListItem {
  id: number;
  serviceTypeId: number;
  isAvailable: boolean;
  type: number;
  sla: number;
  serviceTime: number;
  isRequired: boolean;
  isRequiredAttachment: boolean;
  isMandatoryTest: boolean;
  status: boolean;
  target: number;
  icon: string;
  isFeatured: boolean;
  translations: ServiceTranslation[];
  serviceType: string;
  pricing: ServicePricing[];
}

export type ServiceDetail = ServiceListItem;

export type ServiceListPage = PaginatedResponse<ServiceListItem>;

export type ServiceListResponse = UpstreamApiResponse<ServiceListPage>;

export type FetchServiceListParams = {
  pageNumber?: number;
  pageSize?: number;
  Target?: number;
  Search?: string;
  OrderBy?: string;
  OrderDirection?: boolean;
};
