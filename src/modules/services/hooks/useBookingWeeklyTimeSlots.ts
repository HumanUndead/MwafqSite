'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchWeeklyTimeSlots } from '@/modules/services/api/bookingApi';
import { toBookingQueryErrorMessage } from '@/modules/services/bookingQuery.shared';
import { bookingQueryKeys } from '@/modules/services/bookingQueryKeys';

export type UseBookingWeeklyTimeSlotsParams = {
  branchId: number;
  serviceIds: number[];
  serviceGroupIds: number[];
};

export function useBookingWeeklyTimeSlots({
  branchId,
  serviceIds,
  serviceGroupIds,
}: UseBookingWeeklyTimeSlotsParams) {
  const query = useQuery({
    queryKey: bookingQueryKeys.weeklyTimeSlots(branchId, serviceIds, serviceGroupIds),
    queryFn: ({ signal }) =>
      fetchWeeklyTimeSlots({ branchId, serviceIds, serviceGroupIds }, { signal }),
    enabled:
      Boolean(branchId) &&
      serviceIds.length > 0 &&
      serviceGroupIds.length > 0,
  });

  return {
    days: query.data ?? [],
    loading: query.isLoading,
    error: query.isError ? toBookingQueryErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
