import type { Locale } from '@/i18n/config';
import { http } from '@/shared/lib/http';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  ReservationDetails,
  ReservationListItem,
  ReservationsListQuery,
} from '../types/reservations.types';

export const reservationsApi = {
  list: (query: ReservationsListQuery, locale: Locale) => {
    const params = new URLSearchParams({
      tab: query.tab,
      upcoming: query.upcoming ? '1' : '0',
      page: String(query.pageNumber),
      locale,
    });
    if (query.ownerId) params.set('ownerId', query.ownerId);
    return http.get<PaginatedResponse<ReservationListItem>>(`/api/reservations?${params}`);
  },
  details: (id: string, locale: Locale) =>
    http.get<ReservationDetails>(
      `/api/reservations/${encodeURIComponent(id)}?locale=${locale}`
    ),
};

/** Prefix `['reservations']` is invalidated after a settled payment. */
export const reservationsQueryKeys = {
  all: ['reservations'] as const,
  list: (query: ReservationsListQuery, locale: Locale) =>
    ['reservations', 'list', query, locale] as const,
  details: (id: string, locale: Locale) =>
    ['reservations', 'details', id, locale] as const,
};
