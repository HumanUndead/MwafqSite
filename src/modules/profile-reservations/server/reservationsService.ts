import 'server-only';

import queryString from 'query-string';

import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import { FetchResponseError } from '@/shared/lib/fetchWithErrorHandling.shared';
import { RESERVATIONS_PAGE_SIZE } from '../reservationsPagination.shared';
import type {
  Reservation,
  ReservationPublicDetail,
  ReservationsShortcutListPage,
} from '../types/reservation.types';

export type GetMyReservationsPageParams = {
  pageNumber?: number;
  pageSize?: number;
};

export class ReservationsError extends Error {
  code: string | null;
  status: number;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = 'ReservationsError';
    this.status = status;
    this.code = code;
  }
}

function normalizeReservationsPage(
  page: ReservationsShortcutListPage
): ReservationsShortcutListPage {
  return {
    ...page,
    data: Array.isArray(page.data) ? page.data : [],
  };
}

async function fetchMyReservations(
  params?: GetMyReservationsPageParams
): Promise<ReservationsShortcutListPage> {
  const query = queryString.stringify(
    {
      pageNumber: params?.pageNumber,
      pageSize: params?.pageSize,
    },
    { skipNull: true }
  );
  const url = `/api/client/client/GetMyReservations?${query}`;

  try {
    const page =
      await fetchWithErrorHandling<ReservationsShortcutListPage>(url);
    return normalizeReservationsPage(page);
  } catch (error) {
    if (error instanceof FetchResponseError) {
      throw new ReservationsError(error.message, error.status);
    }
    throw error;
  }
}

export async function getMyReservationsPage(
  params: GetMyReservationsPageParams = {}
): Promise<ReservationsShortcutListPage> {
  const pageSize = params.pageSize ?? RESERVATIONS_PAGE_SIZE;
  const pageNumber = params.pageNumber ?? 1;
  return fetchMyReservations({ pageNumber, pageSize });
}

/** Unpaginated list (e.g. shortcut API). Prefer {@link getMyReservationsPage} for UI. */
export async function getMyReservations({
  pageNumber,
  pageSize,
}: GetMyReservationsPageParams = {}): Promise<Reservation[]> {
  const page = await fetchMyReservations({ pageNumber, pageSize });
  return page.data;
}

export async function getReservationById(
  id: string
): Promise<ReservationPublicDetail> {
  const query = queryString.stringify({ id }, { skipNull: true });

  return await fetchWithErrorHandling<ReservationPublicDetail>(
    `/api/Reservation/Reservation/PublicGetById?${query}`
  );
}
