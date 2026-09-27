export interface ReservationListService {
  id: number;
  serviceProviderBranchServiceId: number;
  serviceName: string;
  slotTimeId: number;
  timeFrom: string;
  timeTo: string;
  cost: number;
  sellPrice: number;
}

/** `client/client/GetMyReservations` row. */
export interface ReservationListItem {
  id: string;
  serviceProviderBranchId: number;
  serviceProviderBranchName: string;
  serviceProviderBranchLogo: string | null;
  latitude: number;
  longitude: number;
  dateChosen: string;
  ownerId: string;
  status: number;
  cost: number;
  sellPrice: number;
  costTax: number;
  sellPriceTax: number;
  cancelationReason: string | null;
  rejectionReason: string | null;
  isFit: boolean | null;
  paymentStatus: number;
  reservationServices: ReservationListService[] | null;
  serviceProviderCityName?: string | null;
}

export interface ReservationDetailService {
  reservationServiceId: number;
  id: number;
  serviceName: string;
  from: string;
  to: string;
  sellPrice: number;
}

export interface ReservationDetailGroupService {
  from: string;
  to: string;
  sellPrice: number;
  services: { serviceName: string }[];
}

export interface ReservationStatusLog {
  id: number;
  status: number;
  createdById: string;
  createdByName: string;
  /** UTC. */
  createdAt: string;
  reservationId: string;
}

/** `Reservation/Reservation/GetById` value (fields the site reads). */
export interface ReservationDetails {
  id: string;
  serviceProviderBranchId: number;
  serviceProviderBranchName: string;
  serviceProviderBranchPhone: string | null;
  dateChosen: string;
  ownerId: string;
  ownerName: string;
  createdByName: string;
  createdAt: string;
  status: number;
  sellPrice: number;
  sellPriceTax: number;
  reservationServices: {
    services: ReservationDetailService[] | null;
    groupServices: ReservationDetailGroupService[] | null;
  } | null;
  statusLogs: ReservationStatusLog[] | null;
  reservationQuestionAnswers: { question: string; answer: string }[] | null;
  fullPathAttachments: string | null;
  cancelationReason: string | null;
  rejectionReason: string | null;
  isfit: boolean | null;
}

export type ReservationsTab = 'exams' | 'results';

export interface ReservationsListQuery {
  tab: ReservationsTab;
  /** Exams tab only: accepted (upcoming) vs everything else. */
  upcoming: boolean;
  pageNumber: number;
  ownerId: string | null;
}
