import 'server-only';

import type { Locale } from '@/i18n/config';
import type { PaginatedResponse } from '@/shared/types/api.types';
import { upstreamRequest } from '@/shared/lib/upstream';
import {
  RESERVATIONS_PAGE_SIZE,
  reservationListFilter,
} from '../reservationStatus.shared';
import type {
  ReservationDetails,
  ReservationListItem,
  ReservationsListQuery,
} from '../types/reservations.types';

/** Paid reservations of one owner (the user or a family member). */
export async function listReservations(
  token: string,
  query: ReservationsListQuery & { ownerId: string; isSelf: boolean },
  locale: Locale
): Promise<PaginatedResponse<ReservationListItem>> {
  const filter = reservationListFilter(query);
  const page = await upstreamRequest<PaginatedResponse<ReservationListItem>>({
    method: 'GET',
    // A family member's list needs `GetUserReservations` (Accepted link only).
    path: query.isSelf
      ? '/api/client/client/GetMyReservations'
      : '/api/Client/Client/GetUserReservations',
    token,
    query: {
      orderBy: 'dateChosen',
      orderDirection: filter.orderDirection,
      isPaid: true,
      ...(query.isSelf
        ? { ownerId: query.ownerId }
        : { userId: query.ownerId }),
      status: filter.status,
      pageNumber: query.pageNumber,
      pageSize: RESERVATIONS_PAGE_SIZE,
      culture: locale,
    },
    fallbackMessage: 'Failed to load reservations',
  });
  return { ...page, data: Array.isArray(page?.data) ? page.data : [] };
}

export function getReservationDetails(
  token: string,
  id: string,
  locale: Locale
): Promise<ReservationDetails> {
  return upstreamRequest<ReservationDetails>({
    method: 'GET',
    path: '/api/Reservation/Reservation/GetById',
    token,
    query: { Id: id, culture: locale },
    fallbackMessage: 'Failed to load the reservation',
  });
}
