import type {
  PaginatedResponse,
  UpstreamApiResponse,
} from '@/shared/types/api.types';

export interface ReservationService {
  id: number;
  serviceProviderBranchServiceId: number;
  serviceName: string;
  slotTimeId: number;
  timeFrom: string;
  timeTo: string;
  cost: number;
  sellPrice: number;
  serviceType: string;
  serviceOrGroupId: number;
}

export interface Reservation {
  id: string;
  companyName: string | null;
  serviceProviderBranchId: number;
  serviceProviderBranchName: string;
  serviceProviderBranchLogo: string;
  latitude: number;
  longitude: number;
  dateChosen: string;
  ownerId: string;
  status: number;
  cost: number;
  sellPrice: number;
  costTax: number;
  sellPriceTax: number;
  note: string | null;
  cancelationReason: string | null;
  rejectionReason: string | null;
  isFit: boolean | null;
  isClaimedByProvider: boolean;
  adminNotes: string | null;
  paymentStatus: number;
  invoiceId: string | null;
  enrollmentType: number;
  reservationServices: ReservationService[];
}

/** Paginated list inside `payload.value`. */
export type ReservationsShortcutListPage = PaginatedResponse<Reservation>;

export type ReservationsShortcutListResponse =
  UpstreamApiResponse<ReservationsShortcutListPage>;

/** Service line inside `PublicGetById` → `reservationServices.services`. */
export interface ReservationPublicService {
  reservationServiceId: number;
  id: number;
  serviceName: string;
  from: string;
  to: string;
  sellPrice: number;
  costPrice: number;
  conditions: string[];
  requirements: {
    id: number;
    serviceId: number;
    langId: number;
    requirement: string;
  }[];
}

export interface ReservationPublicServices {
  services: ReservationPublicService[];
  groupServices: ReservationPublicService[];
}

/** Unwrapped `value` from `GET /api/Reservation/Reservation/PublicGetById`. */
export interface ReservationPublicDetail {
  dateChosen: string;
  ownerName: string;
  ownerPhone: string;
  companyName: string | null;
  packageCode: string | null;
  reservationServices: ReservationPublicServices;
}
