'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale } from '@/i18n/DictionaryProvider';
import { reservationsApi, reservationsQueryKeys } from '../api/reservationsApi';
import type { ReservationsListQuery } from '../types/reservations.types';

export function useReservations(query: ReservationsListQuery, enabled = true) {
  const locale = useLocale();
  return useQuery({
    queryKey: reservationsQueryKeys.list(query, locale),
    queryFn: async () => (await reservationsApi.list(query, locale)).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useReservationDetails(id: string) {
  const locale = useLocale();
  return useQuery({
    queryKey: reservationsQueryKeys.details(id, locale),
    queryFn: async () => (await reservationsApi.details(id, locale)).data,
    retry: false,
  });
}
